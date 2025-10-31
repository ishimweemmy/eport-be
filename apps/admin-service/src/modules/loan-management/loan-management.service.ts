import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { ELoanStatus } from '@customer-service/modules/loan/enums/loan-status.enum';
import { EApprovalStatus } from '@customer-service/modules/loan/enums/approval-status.enum';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _400 } from '@app/common/constants/errors-constants';
import { AdminActionLogService } from '@admin-service/modules/admin-action-log/admin-action-log.service';
import { EAdminActionType } from '@admin-service/modules/admin-action-log/entities/admin-action-log.entity';
import { NotificationGrpcService } from '@admin-service/integrations/notification/notification-grpc.service';
import { QueryLoansDto } from '@admin-service/modules/loan-management/dto/query-loans.dto';
import {
  ApproveLoanDto,
  RejectLoanDto,
} from '@admin-service/modules/loan-management/dto/approve-loan.dto';
import { DisburseLoanDto } from '@admin-service/modules/loan-management/dto/disburse-loan.dto';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { LoanService } from '@customer-service/modules/loan/loan.service';

@Injectable()
export class LoanManagementService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly loanService: LoanService,
    private readonly adminActionLogService: AdminActionLogService,
    private readonly notificationGrpcService: NotificationGrpcService,
  ) {}

  /**
   * Get loans with optional filtering by status and approval status
   * @param query - Query parameters including page, limit, status, and approvalStatus
   * @returns Paginated list of loans
   */
  async getLoans(query: QueryLoansDto) {
    const { page, limit, status, approvalStatus } = query;
    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (approvalStatus) {
      where.approvalStatus = approvalStatus;
    }

    // Determine optimal sort order based on filters
    let orderBy: any = { requestedAt: 'DESC' }; // Default: newest first

    if (approvalStatus === EApprovalStatus.PENDING_REVIEW) {
      orderBy = { requestedAt: 'ASC' }; // FIFO for pending review
    } else if (status === ELoanStatus.DEFAULTED) {
      orderBy = { dueDate: 'ASC' }; // Oldest defaults first
    } else if (status === ELoanStatus.ACTIVE) {
      orderBy = { disbursedAt: 'DESC' }; // Recently disbursed first
    }

    const [loans, total] = await this.loanRepository.findAndCount({
      where,
      relations: ['user', 'creditAccount', 'savingsAccount'],
      order: orderBy,
      take: limit,
      skip,
    });

    return createPaginatedResponse(loans, total, page, limit);
  }

  async getLoanById(loanId: string) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user', 'creditAccount', 'savingsAccount'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound(_404.LOAN_NOT_FOUND);
    }

    return loan;
  }

  async approveLoan(loanId: string, adminId: string, dto: ApproveLoanDto) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user', 'creditAccount'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound(_404.LOAN_NOT_FOUND);
    }

    if (loan.approvalStatus !== EApprovalStatus.PENDING_REVIEW) {
      this.exceptionHandler.throwBadRequest(_400.LOAN_NOT_PENDING_REVIEW);
    }

    // Update loan status
    loan.approvalStatus = EApprovalStatus.MANUAL_APPROVED;
    loan.status = ELoanStatus.APPROVED;
    loan.approvedAt = new Date();
    loan.approvedBy = { id: adminId } as any;

    await this.loanRepository.save(loan);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.LOAN_APPROVED,
      adminId,
      targetId: loan.id,
      targetType: 'Loan',
      metadata: {
        loanNumber: loan.loanNumber,
        principalAmount: loan.principalAmount.toString(),
        userId: loan.user.id,
      },
      notes: dto.notes,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'loan-approved',
        [loan.user.email],
        {
          customerName: `${loan.user.firstName} ${loan.user.lastName}`,
          loanNumber: loan.loanNumber,
          amount: loan.principalAmount.toString(),
        },
        'admin',
        loan.id,
      );
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to send loan approval notification:', error);
    }

    return loan;
  }

  async rejectLoan(loanId: string, adminId: string, dto: RejectLoanDto) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user', 'creditAccount'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound(_404.LOAN_NOT_FOUND);
    }

    if (loan.approvalStatus !== EApprovalStatus.PENDING_REVIEW) {
      this.exceptionHandler.throwBadRequest(_400.LOAN_NOT_PENDING_REVIEW);
    }

    // Update loan status
    loan.approvalStatus = EApprovalStatus.REJECTED;
    loan.status = ELoanStatus.REJECTED;

    await this.loanRepository.save(loan);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.LOAN_REJECTED,
      adminId,
      targetId: loan.id,
      targetType: 'Loan',
      metadata: {
        loanNumber: loan.loanNumber,
        principalAmount: loan.principalAmount.toString(),
        userId: loan.user.id,
        rejectionReason: dto.reason,
      },
      notes: dto.notes,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'loan-rejected',
        [loan.user.email],
        {
          customerName: `${loan.user.firstName} ${loan.user.lastName}`,
          loanNumber: loan.loanNumber,
          amount: loan.principalAmount.toString(),
          reason: dto.reason,
        },
        'admin',
        loan.id,
      );
    } catch (error) {
      console.error('Failed to send loan rejection notification:', error);
    }

    return loan;
  }

  async disburseLoan(loanId: string, adminId: string, dto: DisburseLoanDto) {
    // Validate loan exists and is approved
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound(_404.LOAN_NOT_FOUND);
    }

    if (loan.status !== ELoanStatus.APPROVED) {
      this.exceptionHandler.throwBadRequest(_400.LOAN_NOT_APPROVED);
    }

    // Use customer-service LoanService to handle disbursement
    const result = await this.loanService.disburseLoan(loanId);

    // Admin-specific: Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.LOAN_DISBURSED,
      adminId,
      targetId: loan.id,
      targetType: 'Loan',
      metadata: {
        loanNumber: loan.loanNumber,
        principalAmount: loan.principalAmount.toString(),
        userId: loan.user.id,
      },
      notes: dto.notes,
    });

    return result;
  }
}

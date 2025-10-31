import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LoanManagementService } from '@admin-service/modules/loan-management/loan-management.service';
import { RolesGuard, PreAuthorize } from '@app/common/auth';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { QueryLoansDto } from '@admin-service/modules/loan-management/dto/query-loans.dto';
import {
  ApproveLoanDto,
  RejectLoanDto,
} from '@admin-service/modules/loan-management/dto/approve-loan.dto';
import { DisburseLoanDto } from '@admin-service/modules/loan-management/dto/disburse-loan.dto';

@ApiTags('Admin - Loan Management')
@ApiBearerAuth()
@Controller('admin/loans')
@UseGuards(RolesGuard)
@PreAuthorize(EUserRole.ADMIN)
export class LoanManagementController {
  constructor(private readonly loanManagementService: LoanManagementService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all loans with filtering',
    description:
      'Retrieve loans with optional filters for status, approval status, and pagination. Use query params like ?status=PENDING&approvalStatus=PENDING_REVIEW&page=1&limit=20',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of loans with optional filters',
  })
  async getLoans(@Query() query: QueryLoansDto) {
    return this.loanManagementService.getLoans(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loan details by ID' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns loan details',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan not found',
  })
  async getLoanById(@Param('id') loanId: string) {
    return this.loanManagementService.getLoanById(loanId);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a loan' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan approved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Loan is not in pending review status',
  })
  async approveLoan(
    @Param('id') loanId: string,
    @Body() dto: ApproveLoanDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return this.loanManagementService.approveLoan(loanId, adminId, dto);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a loan' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan rejected successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Loan is not in pending review status',
  })
  async rejectLoan(
    @Param('id') loanId: string,
    @Body() dto: RejectLoanDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return this.loanManagementService.rejectLoan(loanId, adminId, dto);
  }

  @Post(':id/disburse')
  @ApiOperation({ summary: 'Disburse an approved loan' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan disbursed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Loan must be approved before disbursement',
  })
  async disburseLoan(
    @Param('id') loanId: string,
    @Body() dto: DisburseLoanDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return this.loanManagementService.disburseLoan(loanId, adminId, dto);
  }
}

import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { LoanRequestDto } from './dto/loan-request.dto';
import { LoanResponseDto } from './dto/loan-response.dto';
import { RepaymentDto } from './dto/repayment.dto';
import { RepaymentScheduleDto } from './dto/repayment-schedule.dto';
import {
  PreAuthorize,
  AuthUser,
} from '@customer-service/decorators/auth.decorator';
import { EUserRole } from '../user/enums/user-role.enum';

@ApiTags('Loan')
@Controller('loan')
@PreAuthorize(EUserRole.CUSTOMER)
@AuthUser()
@ApiBearerAuth()
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request a new loan' })
  async requestLoan(
    @Request() req,
    @Body() dto: LoanRequestDto,
  ): Promise<LoanResponseDto> {
    return this.loanService.requestLoan(req.user.id, dto);
  }

  @Get('my-loans')
  @ApiOperation({ summary: 'Get all customer loans' })
  async getMyLoans(@Request() req): Promise<LoanResponseDto[]> {
    return this.loanService.getMyLoans(req.user.id);
  }

  @Get(':loanId')
  @ApiOperation({ summary: 'Get loan details by ID' })
  async getLoanById(
    @Request() req,
    @Param('loanId') loanId: string,
  ): Promise<LoanResponseDto> {
    return this.loanService.getLoanById(req.user.id, loanId);
  }

  @Get(':loanId/schedule')
  @ApiOperation({ summary: 'Get loan repayment schedule' })
  async getRepaymentSchedule(
    @Request() req,
    @Param('loanId') loanId: string,
  ): Promise<RepaymentScheduleDto> {
    return this.loanService.getRepaymentSchedule(req.user.id, loanId);
  }

  @Post('repay')
  @ApiOperation({ summary: 'Make a loan repayment' })
  async repayLoan(
    @Request() req,
    @Body() dto: RepaymentDto,
  ): Promise<{ message: string; repaymentId: string }> {
    return this.loanService.repayLoan(req.user.id, dto);
  }
}

import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SavingsService } from './savings.service';
import { CreateSavingsAccountDto } from './dto/create-savings-account.dto';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { SavingsAccountResponseDto } from './dto/savings-account-response.dto';
import { BalanceInquiryDto } from './dto/balance-inquiry.dto';
import {
  PreAuthorize,
  AuthUser,
} from '@customer-service/decorators/auth.decorator';
import { EUserRole } from '../user/enums/user-role.enum';

@ApiTags('Savings')
@Controller('savings')
@PreAuthorize(EUserRole.CUSTOMER)
@AuthUser()
@ApiBearerAuth()
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Post('accounts')
  @ApiOperation({ summary: 'Create new savings account' })
  async createAccount(
    @Request() req,
    @Body() dto: CreateSavingsAccountDto,
  ): Promise<SavingsAccountResponseDto> {
    return this.savingsService.createSavingsAccount(req.user.id, dto);
  }

  @Get('accounts')
  @ApiOperation({
    summary: 'Get all customer savings accounts',
    description:
      'Returns all savings accounts with their current balances and details',
  })
  async getAccounts(@Request() req): Promise<SavingsAccountResponseDto[]> {
    return this.savingsService.getAccountsByUserId(req.user.id);
  }

  @Get('accounts/:accountId')
  @ApiOperation({
    summary: 'Get specific savings account details',
    description:
      'Returns detailed information for a specific savings account including balance',
  })
  async getAccountById(
    @Request() req,
    @Param('accountId') accountId: string,
  ): Promise<SavingsAccountResponseDto> {
    return this.savingsService.getAccountById(req.user.id, accountId);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit funds to savings account' })
  async deposit(
    @Request() req,
    @Body() dto: DepositDto,
  ): Promise<SavingsAccountResponseDto> {
    return this.savingsService.deposit(req.user.id, dto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw funds from savings account' })
  async withdraw(
    @Request() req,
    @Body() dto: WithdrawDto,
  ): Promise<SavingsAccountResponseDto> {
    return this.savingsService.withdraw(req.user.id, dto);
  }
}

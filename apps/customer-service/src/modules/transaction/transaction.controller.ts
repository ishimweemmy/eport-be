import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import {
  PreAuthorize,
  AuthUser,
} from '@customer-service/decorators/auth.decorator';
import { EUserRole } from '../user/enums/user-role.enum';

@ApiTags('Transaction')
@Controller('transaction')
@PreAuthorize(EUserRole.CUSTOMER)
@AuthUser()
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get transaction history' })
  async getHistory(@Request() req, @Query() filter: TransactionFilterDto) {
    return this.transactionService.getTransactionHistory(req.user.id, filter);
  }

  @Get(':reference')
  @ApiOperation({ summary: 'Get transaction by reference' })
  async getByReference(
    @Request() req,
    @Param('reference') reference: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.getTransactionByReference(
      req.user.id,
      reference,
    );
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionManagementService } from './transaction-management.service';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { TransactionAdminResponseDto } from './dto/transaction-admin-response.dto';

@ApiTags('Admin - Transaction Management')
@Controller('admin/transactions')
@ApiBearerAuth()
export class TransactionManagementController {
  constructor(
    private readonly transactionManagementService: TransactionManagementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions (admin)' })
  async getTransactions(@Query() query: QueryTransactionsDto) {
    return this.transactionManagementService.getTransactions(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID (admin)' })
  async getTransactionById(
    @Param('id') id: string,
  ): Promise<TransactionAdminResponseDto> {
    return this.transactionManagementService.getTransactionById(id);
  }
}

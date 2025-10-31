import {
  Controller,
  Get,
  Patch,
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
import { CustomerManagementService } from '@admin-service/modules/customer-management/customer-management.service';
import { RolesGuard, PreAuthorize } from '@app/common/auth';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { QueryCustomersDto } from '@admin-service/modules/customer-management/dto/query-customers.dto';
import {
  SuspendCustomerDto,
  UnsuspendCustomerDto,
  UpdateCreditLimitDto,
  UpdateCreditScoreDto,
} from '@admin-service/modules/customer-management/dto/update-customer.dto';

@ApiTags('Admin - Customer Management')
@ApiBearerAuth()
@Controller('admin/customers')
@UseGuards(RolesGuard)
@PreAuthorize(EUserRole.ADMIN)
export class CustomerManagementController {
  constructor(
    private readonly customerManagementService: CustomerManagementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers with filtering and search' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of customers',
  })
  async getCustomers(@Query() query: QueryCustomersDto) {
    return this.customerManagementService.getCustomers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer details by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description:
      'Returns customer details with credit account and recent actions',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  async getCustomerById(@Param('id') customerId: string) {
    return this.customerManagementService.getCustomerById(customerId);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend a customer account' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer suspended successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Customer is already suspended',
  })
  async suspendCustomer(
    @Param('id') customerId: string,
    @Body() dto: SuspendCustomerDto,
    @Req() req,
  ) {
    const adminId = req.user.id;
    return this.customerManagementService.suspendCustomer(
      customerId,
      adminId,
      dto,
    );
  }

  @Patch(':id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend a customer account' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer unsuspended successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Customer is not suspended',
  })
  async unsuspendCustomer(
    @Param('id') customerId: string,
    @Body() dto: UnsuspendCustomerDto,
    @Req() req,
  ) {
    const adminId = req.user.id;
    return this.customerManagementService.unsuspendCustomer(
      customerId,
      adminId,
      dto,
    );
  }

  @Patch(':id/credit-limit')
  @ApiOperation({ summary: 'Update customer credit limit' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Credit limit updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer or credit account not found',
  })
  async updateCreditLimit(
    @Param('id') customerId: string,
    @Body() dto: UpdateCreditLimitDto,
    @Req() req,
  ) {
    const adminId = req.user.id;
    return this.customerManagementService.updateCreditLimit(
      customerId,
      adminId,
      dto,
    );
  }

  @Patch(':id/credit-score')
  @ApiOperation({ summary: 'Update customer credit score' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Credit score updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  async updateCreditScore(
    @Param('id') customerId: string,
    @Body() dto: UpdateCreditScoreDto,
    @Req() req,
  ) {
    const adminId = req.user.id;
    return this.customerManagementService.updateCreditScore(
      customerId,
      adminId,
      dto,
    );
  }
}

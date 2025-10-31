import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { CreditAccountResponseDto } from './dto/credit-account-response.dto';
import { CreditAvailabilityDto } from './dto/credit-availability.dto';
import {
  PreAuthorize,
  AuthUser,
} from '@customer-service/decorators/auth.decorator';
import { EUserRole } from '../user/enums/user-role.enum';

@ApiTags('Credit')
@Controller('credit')
@PreAuthorize(EUserRole.CUSTOMER)
@AuthUser()
@ApiBearerAuth()
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get('account')
  @ApiOperation({ summary: 'Get customer credit account' })
  async getCreditAccount(@Request() req): Promise<CreditAccountResponseDto> {
    return this.creditService.getCreditAccount(req.user.id);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get credit availability and utilization' })
  async getCreditAvailability(@Request() req): Promise<CreditAvailabilityDto> {
    return this.creditService.getCreditAvailability(req.user.id);
  }
}

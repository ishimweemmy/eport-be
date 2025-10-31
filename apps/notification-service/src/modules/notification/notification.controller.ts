import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  Req,
  Patch,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ENotificationStatus } from '@app/common/enums/notification-status.enum';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthUser } from '@notification-service/common/decorators/auth-checker.decorator';

// TODO: Protect these endpoints so that they can only be accessed by authenticated users or Consider dispatching them to customer-service through GRPC
@Controller('notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.notificationService.findById(id);
  }

  @Get('/user/all')
  @AuthUser()
  @ApiQuery({ name: 'status', required: false, enum: ENotificationStatus })
  async getNotificationsByStatus(
    @Req() req,
    @Query('status') status?: ENotificationStatus,
  ) {
    return await this.notificationService.getUserNotificationsByStatus(
      req.user.id,
      status,
    );
  }

  @Get('/user/paginated')
  @AuthUser()
  @ApiQuery({ name: 'status', required: false, enum: ENotificationStatus })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit of notifications per page',
    type: Number,
    example: 10,
  })
  async getUserNotificationsByStatusPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req,
    @Query('status') status?: ENotificationStatus,
  ) {
    return await this.notificationService.getUserNotificationsByStatusPaginated(
      req.user.id,
      status,
      page,
      limit,
    );
  }

  @Patch(':id/read')
  @AuthUser()
  async markAsRead(@Param('id') id: string, @Req() req) {
    return await this.notificationService.markAsRead(id, req.user.id);
  }

  @Patch('/user/read-all')
  @AuthUser()
  async markAllAsRead(@Req() req) {
    return await this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.notificationService.delete(id);
  }
}

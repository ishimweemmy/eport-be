import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationRegistryDto } from './dto/create-notification-registry.dto';
import { Notification } from './entities/notification.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { ENotificationStatus } from '@app/common/enums/notification-status.enum';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async create(createNotificationDto: CreateNotificationRegistryDto) {
    try {
      return await this.notificationRepository.save(createNotificationDto);
    } catch (error) {
      this.exceptionHandler.throwInternalServerError(error);
    }
  }

  async findAll() {
    return await this.notificationRepository.find();
  }

  async findById(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification)
      this.exceptionHandler.throwNotFound(_404.NOTIFICATION_REGISTRY_NOT_FOUND);
    return notification;
  }

  async findByStatus(status: ENotificationStatus) {
    return await this.notificationRepository.find({
      where: { notificationStatus: status },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getUserNotificationsByStatus(
    userId: string,
    status?: ENotificationStatus,
  ) {
    const where: any = { receiverUserId: userId };
    if (status) {
      where.notificationStatus = status;
    }

    return await this.notificationRepository.find({
      where,
      order: {
        notificationStatus: 'ASC', // DELIVERED comes before READ
        createdAt: 'DESC', // Newest first within each status
      },
    });
  }

  async getUserNotificationsByStatusPaginated(
    userId: string,
    status?: ENotificationStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const where: any = { receiverUserId: userId };
    if (status) {
      where.notificationStatus = status;
    }

    const [data, total] = await this.notificationRepository.findAndCount({
      where,
      order: {
        notificationStatus: 'ASC', // DELIVERED comes before READ
        createdAt: 'DESC', // Newest first within each status
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginatedResponse(data, total, page, limit);
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, receiverUserId: userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.notificationStatus = ENotificationStatus.READ;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    const notifications = await this.notificationRepository.find({
      where: {
        receiverUserId: userId,
        notificationStatus: ENotificationStatus.DELIVERED,
      },
    });

    const updatedNotifications = notifications.map((notification) => {
      notification.notificationStatus = ENotificationStatus.READ;
      return notification;
    });

    return await this.notificationRepository.save(updatedNotifications);
  }

  async delete(id: string) {
    const notification = await this.findById(id);
    return await this.notificationRepository.remove(notification);
  }
}

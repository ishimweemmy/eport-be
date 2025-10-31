import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdminActionLog,
  EAdminActionType,
} from '@admin-service/modules/admin-action-log/entities/admin-action-log.entity';

export interface CreateAdminActionLogDto {
  actionType: EAdminActionType;
  adminId: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, any>;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AdminActionLogService {
  private readonly logger = new Logger(AdminActionLogService.name);

  constructor(
    @InjectRepository(AdminActionLog)
    private readonly adminActionLogRepository: Repository<AdminActionLog>,
  ) {}

  /**
   * Log an admin action with comprehensive context and error handling
   */
  async logAction(data: CreateAdminActionLogDto): Promise<AdminActionLog> {
    try {
      const log = this.adminActionLogRepository.create({
        ...data,
        metadata: {
          ...data.metadata,
          timestamp: new Date().toISOString(),
          userAgent: this.sanitizeUserAgent(data.userAgent),
        },
      });

      const savedLog = await this.adminActionLogRepository.save(log);

      this.logger.log(
        `Admin action logged: ${data.actionType} by admin ${data.adminId} on ${data.targetType || 'N/A'}:${data.targetId || 'N/A'}`,
      );

      return savedLog;
    } catch (error) {
      this.logger.error(
        `Failed to log admin action: ${error.message}`,
        error.stack,
      );
      // Don't throw - logging should not break the main operation
      // But create a fallback in-memory log for critical tracking
      this.logger.warn(
        `Fallback log - Action: ${data.actionType}, Admin: ${data.adminId}, Target: ${data.targetId}`,
      );
      throw error; // Re-throw after logging for upstream handling
    }
  }

  /**
   * Sanitize user agent string to prevent XSS or injection attacks
   */
  private sanitizeUserAgent(userAgent?: string): string {
    if (!userAgent) return 'Unknown';
    // Remove potential malicious content, keep only alphanumeric and common chars
    return userAgent.replace(/[<>\"']/g, '').substring(0, 500); // Limit length
  }

  async findByAdmin(
    adminId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[AdminActionLog[], number]> {
    return await this.adminActionLogRepository.findAndCount({
      where: { adminId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByTarget(
    targetId: string,
    targetType: string,
  ): Promise<AdminActionLog[]> {
    return await this.adminActionLogRepository.find({
      where: { targetId, targetType },
      order: { createdAt: 'DESC' },
      relations: ['admin'],
    });
  }

  async findByActionType(
    actionType: EAdminActionType,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[AdminActionLog[], number]> {
    return await this.adminActionLogRepository.findAndCount({
      where: { actionType },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}

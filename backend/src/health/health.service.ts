import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

export type HealthStatus = {
  status: 'OK';
  database: 'ok';
};

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'OK',
        database: 'ok',
      };
    } catch {
      throw new ServiceUnavailableException('Database is unavailable');
    }
  }
}

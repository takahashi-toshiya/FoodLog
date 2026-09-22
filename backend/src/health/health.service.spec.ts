import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('DBへ接続できる場合は正常状態を返す', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as PrismaService;
    const service = new HealthService(prisma);

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'ok',
    });
  });

  it('DBへ接続できない場合は503エラーを返す', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockRejectedValue(new Error('connection failed')),
    } as unknown as PrismaService;
    const service = new HealthService(prisma);

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});

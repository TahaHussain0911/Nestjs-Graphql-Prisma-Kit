import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger();
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({
      adapter,
    });
  }

  async onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    const models = Reflect.ownKeys(this).filter((key) => {
      return typeof key === 'string' && !key.startsWith('_');
    });
    return Promise.all(
      models.map((modelKey) => {
        return this[modelKey].deleteMany();
      }),
    );
  }
}

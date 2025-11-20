import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [HealthModule, TransactionsModule],
})
export class AppModule {}

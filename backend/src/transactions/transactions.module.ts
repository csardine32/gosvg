import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { WalletService } from './wallet.service';

@Module({
  providers: [TransactionsService, WalletService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}

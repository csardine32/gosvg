import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WalletService } from './wallet.service';

@Controller()
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly walletService: WalletService,
  ) {}

  @Post('transactions')
  createTransaction(@Body() dto: CreateTransactionDto) {
    const tx = this.transactionsService.create(dto);
    return {
      status: 'created',
      transaction: tx,
    };
  }

  @Get('drivers/:driverId/earnings-today')
  getDriverEarningsToday(@Param('driverId') driverId: string) {
    const earnings =
      this.transactionsService.getDriverEarningsForToday(driverId);

    return {
      status: 'ok',
      ...earnings,
    };
  }

  @Get('drivers/:driverId/wallet')
  getDriverWallet(@Param('driverId') driverId: string) {
    const wallet = this.walletService.getSnapshot(driverId);
    return {
      status: 'ok',
      wallet,
    };
  }

  @Post('drivers/:driverId/payouts')
  payout(@Param('driverId') driverId: string) {
    const wallet = this.walletService.payoutAll(driverId);
    return {
      status: 'ok',
      wallet,
    };
  }
}

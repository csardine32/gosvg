import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

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
}

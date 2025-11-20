import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';

export interface Transaction {
  id: string;
  driverId: string;
  vehicleId: string;
  amount: number; // cents
  createdAt: Date;
  passengerId?: string;
}

@Injectable()
export class TransactionsService {
  private transactions: Transaction[] = [];

  create(dto: CreateTransactionDto): Transaction {
    const tx: Transaction = {
      id: (this.transactions.length + 1).toString(),
      driverId: dto.driverId,
      vehicleId: dto.vehicleId,
      amount: dto.amount,
      passengerId: dto.passengerId,
      createdAt: new Date(),
    };

    this.transactions.push(tx);
    return tx;
  }

  /**
   * Basic "today's earnings" for a driver.
   * We'll make this smarter later (routes, shifts, etc).
   */
  getDriverEarningsForToday(driverId: string) {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    const todaysTx = this.transactions.filter(
      (tx) => tx.driverId === driverId && tx.createdAt >= startOfDay,
    );

    const totalCents = todaysTx.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      driverId,
      currency: 'XCD',
      totalCents,
      total: totalCents / 100,
      count: todaysTx.length,
    };
  }

  // Handy debug helper
  findAllForDriver(driverId: string): Transaction[] {
    return this.transactions.filter((tx) => tx.driverId === driverId);
  }
}

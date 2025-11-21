import { Injectable } from '@nestjs/common';

export interface WalletSnapshot {
  driverId: string;
  currency: 'XCD';
  availableCents: number;
  totalEarnedCents: number;
  totalPaidOutCents: number;
  lastPayoutAt?: string;
}

@Injectable()
export class WalletService {
  private wallets = new Map<string, WalletSnapshot>();

  private getOrCreateWallet(driverId: string): WalletSnapshot {
    let wallet = this.wallets.get(driverId);
    if (!wallet) {
      wallet = {
        driverId,
        currency: 'XCD',
        availableCents: 0,
        totalEarnedCents: 0,
        totalPaidOutCents: 0,
      };
      this.wallets.set(driverId, wallet);
    }
    return wallet;
  }

  getSnapshot(driverId: string): WalletSnapshot {
    return this.getOrCreateWallet(driverId);
  }

  addEarnings(driverId: string, amount: number): WalletSnapshot {
    const wallet = this.getOrCreateWallet(driverId);
    wallet.availableCents += amount;
    wallet.totalEarnedCents += amount;
    return wallet;
  }

  payoutAll(driverId: string): WalletSnapshot {
    const wallet = this.getOrCreateWallet(driverId);
    if (wallet.availableCents === 0) {
      return wallet;
    }

    wallet.totalPaidOutCents += wallet.availableCents;
    wallet.availableCents = 0;
    wallet.lastPayoutAt = new Date().toISOString();
    return wallet;
  }
}

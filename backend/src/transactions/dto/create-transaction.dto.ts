export class CreateTransactionDto {
  driverId!: string;
  vehicleId!: string;
  amount!: number; // cents, e.g. 300 = $3.00
  passengerId?: string; // optional for now
}

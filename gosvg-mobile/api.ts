import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
export const BACKEND_BASE_URL = isWeb
  ? 'http://localhost:3000'
  : 'http://192.168.6.141:3000'; // replace with my laptop IP

export async function getHealth() {
  const res = await fetch(`${BACKEND_BASE_URL}/health`);
  return res.json();
}

export async function getEarningsToday(driverId) {
  const res = await fetch(`${BACKEND_BASE_URL}/drivers/${driverId}/earnings-today`);
  return res.json();
}

export async function createTransaction(driverId, vehicleId, amount) {
  const res = await fetch(`${BACKEND_BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId, vehicleId, amount }),
  });
  return res.json();
}

export async function submitTrip(driverId, vehicleId, amountXcd) {
  const amount = Math.round(amountXcd * 100);
  const res = await fetch(`${BACKEND_BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId, vehicleId, amount }),
  });
  return res.json();
}

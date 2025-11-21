import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import { getEarningsToday, submitTrip } from './api';

type HealthResponse = {
  status: string;
  timestamp: string;
};

type WalletSnapshot = {
  driverId: string;
  currency: string;
  availableCents: number;
  totalEarnedCents: number;
  totalPaidOutCents: number;
  lastPayoutAt?: string;
};

type EarningsResponse = {
  status: string;
  driverId: string;
  currency: string;
  totalCents: number;
  total: number;
  count: number;
};

const isWeb = Platform.OS === 'web';
const BACKEND_BASE_URL = isWeb
  ? 'http://localhost:3000' // browser on the laptop
  : 'http://192.168.6.141:3000'; // phone via WiFi

export default function App() {
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [earnings, setEarnings] = useState<EarningsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState('driver-1');
  const [vehicleId, setVehicleId] = useState('van-22');
  const [amountXcd, setAmountXcd] = useState('');
  const [healthLoading, setHealthLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/health`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: HealthResponse = await res.json();
      setHealthStatus(json);
    } catch (err: any) {
      setError(err.message ?? 'Unable to fetch health');
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/drivers/${driverId}/wallet`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setWallet(json.wallet);
    } catch (err: any) {
      setError(err.message ?? 'Unable to fetch wallet');
    } finally {
      setWalletLoading(false);
    }
  }, [driverId]);

  const fetchEarnings = useCallback(async () => {
    setEarningsLoading(true);
    setError(null);
    try {
      const data = await getEarningsToday(driverId);
      setEarnings(data);
    } catch (err: any) {
      setError(err.message ?? 'Unable to fetch earnings');
    } finally {
      setEarningsLoading(false);
    }
  }, [driverId]);

  const simulateRides = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const amounts = [300, 400, 500];
      for (const amount of amounts) {
        const res = await fetch(`${BACKEND_BASE_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverId,
            vehicleId: 'van-22',
            amount,
          }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }
      await fetchWallet();
    } catch (err: any) {
      setError(err.message ?? 'Unable to simulate rides');
    } finally {
      setActionLoading(false);
    }
  }, [fetchWallet]);

  const cashOutNow = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/drivers/${driverId}/payouts`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      await fetchWallet();
    } catch (err: any) {
      setError(err.message ?? 'Unable to cash out');
    } finally {
      setActionLoading(false);
    }
  }, [driverId, fetchWallet]);

  const handleSubmitTrip = useCallback(async () => {
    const numericAmount = parseFloat(amountXcd);
    if (Number.isNaN(numericAmount)) {
      setError('Enter a valid trip amount');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      await submitTrip(driverId, vehicleId, numericAmount);
      setAmountXcd('');
      await fetchEarnings();
    } catch (err: any) {
      setError(err.message ?? 'Unable to submit trip');
    } finally {
      setActionLoading(false);
    }
  }, [amountXcd, driverId, fetchEarnings, vehicleId]);

  useEffect(() => {
    fetchHealth();
    fetchWallet();
  }, [fetchHealth, fetchWallet]);

  const isBusy = healthLoading || walletLoading || actionLoading || earningsLoading;
  const formatXcd = (cents?: number) =>
    typeof cents === 'number' ? (cents / 100).toFixed(2) : '0.00';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GoSVG – Health Check</Text>

      <View style={styles.block}>
        <Text style={styles.label}>Driver ID</Text>
        <TextInput
          style={styles.input}
          value={driverId}
          onChangeText={setDriverId}
          placeholder="Enter driver ID"
          placeholderTextColor="#9bb0cf"
          autoCapitalize="none"
        />
      </View>

      {(healthStatus || isBusy) && (
        <View style={styles.block}>
          <Text style={styles.label}>Status: {healthStatus?.status ?? '—'}</Text>
          <Text style={styles.label}>Timestamp:</Text>
          <Text style={styles.value}>{healthStatus?.timestamp ?? '—'}</Text>
        </View>
      )}

      <View style={styles.block}>
        <Button
          title="Get Earnings Today"
          onPress={fetchEarnings}
          disabled={earningsLoading}
        />
      </View>

      {earnings && (
        <View style={styles.block}>
          <Text style={styles.label}>Earnings (today)</Text>
          <Text style={styles.value}>
            Total: {formatXcd(earnings.totalCents)} {earnings.currency}
          </Text>
          <Text style={styles.value}>Trips: {earnings.count}</Text>
        </View>
      )}

      <View style={styles.block}>
        <Text style={styles.label}>Submit Trip</Text>
        <TextInput
          style={styles.input}
          value={amountXcd}
          onChangeText={setAmountXcd}
          placeholder="Amount (XCD)"
          placeholderTextColor="#9bb0cf"
          keyboardType="decimal-pad"
        />
        <View style={{ height: 12 }} />
        <TextInput
          style={styles.input}
          value={vehicleId}
          onChangeText={setVehicleId}
          placeholder="Vehicle ID"
          placeholderTextColor="#9bb0cf"
          autoCapitalize="none"
        />
        <View style={{ height: 12 }} />
        <Button
          title="Submit Trip"
          onPress={handleSubmitTrip}
          disabled={actionLoading}
        />
      </View>

      <View style={styles.block}>
        <Button title="Simulate Rides" onPress={simulateRides} disabled={actionLoading} />
      </View>

      <View style={styles.block}>
        <Button title="Cash Out Now" onPress={cashOutNow} disabled={actionLoading} />
      </View>

      {isBusy && (
        <View style={styles.block}>
          <ActivityIndicator />
          <Text style={styles.value}>Syncing with backend…</Text>
        </View>
      )}

      {wallet && (
        <View style={styles.block}>
          <Text style={styles.label}>Wallet (driver-1)</Text>
          <Text style={styles.value}>Currency: {wallet.currency}</Text>
          <Text style={styles.value}>
            Available: {formatXcd(wallet.availableCents)} XCD
          </Text>
          <Text style={styles.value}>
            Total earned: {formatXcd(wallet.totalEarnedCents)} XCD
          </Text>
          <Text style={styles.value}>
            Total paid out: {formatXcd(wallet.totalPaidOutCents)} XCD
          </Text>
          <Text style={styles.value}>Last payout: {wallet.lastPayoutAt ?? '—'}</Text>
        </View>
      )}

      {error && !isBusy && (
        <View style={styles.block}>
          <Text style={styles.error}>Error: {error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    backgroundColor: '#0b1727',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
  },
  block: {
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1f2c3d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    backgroundColor: '#101d2d',
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  error: {
    fontSize: 16,
    color: '#ff6b6b',
  },
});

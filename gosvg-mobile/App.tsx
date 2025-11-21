import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, Platform } from 'react-native';

type HealthResponse = {
  status: string;
  timestamp: string;
};

const isWeb = Platform.OS === 'web';
const BACKEND_BASE_URL = isWeb
  ? 'http://localhost:3000' // browser on the laptop
  : 'http://192.168.6.141:3000'; // phone via WiFi

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pingBackend = async () => {
    setLoading(true);
    setError(null);
    setHealth(null);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/health`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: HealthResponse = await res.json();
      setHealth(json);
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GoSVG – Health Check</Text>

      <Button title="Ping Backend" onPress={pingBackend} />

      {loading && (
        <View style={styles.block}>
          <ActivityIndicator />
          <Text>Contacting backend…</Text>
        </View>
      )}

      {health && !loading && (
        <View style={styles.block}>
          <Text style={styles.label}>Status: {health.status}</Text>
          <Text style={styles.label}>Timestamp:</Text>
          <Text>{health.timestamp}</Text>
        </View>
      )}

      {error && !loading && (
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
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  error: {
    fontSize: 16,
    color: '#ff6b6b',
  },
});

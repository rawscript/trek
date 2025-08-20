import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { ConnectedDevice } from '../types';
import * as deviceService from '../services/deviceService';

interface DeviceContextType {
  connectedDevice: ConnectedDevice | null;
  heartRate: number | null;
  heartRateHistory: number[];
  isConnecting: boolean;
  connectionError: string | null;
  connect: () => Promise<void>;
}

export const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connectedDevice, setConnectedDevice] = useState<ConnectedDevice | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleHeartRateChanged = (rate: number) => {
    setHeartRate(rate);
    setHeartRateHistory(prev => [...prev, rate].slice(-100)); // Keep last 100 readings
  };

  const connect = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const device = await deviceService.scanAndConnect(handleHeartRateChanged);
      setConnectedDevice(device);
      setHeartRate(null);
      setHeartRateHistory([]);
      console.log('Successfully connected to', device.name);
    } catch (error: any) {
      console.error('Failed to connect:', error);
      setConnectionError(error.message || 'Failed to connect to device.');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const value = { connectedDevice, heartRate, heartRateHistory, isConnecting, connectionError, connect };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};
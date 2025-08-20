import { Platform } from 'react-native';
import { ConnectedDevice } from '../types';

// Only import BLE dependencies on mobile platforms
let BleManager: any = null;
let request: any = null;
let PERMISSIONS: any = null;
let RESULTS: any = null;

if (Platform.OS !== 'web') {
  try {
    const bleModule = require('react-native-ble-plx');
    BleManager = bleModule.BleManager;
    
    const permissionsModule = require('react-native-permissions');
    request = permissionsModule.request;
    PERMISSIONS = permissionsModule.PERMISSIONS;
    RESULTS = permissionsModule.RESULTS;
  } catch (error) {
    console.warn('Bluetooth or permissions module not available:', error);
  }
}

class BluetoothService {
  private bleManager: any = null;
  private connectedDevice: any = null;

  constructor() {
    if (Platform.OS !== 'web' && BleManager) {
      this.bleManager = new BleManager();
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Web Bluetooth API handles permissions automatically
    }

    if (!request || !PERMISSIONS || !RESULTS) {
      console.warn('Permissions module not available');
      return false;
    }

    try {
      if (Platform.OS === 'android') {
        const permissions = [];
        
        // Check which permissions are available
        if (PERMISSIONS.ANDROID.BLUETOOTH_SCAN) {
          permissions.push(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
        }
        if (PERMISSIONS.ANDROID.BLUETOOTH_CONNECT) {
          permissions.push(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
        }
        if (PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION) {
          permissions.push(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        }

        const results = await Promise.all(permissions.map(permission => request(permission)));
        return results.every(result => result === RESULTS.GRANTED);
      } else if (Platform.OS === 'ios') {
        // iOS permissions are handled automatically by the system
        return true;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }

    return false;
  }

  async scanAndConnect(onHeartRateChanged: (rate: number) => void): Promise<ConnectedDevice> {
    if (Platform.OS === 'web') {
      return this.scanAndConnectWeb(onHeartRateChanged);
    } else {
      return this.scanAndConnectMobile(onHeartRateChanged);
    }
  }

  private async scanAndConnectWeb(onHeartRateChanged: (rate: number) => void): Promise<ConnectedDevice> {
    if (!(navigator as any).bluetooth) {
      throw new Error('Web Bluetooth API is not available on this browser.');
    }

    try {
      console.log('Requesting Bluetooth device...');
      const device: any = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      if (!device.name) {
        throw new Error('Device found but it has no name.');
      }
      
      console.log('Connecting to GATT Server...');
      const server = await device.gatt?.connect();
      
      console.log('Getting Heart Rate Service...');
      const service = await server?.getPrimaryService('heart_rate');
      
      console.log('Getting Heart Rate Measurement Characteristic...');
      const characteristic = await service?.getCharacteristic('heart_rate_measurement');
      
      await characteristic?.startNotifications();
      console.log('> Notifications started');

      characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value as DataView;
        const heartRate = this.parseHeartRate(value);
        onHeartRateChanged(heartRate);
      });

      return {
        id: device.id,
        name: device.name,
      };
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        throw new Error('No device was selected. Please try scanning again.');
      }
      console.error("Bluetooth connection failed:", error);
      throw new Error('Connection failed. Please ensure your device is nearby and Bluetooth is enabled.');
    }
  }

  private async scanAndConnectMobile(onHeartRateChanged: (rate: number) => void): Promise<ConnectedDevice> {
    if (!this.bleManager) {
      throw new Error('Bluetooth manager not initialized. Make sure react-native-ble-plx is properly installed.');
    }

    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Bluetooth permissions not granted');
    }

    try {
      // Check if Bluetooth is enabled
      const state = await this.bleManager.state();
      if (state !== 'PoweredOn') {
        throw new Error('Bluetooth is not enabled. Please turn on Bluetooth and try again.');
      }

      console.log('Scanning for heart rate devices...');
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.bleManager?.stopDeviceScan();
          reject(new Error('No heart rate devices found. Make sure your device is nearby and in pairing mode.'));
        }, 10000);

        this.bleManager?.startDeviceScan(['180D'], null, async (error: any, device: any) => {
          if (error) {
            clearTimeout(timeout);
            this.bleManager?.stopDeviceScan();
            reject(new Error(`Scan failed: ${error.message}`));
            return;
          }

          if (device && device.name) {
            clearTimeout(timeout);
            this.bleManager?.stopDeviceScan();
            
            try {
              console.log(`Connecting to ${device.name}...`);
              const connectedDevice = await device.connect();
              this.connectedDevice = connectedDevice;
              
              console.log('Discovering services...');
              await connectedDevice.discoverAllServicesAndCharacteristics();
              
              console.log('Setting up heart rate notifications...');
              await connectedDevice.monitorCharacteristicForService(
                '180D', // Heart Rate Service UUID
                '2A37', // Heart Rate Measurement Characteristic UUID
                (error: any, characteristic: any) => {
                  if (error) {
                    console.error('Heart rate monitoring error:', error);
                    return;
                  }
                  
                  if (characteristic?.value) {
                    const heartRate = this.parseHeartRateFromBase64(characteristic.value);
                    onHeartRateChanged(heartRate);
                  }
                }
              );

              resolve({
                id: connectedDevice.id,
                name: connectedDevice.name || 'Unknown Device',
              });
            } catch (connectionError) {
              reject(new Error(`Connection failed: ${connectionError}`));
            }
          }
        });
      });
    } catch (error) {
      console.error('Mobile Bluetooth connection failed:', error);
      throw new Error(`Connection failed: ${error}`);
    }
  }

  private parseHeartRate(value: DataView): number {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    if (rate16Bits) {
      return value.getUint16(1, true);
    } else {
      return value.getUint8(1);
    }
  }

  private parseHeartRateFromBase64(base64Value: string): number {
    try {
      // Convert base64 to Uint8Array for React Native compatibility
      const binaryString = atob(base64Value);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      if (bytes.length === 0) return 0;
      
      const flags = bytes[0];
      const rate16Bits = flags & 0x1;
      if (rate16Bits && bytes.length >= 3) {
        // Read 16-bit little-endian value
        return bytes[1] | (bytes[2] << 8);
      } else if (bytes.length >= 2) {
        return bytes[1];
      }
      return 0;
    } catch (error) {
      console.error('Error parsing heart rate data:', error);
      return 0;
    }
  }

  async disconnect(): Promise<void> {
    if (Platform.OS !== 'web' && this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
        this.connectedDevice = null;
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  }

  destroy(): void {
    if (Platform.OS !== 'web' && this.bleManager) {
      this.bleManager.destroy();
      this.bleManager = null;
    }
  }
}

export const bluetoothService = new BluetoothService();

// Legacy export for backward compatibility
export const scanAndConnect = bluetoothService.scanAndConnect.bind(bluetoothService);
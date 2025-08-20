import { ConnectedDevice } from '../types';

// A simple parser for the heart rate measurement characteristic
const parseHeartRate = (value: DataView): number => {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    if (rate16Bits) {
        return value.getUint16(1, true);
    } else {
        return value.getUint8(1);
    }
};

export const scanAndConnect = async (onHeartRateChanged: (rate: number) => void): Promise<ConnectedDevice> => {
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
            const heartRate = parseHeartRate(value);
            onHeartRateChanged(heartRate);
        });

        const connectedDevice: ConnectedDevice = {
            id: device.id,
            name: device.name,
        };
        
        return connectedDevice;
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            throw new Error('No device was selected. Please try scanning again.');
        }
        console.error("Bluetooth connection failed:", error);
        throw new Error('Connection failed. Please ensure your device is nearby and Bluetooth is enabled.');
    }
};
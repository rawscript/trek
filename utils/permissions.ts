import { Platform, Alert, Linking } from 'react-native';

// Conditionally import permissions module
let request: any = null;
let check: any = null;
let PERMISSIONS: any = null;
let RESULTS: any = null;

if (Platform.OS !== 'web') {
  try {
    const permissionsModule = require('react-native-permissions');
    request = permissionsModule.request;
    check = permissionsModule.check;
    PERMISSIONS = permissionsModule.PERMISSIONS;
    RESULTS = permissionsModule.RESULTS;
  } catch (error) {
    console.warn('react-native-permissions not available:', error);
  }
}

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

class PermissionsManager {
  async requestLocationPermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      return { granted: true };
    }

    if (!request || !PERMISSIONS || !RESULTS) {
      return { 
        granted: false, 
        message: 'Permissions module not available. Please ensure react-native-permissions is properly installed.' 
      };
    }

    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          return { granted: true };
        case RESULTS.DENIED:
          return { 
            granted: false, 
            message: 'Location permission is required to show your position on the map and track activities.' 
          };
        case RESULTS.BLOCKED:
          return { 
            granted: false, 
            message: 'Location permission is blocked. Please enable it in your device settings.' 
          };
        default:
          return { 
            granted: false, 
            message: 'Location permission is not available on this device.' 
          };
      }
    } catch (error) {
      console.error('Location permission error:', error);
      return { 
        granted: false, 
        message: 'Failed to request location permission.' 
      };
    }
  }

  async requestBluetoothPermissions(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      return { granted: true };
    }

    if (!request || !PERMISSIONS || !RESULTS) {
      return { 
        granted: false, 
        message: 'Permissions module not available. Please ensure react-native-permissions is properly installed.' 
      };
    }

    try {
      if (Platform.OS === 'android') {
        // Android 12+ requires multiple Bluetooth permissions
        const permissions = [];
        
        if (PERMISSIONS.ANDROID.BLUETOOTH_SCAN) {
          permissions.push(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
        }
        if (PERMISSIONS.ANDROID.BLUETOOTH_CONNECT) {
          permissions.push(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
        }
        if (PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION) {
          permissions.push(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        }

        if (permissions.length === 0) {
          return {
            granted: false,
            message: 'Required Bluetooth permissions not available on this Android version.'
          };
        }

        const results = await Promise.all(permissions.map(permission => request(permission)));
        const allGranted = results.every(result => result === RESULTS.GRANTED);

        if (allGranted) {
          return { granted: true };
        } else {
          return {
            granted: false,
            message: 'Bluetooth and location permissions are required to connect to fitness devices.'
          };
        }
      } else {
        // iOS handles Bluetooth permissions automatically
        return { granted: true };
      }
    } catch (error) {
      console.error('Bluetooth permission error:', error);
      return {
        granted: false,
        message: 'Failed to request Bluetooth permissions.'
      };
    }
  }

  async requestCameraPermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      return { granted: true };
    }

    if (!request || !PERMISSIONS || !RESULTS) {
      return { 
        granted: false, 
        message: 'Permissions module not available. Please ensure react-native-permissions is properly installed.' 
      };
    }

    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          return { granted: true };
        case RESULTS.DENIED:
          return { 
            granted: false, 
            message: 'Camera permission is required to take photos and scan QR codes.' 
          };
        case RESULTS.BLOCKED:
          return { 
            granted: false, 
            message: 'Camera permission is blocked. Please enable it in your device settings.' 
          };
        default:
          return { 
            granted: false, 
            message: 'Camera permission is not available on this device.' 
          };
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      return { 
        granted: false, 
        message: 'Failed to request camera permission.' 
      };
    }
  }

  async checkPermissionStatus(permissionType: string): Promise<string> {
    if (Platform.OS === 'web') {
      return 'granted';
    }

    if (!check || !PERMISSIONS || !RESULTS) {
      return 'unavailable';
    }

    try {
      let permission;
      switch (permissionType) {
        case 'location':
          permission = Platform.OS === 'ios' 
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
          break;
        case 'camera':
          permission = Platform.OS === 'ios' 
            ? PERMISSIONS.IOS.CAMERA 
            : PERMISSIONS.ANDROID.CAMERA;
          break;
        default:
          return 'unavailable';
      }

      return await check(permission);
    } catch (error) {
      console.error('Permission check error:', error);
      return 'unavailable';
    }
  }

  showPermissionAlert(title: string, message: string, canOpenSettings = true) {
    const buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }> = [
      { text: 'Cancel', style: 'cancel' }
    ];

    if (canOpenSettings) {
      buttons.push({
        text: 'Open Settings',
        onPress: () => Linking.openSettings()
      });
    }

    Alert.alert(title, message, buttons);
  }

  async requestAllRequiredPermissions(): Promise<{
    location: PermissionResult;
    bluetooth: PermissionResult;
    camera: PermissionResult;
  }> {
    const [location, bluetooth, camera] = await Promise.all([
      this.requestLocationPermission(),
      this.requestBluetoothPermissions(),
      this.requestCameraPermission()
    ]);

    return { location, bluetooth, camera };
  }
}

export const permissionsManager = new PermissionsManager();
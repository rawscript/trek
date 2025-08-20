# Bluetooth & Maps Integration Setup

This document outlines the improvements made to handle web components compatibility issues and implement proper Bluetooth and Maps functionality.

## Changes Made

### 1. Bluetooth Integration

#### New Dependencies Added:
- `react-native-ble-plx`: Cross-platform Bluetooth Low Energy library
- `react-native-permissions`: Runtime permissions management

#### Features:
- **Platform-aware Bluetooth service** (`services/bluetoothService.ts`)
  - Web: Uses Web Bluetooth API (existing functionality)
  - Mobile: Uses react-native-ble-plx for native Bluetooth support
  - Automatic permission handling for Android 12+ requirements
  - Heart rate monitor support with proper characteristic parsing

#### Permissions Added:
- Android: `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN`, `ACCESS_BACKGROUND_LOCATION`
- iOS: Bluetooth usage descriptions in Info.plist

### 2. Maps Integration

#### New Dependencies Added:
- `react-native-yandex-mapkit`: Native Yandex Maps integration
- `react-native-webview`: For web-based map rendering on mobile

#### Features:
- **Yandex Maps API integration** with provided API key: `11d6371f-43e0-4751-974e-045c02d77a2d`
- **Platform-specific map rendering**:
  - Web: Custom InteractiveMap component (existing)
  - Mobile: YandexMap component with WebView-based rendering
- **Maps service** (`services/mapsService.ts`) with:
  - Static map image generation
  - Directions API
  - Places search
  - Geocoding and reverse geocoding
  - Amenity marker conversion

### 3. Location Services

#### New Features:
- **Enhanced location hook** (`hooks/useLocation.ts`)
  - Cross-platform location tracking
  - Proper permission handling
  - Error management with user-friendly messages
  - High accuracy GPS with configurable options

#### Permissions Manager:
- **Centralized permissions handling** (`utils/permissions.ts`)
  - Location, Bluetooth, and Camera permissions
  - Platform-specific permission requests
  - User-friendly error messages
  - Settings redirect functionality

### 4. Updated Components

#### MapScreen:
- Now uses the new `useLocation` hook
- Platform-aware map rendering (InteractiveMap for web, YandexMap for mobile)
- Improved error handling and loading states

#### YandexMap Component:
- WebView-based Yandex Maps integration
- Interactive markers with click handling
- Custom marker icons for different amenity types
- Responsive design with configurable height

## Installation & Setup

### 1. Install Dependencies
```bash
npm install react-native-ble-plx react-native-yandex-mapkit react-native-webview react-native-permissions
```

### 2. iOS Setup
Add to `ios/Podfile`:
```ruby
pod 'react-native-ble-plx', :path => '../node_modules/react-native-ble-plx'
pod 'react-native-permissions', :path => '../node_modules/react-native-permissions'
```

Run:
```bash
cd ios && pod install
```

### 3. Android Setup
The permissions are already configured in `app.json`. For Android 12+, ensure your target SDK is 31 or higher.

### 4. Yandex Maps Setup
The API key is already configured. For production, consider moving it to environment variables.

## Usage

### Bluetooth Device Connection
```typescript
import { bluetoothService } from './services/bluetoothService';

// Connect to heart rate monitor
const device = await bluetoothService.scanAndConnect((heartRate) => {
  console.log('Heart rate:', heartRate);
});

// Disconnect
await bluetoothService.disconnect();
```

### Location Services
```typescript
import { useLocation } from './hooks/useLocation';

const MyComponent = () => {
  const { position, error, loading, getCurrentPosition } = useLocation({
    enableHighAccuracy: true,
    distanceInterval: 10
  });

  // Get one-time position
  const handleGetLocation = async () => {
    const coords = await getCurrentPosition();
    console.log('Current position:', coords);
  };
};
```

### Maps Integration
```typescript
import { mapsService } from './services/mapsService';

// Get static map URL
const mapUrl = mapsService.getStaticMapUrl({
  center: { latitude: 37.7749, longitude: -122.4194 },
  zoom: 15,
  showUserLocation: true
}, markers);

// Search nearby places
const places = await mapsService.searchNearby(
  { latitude: 37.7749, longitude: -122.4194 },
  'restaurants'
);
```

## Error Handling

All services include comprehensive error handling:
- Permission denied scenarios
- Device compatibility issues
- Network connectivity problems
- Service unavailability

Users receive clear, actionable error messages with options to:
- Retry the operation
- Open device settings
- Use alternative features

## Platform Compatibility

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| Bluetooth | ✅ Web Bluetooth API | ✅ Native BLE | ✅ Native BLE |
| Maps | ✅ Custom SVG | ✅ Yandex WebView | ✅ Yandex WebView |
| Location | ✅ Geolocation API | ✅ Expo Location | ✅ Expo Location |
| Permissions | ✅ Browser prompts | ✅ iOS prompts | ✅ Runtime requests |

## Testing

### Bluetooth Testing:
1. Ensure you have a Bluetooth heart rate monitor
2. Enable Bluetooth on your device
3. Grant necessary permissions when prompted
4. Test connection and data reception

### Maps Testing:
1. Enable location services
2. Grant location permissions
3. Verify map loads with user position
4. Test amenity markers and interactions

### Location Testing:
1. Test both indoor and outdoor scenarios
2. Verify permission handling
3. Check error states (permissions denied, GPS disabled)
4. Test location accuracy and updates

## Troubleshooting

### Common Issues:

1. **Bluetooth not working on Android 12+**
   - Ensure all Bluetooth permissions are granted
   - Check that location services are enabled

2. **Maps not loading**
   - Verify internet connection
   - Check Yandex API key validity
   - Ensure WebView permissions

3. **Location not updating**
   - Check location permissions
   - Verify GPS is enabled
   - Test in outdoor environment for better signal

4. **Permission errors**
   - Use the permissions manager to request permissions
   - Guide users to device settings if needed
   - Provide fallback functionality where possible
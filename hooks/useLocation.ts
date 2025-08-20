import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Coords } from '../types';
import { permissionsManager } from '../utils/permissions';

interface LocationState {
  position: Coords | null;
  error: string | null;
  loading: boolean;
  accuracy: number | null;
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceInterval?: number;
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const [state, setState] = useState<LocationState>({
    position: null,
    error: null,
    loading: true,
    accuracy: null
  });

  const watchIdRef = useRef<number | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    distanceInterval = 10
  } = options;

  useEffect(() => {
    let isMounted = true;

    const startLocationTracking = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Request permissions
        const permissionResult = await permissionsManager.requestLocationPermission();
        if (!permissionResult.granted) {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: permissionResult.message || 'Location permission denied'
            }));
          }
          return;
        }

        if (Platform.OS === 'web') {
          // Use web geolocation API
          if (!navigator.geolocation) {
            if (isMounted) {
              setState(prev => ({
                ...prev,
                loading: false,
                error: 'Geolocation is not supported by this browser'
              }));
            }
            return;
          }

          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  position: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  },
                  accuracy: position.coords.accuracy,
                  loading: false,
                  error: null
                }));
              }
            },
            (error) => {
              if (isMounted) {
                let errorMessage = 'Failed to get location';
                switch (error.code) {
                  case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied. Please enable location services.';
                    break;
                  case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                  case error.TIMEOUT:
                    errorMessage = 'Location request timed out.';
                    break;
                }
                setState(prev => ({
                  ...prev,
                  loading: false,
                  error: errorMessage
                }));
              }
            },
            {
              enableHighAccuracy,
              timeout,
              maximumAge
            }
          );
        } else {
          // Use Expo Location for mobile
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            if (isMounted) {
              setState(prev => ({
                ...prev,
                loading: false,
                error: 'Location permission denied'
              }));
            }
            return;
          }

          // Check if location services are enabled
          const enabled = await Location.hasServicesEnabledAsync();
          if (!enabled) {
            if (isMounted) {
              setState(prev => ({
                ...prev,
                loading: false,
                error: 'Location services are disabled. Please enable them in your device settings.'
              }));
            }
            return;
          }

          // Start watching location
          locationSubscriptionRef.current = await Location.watchPositionAsync(
            {
              accuracy: enableHighAccuracy 
                ? Location.Accuracy.BestForNavigation 
                : Location.Accuracy.Balanced,
              timeInterval: 1000,
              distanceInterval
            },
            (location) => {
              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  position: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                  },
                  accuracy: location.coords.accuracy,
                  loading: false,
                  error: null
                }));
              }
            }
          );
        }
      } catch (error) {
        console.error('Location tracking error:', error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to start location tracking'
          }));
        }
      }
    };

    startLocationTracking();

    return () => {
      isMounted = false;
      
      // Cleanup
      if (Platform.OS === 'web' && watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      } else if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
    };
  }, [enableHighAccuracy, timeout, maximumAge, distanceInterval]);

  const getCurrentPosition = async (): Promise<Coords | null> => {
    try {
      const permissionResult = await permissionsManager.requestLocationPermission();
      if (!permissionResult.granted) {
        throw new Error(permissionResult.message || 'Location permission denied');
      }

      if (Platform.OS === 'web') {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            (error) => {
              reject(new Error(`Failed to get current position: ${error.message}`));
            },
            { enableHighAccuracy, timeout, maximumAge }
          );
        });
      } else {
        const location = await Location.getCurrentPositionAsync({
          accuracy: enableHighAccuracy 
            ? Location.Accuracy.BestForNavigation 
            : Location.Accuracy.Balanced
        });
        
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
      }
    } catch (error) {
      console.error('Get current position error:', error);
      return null;
    }
  };

  return {
    ...state,
    getCurrentPosition,
    hasPermission: state.position !== null || state.error === null
  };
};
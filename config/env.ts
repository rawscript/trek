// Environment configuration for Trekly app
export interface AppConfig {
  geminiApiKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
  enableLogging: boolean;
  enableAI: boolean;
  enableImageGeneration: boolean;
  enableDeviceConnection: boolean;
  fallbackImageService: string;
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  return fallback;
};

// Main configuration object
export const config: AppConfig = {
  geminiApiKey: getEnvVar('API_KEY') || getEnvVar('GEMINI_API_KEY'),
  isDevelopment: getEnvVar('NODE_ENV') !== 'production',
  isProduction: getEnvVar('NODE_ENV') === 'production',
  enableLogging: getEnvVar('NODE_ENV') !== 'production',
  enableAI: Boolean(getEnvVar('API_KEY') || getEnvVar('GEMINI_API_KEY')),
  enableImageGeneration: Boolean(getEnvVar('API_KEY') || getEnvVar('GEMINI_API_KEY')),
  enableDeviceConnection: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
  fallbackImageService: 'dicebear'
};

// Logging utility that respects environment settings
export const logger = {
  log: (...args: any[]) => {
    if (config.enableLogging) {
      console.log('[Trekly]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (config.enableLogging) {
      console.error('[Trekly Error]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (config.enableLogging) {
      console.warn('[Trekly Warning]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (config.enableLogging) {
      console.info('[Trekly Info]', ...args);
    }
  }
};

// Feature availability checks
export const features = {
  isAIAvailable: () => config.enableAI && config.geminiApiKey.length > 0,
  isImageGenerationAvailable: () => config.enableImageGeneration && config.geminiApiKey.length > 0,
  isDeviceConnectionAvailable: () => config.enableDeviceConnection,
  isBluetoothAvailable: () => typeof navigator !== 'undefined' && 'bluetooth' in navigator
};
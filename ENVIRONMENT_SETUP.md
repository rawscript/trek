# Trekly Environment Configuration Guide

## Overview

This document explains the comprehensive environment configuration system implemented for the Trekly app to ensure all features work properly with proper fallbacks when external services are unavailable.

## Configuration System

### Environment Configuration (`config/env.ts`)

The app now uses a centralized configuration system that:

- **Detects API availability** - Checks if Gemini API key is present
- **Provides feature flags** - Enables/disables features based on environment
- **Centralized logging** - Consistent logging across the app
- **Graceful degradation** - Fallbacks when services are unavailable

### Key Features

#### 1. **AI Services with Fallbacks**
- **Primary**: Google Gemini AI for chat, insights, and image generation
- **Fallback**: Pre-written motivational messages and insights
- **Image Fallback**: External services (Unsplash, Picsum, DiceBear)

#### 2. **Avatar Generation**
- **Primary**: Gemini Imagen 3.0 for custom AI avatars
- **Secondary**: DiceBear API with multiple styles
- **Tertiary**: Pravatar service
- **UI**: Dual-tab interface (AI Generate + Presets)

#### 3. **Activity & Campaign Images**
- **Primary**: Gemini image generation
- **Fallback**: Unsplash/Picsum images based on keywords
- **Final Fallback**: SVG gradients with text

#### 4. **Smart Logging**
- Development: Full logging enabled
- Production: Logging disabled for performance
- Consistent format: `[Trekly] message`

## Environment Variables

### Required
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional
```bash
NODE_ENV=development  # or production
```

## Feature Availability

### With API Key (Full Experience)
- ✅ AI Chat with Gemini
- ✅ AI-generated motivational messages
- ✅ AI workout insights
- ✅ Custom avatar generation
- ✅ Activity image generation
- ✅ Campaign image generation

### Without API Key (Fallback Experience)
- ✅ Pre-written motivational messages
- ✅ Rule-based workout insights
- ✅ DiceBear avatar generation
- ✅ Unsplash/Picsum images
- ✅ All core app functionality
- ❌ AI Chat (disabled with helpful message)

## Implementation Details

### 1. **Gemini Service (`services/geminiService.ts`)**
- Conditional AI initialization
- Comprehensive error handling
- Multiple fallback layers
- Smart image generation with external services

### 2. **Chat Screen (`components/screens/ChatScreen.tsx`)**
- Detects AI availability
- Shows appropriate welcome message
- Disables input when AI unavailable
- Clear user feedback

### 3. **Avatar Generation (`components/ui/AvatarSelectionModal.tsx`)**
- Dual-tab interface (AI + Presets)
- Automatic fallback to DiceBear
- Multiple avatar styles
- Consistent user experience

### 4. **Configuration System (`config/env.ts`)**
```typescript
export const features = {
  isAIAvailable: () => config.enableAI && config.geminiApiKey.length > 0,
  isImageGenerationAvailable: () => config.enableImageGeneration && config.geminiApiKey.length > 0,
  isDeviceConnectionAvailable: () => config.enableDeviceConnection,
  isBluetoothAvailable: () => typeof navigator !== 'undefined' && 'bluetooth' in navigator
};
```

## Setup Instructions

### 1. **With Gemini API Key (Recommended)**
```bash
# Add to .env.local
GEMINI_API_KEY=your_actual_api_key_here

# Start the app
npm run dev
```

### 2. **Without API Key (Fallback Mode)**
```bash
# Remove or comment out API key in .env.local
# GEMINI_API_KEY=

# Start the app
npm run dev
```

## User Experience

### Full AI Experience
- Rich AI conversations
- Personalized workout insights
- Custom avatar generation
- Dynamic image creation

### Fallback Experience
- Pre-written motivational content
- Rule-based insights
- Beautiful preset avatars
- Stock photography
- All core features functional

## Benefits

1. **Reliability** - App works regardless of API availability
2. **Performance** - Fallbacks are often faster than API calls
3. **Cost Control** - Reduces API usage when needed
4. **User Experience** - Seamless degradation without broken features
5. **Development** - Easy testing with/without API keys

## Troubleshooting

### Common Issues

1. **"AI chat is not available"**
   - Check GEMINI_API_KEY in .env.local
   - Verify API key is valid
   - Restart development server

2. **Images not generating**
   - Fallback images should still work
   - Check network connectivity
   - Verify external image services are accessible

3. **Console errors**
   - Check browser console for specific errors
   - Verify all environment variables are set correctly
   - Ensure all dependencies are installed

### Testing

```bash
# Test with API key
GEMINI_API_KEY=your_key npm run dev

# Test without API key
npm run dev

# Test in production mode
NODE_ENV=production npm run build && npm run preview
```

## Future Enhancements

1. **Additional Image Services** - More fallback options
2. **Offline Mode** - Local AI models for basic features
3. **API Key Validation** - Real-time key verification
4. **Usage Analytics** - Track API usage and costs
5. **Dynamic Configuration** - Runtime feature toggling

This configuration system ensures Trekly provides an excellent user experience regardless of external service availability, making it robust and reliable for all users.
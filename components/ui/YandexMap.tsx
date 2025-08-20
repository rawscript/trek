import React, { useState, useEffect } from 'react';
import { Platform, View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { Coords, Amenity } from '../../types';
import { mapsService, MapMarker } from '../../services/mapsService';

// Conditionally import WebView only for mobile platforms
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    const webViewModule = require('react-native-webview');
    WebView = webViewModule.WebView;
  } catch (error) {
    console.warn('react-native-webview not available:', error);
  }
}

interface YandexMapProps {
  userPosition: Coords;
  amenities: Amenity[];
  onAmenitySelect?: (amenity: Amenity) => void;
  zoom?: number;
  height?: number;
}

const YandexMap: React.FC<YandexMapProps> = ({ 
  userPosition, 
  amenities, 
  onAmenitySelect, 
  zoom = 15,
  height = 300 
}) => {
  const [mapHtml, setMapHtml] = useState<string>('');
  const [useStaticMap, setUseStaticMap] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      generateInteractiveMapHtml();
    } else if (WebView) {
      generateInteractiveMapHtml();
    } else {
      // Fallback to static map if WebView is not available
      setUseStaticMap(true);
    }
  }, [userPosition, amenities, zoom]);

  const generateInteractiveMapHtml = () => {
    const markers = mapsService.amenitiesToMarkers(amenities);
    
    // Add user position marker
    const userMarker: MapMarker = {
      id: 'user',
      coords: userPosition,
      title: 'Your Location',
      type: 'user'
    };

    const allMarkers = [userMarker, ...markers];

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Yandex Map</title>
    <script src="https://api-maps.yandex.ru/2.1/?apikey=11d6371f-43e0-4751-974e-045c02d77a2d&lang=en_US" type="text/javascript"></script>
    <style>
        html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
        }
        .amenity-balloon {
            padding: 10px;
            max-width: 200px;
        }
        .amenity-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }
        .amenity-type {
            color: #666;
            font-size: 12px;
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            background: #f5f5f5;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div>Loading map...</div>
    </div>
    <div id="map" style="display: none;"></div>
    <script>
        function initMap() {
            try {
                ymaps.ready(function() {
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('map').style.display = 'block';
                    
                    var map = new ymaps.Map('map', {
                        center: [${userPosition.latitude}, ${userPosition.longitude}],
                        zoom: ${zoom},
                        controls: ['zoomControl', 'geolocationControl']
                    }, {
                        searchControlProvider: 'yandex#search'
                    });

                    // Add markers
                    ${allMarkers.map(marker => `
                        var ${marker.id.replace(/[^a-zA-Z0-9]/g, '_')}Placemark = new ymaps.Placemark([${marker.coords.latitude}, ${marker.coords.longitude}], {
                            balloonContentHeader: '${marker.title.replace(/'/g, "\\'")}',
                            balloonContentBody: '<div class="amenity-balloon"><div class="amenity-title">${marker.title.replace(/'/g, "\\'")}</div><div class="amenity-type">' + getAmenityDescription('${marker.type || ''}') + '</div></div>',
                            hintContent: '${marker.title.replace(/'/g, "\\'")}'
                        }, {
                            preset: getMarkerPreset('${marker.type || ''}'),
                            iconColor: getMarkerColor('${marker.type || ''}')
                        });
                        
                        map.geoObjects.add(${marker.id.replace(/[^a-zA-Z0-9]/g, '_')}Placemark);
                        
                        ${marker.type !== 'user' ? `
                        ${marker.id.replace(/[^a-zA-Z0-9]/g, '_')}Placemark.events.add('click', function() {
                            if (window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'amenityClick',
                                    amenity: {
                                        id: '${marker.id}',
                                        name: '${marker.title.replace(/'/g, "\\'")}',
                                        type: '${marker.type}',
                                        coords: {
                                            latitude: ${marker.coords.latitude},
                                            longitude: ${marker.coords.longitude}
                                        }
                                    }
                                }));
                            }
                        });
                        ` : ''}
                    `).join('')}

                    // Auto-fit bounds to show all markers
                    if (map.geoObjects.getLength() > 1) {
                        map.setBounds(map.geoObjects.getBounds(), {
                            checkZoomRange: true,
                            zoomMargin: 50
                        });
                    }
                });
            } catch (error) {
                console.error('Map initialization error:', error);
                document.getElementById('loading').innerHTML = '<div>Map failed to load. Please check your internet connection.</div>';
            }
        }

        function getMarkerPreset(type) {
            switch(type) {
                case 'user':
                    return 'islands#blueCircleDotIcon';
                case 'water':
                    return 'islands#blueIcon';
                case 'bike_shop':
                    return 'islands#greenIcon';
                case 'restroom':
                    return 'islands#yellowIcon';
                default:
                    return 'islands#grayIcon';
            }
        }

        function getMarkerColor(type) {
            switch(type) {
                case 'user':
                    return '#3B82F6';
                case 'water':
                    return '#60A5FA';
                case 'bike_shop':
                    return '#34D399';
                case 'restroom':
                    return '#FBBF24';
                default:
                    return '#9CA3AF';
            }
        }

        function getAmenityDescription(type) {
            switch(type) {
                case 'water':
                    return 'Water fountain or hydration station';
                case 'bike_shop':
                    return 'Bike repair and equipment shop';
                case 'restroom':
                    return 'Public restroom facilities';
                case 'user':
                    return 'Your current location';
                default:
                    return 'Point of interest';
            }
        }

        // Initialize map
        initMap();
    </script>
</body>
</html>`;

    setMapHtml(html);
  };

  const generateStaticMapUrl = () => {
    const markers = mapsService.amenitiesToMarkers(amenities);
    const userMarker: MapMarker = {
      id: 'user',
      coords: userPosition,
      title: 'Your Location',
      type: 'user'
    };
    
    const allMarkers = [userMarker, ...markers];
    return mapsService.getStaticMapUrl(
      {
        center: userPosition,
        zoom,
        showUserLocation: true
      },
      allMarkers,
      400,
      height
    );
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'amenityClick' && onAmenitySelect) {
        const amenity = amenities.find(a => a.id === data.amenity.id);
        if (amenity) {
          onAmenitySelect(amenity);
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleWebViewError = () => {
    console.log('WebView failed to load, falling back to static map');
    setUseStaticMap(true);
  };

  if (Platform.OS === 'web') {
    return (
      <div 
        style={{ width: '100%', height: height }}
        dangerouslySetInnerHTML={{ __html: mapHtml }}
      />
    );
  }

  if (useStaticMap || !WebView) {
    return (
      <View style={[styles.container, { height }]}>
        <Image
          source={{ uri: generateStaticMapUrl() }}
          style={styles.staticMap}
          resizeMode="cover"
        />
        <View style={styles.staticMapOverlay}>
          <Text style={styles.staticMapText}>
            {!WebView ? 'WebView not available' : 'Interactive map unavailable'}
          </Text>
          {WebView && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setUseStaticMap(false)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        source={{ html: mapHtml }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onError={handleWebViewError}
        onHttpError={handleWebViewError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  staticMap: {
    width: '100%',
    height: '100%',
  },
  staticMapOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  staticMapText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default YandexMap;
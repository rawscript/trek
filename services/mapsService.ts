import { Platform } from 'react-native';
import { Coords, Amenity } from '../types';

const YANDEX_API_KEY = '11d6371f-43e0-4751-974e-045c02d77a2d';

export interface MapConfig {
  center: Coords;
  zoom: number;
  showUserLocation: boolean;
}

export interface MapMarker {
  id: string;
  coords: Coords;
  title: string;
  description?: string;
  type?: string;
}

class MapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = YANDEX_API_KEY;
  }

  /**
   * Get static map image URL from Yandex Maps
   */
  getStaticMapUrl(config: MapConfig, markers: MapMarker[] = [], width = 400, height = 300): string {
    const { center, zoom } = config;
    const baseUrl = 'https://static-maps.yandex.ru/1.x/';
    
    let url = `${baseUrl}?apikey=${this.apiKey}&ll=${center.longitude},${center.latitude}&z=${zoom}&size=${width},${height}&l=map`;
    
    // Add markers with different colors based on type
    if (markers.length > 0) {
      const markerParams = markers.map(marker => {
        const color = this.getMarkerColor(marker.type || 'default');
        return `${marker.coords.longitude},${marker.coords.latitude},${color}`;
      }).join('~');
      url += `&pt=${markerParams}`;
    }
    
    return url;
  }

  /**
   * Get marker color for static maps
   */
  private getMarkerColor(type: string): string {
    switch (type) {
      case 'user':
        return 'pm2blm'; // Blue marker
      case 'water':
        return 'pm2lbm'; // Light blue marker
      case 'bike_shop':
        return 'pm2gnm'; // Green marker
      case 'restroom':
        return 'pm2ywm'; // Yellow marker
      default:
        return 'pm2grm'; // Gray marker
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(from: Coords, to: Coords): Promise<any> {
    try {
      const url = `https://api.routing.yandex.net/v2/route?apikey=${this.apiKey}&waypoints=${from.longitude},${from.latitude}|${to.longitude},${to.latitude}&mode=walking`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.route && data.route.length > 0) {
        return {
          distance: data.route[0].distance,
          duration: data.route[0].duration,
          geometry: data.route[0].geometry
        };
      }
      
      throw new Error('No route found');
    } catch (error) {
      console.error('Directions API error:', error);
      throw new Error('Failed to get directions');
    }
  }

  /**
   * Search for places near a location
   */
  async searchNearby(location: Coords, query: string, radius = 1000): Promise<any[]> {
    try {
      const url = `https://search-maps.yandex.ru/v1/?apikey=${this.apiKey}&text=${encodeURIComponent(query)}&ll=${location.longitude},${location.latitude}&spn=0.01,0.01&rspn=1&results=10`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features) {
        return data.features.map((feature: any) => ({
          id: feature.properties.CompanyMetaData?.id || Math.random().toString(),
          name: feature.properties.name || feature.properties.description,
          coords: {
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1]
          },
          address: feature.properties.description,
          category: feature.properties.CompanyMetaData?.Categories?.[0]?.name
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Search API error:', error);
      return [];
    }
  }

  /**
   * Geocode an address to coordinates
   */
  async geocode(address: string): Promise<Coords | null> {
    try {
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${this.apiKey}&geocode=${encodeURIComponent(address)}&format=json`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const geoObjects = data.response?.GeoObjectCollection?.featureMember;
      if (geoObjects && geoObjects.length > 0) {
        const coordinates = geoObjects[0].GeoObject.Point.pos.split(' ');
        return {
          longitude: parseFloat(coordinates[0]),
          latitude: parseFloat(coordinates[1])
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(coords: Coords): Promise<string | null> {
    try {
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${this.apiKey}&geocode=${coords.longitude},${coords.latitude}&format=json`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const geoObjects = data.response?.GeoObjectCollection?.featureMember;
      if (geoObjects && geoObjects.length > 0) {
        return geoObjects[0].GeoObject.metaDataProperty.GeocoderMetaData.text;
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Convert amenities to map markers
   */
  amenitiesToMarkers(amenities: Amenity[]): MapMarker[] {
    return amenities.map(amenity => ({
      id: amenity.id,
      coords: amenity.coords,
      title: amenity.name,
      type: amenity.type
    }));
  }

  /**
   * Get appropriate map zoom level based on distance
   */
  getZoomForDistance(distanceKm: number): number {
    if (distanceKm < 0.5) return 16;
    if (distanceKm < 1) return 15;
    if (distanceKm < 2) return 14;
    if (distanceKm < 5) return 13;
    if (distanceKm < 10) return 12;
    return 11;
  }
}

export const mapsService = new MapsService();
const axios = require('axios');

/**
 * Service to handle reverse geocoding using free/low-cost APIs.
 * Supports LocationIQ and Nominatim (OpenStreetMap).
 */
const locationService = {
  /**
   * Reverse geocode latitude and longitude to get State and Zone (Neighborhood/City).
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<{state: string, zone: string, address: string}>}
   */
  async reverseGeocode(lat, lon) {
    try {
      // Use LocationIQ as primary (fast, good free tier)
      // If no API key is provided, it will fall back to Nominatim or return empty
      const apiKey = process.env.LOCATIONIQ_TOKEN;
      
      if (!apiKey) {
        console.warn('LOCATIONIQ_TOKEN not found, attempting Nominatim (rate-limited)...');
        return await this.reverseGeocodeNominatim(lat, lon);
      }

      const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${lat}&lon=${lon}&format=json`;
      const response = await axios.get(url);
      const data = response.data;

      return {
        state: data.address?.state || data.address?.region || '',
        zone: data.address?.suburb || 
              data.address?.neighbourhood || 
              data.address?.residential || 
              data.address?.city_district || 
              data.address?.city || 
              data.address?.town || 
              data.address?.village || 
              data.address?.county || 
              data.address?.state_district || 
              '',
        address: data.display_name || ''
      };
    } catch (error) {
      console.error('Geocoding error:', error.message);
      return { state: '', zone: '', address: '' };
    }
  },

  /**
   * Fallback using Nominatim (OpenStreetMap).
   * Note: Nominatim has a strict 1 request/second limit.
   */
  async reverseGeocodeNominatim(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'CleanStreet-App' }
      });
      const data = response.data;

      return {
        state: data.address?.state || data.address?.region || '',
        zone: data.address?.suburb || 
              data.address?.neighbourhood || 
              data.address?.residential || 
              data.address?.city_district || 
              data.address?.city || 
              data.address?.town || 
              data.address?.village || 
              data.address?.county || 
              data.address?.state_district || 
              '',
        address: data.display_name || ''
      };
    } catch (error) {
      console.error('Nominatim error:', error.message);
      return { state: '', zone: '', address: '' };
    }
  },

  /**
   * Forward geocode an address string to get latitude and longitude.
   * @param {string} address - Address string
   * @returns {Promise<{lat: number, lon: number, display_name: string} | null>}
   */
  async geocode(address) {
    try {
      const apiKey = process.env.LOCATIONIQ_TOKEN;
      let url;
      
      if (apiKey) {
        url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(address)}&format=json&limit=1`;
      } else {
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      }

      const response = await axios.get(url, {
        headers: apiKey ? {} : { 'User-Agent': 'CleanStreet-App' }
      });
      
      const data = response.data;
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error.message);
      return null;
    }
  }
};

module.exports = locationService;

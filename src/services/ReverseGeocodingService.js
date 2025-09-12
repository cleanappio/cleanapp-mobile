/**
 * Reverse Geocoding Service
 * Converts latitude and longitude coordinates to human-readable addresses
 * using Google Maps Geocoding API
 */

const GEO_API_KEY = process.env.GEO_API_KEY;

if (!GEO_API_KEY) {
  console.warn('GEO_API_KEY environment variable is not set');
}

/**
 * Reverse geocodes coordinates to get human-readable address
 * @param {number} latitude - The latitude coordinate
 * @param {number} longitude - The longitude coordinate
 * @param {string} language - The language for the response (default: 'en')
 * @returns {Promise<{success: boolean, address?: string, error?: string}>}
 */
export const reverseGeocode = async (latitude, longitude, language = 'en') => {
  try {
    // Validate input parameters
    if (!latitude || !longitude) {
      return {
        success: false,
        error: 'Latitude and longitude are required',
      };
    }

    if (!GEO_API_KEY) {
      return {
        success: false,
        error: 'Geocoding API key is not configured',
      };
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      return {
        success: false,
        error: 'Invalid latitude value. Must be between -90 and 90',
      };
    }

    if (longitude < -180 || longitude > 180) {
      return {
        success: false,
        error: 'Invalid longitude value. Must be between -180 and 180',
      };
    }

    // Construct the API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: GEO_API_KEY,
      language: language,
    });

    const url = `${baseUrl}?${params.toString()}`;

    // Make the API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Handle API response status codes
    switch (data.status) {
      case 'OK':
        // Success - extract the formatted address
        if (data.results && data.results.length > 0) {
          const formattedAddress = data.results[0].formatted_address;
          return {
            success: true,
            address: formattedAddress,
          };
        } else {
          return {
            success: false,
            error: 'No results found for the given coordinates',
          };
        }

      case 'ZERO_RESULTS':
        return {
          success: false,
          error: 'No address found for the given coordinates',
        };

      case 'OVER_QUERY_LIMIT':
        return {
          success: false,
          error: 'API quota exceeded. Please try again later',
        };

      case 'REQUEST_DENIED':
        return {
          success: false,
          error: 'Request denied. Check your API key configuration',
        };

      case 'INVALID_REQUEST':
        return {
          success: false,
          error: 'Invalid request parameters',
        };

      case 'UNKNOWN_ERROR':
        return {
          success: false,
          error: 'Server error occurred. Please try again',
        };

      default:
        return {
          success: false,
          error: `Unknown API status: ${data.status}`,
        };
    }
  } catch (error) {
    // Handle network and other errors
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`,
    };
  }
};

/**
 * Batch reverse geocoding for multiple coordinates
 * @param {Array<{latitude: number, longitude: number}>} coordinates - Array of coordinate objects
 * @param {string} language - The language for the response (default: 'en')
 * @returns {Promise<Array<{success: boolean, address?: string, error?: string, coordinates: {latitude: number, longitude: number}}>>}
 */
export const batchReverseGeocode = async (coordinates, language = 'en') => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return [];
  }

  // Process coordinates in parallel with rate limiting
  const batchSize = 5; // Process 5 coordinates at a time to avoid rate limits
  const results = [];

  for (let i = 0; i < coordinates.length; i += batchSize) {
    const batch = coordinates.slice(i, i + batchSize);

    const batchPromises = batch.map(async coord => {
      const result = await reverseGeocode(
        coord.latitude,
        coord.longitude,
        language,
      );
      return {
        ...result,
        coordinates: coord,
      };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add a small delay between batches to respect rate limits
    if (i + batchSize < coordinates.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
};

export default {
  reverseGeocode,
  batchReverseGeocode,
};

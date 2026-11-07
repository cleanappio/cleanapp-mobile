/** Address lookup goes through CleanApp; no cloud credential is bundled in the app. */
export const reverseGeocode = async (latitude, longitude, language = 'en') => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
      !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return {success: false, error: 'Invalid latitude or longitude'};
  }
  if (typeof language !== 'string' || language.length > 35 || !/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*$/.test(language)) {
    return {success: false, error: 'Invalid language'};
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const url = `https://www.cleanapp.io/api/geocode?lat=${latitude}&lng=${longitude}&language=${encodeURIComponent(language)}`;
    const response = await fetch(url, {method: 'GET', headers: {Accept: 'application/json'}, signal: controller.signal});
    const data = await response.json();
    if (!response.ok || data.success !== true || typeof data.address !== 'string' || !data.address) {
      return {success: false, error: response.status === 429 ? 'Address lookup is busy. Please try again later' : 'Address not available. Please try again'};
    }
    return {success: true, address: data.address};
  } catch (_) {
    return {success: false, error: 'Address lookup is unavailable. Please try again'};
  } finally {
    clearTimeout(timer);
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

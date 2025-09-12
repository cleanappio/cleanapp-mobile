import {useState, useEffect, useCallback} from 'react';
import {reverseGeocode} from '../services/ReverseGeocodingService';

interface UseReverseGeocodingResult {
  address: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseReverseGeocodingOptions {
  latitude?: number;
  longitude?: number;
  language?: string;
  autoFetch?: boolean;
}

/**
 * Custom hook for reverse geocoding
 * @param options - Configuration options
 * @returns Object containing address, loading state, error, and refetch function
 */
export const useReverseGeocoding = ({
  latitude,
  longitude,
  language = 'en',
  autoFetch = true,
}: UseReverseGeocodingOptions): UseReverseGeocodingResult => {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = useCallback(async () => {
    if (!latitude || !longitude) {
      setError('Latitude and longitude are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await reverseGeocode(latitude, longitude, language);

      if (result.success) {
        setAddress(result.address || null);
        setError(null);
      } else {
        setError(result.error || 'Failed to get address');
        setAddress(null);
      }
    } catch (err) {
      setError(
        `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      setAddress(null);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, language]);

  // Auto-fetch when coordinates change
  useEffect(() => {
    if (autoFetch && latitude && longitude) {
      fetchAddress();
    }
  }, [latitude, longitude, language, autoFetch, fetchAddress]);

  return {
    address,
    loading,
    error,
    refetch: fetchAddress,
  };
};

export default useReverseGeocoding;

import {useState, useEffect} from 'react';
import AppVersionService from '../services/AppVersionService';

interface AppVersionInfo {
  version: string;
  buildNumber: string | number;
  versionCode: number;
  bundleId: string;
  appName: string;
  platform: string;
  fullVersionString: string;
}

interface UseAppVersionResult {
  versionInfo: AppVersionInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for accessing app version information
 * @returns Object containing version info, loading state, error, and refetch function
 */
export const useAppVersion = (): UseAppVersionResult => {
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersionInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const info = await AppVersionService.getAllVersionInfo();
      setVersionInfo(info as AppVersionInfo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get version info',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersionInfo();
  }, []);

  return {
    versionInfo,
    loading,
    error,
    refetch: fetchVersionInfo,
  };
};

export default useAppVersion;

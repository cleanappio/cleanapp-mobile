// Example usage of matchReports API
import {matchReports} from '../services/API/APIManager';
import {getWalletAddress} from '../services/DataManager';
import {getLocation} from './geolocation';
import MatchReportsLogger from '../utils/MatchReportsLogger';
import {useState} from 'react';

export interface MatchResult {
  report_seq: number;
  similarity: number;
  resolved: boolean;
}

export interface MatchReportsResponse {
  ok: boolean;
  processId: string;
  success?: boolean;
  message?: string;
  results?: MatchResult[];
  error?: string;
}

export interface UseMatchReportsReturn {
  findMatches: (imageBase64: string) => Promise<void>;
  isLoading: boolean;
  results: MatchReportsResponse | null;
  error: string | null;
}

/**
 * Example function showing how to use matchReports API
 * @param imageBase64 - Base64 encoded image data
 * @returns Promise<MatchReportsResponse> Match results
 */
export const findMatchingReports = async (
  imageBase64: string,
): Promise<MatchReportsResponse> => {
  const startTime = Date.now();

  try {
    // Log user interaction
    MatchReportsLogger.logUserInteraction('findMatchingReports_started', {
      hasImage: !!imageBase64,
      imageSize: imageBase64 ? imageBase64.length : 0,
    });

    // Get required data from app
    const publicAddress = await getWalletAddress();
    const location = await getLocation();

    if (!publicAddress) {
      throw new Error('Wallet address not available');
    }

    if (!location || !location.latitude || !location.longitude) {
      throw new Error('Location not available');
    }

    if (!imageBase64) {
      throw new Error('Image data not provided');
    }

    // Log data collection success
    MatchReportsLogger.logUserInteraction('data_collection_completed', {
      hasPublicAddress: !!publicAddress,
      hasLocation: !!location,
      hasImage: !!imageBase64,
      imageSize: imageBase64.length,
    });

    // Call the matchReports API
    const result = await matchReports(
      publicAddress,
      location.latitude,
      location.longitude,
      imageBase64,
    );

    if (result.ok) {
      // Log successful results
      MatchReportsLogger.logUserInteraction('match_results_received', {
        success: (result as any).success,
        message: (result as any).message,
        matchCount: (result as any).results
          ? (result as any).results.length
          : 0,
        processId: result.processId,
      });

      // Process the results
      if ((result as any).results && (result as any).results.length > 0) {
        (result as any).results.forEach((match: MatchResult, index: number) => {
          MatchReportsLogger.logUserInteraction(`match_${index + 1}_details`, {
            reportSeq: match.report_seq,
            similarity: match.similarity,
            resolved: match.resolved,
          });
        });
      }

      // Log user interaction success
      MatchReportsLogger.logUserInteraction('findMatchingReports_success', {
        matchCount: (result as any).results
          ? (result as any).results.length
          : 0,
        duration: Date.now() - startTime,
      });

      return result as MatchReportsResponse;
    } else {
      // Log API failure
      MatchReportsLogger.logUserInteraction('api_call_failed', {
        error: (result as any).error,
        processId: result.processId,
        duration: Date.now() - startTime,
      });

      return result as MatchReportsResponse;
    }
  } catch (error) {
    // Log error
    MatchReportsLogger.logUserInteraction('findMatchingReports_error', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      duration: Date.now() - startTime,
    });

    return {
      ok: false,
      processId: `error_${Date.now()}`,
      error: (error as Error).message,
    };
  }
};

/**
 * Example of how to use in a React component
 */
export const useMatchReports = (): UseMatchReportsReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<MatchReportsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const findMatches = async (imageBase64: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await findMatchingReports(imageBase64);

      if (result.ok) {
        setResults(result);
      } else {
        setError(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    findMatches,
    isLoading,
    results,
    error,
  };
};

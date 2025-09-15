import Logger, {LogEntry} from './Logger';

export interface ProcessStartParams {
  processId?: string;
  publicAddress: string;
  latitude: number;
  longitude: number;
  imageSize: number;
  annotation: string;
}

export interface ProcessSuccessResult {
  success: boolean;
  message: string;
  results?: Array<{
    report_seq: number;
    similarity: number;
    resolved: boolean;
  }>;
}

export interface ProcessErrorContext {
  processId?: string;
  publicAddress?: string;
  latitude?: number;
  longitude?: number;
  imageSize?: number;
  response?: any;
}

export interface PerformanceMetrics {
  totalDuration: number;
  apiCallDuration: number;
  dataProcessingDuration: number;
  imageSize: number;
  matchCount: number;
}

export interface UserInteractionContext {
  hasImage?: boolean;
  imageSize?: number;
  matchCount?: number;
  duration?: number;
  [key: string]: any;
}

export interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalMatchesFound: number;
}

export interface MatchReportsSummary {
  total: number;
  byLevel: Record<string, number>;
  byMessage: Record<string, number>;
  recent: LogEntry[];
  errors: number;
  performanceLogs: number;
}

/**
 * Specialized logger for Match Reports feature
 * Provides structured logging for debugging and analysis
 */
class MatchReportsLogger {
  private logger: typeof Logger;
  private featureName: string;

  constructor() {
    this.logger = Logger;
    this.featureName = 'MATCH_REPORTS';
  }

  /**
   * Log when match reports process starts
   */
  logProcessStart(params: ProcessStartParams): void {
    this.logger.info(this.featureName, 'Match reports process started', {
      publicAddress: params.publicAddress
        ? `${params.publicAddress.substring(0, 8)}...`
        : 'N/A',
      latitude: params.latitude,
      longitude: params.longitude,
      imageSize: params.imageSize || 'N/A',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log when match reports process completes successfully
   */
  logProcessSuccess(result: ProcessSuccessResult, duration: number): void {
    this.logger.info(
      this.featureName,
      'Match reports process completed successfully',
      {
        success: result.success,
        message: result.message,
        matchCount: result.results ? result.results.length : 0,
        duration,
        results: result.results
          ? result.results.map(match => ({
              reportSeq: match.report_seq,
              similarity: match.similarity,
              resolved: match.resolved,
            }))
          : [],
      },
    );
  }

  /**
   * Log when match reports process fails
   */
  logProcessError(
    error: Error,
    context: ProcessErrorContext = {},
    duration: number | null = null,
  ): void {
    this.logger.error(this.featureName, 'Match reports process failed', {
      error: error.message,
      stack: error.stack,
      context,
      duration,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log API request details
   */
  logApiRequest(requestData: any, endpoint: string): void {
    this.logger.logApiRequest(endpoint, requestData, 'POST');

    // Additional match-specific logging
    this.logger.debug(this.featureName, 'API request details', {
      endpoint,
      version: requestData.version,
      id: requestData.id ? `${requestData.id.substring(0, 8)}...` : 'N/A',
      latitude: requestData.latitude,
      longitude: requestData.longitude,
      x: requestData.x,
      y: requestData.y,
      imageSize: requestData.image
        ? `${requestData.image.length} characters`
        : 'N/A',
    });
  }

  /**
   * Log API response details
   */
  logApiResponse(response: any, endpoint: string, duration: number): void {
    this.logger.logApiResponse(endpoint, response, duration);

    // Additional match-specific logging
    if (response.ok && response.data) {
      this.logger.info(this.featureName, 'API response details', {
        endpoint,
        success: response.data.success,
        message: response.data.message,
        resultCount: response.data.results ? response.data.results.length : 0,
        duration,
      });
    }
  }

  /**
   * Log API error details
   */
  logApiError(error: Error, endpoint: string, attempt: number): void {
    this.logger.logApiError(endpoint, error, attempt);

    // Additional match-specific logging
    this.logger.error(this.featureName, 'API error details', {
      endpoint,
      attempt,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log retry attempt
   */
  logRetryAttempt(attempt: number, endpoint: string, error: Error): void {
    this.logger.warn(
      this.featureName,
      `Retry attempt ${attempt} for ${endpoint}`,
      {
        attempt,
        endpoint,
        previousError: error.message,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Log data validation
   */
  logDataValidation(data: any, validationErrors: string[] = []): void {
    if (validationErrors.length > 0) {
      this.logger.error(this.featureName, 'Data validation failed', {
        validationErrors,
        data: {
          hasPublicAddress: !!data.publicAddress,
          hasLatitude: !!data.latitude,
          hasLongitude: !!data.longitude,
          hasImage: !!data.image,
          imageSize: data.image ? data.image.length : 0,
        },
      });
    } else {
      this.logger.debug(this.featureName, 'Data validation passed', {
        hasPublicAddress: !!data.publicAddress,
        hasLatitude: !!data.latitude,
        hasLongitude: !!data.longitude,
        hasImage: !!data.image,
        imageSize: data.image ? data.image.length : 0,
      });
    }
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.logger.info(this.featureName, 'Performance metrics', {
      totalDuration: metrics.totalDuration,
      apiCallDuration: metrics.apiCallDuration,
      dataProcessingDuration: metrics.dataProcessingDuration,
      imageSize: metrics.imageSize,
      matchCount: metrics.matchCount,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log user interaction
   */
  logUserInteraction(
    action: string,
    context: UserInteractionContext = {},
  ): void {
    this.logger.info(this.featureName, `User interaction: ${action}`, {
      action,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log feature usage statistics
   */
  logUsageStats(stats: UsageStats): void {
    this.logger.info(this.featureName, 'Usage statistics', {
      totalRequests: stats.totalRequests || 0,
      successfulRequests: stats.successfulRequests || 0,
      failedRequests: stats.failedRequests || 0,
      averageResponseTime: stats.averageResponseTime || 0,
      totalMatchesFound: stats.totalMatchesFound || 0,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get logs specific to match reports
   */
  getMatchReportsLogs(): LogEntry[] {
    return this.logger.getLogsByCategory(this.featureName);
  }

  /**
   * Get error logs for match reports
   */
  getErrorLogs(): LogEntry[] {
    return this.logger
      .getLogsByCategory(this.featureName)
      .filter(log => log.level === 'ERROR');
  }

  /**
   * Get performance logs for match reports
   */
  getPerformanceLogs(): LogEntry[] {
    return this.logger
      .getLogsByCategory(this.featureName)
      .filter(log => log.message.includes('Performance metrics'));
  }

  /**
   * Export match reports logs
   */
  exportMatchReportsLogs(): string {
    const logs = this.getMatchReportsLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get match reports summary
   */
  getMatchReportsSummary(): MatchReportsSummary {
    const logs = this.getMatchReportsLogs();
    const summary: MatchReportsSummary = {
      total: logs.length,
      byLevel: {},
      byMessage: {},
      recent: logs.slice(-10),
      errors: this.getErrorLogs().length,
      performanceLogs: this.getPerformanceLogs().length,
    };

    logs.forEach(log => {
      summary.byLevel[log.level] = (summary.byLevel[log.level] || 0) + 1;
      summary.byMessage[log.message] =
        (summary.byMessage[log.message] || 0) + 1;
    });

    return summary;
  }
}

// Export singleton instance
export default new MatchReportsLogger();

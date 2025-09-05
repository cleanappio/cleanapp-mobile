import MatchReportsLogger, {
  PerformanceMetrics,
  UsageStats,
  MatchReportsSummary,
} from './MatchReportsLogger';
import Logger, {LogEntry} from './Logger';

export interface PerformanceAnalysis {
  totalRequests: number;
  averageTotalDuration: number;
  averageApiCallDuration: number;
  averageDataProcessingDuration: number;
  averageImageSize: number;
  averageMatchCount: number;
  slowestRequest: PerformanceMetrics | null;
  fastestRequest: PerformanceMetrics | null;
  message?: string;
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorTypes: Record<string, number>;
  commonErrors: Record<string, number>;
  recentErrors: Array<{
    timestamp: string;
    message: string;
    error: string;
  }>;
  message?: string;
}

export interface UsageStatistics {
  totalLogs: number;
  processStarts: number;
  processSuccesses: number;
  processErrors: number;
  apiRequests: number;
  apiResponses: number;
  userInteractions: number;
  successRate: number;
}

export interface DebugReport {
  timestamp: string;
  performance: PerformanceAnalysis;
  errors: ErrorAnalysis;
  usage: UsageStatistics;
  summary: MatchReportsSummary;
}

export interface DebugData {
  report: DebugReport;
  allLogs: string;
  systemLogs: string;
}

/**
 * Debug utilities for analyzing match reports logs
 */
class DebugUtils {
  /**
   * Analyze match reports performance
   */
  static analyzePerformance(): PerformanceAnalysis {
    const performanceLogs = MatchReportsLogger.getPerformanceLogs();

    if (performanceLogs.length === 0) {
      return {message: 'No performance logs found'} as PerformanceAnalysis;
    }

    const analysis: PerformanceAnalysis = {
      totalRequests: performanceLogs.length,
      averageTotalDuration: 0,
      averageApiCallDuration: 0,
      averageDataProcessingDuration: 0,
      averageImageSize: 0,
      averageMatchCount: 0,
      slowestRequest: null,
      fastestRequest: null,
    };

    let totalDuration = 0;
    let totalApiDuration = 0;
    let totalDataProcessingDuration = 0;
    let totalImageSize = 0;
    let totalMatchCount = 0;

    performanceLogs.forEach(log => {
      if (!log.data) return;
      const data = JSON.parse(log.data);

      totalDuration += data.totalDuration || 0;
      totalApiDuration += data.apiCallDuration || 0;
      totalDataProcessingDuration += data.dataProcessingDuration || 0;
      totalImageSize += data.imageSize || 0;
      totalMatchCount += data.matchCount || 0;

      // Track slowest and fastest requests
      if (
        !analysis.slowestRequest ||
        data.totalDuration > analysis.slowestRequest.totalDuration
      ) {
        analysis.slowestRequest = data;
      }
      if (
        !analysis.fastestRequest ||
        data.totalDuration < analysis.fastestRequest.totalDuration
      ) {
        analysis.fastestRequest = data;
      }
    });

    analysis.averageTotalDuration = Math.round(
      totalDuration / performanceLogs.length,
    );
    analysis.averageApiCallDuration = Math.round(
      totalApiDuration / performanceLogs.length,
    );
    analysis.averageDataProcessingDuration = Math.round(
      totalDataProcessingDuration / performanceLogs.length,
    );
    analysis.averageImageSize = Math.round(
      totalImageSize / performanceLogs.length,
    );
    analysis.averageMatchCount = Math.round(
      totalMatchCount / performanceLogs.length,
    );

    return analysis;
  }

  /**
   * Analyze error patterns
   */
  static analyzeErrors(): ErrorAnalysis {
    const errorLogs = MatchReportsLogger.getErrorLogs();

    if (errorLogs.length === 0) {
      return {message: 'No error logs found'} as ErrorAnalysis;
    }

    const analysis: ErrorAnalysis = {
      totalErrors: errorLogs.length,
      errorTypes: {},
      commonErrors: {},
      recentErrors: errorLogs.slice(-5).map(log => ({
        timestamp: log.timestamp,
        message: log.message,
        error: log.data ? JSON.parse(log.data).error : 'Unknown error',
      })),
    };

    errorLogs.forEach(log => {
      if (!log.data) return;
      const data = JSON.parse(log.data);
      const errorType = data.error || 'Unknown';

      analysis.errorTypes[errorType] =
        (analysis.errorTypes[errorType] || 0) + 1;
      analysis.commonErrors[log.message] =
        (analysis.commonErrors[log.message] || 0) + 1;
    });

    return analysis;
  }

  /**
   * Get usage statistics
   */
  static getUsageStats(): UsageStatistics {
    const allLogs = MatchReportsLogger.getMatchReportsLogs();

    const stats: UsageStatistics = {
      totalLogs: allLogs.length,
      processStarts: allLogs.filter(log =>
        log.message.includes('process started'),
      ).length,
      processSuccesses: allLogs.filter(log =>
        log.message.includes('process completed successfully'),
      ).length,
      processErrors: allLogs.filter(log =>
        log.message.includes('process failed'),
      ).length,
      apiRequests: allLogs.filter(log =>
        log.message.includes('Making POST request'),
      ).length,
      apiResponses: allLogs.filter(log =>
        log.message.includes('Received response'),
      ).length,
      userInteractions: allLogs.filter(log =>
        log.message.includes('User interaction'),
      ).length,
      successRate: 0,
    };

    stats.successRate =
      stats.processStarts > 0
        ? Math.round((stats.processSuccesses / stats.processStarts) * 100)
        : 0;

    return stats;
  }

  /**
   * Generate debug report
   */
  static generateDebugReport(): DebugReport {
    const report: DebugReport = {
      timestamp: new Date().toISOString(),
      performance: this.analyzePerformance(),
      errors: this.analyzeErrors(),
      usage: this.getUsageStats(),
      summary: MatchReportsLogger.getMatchReportsSummary(),
    };

    return report;
  }

  /**
   * Export debug data
   */
  static exportDebugData(): string {
    const debugData: DebugData = {
      report: this.generateDebugReport(),
      allLogs: MatchReportsLogger.exportMatchReportsLogs(),
      systemLogs: Logger.exportLogs(),
    };

    return JSON.stringify(debugData, null, 2);
  }

  /**
   * Clear all debug data
   */
  static clearDebugData(): void {
    // Access the logger through the public methods
    const matchReportsLogs = MatchReportsLogger.getMatchReportsLogs();
    const allLogs = Logger.getAllLogs();

    // Clear logs by calling the public clearLogs method
    Logger.clearLogs();
  }

  /**
   * Print debug summary to console
   */
  static printDebugSummary(): void {
    const report = this.generateDebugReport();

    console.log('\n=== MATCH REPORTS DEBUG SUMMARY ===');
    console.log(`Generated at: ${report.timestamp}`);
    console.log('\n--- USAGE STATISTICS ---');
    console.log(`Total Logs: ${report.usage.totalLogs}`);
    console.log(`Process Starts: ${report.usage.processStarts}`);
    console.log(`Process Successes: ${report.usage.processSuccesses}`);
    console.log(`Process Errors: ${report.usage.processErrors}`);
    console.log(`Success Rate: ${report.usage.successRate}%`);

    console.log('\n--- PERFORMANCE ANALYSIS ---');
    if (report.performance.totalRequests > 0) {
      console.log(`Total Requests: ${report.performance.totalRequests}`);
      console.log(
        `Average Total Duration: ${report.performance.averageTotalDuration}ms`,
      );
      console.log(
        `Average API Call Duration: ${report.performance.averageApiCallDuration}ms`,
      );
      console.log(
        `Average Data Processing Duration: ${report.performance.averageDataProcessingDuration}ms`,
      );
      console.log(
        `Average Image Size: ${report.performance.averageImageSize} characters`,
      );
      console.log(
        `Average Match Count: ${report.performance.averageMatchCount}`,
      );
    } else {
      console.log('No performance data available');
    }

    console.log('\n--- ERROR ANALYSIS ---');
    if (report.errors.totalErrors > 0) {
      console.log(`Total Errors: ${report.errors.totalErrors}`);
      console.log('Error Types:', report.errors.errorTypes);
      console.log('Common Errors:', report.errors.commonErrors);
    } else {
      console.log('No errors found');
    }

    console.log('\n=== END DEBUG SUMMARY ===\n');
  }

  /**
   * Monitor real-time logs
   */
  static startLogMonitoring(
    callback: (level: string, args: any[]) => void,
  ): () => void {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: any[]) => {
      originalLog(...args);
      if (callback) callback('log', args);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      if (callback) callback('error', args);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      if (callback) callback('warn', args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }
}

export default DebugUtils;

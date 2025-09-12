import {useState, useEffect, useCallback} from 'react';
import DebugUtils, {
  PerformanceAnalysis,
  ErrorAnalysis,
  UsageStatistics,
  DebugReport,
} from '../utils/DebugUtils';
import MatchReportsLogger from '../utils/MatchReportsLogger';
import {LogEntry} from '../utils/Logger';

export interface UseDebugLoggerReturn {
  // State
  isMonitoring: boolean;
  debugData: DebugReport | null;
  logs: LogEntry[];

  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearLogs: () => void;
  exportDebugData: () => string;
  printSummary: () => void;

  // Analysis
  getPerformanceAnalysis: () => PerformanceAnalysis;
  getErrorAnalysis: () => ErrorAnalysis;
  getUsageStats: () => UsageStatistics;

  // Log filtering
  getLogsByLevel: (level: string) => LogEntry[];
  getLogsByMessage: (message: string) => LogEntry[];
  getRecentLogs: (count?: number) => LogEntry[];

  // Utilities
  updateDebugData: () => void;
  updateLogs: () => void;
}

/**
 * React hook for debugging match reports feature
 * Provides real-time logging and analysis capabilities
 */
export const useDebugLogger = (): UseDebugLoggerReturn => {
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [debugData, setDebugData] = useState<DebugReport | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Update debug data
  const updateDebugData = useCallback(() => {
    const data = DebugUtils.generateDebugReport();
    setDebugData(data);
  }, []);

  // Update logs
  const updateLogs = useCallback(() => {
    const allLogs = MatchReportsLogger.getMatchReportsLogs();
    setLogs(allLogs);
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    updateDebugData();
    updateLogs();
  }, [updateDebugData, updateLogs]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Clear all logs
  const clearLogs = useCallback(() => {
    DebugUtils.clearDebugData();
    updateDebugData();
    updateLogs();
  }, [updateDebugData, updateLogs]);

  // Export debug data
  const exportDebugData = useCallback(() => {
    return DebugUtils.exportDebugData();
  }, []);

  // Print debug summary
  const printSummary = useCallback(() => {
    DebugUtils.printDebugSummary();
  }, []);

  // Get performance analysis
  const getPerformanceAnalysis = useCallback((): PerformanceAnalysis => {
    return DebugUtils.analyzePerformance();
  }, []);

  // Get error analysis
  const getErrorAnalysis = useCallback((): ErrorAnalysis => {
    return DebugUtils.analyzeErrors();
  }, []);

  // Get usage statistics
  const getUsageStats = useCallback((): UsageStatistics => {
    return DebugUtils.getUsageStats();
  }, []);

  // Filter logs by level
  const getLogsByLevel = useCallback(
    (level: string): LogEntry[] => {
      return logs.filter(log => log.level === level.toUpperCase());
    },
    [logs],
  );

  // Filter logs by message
  const getLogsByMessage = useCallback(
    (message: string): LogEntry[] => {
      return logs.filter(log => log.message.includes(message));
    },
    [logs],
  );

  // Get recent logs
  const getRecentLogs = useCallback(
    (count: number = 10): LogEntry[] => {
      return logs.slice(-count);
    },
    [logs],
  );

  // Auto-update when monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      updateDebugData();
      updateLogs();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isMonitoring, updateDebugData, updateLogs]);

  return {
    // State
    isMonitoring,
    debugData,
    logs,

    // Actions
    startMonitoring,
    stopMonitoring,
    clearLogs,
    exportDebugData,
    printSummary,

    // Analysis
    getPerformanceAnalysis,
    getErrorAnalysis,
    getUsageStats,

    // Log filtering
    getLogsByLevel,
    getLogsByMessage,
    getRecentLogs,

    // Utilities
    updateDebugData,
    updateLogs,
  };
};

export default useDebugLogger;

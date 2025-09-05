import {Platform} from 'react-native';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  platform: string;
  data: string | null;
}

export interface LogsSummary {
  total: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  recent: LogEntry[];
}

export interface ApiResponse {
  ok: boolean;
  status?: number;
  data?: any;
}

/**
 * Logging utility for the CleanApp mobile application
 * Provides structured logging with different levels and features
 */
class Logger {
  private logLevel: LogLevel;
  private enableConsoleLog: boolean;
  private enableFileLog: boolean;
  private logs: LogEntry[];
  private maxLogs: number;

  constructor() {
    this.logLevel = __DEV__ ? 'debug' : 'info';
    this.enableConsoleLog = __DEV__;
    this.enableFileLog = false; // Can be enabled for production logging
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
  }

  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Get current timestamp
   */
  getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Get log level priority
   */
  getLevelPriority(level: LogLevel): number {
    const priorities: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return priorities[level] || 0;
  }

  /**
   * Check if log should be processed
   */
  shouldLog(level: LogLevel): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.logLevel);
  }

  /**
   * Format log message
   */
  formatLog(
    level: LogLevel,
    category: string,
    message: string,
    data: any = null,
  ): LogEntry {
    const logEntry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: level.toUpperCase(),
      category,
      message,
      platform: Platform.OS,
      data: data ? JSON.stringify(data, null, 2) : null,
    };

    // Add to memory logs
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    return logEntry;
  }

  /**
   * Log debug message
   */
  debug(category: string, message: string, data: any = null): void {
    if (!this.shouldLog('debug')) return;

    const logEntry = this.formatLog('debug', category, message, data);

    if (this.enableConsoleLog) {
      console.log(
        `[${logEntry.timestamp}] [DEBUG] [${category}] ${message}`,
        data || '',
      );
    }
  }

  /**
   * Log info message
   */
  info(category: string, message: string, data: any = null): void {
    if (!this.shouldLog('info')) return;

    const logEntry = this.formatLog('info', category, message, data);

    if (this.enableConsoleLog) {
      console.log(
        `[${logEntry.timestamp}] [INFO] [${category}] ${message}`,
        data || '',
      );
    }
  }

  /**
   * Log warning message
   */
  warn(category: string, message: string, data: any = null): void {
    if (!this.shouldLog('warn')) return;

    const logEntry = this.formatLog('warn', category, message, data);

    if (this.enableConsoleLog) {
      console.warn(
        `[${logEntry.timestamp}] [WARN] [${category}] ${message}`,
        data || '',
      );
    }
  }

  /**
   * Log error message
   */
  error(category: string, message: string, data: any = null): void {
    if (!this.shouldLog('error')) return;

    const logEntry = this.formatLog('error', category, message, data);

    if (this.enableConsoleLog) {
      console.error(
        `[${logEntry.timestamp}] [ERROR] [${category}] ${message}`,
        data || '',
      );
    }
  }

  /**
   * Log API request
   */
  logApiRequest(
    endpoint: string,
    requestData: any,
    method: string = 'POST',
  ): void {
    this.info('API_REQUEST', `Making ${method} request to ${endpoint}`, {
      endpoint,
      method,
      requestData: this.sanitizeRequestData(requestData),
    });
  }

  /**
   * Log API response
   */
  logApiResponse(
    endpoint: string,
    response: ApiResponse,
    duration: number | null = null,
  ): void {
    const level: LogLevel = response.ok ? 'info' : 'error';
    this[level]('API_RESPONSE', `Received response from ${endpoint}`, {
      endpoint,
      ok: response.ok,
      status: response.status,
      duration,
      responseData: response.data || response,
    });
  }

  /**
   * Log API error
   */
  logApiError(endpoint: string, error: Error, attempt: number = 1): void {
    this.error('API_ERROR', `Error in ${endpoint} (attempt ${attempt})`, {
      endpoint,
      attempt,
      error: error.message,
      stack: error.stack,
    });
  }

  /**
   * Sanitize request data for logging (remove sensitive information)
   */
  sanitizeRequestData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized = {...data};
    const sensitiveFields = ['image', 'password', 'token', 'key', 'secret'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        if (
          typeof sanitized[field] === 'string' &&
          sanitized[field].length > 100
        ) {
          sanitized[field] = `[${sanitized[field].length} characters]`;
        } else {
          sanitized[field] = '[REDACTED]';
        }
      }
    });

    return sanitized;
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: string): LogEntry[] {
    return this.logs.filter(log => log.level === level.toUpperCase());
  }

  /**
   * Get all logs
   */
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get logs summary
   */
  getLogsSummary(): LogsSummary {
    const summary: LogsSummary = {
      total: this.logs.length,
      byLevel: {},
      byCategory: {},
      recent: this.logs.slice(-10), // Last 10 logs
    };

    this.logs.forEach(log => {
      summary.byLevel[log.level] = (summary.byLevel[log.level] || 0) + 1;
      summary.byCategory[log.category] =
        (summary.byCategory[log.category] || 0) + 1;
    });

    return summary;
  }
}

// Export singleton instance
export default new Logger();

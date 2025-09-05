# Match Reports Logging System

This guide explains how to use the comprehensive logging system for the Match Reports feature.

## Overview

The logging system consists of several components:

1. **Logger.js** - Base logging utility
2. **MatchReportsLogger.js** - Specialized logger for match reports
3. **DebugUtils.js** - Analysis and debugging utilities
4. **useDebugLogger.js** - React hook for debugging

## Quick Start

### Basic Usage

```typescript
import MatchReportsLogger from '../utils/MatchReportsLogger';

// Log a process start
MatchReportsLogger.logProcessStart({
  publicAddress: '0x123...',
  latitude: 40.7128,
  longitude: -74.006,
  imageSize: 50000,
});

// Log a process success
MatchReportsLogger.logProcessSuccess(result, duration);

// Log an error
MatchReportsLogger.logProcessError(error, context, duration);
```

### Using the Debug Hook

```typescript
import {useDebugLogger} from '../hooks/useDebugLogger';

const MyComponent = () => {
  const {
    isMonitoring,
    debugData,
    logs,
    startMonitoring,
    stopMonitoring,
    clearLogs,
    printSummary,
  } = useDebugLogger();

  return (
    <View>
      <Button title="Start Monitoring" onPress={startMonitoring} />
      <Button title="Stop Monitoring" onPress={stopMonitoring} />
      <Button title="Print Summary" onPress={printSummary} />
      <Button title="Clear Logs" onPress={clearLogs} />
    </View>
  );
};
```

## Logging Levels

### Debug

- Detailed information for debugging
- Process steps, data validation
- Individual match details

### Info

- General information about process flow
- API requests/responses
- User interactions

### Warn

- Warning conditions
- Retry attempts
- Non-critical issues

### Error

- Error conditions
- Process failures
- API errors

## Log Categories

### MATCH_REPORTS

- All match reports related logs
- Process lifecycle
- API interactions
- Performance metrics

### API_REQUEST

- API request details
- Request data (sanitized)
- Endpoint information

### API_RESPONSE

- API response details
- Response data
- Duration metrics

### API_ERROR

- API error details
- Retry attempts
- Error context

## Log Structure

Each log entry contains:

```typescript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  level: "INFO",
  category: "MATCH_REPORTS",
  message: "Process started",
  platform: "ios",
  data: {
    // Additional context data
  }
}
```

## Debugging Features

### Performance Analysis

```typescript
import DebugUtils from '../utils/DebugUtils';

// Get performance analysis
const performance = DebugUtils.analyzePerformance();
console.log('Average response time:', performance.averageTotalDuration);
console.log('Slowest request:', performance.slowestRequest);
```

### Error Analysis

```javascript
// Get error analysis
const errors = DebugUtils.analyzeErrors();
console.log('Total errors:', errors.totalErrors);
console.log('Error types:', errors.errorTypes);
```

### Usage Statistics

```javascript
// Get usage statistics
const stats = DebugUtils.getUsageStats();
console.log('Success rate:', stats.successRate + '%');
console.log('Total requests:', stats.totalRequests);
```

## Log Filtering

### By Level

```typescript
const errorLogs = MatchReportsLogger.getErrorLogs();
const infoLogs = MatchReportsLogger.getLogsByLevel('info');
```

### By Category

```typescript
const matchLogs = MatchReportsLogger.getMatchReportsLogs();
const apiLogs = Logger.getLogsByCategory('API_REQUEST');
```

### By Message

```typescript
const processLogs = logs.filter(log => log.message.includes('process started'));
```

## Export and Analysis

### Export All Logs

```typescript
const exportedData = DebugUtils.exportDebugData();
// Save to file or send to server
```

### Print Debug Summary

```typescript
DebugUtils.printDebugSummary();
// Prints formatted summary to console
```

### Generate Debug Report

```typescript
const report = DebugUtils.generateDebugReport();
console.log(JSON.stringify(report, null, 2));
```

## Real-time Monitoring

### Start Log Monitoring

```typescript
const stopMonitoring = DebugUtils.startLogMonitoring((level, args) => {
  console.log(`New ${level} log:`, args);
});

// Stop monitoring
stopMonitoring();
```

### Using React Hook

```typescript
const {startMonitoring, stopMonitoring, logs} = useDebugLogger();

useEffect(() => {
  startMonitoring();
  return () => stopMonitoring();
}, []);
```

## Best Practices

### 1. Use Appropriate Log Levels

- **Debug**: Detailed debugging information
- **Info**: General process flow
- **Warn**: Warning conditions
- **Error**: Error conditions

### 2. Include Context

Always include relevant context in logs:

```typescript
MatchReportsLogger.logProcessStart({
  processId: 'match_123',
  publicAddress: '0x123...',
  latitude: 40.7128,
  longitude: -74.006,
  imageSize: 50000,
});
```

### 3. Sanitize Sensitive Data

The logger automatically sanitizes sensitive fields:

- `image` - Shows character count instead of content
- `password` - Redacted
- `token` - Redacted
- `key` - Redacted
- `secret` - Redacted

### 4. Use Process IDs

Include process IDs for tracking:

```typescript
const processId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### 5. Log Performance Metrics

Always log performance data:

```typescript
MatchReportsLogger.logPerformanceMetrics({
  totalDuration: 1500,
  apiCallDuration: 1200,
  dataProcessingDuration: 300,
  imageSize: 50000,
  matchCount: 3,
});
```

## Troubleshooting

### Common Issues

1. **No logs appearing**

   - Check log level settings
   - Ensure `__DEV__` is true for console logging
   - Verify logger is imported correctly

2. **Performance issues**

   - Check if too many logs are being generated
   - Consider increasing log level in production
   - Monitor memory usage

3. **Missing context**
   - Ensure all relevant data is passed to log functions
   - Check if data sanitization is removing needed info

### Debug Commands

```typescript
// Print current log summary
DebugUtils.printDebugSummary();

// Get all logs
const allLogs = MatchReportsLogger.getAllLogs();

// Clear all logs
DebugUtils.clearDebugData();

// Export logs
const exported = DebugUtils.exportDebugData();
```

## Integration with Existing Code

The logging system is designed to integrate seamlessly with existing code:

1. **APIManager.js** - Already integrated with comprehensive logging
2. **MatchReportsExample.js** - Updated with logging examples
3. **CoreAPICalls.js** - Can be enhanced with additional logging

## Production Considerations

1. **Log Level**: Set to 'info' or 'warn' in production
2. **Memory Usage**: Monitor log memory usage
3. **Performance**: Consider async logging for high-volume scenarios
4. **Storage**: Implement log rotation and cleanup
5. **Privacy**: Ensure sensitive data is properly sanitized

## Examples

See the following files for complete examples:

- `src/services/API/APIManager.js` - API logging
- `src/services/API/MatchReportsExample.js` - Usage examples
- `src/hooks/useDebugLogger.ts` - React hook usage

import Logger from './Logger';

type SortLogData = Record<string, unknown> | null | undefined;

const SORT_CATEGORY = 'SORT_FLOW';
const SORT_ID_PREVIEW_LENGTH = 8;

const redactSorterId = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.length <= SORT_ID_PREVIEW_LENGTH) {
    return trimmed;
  }

  return `${trimmed.slice(0, SORT_ID_PREVIEW_LENGTH)}...`;
};

const sanitizeSortLogData = (data: SortLogData) => {
  if (!data || typeof data !== 'object') {
    return data ?? null;
  }

  const sanitized: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'sorterId' || key === 'sorter_id') {
      sanitized[key] = redactSorterId(value);
      return;
    }

    if (Array.isArray(value) && value.length > 10) {
      sanitized[key] = {
        count: value.length,
        preview: value.slice(0, 10),
      };
      return;
    }

    sanitized[key] = value;
  });

  return sanitized;
};

const logSort = (
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: SortLogData,
) => {
  Logger[level](SORT_CATEGORY, message, sanitizeSortLogData(data));
};

export const createSortTraceId = (scope = 'sort') => {
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `${scope}-${Date.now().toString(36)}-${randomSuffix}`;
};

export const delaySortMs = (durationMs: number) =>
  new Promise(resolve => {
    setTimeout(resolve, durationMs);
  });

export const SortLogger = {
  debug(message: string, data?: SortLogData) {
    logSort('debug', message, data);
  },
  info(message: string, data?: SortLogData) {
    logSort('info', message, data);
  },
  warn(message: string, data?: SortLogData) {
    logSort('warn', message, data);
  },
  error(message: string, data?: SortLogData) {
    logSort('error', message, data);
  },
};

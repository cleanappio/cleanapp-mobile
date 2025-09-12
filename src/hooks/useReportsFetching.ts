import {useStateValue} from '../services/State/State';

/**
 * Custom hook to access the Reports fetching state from PollingService
 * @returns {boolean} isFetchingReports - true when PollingService is calling getReports API
 */
export const useReportsFetching = (): boolean => {
  const [{isFetchingReports}] = useStateValue();
  return isFetchingReports;
};

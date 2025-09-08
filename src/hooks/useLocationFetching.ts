import {useStateValue} from '../services/State/State';

/**
 * Custom hook to access the location fetching state from PollingService
 * @returns {boolean} isFetchingLocation - true when PollingService is calling getLocation API
 */
export const useLocationFetching = (): boolean => {
  const [{isFetchingLocation}] = useStateValue();
  return isFetchingLocation;
};

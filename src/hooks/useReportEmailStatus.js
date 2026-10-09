import {useCallback, useState} from 'react';
import {AppState, DeviceEventEmitter} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getWalletAddress} from '../services/DataManager';
import {readReportEmailStatusLimited} from '../services/ReportEmailStatusService';

export const REPORT_DELIVERY_UPDATED = 'cleanapp.reportDeliveryUpdated';

export const useReportEmailStatus = (seq, refreshKey = 0) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const refresh = useCallback(() => setRefreshVersion(value => value + 1), []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let requestVersion = 0;
      let currentOwner = null;
      const load = async () => {
        const version = ++requestVersion;
        setLoading(true);
        setError(false);
        try {
          const owner = await getWalletAddress();
          if (!active || version !== requestVersion) {
            return;
          }
          if (owner !== currentOwner) {
            setStatus(null);
            currentOwner = owner;
          }
          const result = await readReportEmailStatusLimited(
            owner,
            seq,
            () => active && version === requestVersion,
          );
          if (active && version === requestVersion) {
            const latestOwner = await getWalletAddress();
            if (!active || version !== requestVersion) {
              return;
            }
            if (latestOwner !== owner) {
              setStatus(null);
              load();
              return;
            }
            // Never keep an old successful receipt as a current server response.
            setStatus(result);
            setError(!result);
            setLoading(false);
          }
        } catch {
          if (active && version === requestVersion) {
            setStatus(null);
            setError(true);
            setLoading(false);
          }
        }
      };
      load();
      const updateSubscription = DeviceEventEmitter.addListener(
        REPORT_DELIVERY_UPDATED,
        payload => {
          if (Number(payload?.seq) === Number(seq)) {
            load();
          }
        },
      );
      const appSubscription = AppState.addEventListener('change', state => {
        if (state === 'active') {
          load();
        }
      });
      return () => {
        active = false;
        updateSubscription.remove();
        appSubscription.remove();
        setStatus(null);
      };
    }, [seq, refreshKey, refreshVersion]),
  );

  return {status, loading, error, refresh};
};

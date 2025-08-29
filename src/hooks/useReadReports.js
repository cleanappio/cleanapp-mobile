import {useState, useEffect, useCallback, useRef} from 'react';
import {
  getNotifiedReports,
  setNotifiedReports,
  removeNotifiedReports,
  getOpenedReports,
  setOpenedReports,
  removeOpenedReports,
} from '../services/DataManager';

export const useNotifiedReports = reports => {
  const [notifiedReports, setNotifiedReportsState] = useState([]);
  const [openedReports, setOpenedReportsState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const hasInitialized = useRef(false);
  const lastReportsLength = useRef(0);
  const isUpdatingReadReports = useRef(false);
  const isUpdatingOpenedReports = useRef(false);

  // Load existing read reports and opened reports from AsyncStorage on mount
  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true);

        // Load notified reports
        const storedReports = await getNotifiedReports();

        if (storedReports && storedReports !== 'null') {
          try {
            const parsedReports = JSON.parse(storedReports);

            setNotifiedReportsState(parsedReports);
          } catch (parseError) {
            console.error(
              '❌ [useReadReports] Error parsing stored notified reports:',
              parseError,
            );
            try {
              await removeNotifiedReports();
            } catch (clearError) {
              console.error(
                '❌ [useReadReports] Error clearing corrupted notified data:',
                clearError,
              );
            }
            setNotifiedReportsState([]);
          }
        } else {
          setNotifiedReportsState([]);
        }

        // Load opened reports
        const storedOpenedReports = await getOpenedReports();

        if (storedOpenedReports && storedOpenedReports !== 'null') {
          try {
            const parsedOpenedReports = JSON.parse(storedOpenedReports);

            setOpenedReportsState(parsedOpenedReports);
          } catch (parseError) {
            console.error(
              '❌ [useReadReports] Error parsing stored opened reports:',
              parseError,
            );

            try {
              await removeOpenedReports();
            } catch (clearError) {
              console.error(
                '❌ [useReadReports] Error clearing corrupted opened data:',
                clearError,
              );
            }
            setOpenedReportsState([]);
          }
        } else {
          setOpenedReportsState([]);
        }
      } catch (error) {
        console.error('❌ [useReadReports] Error loading reports:', error);
      } finally {
        setIsLoading(false);
        hasInitialized.current = true;
      }
    };

    loadReports();
  }, []);

  const clearReadReports = useCallback(async () => {
    try {
      await removeNotifiedReports();
      setNotifiedReportsState([]);
    } catch (error) {
      console.error(
        '❌ [useReadReports] Error clearing notified reports:',
        error,
      );
    }
  }, []);

  const clearOpenedReports = useCallback(async () => {
    try {
      await removeOpenedReports();
      setOpenedReportsState([]);
    } catch (error) {
      console.error(
        '❌ [useReadReports] Error clearing opened reports:',
        error,
      );
    }
  }, []);

  // Save read reports to AsyncStorage
  const saveReadReports = useCallback(async reportIds => {
    try {
      // Validate that reportIds is an array of strings/numbers
      if (!Array.isArray(reportIds)) {
        console.error(
          '❌ [useReadReports] Invalid reportIds - not an array:',
          reportIds,
        );
        return;
      }

      // Filter out any invalid IDs
      const validReportIds = reportIds.filter(
        id =>
          id !== null &&
          id !== undefined &&
          id !== '' &&
          (typeof id === 'string' || typeof id === 'number'),
      );

      if (validReportIds.length !== reportIds.length) {
        console.warn('⚠️ [useReadReports] Filtered out invalid IDs:', {
          original: reportIds,
          filtered: validReportIds,
        });
      }

      await setNotifiedReports(validReportIds);
    } catch (error) {
      console.error('❌ [useReadReports] Error saving read reports:', error);
    }
  }, []);

  // Check for new reports and update read reports
  useEffect(() => {
    // Only run after initial load and when reports change
    if (!hasInitialized.current || isLoading) {
      return;
    }

    // Only run when reports length changes (new reports added)
    if (reports.length === lastReportsLength.current) {
      return;
    }
    lastReportsLength.current = reports.length;

    if (reports.length > 0) {
      // If notifiedReports is empty (first time), treat all reports as new
      let newReports;
      if (notifiedReports.length === 0) {
        newReports = reports;
      } else {
        newReports = reports.filter(
          report => !notifiedReports.includes(report.id),
        );
      }

      if (newReports.length > 0) {
        // Show toast notification
        const message =
          newReports.length === 1
            ? `New report: ${newReports[0].title}`
            : `${newReports.length} new reports available`;

        // Set toast state first
        setToastMessage(message);
        setShowToast(true);

        // Update notifiedReports to include new reports (separate from toast)
        const updatedReadReports = [
          ...notifiedReports,
          ...newReports.map(r => r.id),
        ];

        // Use setTimeout to delay notifiedReports update to avoid interference
        setTimeout(() => {
          isUpdatingReadReports.current = true;
          setNotifiedReportsState(updatedReadReports);
          saveReadReports(updatedReadReports);
          isUpdatingReadReports.current = false;
        }, 200);
      }
    }
  }, [reports.length, notifiedReports, isLoading, saveReadReports]);

  // Mark a report as read
  const markReportAsRead = useCallback(
    async reportId => {
      // Validate reportId
      if (
        !reportId ||
        (typeof reportId !== 'string' && typeof reportId !== 'number')
      ) {
        console.error('❌ [useReadReports] Invalid reportId:', reportId);
        return;
      }

      if (!notifiedReports.includes(reportId)) {
        const updatedReadReports = [...notifiedReports, reportId];
        setNotifiedReportsState(updatedReadReports);
        await saveReadReports(updatedReadReports);
      }
    },
    [notifiedReports, saveReadReports],
  );

  // Mark a report as opened
  const markReportAsOpened = useCallback(
    async reportId => {
      // Validate reportId
      if (
        !reportId ||
        (typeof reportId !== 'string' && typeof reportId !== 'number')
      ) {
        console.error('❌ [useReadReports] Invalid reportId:', reportId);
        return;
      }

      if (!openedReports.includes(reportId)) {
        const updatedOpenedReports = [...openedReports, reportId];

        isUpdatingOpenedReports.current = true;
        setOpenedReportsState(updatedOpenedReports);
        await setOpenedReports(updatedOpenedReports);
        isUpdatingOpenedReports.current = false;
      }
    },
    [openedReports],
  );

  // Check if a report is new
  const isNewReport = useCallback(
    reportId => {
      const isNew = !notifiedReports.includes(reportId);
      return isNew;
    },
    [notifiedReports],
  );

  // Check if a report is opened
  const isReportOpened = useCallback(
    reportId => {
      const isOpened = openedReports.includes(reportId);
      return isOpened;
    },
    [openedReports],
  );

  return {
    notifiedReports,
    openedReports,
    isLoading,
    markReportAsRead,
    markReportAsOpened,
    isNewReport,
    isReportOpened,
    saveReadReports,
    toastMessage,
    showToast,
    hideToast: () => setShowToast(false),
    clearReadReports,
    clearOpenedReports,
    setToastMessage,
    setShowToast,
  };
};

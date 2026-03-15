import {AppState, NativeModules, Platform} from 'react-native';
import {
  checkNotifications,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';

import {readReportEmailStatus} from './API/APIManager';
import {
  getDeliveredReportNotificationKeys,
  getPendingReportDeliveryTracking,
  getWalletAddress,
  setDeliveredReportNotificationKeys,
  setPendingReportDeliveryTracking,
} from './DataManager';
import {ToastService} from '../components/ToastifyToast';

const POLL_INTERVAL_MS = 15000;
const TERMINAL_STATUSES = new Set(['sent', 'processed_no_delivery']);
const MAX_DELIVERED_KEYS = 200;

class ReportDeliveryNotificationService {
  constructor() {
    this.interval = null;
    this.started = false;
    this.pollInFlight = false;
    this.appState = AppState.currentState;
    this.subscription = null;
  }

  start = async () => {
    if (this.started) {
      return;
    }

    this.started = true;
    this.subscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );

    await this.pollNow();
    this.startIntervalIfNeeded();
  };

  stop = () => {
    this.stopInterval();
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.started = false;
  };

  trackSubmission = async submission => {
    if (!submission || submission.seq == null) {
      return;
    }

    const pendingReports = await getPendingReportDeliveryTracking();
    const nextPendingReports = [...pendingReports];
    const existingIndex = nextPendingReports.findIndex(
      item => Number(item.seq) === Number(submission.seq),
    );

    const normalizedSubmission = {
      seq: Number(submission.seq),
      publicId: submission.publicId || submission.public_id || null,
      walletAddress: submission.walletAddress || null,
      submittedAt: submission.submittedAt || new Date().toISOString(),
      lastKnownStatus: 'pending',
    };

    if (existingIndex >= 0) {
      nextPendingReports[existingIndex] = {
        ...nextPendingReports[existingIndex],
        ...normalizedSubmission,
      };
    } else {
      nextPendingReports.push(normalizedSubmission);
    }

    await setPendingReportDeliveryTracking(nextPendingReports);
    await this.ensureNotificationPermissions();
    await this.pollNow();
  };

  handleAppStateChange = async nextAppState => {
    const wasBackgrounded = this.appState.match(/inactive|background/);
    this.appState = nextAppState;

    if (wasBackgrounded && nextAppState === 'active') {
      await this.pollNow();
      this.startIntervalIfNeeded();
      return;
    }

    if (nextAppState === 'active') {
      this.startIntervalIfNeeded();
      return;
    }

    this.stopInterval();
  };

  startIntervalIfNeeded = () => {
    if (this.appState !== 'active' || this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      this.pollNow();
    }, POLL_INTERVAL_MS);
  };

  stopInterval = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  };

  pollNow = async () => {
    if (this.pollInFlight) {
      return;
    }

    this.pollInFlight = true;

    try {
      const pendingReports = await getPendingReportDeliveryTracking();
      if (!pendingReports.length) {
        return;
      }

      const deliveredKeys = await getDeliveredReportNotificationKeys();
      const deliveredKeySet = new Set(deliveredKeys);
      const nextPendingReports = [];

      for (const pendingReport of pendingReports) {
        const walletAddress =
          pendingReport.walletAddress || (await getWalletAddress());

        if (!walletAddress || pendingReport.seq == null) {
          nextPendingReports.push(pendingReport);
          continue;
        }

        const statusResponse = await readReportEmailStatus(
          walletAddress,
          pendingReport.seq,
        );

        if (!statusResponse || !statusResponse.status) {
          nextPendingReports.push(pendingReport);
          continue;
        }

        if (!TERMINAL_STATUSES.has(statusResponse.status)) {
          nextPendingReports.push({
            ...pendingReport,
            lastKnownStatus: statusResponse.status,
            lastCheckedAt: new Date().toISOString(),
          });
          continue;
        }

        const deliveryKey = this.buildDeliveryKey(
          pendingReport.seq,
          statusResponse,
        );

        if (!deliveredKeySet.has(deliveryKey)) {
          await this.notifyDelivery(pendingReport, statusResponse);
          deliveredKeySet.add(deliveryKey);
        }
      }

      await setPendingReportDeliveryTracking(nextPendingReports);
      await setDeliveredReportNotificationKeys(
        Array.from(deliveredKeySet).slice(-MAX_DELIVERED_KEYS),
      );
    } finally {
      this.pollInFlight = false;
    }
  };

  buildDeliveryKey = (seq, statusResponse) => {
    return [
      String(seq),
      statusResponse.status || 'unknown',
      statusResponse.last_email_sent_at || 'no-sent-at',
      String(statusResponse.recipient_count || 0),
    ].join(':');
  };

  ensureNotificationPermissions = async () => {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      const currentStatus = await checkNotifications();
      if (currentStatus.status === RESULTS.DENIED) {
        await requestNotifications(['alert', 'badge', 'sound']);
      }
    } catch (error) {
      console.warn(
        'ReportDeliveryNotificationService.ensureNotificationPermissions error:',
        error?.message || error,
      );
    }
  };

  notifyDelivery = async (pendingReport, statusResponse) => {
    const notificationConfig = this.buildNotificationConfig(statusResponse);

    if (this.appState === 'active') {
      ToastService.show({
        type: notificationConfig.type,
        text1: notificationConfig.title,
        text2: notificationConfig.body,
        duration: 6000,
      });
      return;
    }

    try {
      await NativeModules.CleanAppNotificationModule?.presentLocalNotification(
        notificationConfig.title,
        notificationConfig.body,
        {
          notification_id: `report_delivery_${pendingReport.seq}_${statusResponse.status}`,
          seq: String(pendingReport.seq),
          public_id: pendingReport.publicId || '',
          status: statusResponse.status || '',
        },
      );
    } catch (error) {
      console.warn(
        'ReportDeliveryNotificationService.presentLocalNotification error:',
        error?.message || error,
      );
    }
  };

  buildNotificationConfig = statusResponse => {
    if (statusResponse.status === 'sent') {
      const recipientCount = Number(statusResponse.recipient_count || 0);
      if (recipientCount === 1) {
        return {
          type: 'success',
          title: 'Report sent',
          body: 'Your report was sent to 1 responsible party.',
        };
      }

      if (recipientCount > 1) {
        return {
          type: 'success',
          title: 'Report sent',
          body: `Your report was sent to ${recipientCount} responsible parties.`,
        };
      }

      return {
        type: 'success',
        title: 'Report processed',
        body: 'Your report was processed and outreach was completed.',
      };
    }

    return {
      type: 'info',
      title: 'Report processed',
      body: 'Your report was processed. No confirmed delivery recipient was recorded yet.',
    };
  };
}

export default new ReportDeliveryNotificationService();

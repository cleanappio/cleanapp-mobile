import {AppState, NativeModules} from 'react-native';

import {getOrCreatePushInstallID, getWalletAddress} from './DataManager';
import AppVersionService from './AppVersionService';
import {getUrls} from './API/Settings';

class ShareToCleanAppService {
  constructor() {
    this.started = false;
    this.subscription = null;
  }

  start = async () => {
    if (this.started) {
      return;
    }
    this.started = true;
    this.subscription = AppState.addEventListener('change', this.handleAppStateChange);
    await this.syncAndRetry();
  };

  stop = () => {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.started = false;
  };

  handleAppStateChange = async nextState => {
    if (nextState === 'active') {
      await this.syncAndRetry();
    }
  };

  syncAndRetry = async () => {
    const shareModule = NativeModules.CleanAppShareModule;
    if (!shareModule) {
      return;
    }

    try {
      const [walletAddress, installId, appVersion] = await Promise.all([
        getWalletAddress(),
        getOrCreatePushInstallID(),
        AppVersionService.getFullVersionString(),
      ]);

      if (shareModule.syncShareContext) {
        await shareModule.syncShareContext({
          walletAddress: walletAddress || '',
          installId: installId || '',
          liveUrl: getUrls().liveUrl,
          appVersion: appVersion || '',
        });
      }

      if (shareModule.retryPendingSharedDrafts) {
        await shareModule.retryPendingSharedDrafts();
      }
    } catch (error) {
      console.warn('ShareToCleanAppService.syncAndRetry error:', error?.message || error);
    }
  };
}

export default new ShareToCleanAppService();

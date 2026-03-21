import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const pendingActions = [];

export const runWhenNavigationReady = action => {
  if (typeof action !== 'function') {
    return;
  }

  if (navigationRef.isReady()) {
    action();
    return;
  }

  pendingActions.push(action);
};

export const flushPendingNavigationActions = () => {
  if (!navigationRef.isReady()) {
    return;
  }

  while (pendingActions.length > 0) {
    const action = pendingActions.shift();
    try {
      action?.();
    } catch (error) {
      console.warn('NavigationService.flushPendingNavigationActions error:', error);
    }
  }
};

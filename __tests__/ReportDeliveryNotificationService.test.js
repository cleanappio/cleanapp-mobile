import {NativeModules} from 'react-native';

let mockNavigationReady = true;
const mockPendingActions = [];
jest.mock('react-native-config', () => ({}));
jest.mock('react-native-permissions', () => ({
  checkNotifications: jest.fn(),
  requestNotifications: jest.fn(),
  RESULTS: {},
}));
jest.mock('../src/services/API/APIManager', () => ({
  readReportEmailStatus: jest.fn(),
  readDetailedReportBySeq: jest.fn(),
  readDetailedReportByPublicId: jest.fn(),
  registerMobilePushDevice: jest.fn(),
  unregisterMobilePushDevice: jest.fn(),
}));
jest.mock('../src/services/AppVersionService', () => ({}));
jest.mock('../src/services/DataManager', () => ({}));
jest.mock('../src/components/ToastifyToast', () => ({
  ToastService: {show: jest.fn()},
}));
jest.mock('../src/services/NavigationService', () => ({
  navigationRef: {navigate: jest.fn()},
  runWhenNavigationReady: jest.fn(action =>
    mockNavigationReady ? action() : mockPendingActions.push(action),
  ),
}));

import service from '../src/services/ReportDeliveryNotificationService';
import {
  readDetailedReportBySeq,
  readDetailedReportByPublicId,
} from '../src/services/API/APIManager';
import {ToastService} from '../src/components/ToastifyToast';
import {navigationRef} from '../src/services/NavigationService';

const report = seq => ({report: {seq}, analysis: []});
const receipt = {
  status: 'sent',
  last_email_sent_at: '2030-01-01T00:00:00Z',
  recipient_count: 5,
  recipients: [
    {
      email: 'contact@example.com',
      delivery_status: 'sent',
      sent_at: '2026-10-10T11:00:00Z',
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigationReady = true;
  mockPendingActions.length = 0;
  service.notificationOpenVersion = 0;
  service.navigationRequestID = 0;
  service.appState = 'active';
  NativeModules.CleanAppNotificationModule = {
    clearInitialNotification: jest.fn(),
    presentLocalNotification: jest.fn(),
    getInitialNotification: jest.fn(),
  };
  readDetailedReportBySeq.mockResolvedValue(report(7));
  readDetailedReportByPublicId.mockResolvedValue(null);
});

test('foreground delivery banner tap opens the actual report escalation log', async () => {
  await service.notifyDelivery({seq: 7, publicId: 'report-id'}, receipt);
  const toast = ToastService.show.mock.calls[0][0];
  expect(toast).toMatchObject({type: 'delivery', text1: 'Report emailed'});
  expect(toast.text2).toContain('Emailed 1 contact');
  await toast.onPress();
  expect(navigationRef.navigate).toHaveBeenCalledWith('Leaderboard', {
    screen: 'MyReportDetails',
    params: expect.objectContaining({
      report: report(7),
      initialSection: 'escalation_log',
      escalationRequestId: expect.any(Number),
    }),
  });
});

test('cold-start push waits for navigation readiness and preserves the log destination', async () => {
  mockNavigationReady = false;
  NativeModules.CleanAppNotificationModule.getInitialNotification.mockResolvedValue(
    {seq: '7', initial_section: 'escalation_log', recipient_count: '1'},
  );
  await service.handleInitialNotificationOpen();
  expect(navigationRef.navigate).not.toHaveBeenCalled();
  expect(
    NativeModules.CleanAppNotificationModule.clearInitialNotification,
  ).not.toHaveBeenCalled();
  mockNavigationReady = true;
  mockPendingActions.shift()();
  expect(navigationRef.navigate.mock.calls[0][1].params.initialSection).toBe(
    'escalation_log',
  );
  expect(
    NativeModules.CleanAppNotificationModule.clearInitialNotification,
  ).toHaveBeenCalledTimes(1);
});

test('repeat push for an already-open report supplies a distinct refresh and scroll token', async () => {
  jest.spyOn(Date, 'now').mockReturnValue(100);
  await service.handleNotificationOpenPayload({
    seq: '7',
    navigate_to: 'my_report_details',
  });
  await service.handleNotificationOpenPayload({
    seq: '7',
    initial_section: 'escalation_log',
  });
  expect(
    navigationRef.navigate.mock.calls.map(
      call => call[1].params.escalationRequestId,
    ),
  ).toEqual([100, 101]);
  Date.now.mockRestore();
});

test('newest tap wins when an older fetch finishes late', async () => {
  let resolveOlder;
  readDetailedReportBySeq.mockImplementation(seq =>
    seq === 7
      ? new Promise(resolve => {
          resolveOlder = resolve;
        })
      : Promise.resolve(report(seq)),
  );
  const older = service.handleNotificationOpenPayload({seq: 7});
  await service.handleNotificationOpenPayload({seq: 8});
  resolveOlder(report(7));
  await older;
  expect(navigationRef.navigate).toHaveBeenCalledTimes(1);
  expect(navigationRef.navigate.mock.calls[0][1].params.report.report.seq).toBe(
    8,
  );
});

test('failed fetch leaves native initial payload available and gives a retry hint', async () => {
  readDetailedReportBySeq.mockResolvedValue(null);
  await service.handleNotificationOpenPayload({seq: 7});
  expect(navigationRef.navigate).not.toHaveBeenCalled();
  expect(
    NativeModules.CleanAppNotificationModule.clearInitialNotification,
  ).not.toHaveBeenCalled();
  expect(ToastService.show).toHaveBeenCalledWith(
    expect.objectContaining({text1: 'Could not open this report'}),
  );
});

test('background local notification includes route/count and only an actual receipt timestamp', async () => {
  service.appState = 'background';
  await service.notifyDelivery({seq: 7}, receipt);
  expect(
    NativeModules.CleanAppNotificationModule.presentLocalNotification,
  ).toHaveBeenCalledWith(
    expect.any(String),
    expect.any(String),
    expect.objectContaining({
      initial_section: 'escalation_log',
      recipient_count: '1',
      sent_at: '2026-10-10T11:00:00Z',
    }),
  );
  await service.notifyDelivery(
    {seq: 8},
    {
      status: 'processed_no_delivery',
      last_email_sent_at: '2030-01-01T00:00:00Z',
    },
  );
  expect(
    NativeModules.CleanAppNotificationModule.presentLocalNotification.mock
      .calls[1][2].sent_at,
  ).toBe('');
});

import React from 'react';
import {Pressable, Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';

jest.mock('../src/hooks/useReportEmailStatus', () => ({
  useReportEmailStatus: jest.fn(),
}));
jest.mock('toastify-react-native', () => ({
  __esModule: true,
  default: () => null,
  Toast: {show: jest.fn(), hide: jest.fn()},
}));

import {useReportEmailStatus} from '../src/hooks/useReportEmailStatus';
import ReportDeliverySummary from '../src/components/ReportDeliverySummary';
import ReportEscalationLog from '../src/components/ReportEscalationLog';
import {DeliveryToast} from '../src/components/ToastifyToast';

const status = {
  status: 'sent',
  last_email_sent_at: '2030-01-01T00:00:00Z',
  recipients: [
    {
      email: 'contact@example.com',
      display_name: 'Maintenance team',
      delivery_status: 'sent',
      sent_at: '2026-10-10T11:00:00Z',
    },
  ],
};
const texts = renderer =>
  renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .join(' ');
let renderer;
afterEach(() => {
  if (renderer) {
    act(() => renderer.unmount());
    renderer = null;
  }
});

test('persistent My Reports summary opens its escalation log and survives a fresh mount', async () => {
  useReportEmailStatus.mockReturnValue({status, loading: false});
  const onPress = jest.fn();
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ReportDeliverySummary seq={7} onPress={onPress} />,
    );
  });
  expect(texts(renderer)).toContain('Emailed 1 contact');
  expect(texts(renderer)).toContain('View escalation log');
  renderer.root.findByType(Pressable).props.onPress();
  expect(onPress).toHaveBeenCalledTimes(1);
  await act(async () => {
    renderer.unmount();
    renderer = ReactTestRenderer.create(
      <ReportDeliverySummary seq={7} onPress={onPress} />,
    );
  });
  expect(texts(renderer)).toContain('Emailed 1 contact');
});

test('log shows actual recipient and timestamp, refreshes same-report reopen token', async () => {
  useReportEmailStatus.mockReturnValue({
    status,
    loading: false,
    error: false,
    refresh: jest.fn(),
  });
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ReportEscalationLog seq={7} refreshKey={100} />,
    );
  });
  expect(texts(renderer)).toContain('Maintenance team');
  expect(texts(renderer)).toContain('contact@example.com');
  expect(texts(renderer)).toContain('Emailed');
  expect(texts(renderer)).not.toContain('2030');
  expect(texts(renderer)).toContain('Latest recorded email for each contact.');
  expect(useReportEmailStatus).toHaveBeenLastCalledWith(7, 100);
  await act(async () => {
    renderer.update(<ReportEscalationLog seq={7} refreshKey={101} />);
  });
  expect(useReportEmailStatus).toHaveBeenLastCalledWith(7, 101);
});

test('no-delivery and unavailable states remain honest and offer refresh', async () => {
  const refresh = jest.fn();
  useReportEmailStatus.mockReturnValue({
    status: {
      status: 'processed_no_delivery',
      last_email_sent_at: '2030-01-01T00:00:00Z',
    },
    loading: false,
    error: false,
    refresh,
  });
  await act(async () => {
    renderer = ReactTestRenderer.create(<ReportEscalationLog seq={7} />);
  });
  expect(texts(renderer)).toContain('No email delivery recorded');
  expect(texts(renderer)).not.toContain('2030');
  renderer.root.findByType(Pressable).props.onPress();
  expect(refresh).toHaveBeenCalledTimes(1);
  useReportEmailStatus.mockReturnValue({
    status: null,
    loading: false,
    error: true,
    refresh,
  });
  await act(async () => {
    renderer.update(<ReportEscalationLog seq={7} />);
  });
  expect(texts(renderer)).toContain(
    'Could not load email delivery. Try again.',
  );
});

test('delivery toast action is tappable and its dismiss action does not navigate', async () => {
  const onPress = jest.fn();
  const hide = jest.fn();
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <DeliveryToast
        text1="Report emailed"
        text2="Emailed 1 contact"
        onPress={onPress}
        hide={hide}
      />,
    );
  });
  renderer.root.findByType(Pressable).props.onPress();
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(hide).toHaveBeenCalledTimes(1);
  const dismiss = renderer.root
    .findAllByType(Text)
    .find(node => node.props.accessibilityLabel === 'Dismiss notification');
  dismiss.props.onPress();
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(hide).toHaveBeenCalledTimes(2);
});

import React from 'react';
import {DeviceEventEmitter, Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const Focus = React.createContext(true);
  return {
    TestFocusProvider: Focus.Provider,
    useFocusEffect: callback => {
      const focused = React.useContext(Focus);
      React.useEffect(
        () => (focused ? callback() : undefined),
        [callback, focused],
      );
    },
  };
});
jest.mock('../src/services/DataManager', () => ({getWalletAddress: jest.fn()}));
jest.mock('../src/services/API/APIManager', () => ({
  readReportEmailStatus: jest.fn(),
}));
jest.mock('../src/services/ReportEmailStatusService', () => {
  const actual = jest.requireActual('../src/services/ReportEmailStatusService');
  return {...actual, readReportEmailStatusLimited: jest.fn()};
});

import {TestFocusProvider} from '@react-navigation/native';
import {getWalletAddress} from '../src/services/DataManager';
import {
  createReportEmailStatusReader,
  readReportEmailStatusLimited,
} from '../src/services/ReportEmailStatusService';
import {
  REPORT_DELIVERY_UPDATED,
  useReportEmailStatus,
} from '../src/hooks/useReportEmailStatus';
import {getReportDeliverySummary} from '../src/utils/reportDelivery';

let latest;
const StatusProbe = ({seq = 7, refreshKey}) => {
  latest = useReportEmailStatus(seq, refreshKey);
  const summary = getReportDeliverySummary(latest.status);
  return (
    <>
      <Text>{summary.label}</Text>
      <Text>
        {summary.recipients.map(recipient => recipient.email).join(', ')}
      </Text>
    </>
  );
};
const Probe = ({focused = true, ...props}) => (
  <TestFocusProvider value={focused}>
    <StatusProbe {...props} />
  </TestFocusProvider>
);
const visibleText = () =>
  renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .join(' ');
const receipt = email => ({
  status: 'sent',
  recipients: [
    {email, delivery_status: 'sent', sent_at: '2026-10-10T11:00:00Z'},
  ],
});
const deferred = () => {
  let resolve;
  const promise = new Promise(complete => {
    resolve = complete;
  });
  return {promise, resolve};
};
let renderer;
beforeEach(() => {
  jest.clearAllMocks();
  getWalletAddress.mockResolvedValue('owner');
  readReportEmailStatusLimited.mockResolvedValue({
    status: 'pending',
    recipients: [],
  });
});
afterEach(() => {
  if (renderer) {
    act(() => renderer.unmount());
    renderer = null;
  }
});

test('fetches fresh owner-only status after relaunch and when same focused report receives a new tap token', async () => {
  await act(async () => {
    renderer = ReactTestRenderer.create(<Probe refreshKey={100} />);
  });
  expect(latest.status.status).toBe('pending');
  expect(visibleText()).toContain('Email delivery pending');
  readReportEmailStatusLimited.mockResolvedValue({
    status: 'sent',
    recipients: [{email: 'contact@example.com', delivery_status: 'sent'}],
  });
  await act(async () => {
    renderer.update(<Probe refreshKey={101} />);
  });
  expect(latest.status.status).toBe('sent');
  expect(visibleText()).toContain('Emailed 1 contact');
  expect(visibleText()).toContain('contact@example.com');
  expect(readReportEmailStatusLimited).toHaveBeenCalledTimes(2);
  expect(readReportEmailStatusLimited).toHaveBeenLastCalledWith(
    'owner',
    7,
    expect.any(Function),
  );
  await act(async () => {
    renderer.unmount();
    renderer = ReactTestRenderer.create(<Probe refreshKey={101} />);
  });
  expect(latest.status.status).toBe('sent');
  expect(readReportEmailStatusLimited).toHaveBeenCalledTimes(3);
});

test('an old request cannot overwrite a newly selected report', async () => {
  let resolveOlder;
  readReportEmailStatusLimited.mockImplementation((_owner, seq) =>
    seq === 7
      ? new Promise(resolve => {
          resolveOlder = resolve;
        })
      : Promise.resolve({seq: 8, status: 'sent'}),
  );
  await act(async () => {
    renderer = ReactTestRenderer.create(<Probe seq={7} />);
  });
  await act(async () => {
    renderer.update(<Probe seq={8} />);
  });
  await act(async () => {
    resolveOlder({seq: 7, status: 'pending'});
  });
  expect(latest.status).toEqual({seq: 8, status: 'sent'});
});

test('a wallet switch during a status request never renders the prior owner recipients', async () => {
  let resolveOlder;
  let owner = 'first-owner';
  getWalletAddress.mockImplementation(async () => owner);
  readReportEmailStatusLimited.mockImplementation(wallet =>
    wallet === 'first-owner'
      ? new Promise(resolve => {
          resolveOlder = resolve;
        })
      : Promise.resolve(null),
  );
  await act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  owner = 'second-owner';
  await act(async () => {
    resolveOlder({
      status: 'sent',
      recipients: [{email: 'private@example.com'}],
    });
  });
  expect(latest.status).toBeNull();
  expect(latest.error).toBe(true);
  expect(readReportEmailStatusLimited).toHaveBeenLastCalledWith(
    'second-owner',
    7,
    expect.any(Function),
  );
});

test('unavailable refresh clears the earlier successful response', async () => {
  readReportEmailStatusLimited.mockResolvedValue({status: 'sent'});
  await act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  readReportEmailStatusLimited.mockResolvedValue(null);
  await act(async () => {
    latest.refresh();
  });
  expect(latest.status).toBeNull();
  expect(latest.error).toBe(true);
  expect(visibleText()).toContain('Email status unavailable');
});

test('blur discards an in-flight receipt and refocus fetches fresh status', async () => {
  const older = deferred();
  readReportEmailStatusLimited.mockReturnValueOnce(older.promise);
  await act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  await act(async () => {
    renderer.update(<Probe focused={false} />);
    older.resolve(receipt('stale@example.com'));
  });
  expect(visibleText()).not.toContain('stale@example.com');
  expect(latest.status).toBeNull();

  readReportEmailStatusLimited.mockResolvedValue(receipt('fresh@example.com'));
  await act(async () => {
    renderer.update(<Probe focused />);
  });
  expect(visibleText()).toContain('Emailed 1 contact');
  expect(visibleText()).toContain('fresh@example.com');
  expect(readReportEmailStatusLimited).toHaveBeenCalledTimes(2);
});

test('a newer same-report delivery refresh cannot be overwritten by an older response', async () => {
  const older = deferred();
  const newer = deferred();
  readReportEmailStatusLimited
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(newer.promise);
  await act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  await act(async () => {
    DeviceEventEmitter.emit(REPORT_DELIVERY_UPDATED, {seq: 7});
  });
  await act(async () => {
    newer.resolve(receipt('latest@example.com'));
  });
  expect(visibleText()).toContain('latest@example.com');
  await act(async () => {
    older.resolve(receipt('stale@example.com'));
  });
  expect(visibleText()).toContain('latest@example.com');
  expect(visibleText()).not.toContain('stale@example.com');
});

test('blur cancels the hook queued read before network dispatch, then refocus reads it', async () => {
  const occupied = deferred();
  const fetchStatus = jest.fn((_owner, seq) =>
    seq === 99
      ? occupied.promise
      : Promise.resolve(receipt('fresh@example.com')),
  );
  const read = createReportEmailStatusReader(fetchStatus, 1);
  const blocker = read('other-owner', 99);
  readReportEmailStatusLimited.mockImplementation(read);
  await act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  expect(fetchStatus.mock.calls).toEqual([['other-owner', 99]]);

  await act(async () => {
    renderer.update(<Probe focused={false} />);
  });
  await act(async () => {
    occupied.resolve({status: 'pending'});
    await blocker;
  });
  expect(fetchStatus.mock.calls).toEqual([['other-owner', 99]]);
  expect(visibleText()).toContain('Email status unavailable');

  await act(async () => {
    renderer.update(<Probe focused />);
  });
  expect(fetchStatus).toHaveBeenLastCalledWith('owner', 7);
  expect(visibleText()).toContain('fresh@example.com');
});

test('selecting another report skips the superseded queued read', async () => {
  const occupied = deferred();
  const fetchStatus = jest.fn((_owner, seq) =>
    seq === 99
      ? occupied.promise
      : Promise.resolve(receipt(`report-${seq}@example.com`)),
  );
  const read = createReportEmailStatusReader(fetchStatus, 1);
  const blocker = read('other-owner', 99);
  readReportEmailStatusLimited.mockImplementation(read);
  await act(async () => {
    renderer = ReactTestRenderer.create(<Probe seq={7} />);
  });
  await act(async () => {
    renderer.update(<Probe seq={8} />);
  });
  await act(async () => {
    occupied.resolve({status: 'pending'});
    await blocker;
  });
  expect(fetchStatus.mock.calls).toEqual([
    ['other-owner', 99],
    ['owner', 8],
  ]);
  expect(visibleText()).toContain('report-8@example.com');
  expect(visibleText()).not.toContain('report-7@example.com');
});

test('wallet change clears the earlier receipt while the current owner status is loading', async () => {
  let owner = 'first-owner';
  const nextOwner = deferred();
  getWalletAddress.mockImplementation(async () => owner);
  readReportEmailStatusLimited.mockImplementation(wallet =>
    wallet === 'first-owner'
      ? Promise.resolve(receipt('prior-owner@example.com'))
      : nextOwner.promise,
  );
  await act(async () => {
    renderer = ReactTestRenderer.create(<Probe refreshKey={100} />);
  });
  expect(visibleText()).toContain('prior-owner@example.com');

  owner = 'second-owner';
  await act(async () => {
    renderer.update(<Probe refreshKey={101} />);
  });
  expect(visibleText()).not.toContain('prior-owner@example.com');
  expect(latest.loading).toBe(true);
  expect(readReportEmailStatusLimited).toHaveBeenLastCalledWith(
    'second-owner',
    7,
    expect.any(Function),
  );
  await act(async () => {
    nextOwner.resolve(receipt('current-owner@example.com'));
  });
  expect(visibleText()).toContain('current-owner@example.com');
  expect(visibleText()).not.toContain('prior-owner@example.com');
});

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';

const mockScrollTo = jest.fn();
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  const ReactModule = require('react');
  const mocked = Object.create(actual);
  Object.defineProperty(mocked, 'ScrollView', {
    value: ReactModule.forwardRef((props, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({scrollTo: mockScrollTo}));
      return ReactModule.createElement('TestScrollView', props, props.children);
    }),
  });
  return mocked;
});
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: jest.fn()}),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
jest.mock('../src/hooks/useReverseGeocoding', () => ({
  useReverseGeocoding: () => ({address: 'Address', loading: false}),
}));
jest.mock('../src/services/API/APIManager', () => ({
  readReportCases: jest.fn(async () => ({cases: []})),
}));
jest.mock('../src/components/ResponsiveImage', () => () => null);
jest.mock('../src/components/ChevronLeft', () => () => null);
jest.mock('../src/components/NavigationIcon', () => () => null);
jest.mock('../src/components/CaseAwarenessCard', () => () => null);
jest.mock('../src/components/ReportEscalationLog', () => () => null);

import {View, Text} from 'react-native';
import MyReportDetails from '../src/screens/MyReportDetails';

const route = (token = 100) => ({
  params: {
    report: {report: {seq: 7, timestamp: '2026-10-10T10:00:00Z'}, analysis: []},
    initialSection: 'escalation_log',
    escalationRequestId: token,
  },
});
let renderer;
beforeEach(() => {
  jest.useFakeTimers();
  mockScrollTo.mockClear();
});
afterEach(() => {
  if (renderer) {
    act(() => renderer.unmount());
    renderer = null;
  }
  jest.useRealTimers();
});

test('empty analysis still renders and log navigation waits for layout, realigns after hydration and respects manual scrolling', async () => {
  await act(async () => {
    renderer = ReactTestRenderer.create(<MyReportDetails route={route()} />);
  });
  expect(
    renderer.root
      .findAllByType(Text)
      .some(node => node.props.children === 'Untitled Report'),
  ).toBe(true);
  expect(mockScrollTo).not.toHaveBeenCalled();
  const layouts = renderer.root
    .findAllByType(View)
    .filter(node => node.props.onLayout);
  const scroll = renderer.root.findByType('TestScrollView');
  act(() => {
    layouts[0].props.onLayout({nativeEvent: {layout: {y: 400}}});
    layouts[1].props.onLayout({nativeEvent: {layout: {y: 300}}});
    scroll.props.onContentSizeChange(400, 900);
  });
  act(() => jest.runOnlyPendingTimers());
  expect(mockScrollTo).toHaveBeenLastCalledWith({y: 700, animated: true});
  mockScrollTo.mockClear();
  act(() => scroll.props.onContentSizeChange(400, 1400));
  act(() => jest.runOnlyPendingTimers());
  expect(mockScrollTo).toHaveBeenCalledTimes(1);
  act(() => scroll.props.onScrollBeginDrag());
  mockScrollTo.mockClear();
  act(() => scroll.props.onContentSizeChange(400, 1600));
  act(() => jest.runOnlyPendingTimers());
  expect(mockScrollTo).not.toHaveBeenCalled();
  await act(async () => {
    renderer.update(<MyReportDetails route={route(101)} />);
  });
  act(() => jest.runOnlyPendingTimers());
  expect(mockScrollTo).toHaveBeenLastCalledWith({y: 700, animated: true});
});

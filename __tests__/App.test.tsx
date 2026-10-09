import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import CaseAwarenessCard from '../src/components/CaseAwarenessCard';

describe('CaseAwarenessCard', () => {
  test('renders nothing when there are no related cases', async () => {
    let tree: ReactTestRenderer.ReactTestRendererJSON | ReactTestRenderer.ReactTestRendererJSON[] | null =
      null;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<CaseAwarenessCard cases={[]} />).toJSON();
    });

    expect(tree).toBeNull();
  });

  test('renders related case metadata', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <CaseAwarenessCard
          cases={[
            {
              case_id: 'case_123',
              title: 'Overflowing waste area',
              status: 'open',
              summary: 'Repeated dumping near the loading dock.',
              severity_score: 0.72,
              urgency_score: 0.9,
              escalation_target_count: 3,
              delivery_count: 2,
            },
          ]}
        />,
      );
    });

    expect(
      renderer!.root.findAllByProps({children: 'Related Cases'}).length,
    ).toBeGreaterThan(0);
    const tree = JSON.stringify(renderer!.toJSON());
    expect(tree).toContain('Urgency ');
    expect(tree).toContain('90%');
  });
});

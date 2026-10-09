import {
  formatDeliveryTimestamp,
  getReportDeliverySummary,
  getSentRecipients,
} from '../src/utils/reportDelivery';

const sent = (email, sent_at) => ({email, sent_at, delivery_status: 'sent'});

test('counts unique successful contacts and uses their latest actual receipt time', () => {
  const status = {
    status: 'sent',
    recipient_count: 99,
    last_email_sent_at: '2030-01-01T00:00:00Z',
    recipients: [
      sent(' A@example.com ', '2026-10-10T10:00:00Z'),
      sent('a@example.com', '2026-10-10T11:00:00Z'),
      sent('b@example.com', '2026-10-10T09:00:00Z'),
      {
        email: 'failed@example.com',
        delivery_status: 'failed',
        sent_at: '2026-10-10T12:00:00Z',
      },
      sent('', '2026-10-10T12:00:00Z'),
    ],
  };
  expect(getReportDeliverySummary(status)).toMatchObject({
    count: 2,
    label: 'Emailed 2 contacts',
    latestSentAt: '2026-10-10T11:00:00Z',
  });
  expect(getSentRecipients(status).map(recipient => recipient.email)).toEqual([
    'a@example.com',
    'b@example.com',
  ]);
});

test('never represents the processing marker as an emailed time', () => {
  for (const status of ['sent', 'processed_no_delivery']) {
    expect(
      getReportDeliverySummary({
        status,
        last_email_sent_at: '2026-10-10T12:00:00Z',
        recipient_count: 1,
      }),
    ).toMatchObject({
      count: 0,
      latestSentAt: undefined,
      label: 'No email delivery recorded',
    });
  }
  expect(getReportDeliverySummary({status: 'pending_retry'}).label).toBe(
    'Email delivery pending',
  );
});

test('shows partial successful deliveries while another attempt is pending', () => {
  expect(
    getReportDeliverySummary({
      status: 'pending_retry',
      recipients: [sent('a@example.com', null)],
    }),
  ).toMatchObject({
    count: 1,
    label: 'Emailed 1 contact',
    latestSentAt: undefined,
  });
});

test('invalid or absent timestamps stay unavailable, valid ones use the device locale', () => {
  expect(formatDeliveryTimestamp('invalid')).toBe('');
  expect(formatDeliveryTimestamp(null)).toBe('');
  const value = '2026-10-10T11:00:00Z';
  expect(formatDeliveryTimestamp(value)).toBe(
    new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  );
});

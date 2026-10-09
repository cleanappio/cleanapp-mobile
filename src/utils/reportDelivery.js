// Only successful recipient receipts establish an email delivery. The report's
// last_email_sent_at field is a processing marker, including no-delivery runs.
export const getSentRecipients = status => {
  const byEmail = new Map();
  for (const recipient of Array.isArray(status?.recipients)
    ? status.recipients
    : []) {
    const email =
      typeof recipient?.email === 'string' ? recipient.email.trim() : '';
    if (recipient?.delivery_status !== 'sent' || !email) {
      continue;
    }
    const key = email.toLowerCase();
    const previous = byEmail.get(key);
    if (
      !previous ||
      timestampValue(recipient.sent_at) > timestampValue(previous.sent_at)
    ) {
      byEmail.set(key, {...recipient, email});
    }
  }
  return Array.from(byEmail.values()).sort(
    (a, b) => timestampValue(b.sent_at) - timestampValue(a.sent_at),
  );
};

const timestampValue = timestamp => {
  const value = timestamp ? new Date(timestamp).getTime() : NaN;
  return Number.isFinite(value) ? value : 0;
};

export const formatDeliveryTimestamp = timestamp => {
  if (!timestampValue(timestamp)) {
    return '';
  }
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getReportDeliverySummary = status => {
  const recipients = getSentRecipients(status);
  const latestSentAt = recipients.find(recipient =>
    timestampValue(recipient.sent_at),
  )?.sent_at;
  const count = recipients.length;
  let label;
  if (count) {
    label = `Emailed ${count} ${count === 1 ? 'contact' : 'contacts'}`;
  } else if (
    status?.status === 'pending' ||
    status?.status === 'pending_retry'
  ) {
    label = 'Email delivery pending';
  } else if (status) {
    label = 'No email delivery recorded';
  } else {
    label = 'Email status unavailable';
  }
  return {recipients, count, latestSentAt, label};
};

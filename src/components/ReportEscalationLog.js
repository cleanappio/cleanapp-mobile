import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useReportEmailStatus} from '../hooks/useReportEmailStatus';
import {
  formatDeliveryTimestamp,
  getReportDeliverySummary,
} from '../utils/reportDelivery';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

export default function ReportEscalationLog({seq, refreshKey}) {
  const {status, loading, error, refresh} = useReportEmailStatus(
    seq,
    refreshKey,
  );
  const summary = getReportDeliverySummary(status);
  const nextAttempt = formatDeliveryTimestamp(status?.next_attempt_at);
  return (
    <View style={styles.container} testID="report-escalation-log">
      <Text style={styles.title} accessibilityRole="header">
        Escalation log
      </Text>
      {loading && !status ? (
        <ActivityIndicator
          accessibilityLabel="Loading email delivery"
          color={theme.COLORS.BTN_BG_BLUE}
        />
      ) : (
        <>
          <Text style={styles.summary}>{summary.label}</Text>
          {summary.recipients.map(recipient => {
            const label = recipient.display_name || recipient.organization;
            const sentAt = formatDeliveryTimestamp(recipient.sent_at);
            return (
              <View
                style={styles.recipient}
                key={recipient.email.toLowerCase()}>
                {label ? <Text style={styles.name}>{label}</Text> : null}
                <Text style={styles.text} selectable>
                  {recipient.email}
                </Text>
                <Text style={styles.time}>
                  {sentAt ? `Emailed ${sentAt}` : 'Email time unavailable'}
                </Text>
              </View>
            );
          })}
          {summary.count > 0 && (
            <Text style={styles.note}>
              Latest recorded email for each contact.
            </Text>
          )}
          {status?.status === 'pending_retry' && (
            <Text style={styles.text}>
              {nextAttempt
                ? `Next email attempt: ${nextAttempt}`
                : 'Another email attempt is pending.'}
            </Text>
          )}
          {status?.status === 'pending' && (
            <Text style={styles.text}>
              We are still processing this report.
            </Text>
          )}
          {status?.status === 'processed_no_delivery' &&
            summary.count === 0 && (
              <Text style={styles.text}>
                Processing finished without a confirmed email recipient.
              </Text>
            )}
          {error && (
            <Text style={styles.text}>
              Could not load email delivery. Try again.
            </Text>
          )}
        </>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={refresh}
        style={styles.refresh}>
        <Text style={styles.action}>
          {loading ? 'Refreshing…' : 'Refresh delivery status'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.BORDER_GREY,
  },
  title: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summary: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontFamily: fontFamilies.Default,
    fontSize: 15,
    marginBottom: 8,
  },
  recipient: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.BORDER_GREY,
  },
  name: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    marginBottom: 4,
  },
  text: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 21,
  },
  time: {
    color: theme.COLORS.TEXT_GREY_50P,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    marginTop: 5,
  },
  note: {
    color: theme.COLORS.TEXT_GREY_50P,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    marginVertical: 12,
  },
  refresh: {paddingVertical: 12, alignSelf: 'flex-start'},
  action: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    fontWeight: '600',
  },
});

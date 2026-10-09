import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {useReportEmailStatus} from '../hooks/useReportEmailStatus';
import {
  formatDeliveryTimestamp,
  getReportDeliverySummary,
} from '../utils/reportDelivery';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

export default function ReportDeliverySummary({seq, onPress, refreshKey}) {
  const {status, loading} = useReportEmailStatus(seq, refreshKey);
  const summary = getReportDeliverySummary(status);
  const sentAt = formatDeliveryTimestamp(summary.latestSentAt);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${summary.label}. View escalation log`}
      onPress={onPress}
      style={styles.container}>
      <Text style={styles.summary}>
        {loading && !status ? 'Checking email delivery…' : summary.label}
        {sentAt ? ` • ${sentAt}` : ''}
      </Text>
      <Text style={styles.action}>View escalation log →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 10, paddingVertical: 6},
  summary: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 18,
  },
  action: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
    fontWeight: '600',
  },
});

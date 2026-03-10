import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

const percentage = value => `${Math.round((value || 0) * 100)}%`;

const CaseAwarenessCard = ({cases = []}) => {
  if (!cases.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Related Cases</Text>
      <Text style={styles.subtitle}>
        These reports are already being tracked as broader incidents.
      </Text>

      <View style={styles.list}>
        {cases.map(item => (
          <View key={item.case_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.caseTitle}>{item.title}</Text>
              <Text style={styles.caseStatus}>{item.status}</Text>
            </View>
            {!!item.summary && (
              <Text style={styles.caseSummary} numberOfLines={3}>
                {item.summary}
              </Text>
            )}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Severity {percentage(item.severity_score)}
              </Text>
              <Text style={styles.metaText}>
                Urgency {percentage(item.urgency_score)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Targets {item.escalation_target_count || 0}
              </Text>
              <Text style={styles.metaText}>
                Deliveries {item.delivery_count || 0}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
  },
  subtitle: {
    fontSize: 13,
    color: theme.COLORS.TEXT_GREY_50P,
    fontFamily: fontFamilies.Default,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: theme.COLORS.PANEL_BG,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE_30P,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  caseTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
  },
  caseStatus: {
    color: theme.COLORS.BTN_BG_BLUE,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fontFamilies.Default,
  },
  caseSummary: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metaText: {
    fontSize: 12,
    color: theme.COLORS.TEXT_GREY_50P,
    fontFamily: fontFamilies.Default,
  },
});

export default CaseAwarenessCard;

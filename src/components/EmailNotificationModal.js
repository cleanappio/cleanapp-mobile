import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../services/Common/theme';
import { fontFamilies } from '../utils/fontFamilies';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH * 0.85;

/**
 * EmailNotificationModal
 *
 * Shows a mid-size card over the camera screen with the email delivery
 * status for the most recent report.
 *
 * Props:
 *   visible   – boolean
 *   onDismiss – () => void
 *   data      – ReportEmailStatusResponse from backend:
 *     {
 *       status: 'pending' | 'pending_retry' | 'processed_no_delivery' | 'sent',
 *       recipient_count: number,
 *       recipients?: [{ email, delivery_source, delivery_status, sent_at }],
 *       last_email_sent_at?: string,
 *       next_attempt_at?: string,
 *       retry_reason?: string,
 *     }
 */
const EmailNotificationModal = ({ visible, onDismiss, data }) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 1,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!data) return null;

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0],
    });

    // --- Derive UI content based on backend status ---
    const status = data.status;
    const recipients = data.recipients || [];
    const recipientCount = data.recipient_count || 0;

    const getStatusConfig = () => {
        switch (status) {
            case 'sent':
                if (recipientCount > 0 && recipients.length > 0) {
                    const isSingle = recipients.length === 1;
                    return {
                        icon: '📧',
                        title: isSingle ? 'Notification Sent!' : 'Notifications Sent!',
                        subtitle: isSingle
                            ? "We've notified the responsible party about your report."
                            : `We've notified ${recipients.length} responsible parties about your report.`,
                        showRecipients: true,
                        accentColor: '#59E480',
                    };
                }
                // sent but no recipient rows (legacy)
                return {
                    icon: '✅',
                    title: 'Report Processed',
                    subtitle: 'Your report has been processed and outreach was completed.',
                    showRecipients: false,
                    accentColor: '#59E480',
                };

            case 'pending':
                return {
                    icon: '🔍',
                    title: 'Analyzing Report',
                    subtitle: 'We\'re analyzing your report and preparing outreach to the responsible party.',
                    showRecipients: false,
                    accentColor: '#F5A623',
                };

            case 'pending_retry':
                return {
                    icon: '⏳',
                    title: 'Still Working On It',
                    subtitle: humanizeRetryReason(data.retry_reason) ||
                        "We're still trying to identify and reach the right contact for your report.",
                    showRecipients: false,
                    accentColor: '#F5A623',
                };

            case 'processed_no_delivery':
                return {
                    icon: '📋',
                    title: 'Report Processed',
                    subtitle: 'Your report was processed. No confirmed delivery recipient was recorded.',
                    showRecipients: false,
                    accentColor: 'rgba(255, 255, 255, 0.5)',
                };

            default:
                return {
                    icon: '📋',
                    title: 'Report Update',
                    subtitle: 'Your report status has been updated.',
                    showRecipients: false,
                    accentColor: 'rgba(255, 255, 255, 0.5)',
                };
        }
    };

    const config = getStatusConfig();

    const formatTimestamp = (isoString) => {
        if (!isoString) return null;
        try {
            const d = new Date(isoString);
            return d.toLocaleString(undefined, {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch {
            return null;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onDismiss}>
            {/* Backdrop – tap to dismiss */}
            <Pressable style={styles.backdrop} onPress={onDismiss}>
                <Animated.View
                    style={[styles.backdropOverlay, { opacity: fadeAnim }]}
                />
            </Pressable>

            {/* Card */}
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY }],
                    },
                ]}
                pointerEvents="box-none">
                <View style={styles.card}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onDismiss}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    {/* Icon */}
                    <View style={[styles.iconCircle, { backgroundColor: hexToRgba(config.accentColor, 0.15) }]}>
                        <Text style={styles.iconEmoji}>{config.icon}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{config.title}</Text>
                    <Text style={styles.subtitle}>{config.subtitle}</Text>

                    {/* Retry info for pending_retry */}
                    {status === 'pending_retry' && data.next_attempt_at && (
                        <Text style={styles.retryInfo}>
                            Next attempt: {formatTimestamp(data.next_attempt_at)}
                        </Text>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Recipients List (only for 'sent' with actual recipients) */}
                    {config.showRecipients && (
                        <ScrollView
                            style={styles.recipientsList}
                            showsVerticalScrollIndicator={false}
                            bounces={recipients.length > 2}>
                            {recipients.map((recipient, index) => {
                                const isSingle = recipients.length === 1;
                                return (
                                    <View
                                        key={`${recipient.email}-${index}`}
                                        style={[
                                            styles.recipientCard,
                                            index < recipients.length - 1 && styles.recipientCardSpacing,
                                        ]}>
                                        {/* Number badge for multiple */}
                                        {!isSingle && (
                                            <View style={styles.recipientNumber}>
                                                <Text style={styles.recipientNumberText}>{index + 1}</Text>
                                            </View>
                                        )}
                                        <View style={[styles.recipientContent, !isSingle && { marginLeft: 12 }]}>
                                            <Text style={styles.detailLabel}>
                                                Email Sent To
                                            </Text>
                                            <Text style={styles.detailValueEmail}>{recipient.email}</Text>
                                            {recipient.sent_at && (
                                                <Text style={styles.timestampText}>
                                                    {formatTimestamp(recipient.sent_at)}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}

                    {/* Timestamp for sent (without recipient rows) */}
                    {!config.showRecipients && data.last_email_sent_at && status === 'sent' && (
                        <Text style={styles.timestampText}>
                            Processed: {formatTimestamp(data.last_email_sent_at)}
                        </Text>
                    )}

                    {/* Pending indicator */}
                    {(status === 'pending' || status === 'pending_retry') && (
                        <View style={styles.pendingDots}>
                            <Text style={styles.pendingDotsText}>●  ●  ●</Text>
                        </View>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Footer */}
                    <Text style={styles.footerText}>
                        Thank you for helping keep your community clean! 🌱
                    </Text>

                    {/* Dismiss Button */}
                    <TouchableOpacity
                        style={[styles.dismissButton, { backgroundColor: config.accentColor }]}
                        onPress={onDismiss}>
                        <Text style={styles.dismissButtonText}>Got it</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
};

/**
 * Convert retry_reason enum to human-friendly text
 */
function humanizeRetryReason(reason) {
    if (!reason) return null;
    switch (reason) {
        case 'await_contact_discovery':
            return "We're still searching for the right contact to notify about your report.";
        case 'rate_limit':
            return "We've hit a sending limit. Your notification will be sent shortly.";
        case 'temporary_failure':
            return "There was a temporary issue. We'll retry sending soon.";
        default:
            return `We're working on it (${reason.replace(/_/g, ' ')}).`;
    }
}

/**
 * Simple hex/named color to rgba
 */
function hexToRgba(color, alpha) {
    if (color.startsWith('rgba')) return color;
    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdropOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'box-none',
    },
    card: {
        width: MODAL_WIDTH,
        maxHeight: '80%',
        backgroundColor: '#1E1E2E',
        borderRadius: 24,
        paddingTop: 32,
        paddingBottom: 24,
        paddingHorizontal: 24,
        shadowColor: '#59E480',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(89, 228, 128, 0.2)',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    iconEmoji: {
        fontSize: 30,
    },
    title: {
        fontFamily: fontFamilies.Default,
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontFamily: fontFamilies.Default,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.65)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 8,
    },
    retryInfo: {
        fontFamily: fontFamilies.Default,
        fontSize: 12,
        color: '#F5A623',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 4,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginVertical: 16,
    },
    recipientsList: {
        maxHeight: 220,
    },
    recipientCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    recipientCardSpacing: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    recipientNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(89, 228, 128, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    recipientNumberText: {
        fontFamily: fontFamilies.Default,
        fontSize: 13,
        fontWeight: '700',
        color: '#59E480',
    },
    recipientContent: {
        flex: 1,
    },
    detailLabel: {
        fontFamily: fontFamilies.Default,
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.45)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 3,
    },
    detailValueEmail: {
        fontFamily: fontFamilies.Default,
        fontSize: 15,
        fontWeight: '500',
        color: '#59E480',
    },
    timestampText: {
        fontFamily: fontFamilies.Default,
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.35)',
        marginTop: 4,
    },
    pendingDots: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    pendingDotsText: {
        fontFamily: fontFamilies.Default,
        fontSize: 16,
        color: '#F5A623',
        letterSpacing: 4,
    },
    footerText: {
        fontFamily: fontFamilies.Default,
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        lineHeight: 18,
    },
    dismissButton: {
        marginTop: 16,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    dismissButtonText: {
        fontFamily: fontFamilies.Default,
        fontSize: 16,
        fontWeight: '700',
        color: '#1E1E2E',
    },
});

export default EmailNotificationModal;

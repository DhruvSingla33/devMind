import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/Button';
import { radius, spacing, typography } from '../../theme/theme';
import { useBreakpoint } from '../../theme/responsive';
import { notify } from '../../utils/alert';

// This screen is a fixed dark "promo" surface (like the marketing creative it
// mirrors) rather than following the light/dark app theme — so colors below
// are hardcoded, not pulled from theme/colors.js.
const PAGE_BG = '#0E0E11';
const CARD_BG = '#FFFFFF';
const ACCENT = '#E63946';

const FEATURES = [
  { icon: '📖', title: 'NCERT + PYQ', subtitle: 'Line to line', tint: '#FBE4E6', iconColor: '#D6273A' },
  { icon: '💬', title: 'AI Chatbot', subtitle: 'Doubt solving, notes, more', tint: '#E2ECFF', iconColor: '#3B6FE0' },
  { icon: '📄', title: 'Smart Notes', subtitle: 'Create & revise', tint: '#EDE6FB', iconColor: '#7C3AED' },
  { icon: '📗', title: 'Books', subtitle: 'NCERT, PYQ & more', tint: '#DFF5E7', iconColor: '#18875A' },
  { icon: '🎯', title: 'Daily Practice', subtitle: 'MCQs + PYQs', tint: '#FFF3D6', iconColor: '#B4700D' },
  { icon: '📊', title: 'Performance', subtitle: 'Track your progress', tint: '#DFF6F5', iconColor: '#0E9488' },
  { icon: '⭐', title: 'And Many More', subtitle: 'Tools, resources, features', tint: '#F1E9FF', iconColor: '#8B5CF6' },
];

const COUPON_CODE = 'MUKUL7';

export default function SubscriptionScreen() {
  const { isDesktop } = useBreakpoint();

  const handleUnlock = () => {
    notify('Aarambh+', 'Checkout is coming soon — stay tuned!');
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={[styles.layout, isDesktop && styles.layoutDesktop]}>
        <View style={[styles.left, isDesktop && styles.leftDesktop]}>
          <View style={styles.brandRow}>
            <LinearGradient
              colors={['#FF7A3D', ACCENT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mark}
            >
              <Text style={styles.markText}>A</Text>
            </LinearGradient>
            <View>
              <Text style={styles.brandTitle}>
                aarambh<Text style={{ color: ACCENT }}>+</Text>
              </Text>
              <Text style={styles.brandTagline}>NEET · LEARN · GROW</Text>
            </View>
          </View>

          <Text style={styles.badge}>🔥 Limited time offer</Text>

          <Text style={styles.headline}>Everything You Need for NEET.</Text>
          <Text style={styles.headlineBold}>
            Now at <Text style={styles.headlineAccent}>Even More</Text>{'\n'}Affordable Prices.
          </Text>

          <View style={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <View key={feature.title} style={styles.featureItem}>
                <View style={[styles.featureIconWrap, { backgroundColor: feature.tint }]}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.right, isDesktop && styles.rightDesktop]}>
          <Text style={styles.rightCaption}>Your NEET journey just got better!</Text>

          <View style={styles.pricingCard}>
            <View style={styles.pricingBanner}>
              <Text style={styles.pricingBannerText}>Aarambh+ Annual Subscription</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.strikePrice}>₹3,588</Text>
              <Text style={styles.onlyTag}>Only</Text>
            </View>
            <View style={styles.mainPriceRow}>
              <Text style={styles.mainPrice}>₹299</Text>
              <Text style={styles.perYear}>/year</Text>
            </View>

            <View style={styles.couponRow}>
              <View>
                <Text style={styles.couponLabel}>Use Code</Text>
                <View style={styles.couponChip}>
                  <Text style={styles.couponChipText}>{COUPON_CODE}</Text>
                </View>
              </View>
              <View style={styles.couponRightCol}>
                <Text style={styles.couponLabel}>Get Extra</Text>
                <Text style={styles.couponOff}>₹50 OFF</Text>
              </View>
            </View>

            <Text style={styles.monthlyNote}>
              Now Just <Text style={styles.monthlyPrice}>₹249</Text> /month
            </Text>

            <Button title="Unlock Aarambh+  →" onPress={handleUnlock} style={styles.cta} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  layout: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  layoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xxl,
  },
  left: {
    width: '100%',
  },
  leftDesktop: {
    flex: 1.2,
  },
  right: {
    width: '100%',
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  rightDesktop: {
    flex: 1,
    marginTop: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'lowercase',
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
    color: '#FF9A9A',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  headline: {
    marginTop: spacing.md,
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  headlineBold: {
    marginTop: spacing.xs,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headlineAccent: {
    color: ACCENT,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
    marginHorizontal: -spacing.sm,
  },
  featureItem: {
    width: '50%',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featureSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  rightCaption: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#FF9A9A',
    marginBottom: spacing.md,
  },
  pricingCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: CARD_BG,
    borderRadius: radius.lg,
    padding: spacing.lg,
    paddingTop: 0,
    overflow: 'hidden',
  },
  pricingBanner: {
    backgroundColor: ACCENT,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  pricingBannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  strikePrice: {
    fontSize: 18,
    color: '#8E8E98',
    textDecorationLine: 'line-through',
  },
  onlyTag: {
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    color: ACCENT,
  },
  mainPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  mainPrice: {
    fontSize: 44,
    fontWeight: '800',
    color: '#17171A',
  },
  perYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B5B66',
    marginBottom: 8,
    marginLeft: 4,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(230, 57, 70, 0.4)',
    backgroundColor: 'rgba(230, 57, 70, 0.06)',
  },
  couponRightCol: {
    alignItems: 'flex-end',
  },
  couponLabel: {
    fontSize: 11,
    color: '#8E8E98',
    fontWeight: '600',
  },
  couponChip: {
    marginTop: 4,
    backgroundColor: ACCENT,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  couponChipText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  couponOff: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
    color: ACCENT,
  },
  monthlyNote: {
    marginTop: spacing.md,
    fontSize: 13,
    color: '#5B5B66',
  },
  monthlyPrice: {
    fontWeight: '800',
    color: '#17171A',
  },
  cta: {
    marginTop: spacing.lg,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
  },
});

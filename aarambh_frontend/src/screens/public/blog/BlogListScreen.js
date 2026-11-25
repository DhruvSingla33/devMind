import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../components/ScreenContainer';
import Card from '../../../components/Card';
import { radius, spacing } from '../../../theme/theme';
import { useTheme, useThemedStyles } from '../../../theme/ThemeContext';
import { getAllBlogs } from './blogData';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BlogListScreen({ navigation }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const blogs = getAllBlogs();

  return (
    <ScreenContainer noPadding>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[typography.h1, styles.title]}>Aarambh</Text>
          <Text style={[typography.bodyMuted, styles.subtitle]}>
            New way of medical study.
          </Text>
        </View>

        {blogs.length === 0 ? (
          <Text style={[typography.bodyMuted, styles.empty]}>No posts yet. Check back soon.</Text>
        ) : (
          <View style={styles.list}>
            {blogs.map((b) => (
              <Card
                key={b.slug}
                style={styles.card}
                onPress={() => navigation.navigate('BlogPost', { slug: b.slug })}
              >
                {b.tags?.length ? (
                  <View style={styles.tags}>
                    {b.tags.map((t) => (
                      <View key={t} style={styles.tag}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <Text style={[typography.h3, styles.cardTitle]}>{b.title}</Text>
                <Text style={[typography.bodyMuted, styles.excerpt]} numberOfLines={3}>
                  {b.excerpt}
                </Text>

                <View style={styles.meta}>
                  {b.authorUrl ? (
                    <Text
                      style={[typography.caption, styles.metaText, styles.authorLink]}
                      onPress={() => Linking.openURL(b.authorUrl)}
                    >
                      {b.author}
                    </Text>
                  ) : (
                    <Text style={[typography.caption, styles.metaText]}>{b.author}</Text>
                  )}
                  <Text style={[typography.caption, styles.metaText]}>{formatDate(b.date)}</Text>
                </View>
                <Text style={styles.read}>Read →</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      marginBottom: spacing.xs,
    },
    subtitle: {},
    empty: {
      textAlign: 'center',
      marginTop: spacing.xl,
    },
    list: {
      gap: spacing.md,
    },
    card: {
      gap: spacing.sm,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    tag: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    cardTitle: {},
    excerpt: {},
    meta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    metaText: {},
    authorLink: {
      color: colors.primary,
      fontWeight: '600',
    },
    read: {
      fontWeight: '700',
      color: colors.primary,
    },
  });

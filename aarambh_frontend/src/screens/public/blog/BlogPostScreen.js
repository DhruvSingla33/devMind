import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../components/ScreenContainer';
import Button from '../../../components/Button';
import { spacing } from '../../../theme/theme';
import { useTheme, useThemedStyles } from '../../../theme/ThemeContext';
import { getBlogBySlug } from './blogData';
import BlogFrame from './BlogFrame';
import PublicHeader from './PublicHeader';

export default function BlogPostScreen({ route, navigation }) {
  const { slug } = route.params || {};
  const blog = getBlogBySlug(slug);
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);

  useEffect(() => {
    navigation.setOptions({ title: blog ? blog.title : 'Blog' });
  }, [blog, navigation]);

  if (!blog) {
    return (
      <ScreenContainer>
        <View style={styles.notFound}>
          <Text style={[typography.h2, styles.notFoundTitle]}>Post not found</Text>
          <Text style={[typography.bodyMuted, styles.notFoundText]}>
            The blog you’re looking for doesn’t exist or was moved.
          </Text>
          <Button title="Back to Blog" onPress={() => navigation.navigate('Blog')} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noPadding>
      <PublicHeader activeKey="blog" />
      <View style={styles.frameWrap}>
        <BlogFrame slug={blog.slug} title={blog.title} />
      </View>
    </ScreenContainer>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    frameWrap: {
      flex: 1,
      backgroundColor: '#fff',
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      padding: spacing.lg,
    },
    notFoundTitle: {
      textAlign: 'center',
    },
    notFoundText: {
      textAlign: 'center',
    },
  });

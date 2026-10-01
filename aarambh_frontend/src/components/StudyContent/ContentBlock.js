import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import DataTable from "./DataTable";
import { radius, spacing } from "../../theme/theme";
import { useThemedStyles } from "../../theme/ThemeContext";

const ContentImage = ({ item }) => {
  const styles = useThemedStyles(makeStyles);
  const [failed, setFailed] = useState(false);

  return (
    <View style={styles.figure}>
      {failed ? (
        <View style={[styles.image, styles.imageFallback]}>
          <Text style={styles.imageFallbackIcon}>{"🖼️"}</Text>

          <Text style={styles.imageFallbackText} numberOfLines={2}>
            {item.alt || "Image unavailable"}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: item.src }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={item.alt || ""}
          onError={() => setFailed(true)}
        />
      )}

      {item.caption ? (
        <Text style={styles.caption}>{item.caption}</Text>
      ) : null}
    </View>
  );
};

const ContentBlock = ({ item }) => {
  const styles = useThemedStyles(makeStyles);

  switch (item.type) {
    case "text":
      return <Text style={styles.text}>{item.value}</Text>;

    case "image":
      return <ContentImage item={item} />;

    case "table":
      return <DataTable columns={item.columns} rows={item.rows} />;

    case "list":
      return (
        <View style={styles.list}>
          {item.items.map((listItem, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>{"•"}</Text>

              <Text style={styles.listText}>{listItem}</Text>
            </View>
          ))}
        </View>
      );

    default:
      return null;
  }
};

const makeStyles = ({ colors }) => StyleSheet.create({
  text: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 15,
    lineHeight: 24
  },

  figure: {
    marginTop: spacing.md
  },

  image: {
    width: "100%",
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt
  },

  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg
  },

  imageFallbackIcon: {
    fontSize: 28
  },

  imageFallbackText: {
    marginTop: spacing.sm,
    color: colors.faint,
    fontSize: 12,
    textAlign: "center"
  },

  caption: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center"
  },

  list: {
    marginTop: spacing.md,
    gap: spacing.sm
  },

  listItem: {
    flexDirection: "row",
    gap: spacing.sm
  },

  bullet: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 24
  },

  listText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 24
  }
});

export default ContentBlock;

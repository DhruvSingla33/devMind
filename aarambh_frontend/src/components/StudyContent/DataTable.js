import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme/theme";

const COLUMN_WIDTH = 180;

const DataTable = ({ columns = [], rows = [] }) => {
  if (columns.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <View style={[styles.row, styles.headRow]}>
            {columns.map((column) => (
              <View key={column} style={styles.cell}>
                <Text style={styles.headText}>{column}</Text>
              </View>
            ))}
          </View>

          {rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.row,
                rowIndex % 2 === 1 && styles.rowAlt,
                rowIndex === rows.length - 1 && styles.lastRow
              ]}
            >
              {row.map((cell, cellIndex) => (
                <View key={cellIndex} style={styles.cell}>
                  <Text style={styles.cellText}>{cell}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },

  scrollContent: {
    flexGrow: 1
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },

  headRow: {
    backgroundColor: colors.surfaceAlt
  },

  rowAlt: {
    backgroundColor: "rgba(255, 255, 255, 0.02)"
  },

  lastRow: {
    borderBottomWidth: 0
  },

  cell: {
    width: COLUMN_WIDTH,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },

  headText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },

  cellText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  }
});

export default DataTable;

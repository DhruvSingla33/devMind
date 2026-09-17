import React from 'react';
import { FlatList, View } from 'react-native';
import { spacing } from '../theme/theme';
import { useColumns } from '../theme/responsive';

// Generalizes the flexBasis-percentage grid trick from TestResultScreen into a
// reusable multi-column FlatList. At numColumns === 1 (mobile/native) this
// renders identically to a plain single-column FlatList.
export default function Grid({
  data,
  renderItem,
  keyExtractor,
  columns,
  gap = spacing.md,
  contentContainerStyle,
  ListEmptyComponent,
  ...rest
}) {
  const numColumns = useColumns(columns);
  const halfGap = gap / 2;

  return (
    <FlatList
      key={numColumns}
      data={data}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      contentContainerStyle={contentContainerStyle}
      // The negative margin belongs on the row wrapper (only wraps actual
      // data rows), NOT on contentContainerStyle — that container also holds
      // ListHeaderComponent/ListFooterComponent, which have no matching
      // per-item padding to cancel out, so putting it there clips/shifts
      // whatever header content is passed in.
      columnWrapperStyle={numColumns > 1 ? { marginHorizontal: -halfGap, marginBottom: 0 } : undefined}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={(info) => (
        <View
          style={
            numColumns > 1
              ? { flexBasis: `${100 / numColumns}%`, maxWidth: `${100 / numColumns}%`, paddingHorizontal: halfGap }
              : undefined
          }
        >
          {renderItem(info)}
        </View>
      )}
      {...rest}
    />
  );
}

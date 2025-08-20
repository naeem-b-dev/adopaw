import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslationLoader } from '@/src/localization/hooks/useTranslationLoader';

const StatCards = ({ size, age, activity }) => {
  const theme = useTheme();
  const { t } = useTranslationLoader('petdetails');
  const palette = theme.colors.palette;

  // Extract numeric part from age string (e.g., "2 years" → 2)
  const numericAge = parseInt(age?.toString().match(/\d+/)?.[0] || '0', 10);

  return (
    <View style={styles.row}>
      <View style={[styles.card, { backgroundColor: palette.blue[100] }]}>
        <Text variant="labelSmall" style={[styles.label, { color: palette.blue[500] }]}>
          {t('size')}
        </Text>
        <Text variant="labelLarge" style={[styles.value, { color: palette.blue[600] }]}>
          {t(size?.toLowerCase())}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.blue[100] }]}>
        <Text variant="labelSmall" style={[styles.label, { color: palette.blue[500] }]}>
          {t('ageText')}
        </Text>
        <Text variant="labelLarge" style={[styles.value, { color: palette.blue[600] }]}>
          {t('ageValue_plural', { count: numericAge })}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.blue[100] }]}>
        <Text variant="labelSmall" style={[styles.label, { color: palette.blue[500] }]}>
          {t('activity')}
        </Text>
        <Text variant="labelLarge" style={[styles.value, { color: palette.blue[600] }]}>
          {t(activity?.toLowerCase())}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  label: {
    marginBottom: 4,
  },
  value: {
    fontWeight: '600',
  },
});

export default StatCards;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslationLoader } from '@/src/localization/hooks/useTranslationLoader';

const PetHeader = ({ name, colors, children }) => {
  const { t } = useTranslationLoader('petdetails');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="headlineLarge" style={styles.name}>
          {name}
        </Text>
        <View style={styles.colorRow}>
          {colors.map((color, index) => (
            <View
              key={index}
              style={[styles.colorCircle, { backgroundColor: color }]}
              accessibilityLabel={`${t('color')} ${index + 1}`}
            />
          ))}
        </View>
      </View>
      {children && <View style={{ marginTop: 4 }}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flexShrink: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default PetHeader;

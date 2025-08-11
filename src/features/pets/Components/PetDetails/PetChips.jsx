import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Text, useTheme } from 'react-native-paper';
import { useTranslationLoader } from '@/src/localization/hooks/useTranslationLoader';

const PetChips = ({ gender, breed, vaccinated, sterilized }) => {
  const theme = useTheme();
  const { t } = useTranslationLoader('petdetails');
  const { palette } = theme.colors;

  const healthText = [
    sterilized ? t('sterilized') : null,
    vaccinated ? t('vaccinated') : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.row}>
      {/* Breed */}
      <View style={styles.chip}>
        <MaterialCommunityIcons name="paw" size={12} color={palette.coral[500]} />
        <Text variant="labelSmall" style={{ color: palette.coral[500], marginLeft: 4 }}>
          {t(breed.toLowerCase())}
        </Text>
      </View>

      {/* Gender */}
      <View style={styles.chip}>
        <MaterialIcons name="female" size={12} color={palette.coral[500]} />
        <Text variant="labelSmall" style={{ color: palette.coral[500], marginLeft: 4 }}>
          {t(gender.toLowerCase())}
        </Text>
      </View>

      {/* Health */}
      {(vaccinated || sterilized) && (
        <View style={styles.chip}>
          <FontAwesome5 name="clinic-medical" size={11} color={palette.blue[500]} />
          <Text variant="labelSmall" style={{ color: palette.blue[500], marginLeft: 4 }}>
            {healthText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default PetChips;

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, useTheme } from 'react-native-paper';
import { useTranslationLoader } from '@/src/localization/hooks/useTranslationLoader';

const PostedByCard = ({ name, avatarUrl, postedAt }) => {
  const theme = useTheme();
  const { t } = useTranslationLoader('petdetails');

  const surfaceColor = theme.colors.surface;
  const neutral600 = theme.colors.palette.neutral[600];
  const blue600 = theme.colors.palette.blue[600];
  const blue200 = theme.colors.palette.blue[200];

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor }]}>
      <Image source={avatarUrl} style={styles.avatar} />

      <View style={styles.textContainer}>
        <Text variant="labelSmall" style={[styles.label, { color: neutral600 }]}>
          {t('postedBy')}
        </Text>
        <Text variant="titleMedium" style={styles.name}>
          {name}
        </Text>
        <Text variant="labelSmall" style={[styles.time, { color: neutral600 }]}>
          {postedAt}
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={[styles.iconButton, { backgroundColor: blue200 }]}>
          <Ionicons name="send" size={20} color={blue600} />
        </View>
        <View style={[styles.iconButton, { backgroundColor: blue200 }]}>
          <Ionicons name="call" size={20} color={blue600} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 16,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {},
  name: {
    marginTop: 2,
  },
  time: {
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostedByCard;

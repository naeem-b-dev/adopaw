import React from 'react';
import { Image, View, StyleSheet, Dimensions } from 'react-native';

export default function HeroImage({ imageUrl }) {
  const source = typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;

  return (
    <View style={styles.container}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Dimensions.get('window').width * 0.9,
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'lightgray',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

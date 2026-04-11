import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32) / 2 - 8;

const ShimmerBox = ({ width: w, height, style }) => {
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.35, { duration: 900 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.shimmer, { width: w, height }, style, animatedStyle]}
    />
  );
};

const LoadingShimmer = () => (
  <View style={styles.container}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <View key={i} style={styles.card}>
        <ShimmerBox width={CARD_WIDTH} height={CARD_WIDTH} style={styles.image} />
        <ShimmerBox width={CARD_WIDTH * 0.8} height={14} style={styles.text} />
        <ShimmerBox width={CARD_WIDTH * 0.5} height={10} style={styles.text} />
        <ShimmerBox width={CARD_WIDTH * 0.4} height={12} style={[styles.text, { marginTop: 8 }]} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: CARD_WIDTH + 16,
    margin: 8,
    padding: 8,
  },
  shimmer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
  },
  image: {
    borderRadius: 14,
  },
  text: {
    marginTop: 8,
    borderRadius: 4,
  },
});

export default LoadingShimmer;

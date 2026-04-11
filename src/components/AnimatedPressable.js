import React from 'react';
import { Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

const AnimatedPressable = ({ 
  children, 
  onPress, 
  style, 
  scaleTo = 0.96, 
  disabled = false,
  ...props 
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(scaleTo, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <AnimatedPressableBase
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
      disabled={disabled}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  );
};

export default AnimatedPressable;

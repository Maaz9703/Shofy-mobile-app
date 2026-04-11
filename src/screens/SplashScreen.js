import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const pulse = useRef(new Animated.Value(0.8)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0.5)).current;
  const ring2 = useRef(new Animated.Value(0.5)).current;
  const ring3 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Logo entrance
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse rings
    const ringAnim = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1.8,
              duration: 1600,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

    setTimeout(() => {
      ringAnim(ring1, 0);
      ringAnim(ring2, 400);
      ringAnim(ring3, 800);
    }, 400);

    // Heartbeat pulse on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.07, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const ringOpacity = (anim) => anim.interpolate({
    inputRange: [0.5, 1.8],
    outputRange: [0.4, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#09090b', '#09090b']}
        style={StyleSheet.absoluteFill}
      />

      {/* Pulse rings */}
      {[{ anim: ring1, size: 160 }, { anim: ring2, size: 200 }, { anim: ring3, size: 240 }].map((r, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              width: r.size,
              height: r.size,
              borderRadius: r.size / 2,
              transform: [{ scale: r.anim }],
              opacity: ringOpacity(r.anim),
            },
          ]}
        />
      ))}

      {/* Logo */}
      <Animated.View style={{
        opacity: logoOpacity,
        transform: [{ scale: Animated.multiply(logoScale, pulse) }],
        alignItems: 'center',
      }}>
        <LinearGradient
          colors={['#fafafa', '#fafafa']}
          style={styles.logo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoLetter}>S</Text>
        </LinearGradient>
      </Animated.View>

      {/* Text */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: 20 }}>
        <Text style={styles.appName}>Shofy</Text>
        <Text style={styles.tagline}>Premium Shopping Experience</Text>
      </Animated.View>

      {/* Bottom dots loader */}
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <BounceDot key={i} delay={i * 150} />
        ))}
      </View>
    </View>
  );
};

const BounceDot = ({ delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -8, duration: 350, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.delay(600),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ translateY: anim }] }]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(250,250,250,0.2)',
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fafafa',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoLetter: {
    color: '#09090b',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  appName: {
    color: '#f1f5f9',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  tagline: {
    color: '#475569',
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    bottom: 60,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fafafa',
    opacity: 0.8,
  },
});

export default SplashScreen;

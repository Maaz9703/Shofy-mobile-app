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
import { useSettings } from '../context/SettingsContext';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const { settings } = useSettings();
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
        colors={['#f8fafc', '#f8fafc']}
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
          colors={['#0f172a', '#0f172a']}
          style={styles.logo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoLetter}>{(settings.mobileAppName || 'Shofy')[0]}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Text */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: 20 }}>
        <Text style={styles.appName}>{settings.mobileAppName || 'Shofy'}</Text>
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
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoLetter: {
    color: '#f8fafc',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  appName: {
    color: '#0f172a',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  tagline: {
    color: '#94a3b8',
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
    backgroundColor: '#0f172a',
    opacity: 0.8,
  },
});

export default SplashScreen;

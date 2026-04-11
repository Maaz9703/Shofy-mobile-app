import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating orb animations
    const loopOrb = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 3000 + delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 3000 + delay, useNativeDriver: true }),
        ])
      ).start();
    };
    loopOrb(orb1, 0);
    loopOrb(orb2, 800);
  }, []);

  const orb1Translate = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const orb2Translate = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, 15] });

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Oops!', text2: 'Please fill all fields' });
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      Toast.show({ type: 'success', text1: 'Welcome back! 👋' });
    } catch (error) {
      let msg = 'Login failed. Please try again.';
      if (error.response?.data?.message) msg = error.response.data.message;
      else if (!error.response || error.message?.includes('Network') || error.message?.includes('connect'))
        msg = 'Cannot connect to server. Check your internet connection.';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: msg, visibilityTime: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#f8fafc', '#f8fafc']}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Orbs */}
      <Animated.View
        style={[styles.orb, styles.orb1, { transform: [{ translateY: orb1Translate }] }]}
      >
        <LinearGradient colors={['rgba(124,58,237,0.45)', 'transparent']} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }} />
      </Animated.View>
      <Animated.View
        style={[styles.orb, styles.orb2, { transform: [{ translateY: orb2Translate }] }]}
      >
        <LinearGradient colors={['rgba(6,182,212,0.3)', 'transparent']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
            <LinearGradient
              colors={['#0f172a', '#0f172a']}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoText}>S</Text>
            </LinearGradient>
          </Animated.View>

          {/* Heading */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Glass card */}
            <View style={styles.card}>
              {/* Email */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrap, focusedField === 'pass' && styles.inputWrapFocused]}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('pass')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(p => !p)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  onPress={handleLogin}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={loading ? ['#e2e8f0', '#e2e8f0'] : ['#0f172a', '#0f172a']}
                    style={styles.btn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#f8fafc" size="small" />
                    ) : (
                      <Text style={styles.btnText}>Sign In →</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Register link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                Don't have an account?{' '}
                <Text style={styles.registerBold}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },

  orb: { position: 'absolute', borderRadius: 999, overflow: 'hidden' },
  orb1: { width: width * 0.9, height: width * 0.9, top: -width * 0.3, left: -width * 0.2 },
  orb2: { width: width * 0.7, height: width * 0.7, bottom: -width * 0.1, right: -width * 0.2 },

  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logo: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  logoText: { color: '#f8fafc', fontSize: 34, fontWeight: '900', letterSpacing: -1 },

  title: {
    color: '#0f172a', fontSize: 30, fontWeight: '800',
    textAlign: 'center', letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: {
    color: '#64748b', fontSize: 15,
    textAlign: 'center', marginBottom: 32,
  },

  form: { gap: 0 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    gap: 18,
    marginBottom: 20,
  },

  fieldWrap: { gap: 7 },
  label: {
    color: '#64748b', fontSize: 11,
    fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  inputWrapFocused: {
    borderColor: '#0f172a',
    backgroundColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    letterSpacing: 0.1,
  },
  eyeBtn: { paddingHorizontal: 14 },

  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  btnText: { color: '#f8fafc', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  registerLink: { alignItems: 'center', paddingVertical: 8 },
  registerText: { color: '#64748b', fontSize: 14 },
  registerBold: { color: '#0f172a', fontWeight: '700' },
});

export default LoginScreen;

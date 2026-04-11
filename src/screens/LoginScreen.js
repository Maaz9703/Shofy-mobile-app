import React, { useState } from 'react';
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
  StatusBar,
} from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Layout 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import AnimatedPressable from '../components/AnimatedPressable';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Identity */}
          <Animated.View entering={FadeInDown.duration(600).springify()}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primary, ...theme.shadows.medium }]}>
              <Text style={styles.logoText}>{(settings.mobileAppName || 'Shofy')[0]}</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Enter your credentials to continue shopping</Text>
          </Animated.View>

          {/* Login Card */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={[styles.card, { backgroundColor: theme.card, ...theme.shadows.medium, borderColor: theme.border }]}
          >
            {/* Email Field */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
              <View style={[
                styles.inputWrap, 
                { borderColor: focusedField === 'email' ? theme.primary : theme.border },
                focusedField === 'email' && { backgroundColor: '#fcfcff' }
              ]}>
                <Mail size={20} color={focusedField === 'email' ? theme.primary : theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Passcode</Text>
              <View style={[
                styles.inputWrap, 
                { borderColor: focusedField === 'pass' ? theme.primary : theme.border },
                focusedField === 'pass' && { backgroundColor: '#fcfcff' }
              ]}>
                <Lock size={20} color={focusedField === 'pass' ? theme.primary : theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={theme.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <AnimatedPressable
              onPress={handleLogin}
              disabled={loading}
              style={{ marginTop: 10 }}
            >
              <View style={[styles.btn, { backgroundColor: loading ? theme.textSecondary : theme.primary }]}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.btnText}>Login to Account</Text>
                )}
              </View>
            </AnimatedPressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View 
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.footer}
          >
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              New to {settings.mobileAppName || 'Shofy'}?{' '}
              <Text 
                onPress={() => navigation.navigate('Register')}
                style={[styles.footerLink, { color: theme.primary }]}
              >
                Create Account
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  
  logoIcon: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 28,
  },
  logoText: { color: '#ffffff', fontSize: 32, fontWeight: '900' },
  
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
  
  card: { borderRadius: 32, padding: 32, borderWidth: 1 },
  
  fieldWrap: { marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    height: 60, borderRadius: 18, borderWidth: 1.5,
    paddingHorizontal: 16, gap: 12,
  },
  input: { flex: 1, fontSize: 16, fontWeight: '600' },
  
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: '700' },
  
  btn: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  
  footer: { marginTop: 32, alignItems: 'center' },
  footerText: { fontSize: 15, fontWeight: '500' },
  footerLink: { fontWeight: '800' },
});

export default LoginScreen;

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
  FadeInUp 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from '../components/AnimatedPressable';

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Oops!', text2: 'Please fill all fields' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      Toast.show({ type: 'success', text1: 'Welcome to Shofy! 🎉' });
    } catch (error) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, icon, placeholder, value, onChange, secure = false) => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[
        styles.inputWrap, 
        { borderColor: focusedField === label ? theme.primary : theme.border },
        focusedField === label && { backgroundColor: '#fcfcff' }
      ]}>
        <Ionicons name={icon} size={20} color={focusedField === label ? theme.primary : theme.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure && !showPassword}
          onFocus={() => setFocusedField(label)}
          onBlur={() => setFocusedField(null)}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(600).springify()}>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join our community and start your premium shopping experience</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={[styles.card, { backgroundColor: theme.card, ...theme.shadows.medium, borderColor: theme.border }]}
          >
            {renderInput('Full Name', 'person', 'John Doe', name, setName)}
            {renderInput('Email Address', 'mail', 'john@example.com', email, setEmail)}
            {renderInput('Password', 'lock-closed', '••••••••', password, setPassword, true)}
            {renderInput('Confirm Password', 'shield-checkmark', '••••••••', confirmPassword, setConfirmPassword, true)}

            <AnimatedPressable
              onPress={handleRegister}
              disabled={loading}
              style={{ marginTop: 10 }}
            >
              <View style={[styles.btn, { backgroundColor: loading ? theme.textSecondary : theme.primary }]}>
                {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>Join Now</Text>}
              </View>
            </AnimatedPressable>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.footer}
          >
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
              <Text 
                onPress={() => navigation.goBack()}
                style={[styles.footerLink, { color: theme.primary }]}
              >
                Sign In
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
  
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32, paddingRight: 40 },
  
  card: { borderRadius: 32, padding: 28, borderWidth: 1 },
  
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    height: 56, borderRadius: 16, borderWidth: 1.5,
    paddingHorizontal: 16, gap: 12,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '600' },
  
  btn: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  
  footer: { marginTop: 32, alignItems: 'center' },
  footerText: { fontSize: 15, fontWeight: '500' },
  footerLink: { fontWeight: '800' },
});

export default RegisterScreen;

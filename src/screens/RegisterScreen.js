import React, { useState, useRef, useEffect } from 'react';
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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
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
      Toast.show({ type: 'success', text1: 'Registration successful! 🎉' });
    } catch (error) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (placeholder, value, onChange, opts = {}) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{placeholder}</Text>
      <View style={[styles.inputWrap, focusedField === placeholder && styles.inputWrapFocused]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocusedField(placeholder)}
          onBlur={() => setFocusedField(null)}
          {...opts}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start shopping</Text>
          </Animated.View>

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {renderInput('Full Name', name, setName)}
            {renderInput('Email', email, setEmail, { keyboardType: 'email-address', autoCapitalize: 'none' })}
            {renderInput('Password (min 6 chars)', password, setPassword, { secureTextEntry: true })}
            {renderInput('Confirm Password', confirmPassword, setConfirmPassword, { secureTextEntry: true })}

            <TouchableOpacity onPress={handleRegister} disabled={loading}>
              <LinearGradient
                colors={loading ? ['#e2e8f0', '#e2e8f0'] : ['#0f172a', '#0f172a']}
                style={styles.btn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? <ActivityIndicator color="#f8fafc" /> : <Text style={styles.btnText}>Create Account →</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={{ color: '#0f172a', fontWeight: '700' }}>Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { color: '#0f172a', fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { color: '#64748b', fontSize: 15, marginBottom: 32 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0',
    padding: 24, gap: 16, marginBottom: 20,
  },
  fieldWrap: { gap: 7 },
  label: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  inputWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  inputWrapFocused: { borderColor: '#0f172a', backgroundColor: '#ffffff' },
  input: { color: '#0f172a', fontSize: 15, paddingHorizontal: 16, paddingVertical: 14 },
  btn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10,
  },
  btnText: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: '#64748b', fontSize: 14 },
});

export default RegisterScreen;

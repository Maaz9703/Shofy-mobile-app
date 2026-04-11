import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AddEditAddressScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { address } = route.params || {};
  const isEdit = !!address;

  const [fullName, setFullName] = useState(address?.fullName || '');
  const [addressLine, setAddressLine] = useState(address?.address || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [zipCode, setZipCode] = useState(address?.zipCode || '');
  const [phone, setPhone] = useState(address?.phone || '');
  const [isDefault, setIsDefault] = useState(address?.isDefault || false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSave = async () => {
    if (!fullName || !addressLine || !city || !state || !zipCode || !phone) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' }); return;
    }
    setLoading(true);
    try {
      const data = { fullName, address: addressLine, city, state, zipCode, phone, isDefault };
      if (isEdit) {
        await api.put(`/addresses/${address._id}`, data);
        Toast.show({ type: 'success', text1: 'Address updated ✅' });
      } else {
        await api.post('/addresses', data);
        Toast.show({ type: 'success', text1: 'Address added ✅' });
      }
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, value, onChange, opts = {}) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focusedField === label && styles.inputWrapFocused]}>
        <TextInput
          style={styles.input}
          placeholder={label}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocusedField(label)}
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

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Address' : 'New Address'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {renderInput('Full Name', fullName, setFullName)}
          {renderInput('Address', addressLine, setAddressLine)}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>{renderInput('City', city, setCity)}</View>
            <View style={{ flex: 1 }}>{renderInput('State', state, setState)}</View>
          </View>
          {renderInput('Zip Code', zipCode, setZipCode, { keyboardType: 'numeric' })}
          {renderInput('Phone', phone, setPhone, { keyboardType: 'phone-pad' })}

          <View style={styles.defaultRow}>
            <Text style={styles.defaultLabel}>Set as default address</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: '#cbd5e1', true: '#7c3aed' }}
              thumbColor="#0f172a"
            />
          </View>
        </View>

        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <LinearGradient
            colors={loading ? ['#e2e8f0', '#e2e8f0'] : ['#0f172a', '#0f172a']}
            style={styles.saveBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            {loading ? <ActivityIndicator color="#f8fafc" /> : (
              <Text style={styles.saveBtnText}>{isEdit ? 'Update' : 'Save'} Address</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    padding: 20, borderRadius: 20, marginBottom: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  label: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 7 },
  inputWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  inputWrapFocused: { borderColor: '#0f172a', backgroundColor: '#ffffff' },
  input: { color: '#0f172a', fontSize: 15, paddingHorizontal: 16, paddingVertical: 14 },
  defaultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  defaultLabel: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  saveBtn: { borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#f8fafc', fontSize: 18, fontWeight: '800' },
});

export default AddEditAddressScreen;

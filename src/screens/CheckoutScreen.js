import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CheckoutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { loadAddresses(); }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/addresses');
      const list = res.data.data || [];
      setAddresses(list);
      setSelectedAddress(list.find((a) => a.isDefault) || list[0]);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load addresses' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && addresses.length > 0) {
      Toast.show({ type: 'error', text1: 'Please select a shipping address' }); return;
    }
    if (addresses.length === 0) {
      Toast.show({ type: 'error', text1: 'Please add a shipping address first' });
      navigation.getParent()?.navigate('Profile', { screen: 'AddressManagement' }); return;
    }
    if (cartItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Cart is empty' }); return;
    }
    setPlacing(true);
    try {
      await api.post('/orders', {
        items: cartItems.map((item) => ({ product: item.product._id, quantity: item.quantity })),
        shippingAddress: {
          fullName: selectedAddress.fullName, address: selectedAddress.address,
          city: selectedAddress.city, state: selectedAddress.state,
          zipCode: selectedAddress.zipCode, phone: selectedAddress.phone,
        },
        paymentMethod,
      });
      setSuccess(true);
      clearCart();
    } catch (error) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Order failed' });
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />
        <View style={styles.successContainer}>
          <View style={styles.successIconBg}>
            <Ionicons name="checkmark-circle" size={80} color="#34d399" />
          </View>
          <Text style={styles.successTitle}>Order Placed! 🎉</Text>
          <Text style={styles.successSubtitle}>
            {paymentMethod === 'COD' ? 'Cash on Delivery — Pay when you receive' : 'Payment processing'}
          </Text>
          <TouchableOpacity onPress={() => { setSuccess(false); navigation.navigate('OrdersMain'); }}>
            <LinearGradient colors={['#0f172a', '#0f172a']} style={styles.successBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.successBtnText}>View Orders</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#0f172a" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Checkout</Text>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : addresses.length === 0 ? (
            <TouchableOpacity style={styles.addAddrBtn} onPress={() => navigation.navigate('ProfileMain')}>
              <Ionicons name="add" size={24} color="#0f172a" />
              <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600' }}>Add Address</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity
                key={addr._id}
                style={[
                  styles.addressCard,
                  selectedAddress?._id === addr._id && styles.addressCardSelected,
                ]}
                onPress={() => setSelectedAddress(addr)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Ionicons
                    name={selectedAddress?._id === addr._id ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedAddress?._id === addr._id ? '#0f172a' : '#94a3b8'}
                  />
                  <Text style={styles.addrName}>{addr.fullName}</Text>
                </View>
                <Text style={styles.addrText}>{addr.address}, {addr.city}, {addr.state} {addr.zipCode}</Text>
                <Text style={styles.addrPhone}>{addr.phone}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {[
            { key: 'COD', icon: 'cash', label: 'Cash on Delivery' },
            { key: 'ONLINE', icon: 'card', label: 'Online Payment (Coming Soon)' },
          ].map((pm) => (
            <TouchableOpacity
              key={pm.key}
              style={[styles.paymentOption, paymentMethod === pm.key && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod(pm.key)}
            >
              <Ionicons name={pm.icon} size={22} color={paymentMethod === pm.key ? '#0f172a' : '#64748b'} />
              <Text style={[styles.paymentText, paymentMethod === pm.key && { color: '#e2e8f0' }]}>{pm.label}</Text>
              {paymentMethod === pm.key && <Ionicons name="checkmark-circle" size={22} color="#0f172a" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>PKR {cartTotal.toLocaleString()}</Text>
          </View>
          {paymentMethod === 'COD' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping:</Text>
              <Text style={styles.summaryValue}>PKR 100</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              PKR {(cartTotal + (paymentMethod === 'COD' ? 100 : 0)).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Place Order */}
        <TouchableOpacity onPress={handlePlaceOrder} disabled={placing || addresses.length === 0}>
          <LinearGradient
            colors={placing || addresses.length === 0 ? ['#e2e8f0', '#e2e8f0'] : ['#0f172a', '#0f172a']}
            style={styles.placeBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            {placing ? <ActivityIndicator color="#f8fafc" /> : <Text style={styles.placeBtnText}>Place Order</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  backBtn: {
    position: 'absolute', left: 20, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center',
  },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
  section: {
    padding: 18, borderRadius: 18, marginBottom: 16,
    backgroundColor: '#ffffff',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14, color: '#0f172a' },
  addressCard: {
    padding: 14, borderRadius: 14, marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  addressCardSelected: { backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#0f172a' },
  addrName: { fontSize: 15, fontWeight: '600', color: '#e2e8f0' },
  addrText: { fontSize: 13, color: '#64748b', marginLeft: 28 },
  addrPhone: { fontSize: 12, color: '#64748b', marginLeft: 28, marginTop: 2 },
  addAddrBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 20, borderWidth: 1.5, borderRadius: 14,
    borderColor: '#0f172a', borderStyle: 'dashed',
  },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14, marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  paymentOptionSelected: { backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#0f172a' },
  paymentText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#64748b' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 15, color: '#64748b' },
  summaryValue: { fontSize: 15, color: '#e2e8f0' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  totalLabel: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  placeBtn: { borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center' },
  placeBtnText: { color: '#f8fafc', fontSize: 18, fontWeight: '800' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successIconBg: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#0d3320',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  successSubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 32 },
  successBtn: { paddingHorizontal: 36, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  successBtnText: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;

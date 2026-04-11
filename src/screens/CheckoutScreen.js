import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Check, ArrowLeft, MapPin, Circle, CircleCheck, CheckSquare, Square, Wallet, CreditCard, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();
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
      Toast.show({ type: 'info', text1: 'Add a shipping address to continue' });
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successWrapper}>
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={[styles.successBadge, { backgroundColor: '#10b981' }]}>
              <Check size={60} color="#ffffff" strokeWidth={3} />
            </View>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={[styles.successTitle, { color: theme.text }]}>Order Placed Successfully!</Text>
            <Text style={[styles.successSub, { color: theme.textSecondary }]}>
              Your premium items are being prepared for delivery.
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.successActions}>
            <AnimatedPressable onPress={() => { setSuccess(false); navigation.navigate('Orders'); }} style={{ width: '100%' }}>
              <View style={[styles.primaryBtn, { backgroundColor: theme.primary }]}>
                <Text style={styles.primaryBtnText}>Check Order Status</Text>
              </View>
            </AnimatedPressable>
            <TouchableOpacity onPress={() => { setSuccess(false); navigation.navigate('Home'); }} style={{ marginTop: 20 }}>
              <Text style={[styles.secondaryActionText, { color: theme.textSecondary }]}>Return to Shopping</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          style={[styles.headerBtn, { backgroundColor: theme.card, ...theme.shadows.small }]} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Shipping Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'AddressManagement' })}>
            <Text style={[styles.addText, { color: theme.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginVertical: 20 }} />
        ) : addresses.length === 0 ? (
          <TouchableOpacity 
            style={[styles.emptyAddr, { borderColor: theme.border, backgroundColor: theme.card }]} 
            onPress={() => navigation.navigate('Profile', { screen: 'AddressManagement' })}
          >
            <MapPin size={32} color={theme.textSecondary} />
            <Text style={[styles.emptyAddrText, { color: theme.textSecondary }]}>Add a shipping address</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View layout={Layout.springify()}>
            {addresses.map((addr) => (
              <TouchableOpacity
                key={addr._id}
                onPress={() => setSelectedAddress(addr)}
                style={[
                  styles.optionCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  selectedAddress?._id === addr._id && { borderColor: theme.primary, borderWidth: 2 }
                ]}
              >
                <View style={styles.optionHeader}>
                  {selectedAddress?._id === addr._id ? (
                    <CircleCheck size={22} color={theme.primary} fill={theme.primary + '20'} />
                  ) : (
                    <Circle size={22} color={theme.textSecondary} />
                  )}
                  <Text style={[styles.optionTitle, { color: theme.text }]}>{addr.fullName}</Text>
                </View>
                <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                  {addr.address}, {addr.city}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Payment Section */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24, marginBottom: 16 }]}>Payment Mode</Text>
        {[
          { key: 'COD', icon: 'cash', label: 'Cash on Delivery' },
          { key: 'ONLINE', icon: 'card', label: 'Stripe / Credit Card', disabled: true },
        ].map((pm) => (
          <TouchableOpacity
            key={pm.key}
            disabled={pm.disabled}
            onPress={() => setPaymentMethod(pm.key)}
            style={[
              styles.optionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              paymentMethod === pm.key && { borderColor: theme.primary, borderWidth: 2 },
              pm.disabled && { opacity: 0.5 }
            ]}
          >
            <View style={styles.optionHeader}>
              {paymentMethod === pm.key ? (
                <CheckSquare size={22} color={theme.primary} />
              ) : (
                <Square size={22} color={theme.textSecondary} />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>{pm.label}</Text>
                {pm.disabled && <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textSecondary }}>COMING SOON</Text>}
              </View>
              {pm.key === 'COD' ? <Wallet size={22} color={theme.textSecondary} /> : <CreditCard size={22} color={theme.textSecondary} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Order Summary */}
        <View style={[styles.summaryBox, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border }]}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.sumLabel, { color: theme.textSecondary }]}>Items Subtotal</Text>
            <Text style={[styles.sumVal, { color: theme.text }]}>PKR {cartTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.sumLabel, { color: theme.textSecondary }]}>Logistic Charges</Text>
            <Text style={[styles.sumVal, { color: '#10b981' }]}>Free Delivery</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.sumTotalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Grant Total</Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>PKR {cartTotal.toLocaleString()}</Text>
          </View>
        </View>

        <AnimatedPressable 
          onPress={handlePlaceOrder} 
          disabled={placing || addresses.length === 0}
          style={styles.placeOrderBtnWrapper}
        >
          <View style={[
            styles.primaryBtn, 
            { backgroundColor: theme.primary },
            (placing || addresses.length === 0) && { backgroundColor: theme.textSecondary }
          ]}>
            {placing ? <ActivityIndicator color="#ffffff" /> : (
              <>
                <Text style={styles.primaryBtnText}>Confirm Order</Text>
                <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </>
            )}
          </View>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 20,
  },
  headerBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  scroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  addText: { fontSize: 14, fontWeight: '700' },
  emptyAddr: {
    height: 120, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  emptyAddrText: { fontSize: 15, fontWeight: '600' },
  optionCard: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  optionHeader: { flexDirection: 'row', alignItems: 'center' },
  optionTitle: { fontSize: 16, fontWeight: '800', marginLeft: 12 },
  optionSub: { fontSize: 13, fontWeight: '500', marginTop: 6, marginLeft: 34 },
  summaryBox: { padding: 24, borderRadius: 24, marginTop: 32, borderWidth: 1 },
  summaryTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sumLabel: { fontSize: 14, fontWeight: '600' },
  sumVal: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1.5, width: '100%', marginVertical: 16, opacity: 0.1 },
  sumTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 18, fontWeight: '900' },
  totalValue: { fontSize: 22, fontWeight: '900' },
  placeOrderBtnWrapper: { marginTop: 32 },
  primaryBtn: {
    height: 56, borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  
  successWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successBadge: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  successTitle: { fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 40, marginBottom: 16 },
  successSub: { fontSize: 16, fontWeight: '500', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  successActions: { width: '100%', alignItems: 'center' },
  secondaryActionText: { fontSize: 15, fontWeight: '700' },
});

export default CheckoutScreen;


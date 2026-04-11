import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify().damping(12)}
      style={styles.card}
    >
      <Image
        source={{ uri: item.product.image || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.product.title}
          </Text>
          <TouchableOpacity onPress={() => removeFromCart(item.product._id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>
          PKR {item.product.price?.toLocaleString(undefined, { minimumFractionDigits: 0 })}
        </Text>
        <View style={styles.actions}>
          <View style={styles.quantityRow}>
            <TouchableOpacity onPress={() => updateQuantity(item.product._id, item.quantity - 1)} style={styles.qtyBtn}>
              <Ionicons name="remove" size={16} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.product._id, item.quantity + 1)} style={styles.qtyBtn}>
              <Ionicons name="add" size={16} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  if (cartCount === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />
        <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="cart" size={60} color="#0f172a" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Explore our products and start shopping.</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Home')}>
            <LinearGradient colors={['#0f172a', '#0f172a']} style={styles.shopBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
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

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.headerSub}>{cartCount} items</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.product._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom || 24 }]}>
        <LinearGradient colors={['#f8fafc', '#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>PKR {cartTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Checkout')}>
            <LinearGradient colors={['#0f172a', '#0f172a']} style={styles.checkoutBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.checkoutBtnText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color="#f8fafc" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a', letterSpacing: 0.5 },
  headerSub: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  list: { padding: 16, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  image: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#f1f5f9' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  productTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#e2e8f0', marginRight: 8, lineHeight: 20 },
  price: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  quantityRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ede9fe',
    borderRadius: 10,
  },
  qtyBtn: { padding: 6, opacity: 0.8 },
  qtyText: { fontSize: 13, fontWeight: '700', color: '#0f172a', minWidth: 20, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 16, height: 56,
  },
  checkoutBtnText: { color: '#f8fafc', fontSize: 17, fontWeight: '800' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIconBg: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', paddingHorizontal: 20 },
  shopBtn: {
    marginTop: 32, paddingHorizontal: 36, height: 50,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  shopBtnText: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
});

export default CartScreen;

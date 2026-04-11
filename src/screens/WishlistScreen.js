import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const WishlistScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setProducts(res.data.data || []);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const removeFromWishlist = async (product) => {
    try {
      await api.delete(`/wishlist/${product._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      Toast.show({ type: 'success', text1: 'Removed from wishlist' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to remove' });
    }
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(14)} style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
        style={styles.cardContent}
      >
        <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.price}>PKR {item.price?.toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => { addToCart(item); Toast.show({ type: 'success', text1: 'Added to cart! 🛒' }); }}>
          <LinearGradient colors={['#7c3aed', '#0f172a']} style={styles.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="cart" size={18} color="#0f172a" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeFromWishlist(item)}>
          <Ionicons name="heart" size={24} color="#f87171" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="heart" size={50} color="#0f172a" />
              </View>
              <Text style={styles.emptyTitle}>No items in wishlist</Text>
              <Text style={styles.emptySubtitle}>Items you save will show up here</Text>
            </View>
          }
        />
      )}
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
    backgroundColor: '#ffffff',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 16, marginBottom: 12,
    backgroundColor: '#ffffff',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  image: { width: 80, height: 80, borderRadius: 12, marginRight: 12, backgroundColor: '#f1f5f9' },
  info: { flex: 1 },
  productTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6, color: '#e2e8f0' },
  price: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIconBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#ede9fe',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  emptySubtitle: { fontSize: 14, color: '#64748b', marginTop: 6 },
});

export default WishlistScreen;

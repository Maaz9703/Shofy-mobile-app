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
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { X, ShoppingBag, ArrowLeft, Heart } from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';

const WishlistScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
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
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()} 
      layout={Layout.springify()}
      style={[styles.card, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border }]}
    >
      <View style={styles.imageContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ProductDetails', { product: item })}
          style={StyleSheet.absoluteFill}
        >
          <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.image} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.removeBadge, { backgroundColor: '#ffffff', ...theme.shadows.small, zIndex: 10 }]} 
          onPress={() => removeFromWishlist(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={theme.error} />
        </TouchableOpacity>

        {item.discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: theme.error }]}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.primary }]}>PKR {item.price?.toLocaleString()}</Text>
          <AnimatedPressable onPress={() => { addToCart(item); Toast.show({ type: 'success', text1: 'Added to cart! 🛒' }); }}>
            <View style={[styles.addBtn, { backgroundColor: theme.primary }]}>
              <ShoppingBag size={18} color="#ffffff" />
            </View>
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: theme.card, ...theme.shadows.small }]} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Wishlist</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIconBg, { backgroundColor: theme.card, ...theme.shadows.medium }]}>
                <Heart size={60} color={theme.primary} fill={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Wishlist is empty</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Save items you like to view them later.
              </Text>
              <AnimatedPressable onPress={() => navigation.navigate('Home')} style={styles.shopBtnContainer}>
                <View style={[styles.shopBtn, { backgroundColor: theme.primary }]}>
                  <Text style={styles.shopBtnText}>Browse Products</Text>
                </View>
              </AnimatedPressable>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 20,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16 },
  columnWrapper: { justifyContent: 'space-between' },
  card: {
    width: '48%',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  image: { width: '100%', height: '100%' },
  removeBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  discountText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  info: { padding: 8, paddingTop: 12 },
  productTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '800' },
  addBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyIconBg: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  shopBtnContainer: { marginTop: 32, width: '100%' },
  shopBtn: {
    height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  shopBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

export default WishlistScreen;


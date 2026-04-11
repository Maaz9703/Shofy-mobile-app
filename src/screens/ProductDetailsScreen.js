import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { getQuantityDiscount } from '../utils/price';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProductDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { product: initialProduct } = route.params || {};
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (initialProduct?._id && !initialProduct.description) {
      api.get(`/products/${initialProduct._id}`).then((res) => setProduct(res.data.data)).finally(() => setLoading(false));
    } else if (!initialProduct) {
      setLoading(false);
    }
  }, [initialProduct?._id]);

  const handleAddToCart = async () => {
    if (!product || product.stock < quantity) {
      Toast.show({ type: 'error', text1: 'Oops!', text2: 'Insufficient stock available.' });
      return;
    }
    setAddingToCart(true);
    try {
      addToCart(product, quantity);
      Toast.show({ type: 'success', text1: 'Added to cart! 🛍️' });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: '#09090b' }]}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  const { unitPrice, totalPrice, originalPrice, hasDiscount, discountPercent, tiers } = getQuantityDiscount(product, quantity);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#09090b', '#09090b']} style={StyleSheet.absoluteFill} />

      {/* Back button */}
      <Animated.View entering={FadeInUp.delay(100)} style={[styles.backBtnWrap, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* Full Image */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/400' }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(9,9,11,0)', '#09090b']}
            style={styles.imageBottomGradient}
          />
        </View>

        {/* Info Area */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.content}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={styles.categoryPill}>
              <Ionicons name="pricetag" size={13} color="#a855f7" />
              <Text style={styles.categoryPillText}>{product.category}</Text>
            </View>
            <View style={[styles.stockPill, { backgroundColor: product.stock > 0 ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)' }]}>
              <Text style={{ color: product.stock > 0 ? '#34d399' : '#f87171', fontSize: 11, fontWeight: '700' }}>
                {product.stock > 0 ? 'IN STOCK' : 'OUT_OF_STOCK'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{product.title}</Text>

          {/* Price Block */}
          <View style={styles.priceBlock}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
              <Text style={styles.price}>PKR {unitPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>PKR {originalPrice.toLocaleString()}</Text>
              )}
            </View>
            {hasDiscount && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{discountPercent}% OFF TODAY</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.sectionHeader}>About Product</Text>
          <View style={styles.glassBox}>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Quantity Controls */}
          <Text style={styles.sectionHeader}>Quantity</Text>
          <View style={styles.quantityWrap}>
            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>
              <Ionicons name="remove" size={24} color="#f8fafc" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(q => Math.min(product.stock, q + 1))} style={styles.qtyBtn}>
              <Ionicons name="add" size={24} color="#f8fafc" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 24 }]}>
        <LinearGradient
          colors={['rgba(9,9,11,0)', 'rgba(9,9,11,0.95)', '#09090b']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bottomBarContent}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>Total Price</Text>
            <Text style={{ color: '#f8fafc', fontSize: 22, fontWeight: '800' }}>
              PKR {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <TouchableOpacity
            style={{ flex: 1.2 }}
            onPress={handleAddToCart}
            disabled={product.stock < 1 || addingToCart}
          >
            <LinearGradient
              colors={product.stock < 1 ? ['#3f3f46', '#3f3f46'] : ['#fafafa', '#fafafa']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.addBtn}
            >
              {addingToCart ? (
                <ActivityIndicator color="#09090b" />
              ) : (
                <>
                  <Ionicons name="cart" size={20} color="#09090b" />
                  <Text style={styles.addBtnText}>Add To Cart</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtnWrap: {
    position: 'absolute', left: 20, zIndex: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#27272a',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#2a2a3e',
  },
  imageWrap: {
    width: screenWidth,
    height: screenHeight * 0.5,
    backgroundColor: '#000',
  },
  image: { width: '100%', height: '100%' },
  imageBottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#3f3f46',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  categoryPillText: { color: '#fafafa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  stockPill: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  title: {
    color: '#f8fafc', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, lineHeight: 34, marginBottom: 16,
  },
  priceBlock: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: '#3f3f46', marginBottom: 24,
  },
  price: { color: '#fafafa', fontSize: 26, fontWeight: '800' },
  originalPrice: { color: '#64748b', fontSize: 16, textDecorationLine: 'line-through', marginBottom: 4 },
  saveBadge: {
    backgroundColor: '#3f3f46',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  saveBadgeText: { color: '#fafafa', fontSize: 10, fontWeight: '800' },
  sectionHeader: {
    color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 12,
  },
  glassBox: {
    backgroundColor: '#18181b',
    borderRadius: 16, padding: 16, marginBottom: 24,
  },
  descriptionText: { color: '#cbd5e1', fontSize: 14, lineHeight: 24 },
  quantityWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#27272a',
    borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  qtyBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#3f3f46', justifyContent: 'center', alignItems: 'center' },
  qtyText: { color: '#f8fafc', fontSize: 20, fontWeight: '800' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    zIndex: 100,
  },
  bottomBarContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 54, borderRadius: 16,
  },
  addBtnText: { color: '#09090b', fontSize: 16, fontWeight: '700' },
});

export default ProductDetailsScreen;

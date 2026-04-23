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
  TextInput,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { ArrowLeft, Tag, Minus, Plus, ArrowRight } from 'lucide-react-native';
import { getQuantityDiscount } from '../utils/price';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

import AnimatedPressable from '../components/AnimatedPressable';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { product: initialProduct } = route.params || {};
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [note, setNote] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (initialProduct?._id) {
      api.get(`/products/${initialProduct._id}`).then((res) => {
        const p = res.data.data;
        setProduct(p);
        if (p?.colors?.length > 0) setSelectedColor(p.colors[0]);
      }).finally(() => setLoading(false));
    } else if (!initialProduct) {
      setLoading(false);
    }
  }, [initialProduct?._id]);

  const handleAddToCart = async () => {
    if (!product || product.stock < quantity) {
      Toast.show({ type: 'error', text1: 'Oops!', text2: 'Insufficient stock available.' });
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      Toast.show({ type: 'error', text1: 'Wait!', text2: 'Please select a color.' });
      return;
    }
    setAddingToCart(true);
    try {
      addToCart(product, quantity, selectedColor, note);
      Toast.show({ type: 'success', text1: 'Added to cart! 🛍️' });
      setNote('');
      // Navigate to Cart after adding to mimic "Checkout Now" behavior
      navigation.navigate('Cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const { unitPrice, totalPrice, originalPrice, hasDiscount, discountPercent } = getQuantityDiscount(product, quantity);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Back button */}
      <Animated.View entering={FadeInUp.delay(100)} style={[styles.backBtnWrap, { top: insets.top + 10 }]}>
        <AnimatedPressable style={[styles.backBtn, { ...theme.shadows.small, backgroundColor: theme.card }]} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.text} />
        </AnimatedPressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Full Image */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.imageWrap}>
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/400' }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Info Area */}
        <Animated.View entering={FadeInDown.delay(300).springify().damping(18)} style={[styles.content, { backgroundColor: theme.background }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={[styles.categoryPill, { backgroundColor: theme.primary + '15' }]}>
              <Tag size={13} color={theme.primary} />
              <Text style={[styles.categoryPillText, { color: theme.primary }]}>{product.category}</Text>
            </View>
            <View style={[styles.stockPill, { backgroundColor: product.stock > 0 ? '#dcfce7' : '#fee2e2' }]}>
              <Text style={{ color: product.stock > 0 ? '#16a34a' : '#dc2626', fontSize: 11, fontWeight: '900' }}>
                {product.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{product.title}</Text>

          {/* Price Block */}
          <View style={[styles.priceBlock, { borderColor: theme.border }]}>
            <View style={{ flexDirection: 'column', gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                <Text style={[styles.price, { color: theme.text }]}>PKR {unitPrice.toLocaleString()}</Text>
                {hasDiscount && (
                  <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>PKR {originalPrice.toLocaleString()}</Text>
                )}
              </View>
              {product.isWholesale && (
                <View style={{ backgroundColor: theme.success + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' }}>
                  <Text style={{ color: theme.success, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>WHOLESALE RATE APPLIED</Text>
                </View>
              )}
            </View>
            {hasDiscount && (
              <View style={[styles.saveBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.saveBadgeText, { color: '#ffffff' }]}>{discountPercent}% OFF</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={[styles.sectionHeader, { color: theme.text }]}>Description</Text>
          <View style={[styles.glassBox, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border, borderWidth: 1 }]}>
            <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{product.description}</Text>
          </View>

          {/* Details */}
          {product.details && (
            <Animated.View entering={FadeInDown.delay(350)}>
              <Text style={[styles.sectionHeader, { color: theme.text }]}>Additional Details</Text>
              <View style={[styles.glassBox, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border, borderWidth: 1 }]}>
                <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{product.details}</Text>
              </View>
            </Animated.View>
          )}

          {/* Custom Note */}
          <Animated.View entering={FadeInDown.delay(380)}>
            <Text style={[styles.sectionHeader, { color: theme.text }]}>Order Detail / Note (Optional)</Text>
            <View style={[styles.glassBox, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border, borderWidth: 1, padding: 12 }]}>
              <TextInput
                placeholder="e.g. Size, gift note, special instruction..."
                placeholderTextColor={theme.textSecondary + '80'}
                value={note}
                onChangeText={setNote}
                multiline
                style={{ color: theme.text, fontSize: 14, minHeight: 60, textAlignVertical: 'top' }}
              />
            </View>
          </Animated.View>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400)}>
              <Text style={[styles.sectionHeader, { color: theme.text }]}>
                Select Color: <Text style={{ color: theme.primary }}>{selectedColor}</Text>
              </Text>
              <View style={[styles.glassBox, { backgroundColor: theme.card, flexDirection: 'row', gap: 15, flexWrap: 'wrap', ...theme.shadows.small, borderColor: theme.border, borderWidth: 1 }]}>
                {product.colors.map((color, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color, borderColor: theme.border, borderWidth: 1 },
                      selectedColor === color && { borderColor: theme.primary, borderWidth: 3, transform: [{ scale: 1.1 }] }
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Quantity Selection */}
          <Text style={[styles.sectionHeader, { color: theme.text }]}>Quantity Selection</Text>
          <View style={[styles.quantityWrap, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border, borderWidth: 1 }]}>
            <AnimatedPressable onPress={() => setQuantity(q => Math.max(1, q - 1))} style={[styles.qtyBtn, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}>
              <Minus size={24} color={theme.text} />
            </AnimatedPressable>
            <Text style={[styles.qtyText, { color: theme.text }]}>{quantity}</Text>
            <AnimatedPressable onPress={() => setQuantity(q => Math.min(product.stock, q + 1))} style={[styles.qtyBtn, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}>
              <Plus size={24} color={theme.text} />
            </AnimatedPressable>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Bar */}
      <Animated.View entering={FadeInUp.delay(500)} style={[styles.bottomBar, { paddingBottom: insets.bottom || 24, paddingHorizontal: 20 }]}>
        <View style={[styles.bottomBarContent, { backgroundColor: theme.card, borderRadius: 24, ...theme.shadows.large, borderColor: theme.border, borderWidth: 1 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Total</Text>
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900' }}>
              PKR {totalPrice.toLocaleString()}
            </Text>
          </View>
          <AnimatedPressable
            style={{ flex: 1.4 }}
            onPress={handleAddToCart}
            disabled={product.stock < 1 || addingToCart}
          >
              <View
                style={[
                  styles.addBtn,
                  { backgroundColor: product.stock < 1 ? theme.textSecondary : theme.primary }
                ]}
              >
                {addingToCart ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.addBtnText}>Checkout Now</Text>
                    <View style={styles.btnIconBox}>
                      <ArrowRight size={18} color={theme.primary} />
                    </View>
                  </View>
                )}
              </View>

          </AnimatedPressable>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtnWrap: {
    position: 'absolute', left: 20, zIndex: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  imageWrap: {
    width: screenWidth,
    height: screenHeight * 0.45,
    backgroundColor: '#ffffff',
  },
  image: { width: '100%', height: '100%' },
  content: {
    paddingHorizontal: 24,
    marginTop: -30,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 32,
  },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12,
  },
  categoryPillText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  stockPill: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
  },
  title: {
    fontSize: 28, fontWeight: '900', letterSpacing: -0.8, lineHeight: 36, marginBottom: 20,
  },
  priceBlock: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1,
    marginBottom: 28,
  },
  price: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  originalPrice: { fontSize: 16, textDecorationLine: 'line-through', marginBottom: 4 },
  saveBadge: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  saveBadgeText: { fontSize: 11, fontWeight: '900' },
  sectionHeader: {
    fontSize: 18, fontWeight: '900', marginBottom: 16, letterSpacing: -0.5,
  },
  glassBox: {
    borderRadius: 24, padding: 20, marginBottom: 28,
  },
  descriptionText: { fontSize: 15, lineHeight: 26, fontWeight: '500' },
  quantityWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 24,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  qtyBtn: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 24, fontWeight: '900' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    zIndex: 100,
  },
  bottomBarContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
  },
  addBtn: {
    paddingHorizontal: 12,
    height: 60, borderRadius: 20,
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 8,
  },
  btnIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});


export default ProductDetailsScreen;


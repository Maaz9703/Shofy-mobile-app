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
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInRight, FadeInDown, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Heart } from 'lucide-react-native';
import AnimatedPressable from '../components/AnimatedPressable';
import { getQuantityDiscount } from '../utils/price';

const { width: screenWidth } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  const renderItem = ({ item, index }) => {
    // Calculate total quantity of this product across all flavors/colors
    const totalProductQty = cartItems.filter(ci => ci.product._id === item.product._id).reduce((sum, ci) => sum + ci.quantity, 0);
    const { unitPrice } = getQuantityDiscount(item.product, totalProductQty);

    return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify().damping(15)}
      layout={Layout.springify()}
      style={[styles.card, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border }]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.product.image || 'https://via.placeholder.com/150' }}
          style={styles.image}
          resizeMode="cover"
        />
        {item.product.discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: theme.error }]}>
            <Text style={styles.discountText}>-{item.product.discount}%</Text>
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <View style={styles.infoTop}>
          <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={1}>
            {item.product.title}
          </Text>
          <TouchableOpacity 
            onPress={() => removeFromCart(item.product._id, item.color, item.flavor, item.note)}
            style={styles.removeBtn}
          >
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          {item.color && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color, borderAdaptiveColor: theme.border, borderWidth: 1 }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary }}>{item.color}</Text>
            </View>
          )}
          {item.flavor && (
            <View style={{ backgroundColor: theme.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary }} numberOfLines={1}>{item.flavor}</Text>
            </View>
          )}
          {item.note && (
            <View style={{ backgroundColor: theme.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: theme.primary }}>
              <Text style={{ fontSize: 11, color: theme.textSecondary }} numberOfLines={1}>Note: {item.note}</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.price, { color: theme.primary }]}>
          PKR {unitPrice.toLocaleString()}
        </Text>
        
        <View style={styles.actions}>
          <View style={[styles.quantityRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <TouchableOpacity 
              onPress={() => updateQuantity(item.product._id, item.color, item.flavor, item.note, item.quantity - 1)} 
              style={styles.qtyBtn}
              disabled={item.quantity <= 1}
            >
              <Minus size={18} color={item.quantity <= 1 ? theme.textSecondary : theme.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: theme.text }]}>{item.quantity}</Text>
            <TouchableOpacity 
              onPress={() => updateQuantity(item.product._id, item.color, item.flavor, item.note, item.quantity + 1)} 
              style={styles.qtyBtn}
            >
              <Plus size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.itemSubtotal, { color: theme.textSecondary }]}>
            Total: <Text style={{ color: theme.text, fontWeight: '700' }}>PKR {(unitPrice * item.quantity).toLocaleString()}</Text>
          </Text>
        </View>
      </View>
    </Animated.View>
  );
  };

  if (cartCount === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
          <Animated.View entering={FadeInDown.springify()} style={[styles.emptyIconBg, { backgroundColor: theme.card, ...theme.shadows.medium }]}>
            <ShoppingBag size={70} color={theme.primary} />
          </Animated.View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Looks like you haven't added anything to your cart yet.
          </Text>
          <AnimatedPressable onPress={() => navigation.navigate('Home')} style={styles.shopBtnContainer}>
            <View style={[styles.shopBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
              <ArrowRight size={18} color="#ffffff" />
            </View>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Cart</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{cartCount} premium items</Text>
        </View>
        <AnimatedPressable onPress={() => navigation.navigate('Wishlist')}>
          <View style={[styles.headerBtn, { backgroundColor: theme.card, ...theme.shadows.small }]}>
            <Heart size={22} color={theme.error} fill={theme.error} />
          </View>
        </AnimatedPressable>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => `${item.product._id}-${item.color}-${item.flavor}-${item.note}`}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: 160 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={styles.footerContent}>
          <View style={styles.totalRow}>
            <View>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Amount</Text>
              <Text style={[styles.itemsTotal, { color: theme.textSecondary }]}>{cartCount} Items included</Text>
            </View>
            <Text style={[styles.totalValue, { color: theme.text }]}>
              PKR {cartTotal.toLocaleString()}
            </Text>
          </View>
          
          <AnimatedPressable onPress={() => navigation.navigate('Checkout')}>
            <View style={[styles.checkoutBtn, { backgroundColor: theme.primary, ...theme.shadows.medium }]}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <View style={styles.checkoutIconBtn}>
                <ArrowRight size={20} color={theme.primary} />
              </View>
            </View>
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingBottom: 20 
  },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  headerSub: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  headerBtn: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  list: { paddingHorizontal: 20, paddingTop: 10 },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
  },
  imageContainer: { position: 'relative' },
  image: { width: 100, height: 110, borderRadius: 18, backgroundColor: '#f1f5f9' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  discountText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  info: { flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 4 },
  infoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productTitle: { fontSize: 17, fontWeight: '800', flex: 1, marginRight: 8 },
  removeBtn: { padding: 4 },
  price: { fontSize: 19, fontWeight: '900', marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  quantityRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  qtyBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 15, fontWeight: '800', minWidth: 28, textAlign: 'center' },
  itemSubtotal: { fontSize: 12, fontWeight: '500' },
  
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20,
  },
  footerContent: { paddingHorizontal: 24, paddingTop: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  totalLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  itemsTotal: { fontSize: 12, marginTop: 2 },
  totalValue: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    borderRadius: 20, height: 64, paddingLeft: 24, paddingRight: 8,
  },
  checkoutBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  checkoutIconBtn: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 'auto',
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIconBg: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  emptyTitle: { fontSize: 26, fontWeight: '900', marginBottom: 12 },
  emptySubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  shopBtnContainer: { marginTop: 40, width: '100%' },
  shopBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    height: 60, borderRadius: 18,
  },
  shopBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
});

export default CartScreen;


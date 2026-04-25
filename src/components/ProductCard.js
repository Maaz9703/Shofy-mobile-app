import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getQuantityDiscount } from '../utils/price';
import { LinearGradient } from 'expo-linear-gradient';

import AnimatedPressable from './AnimatedPressable';

const ProductCard = ({ product, index, onPress, onWishlist, isInWishlist }) => {
  const { theme } = useTheme();
  const { unitPrice, hasDiscount, discountPercent } = getQuantityDiscount(product, 1);

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 100, 500)).springify().damping(15).stiffness(120)}
      style={[
        styles.card, 
        { 
          backgroundColor: theme.card,
          borderRadius: theme.radius.lg,
          ...theme.shadows.medium 
        }
      ]}
    >
      <AnimatedPressable 
        onPress={onPress} 
        style={{ flex: 1 }}
        scaleTo={0.97}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/300' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.info}>
          <Text style={[styles.category, { color: theme.textSecondary }]}>
            {product.category}
          </Text>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {product.title}
          </Text>
          
          {product.flavors && product.flavors.length > 0 && (
            <Text style={{ fontSize: 9, fontWeight: '800', color: theme.primary, marginTop: 4, letterSpacing: 0.5 }}>
              {product.flavors.length} FLAVOR{product.flavors.length > 1 ? 'S' : ''} AVAILABLE
            </Text>
          )}
          
          <View style={{ flex: 1, minHeight: 8 }} />
          
          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.price, { color: theme.primary }]}>
                  PKR {unitPrice.toLocaleString()}
                </Text>
                {product.isWholesale && (
                  <View style={{ backgroundColor: theme.success + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontSize: 8, color: theme.success, fontWeight: '900' }}>WHOLESALE</Text>
                  </View>
                )}
              </View>
              {hasDiscount && (
                <Text style={{ fontSize: 10, color: theme.success, fontWeight: '700' }}>
                  {discountPercent}% OFF
                </Text>
              )}
            </View>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: product.stock > 0 ? '#dcfce7' : '#fee2e2' }
              ]}
            >
              <Text style={[styles.stockText, { color: product.stock > 0 ? '#16a34a' : '#dc2626' }]}>
                {product.stock > 0 ? 'STOCK' : 'OUT'}
              </Text>
            </View>
          </View>
        </View>
      </AnimatedPressable>

      <TouchableOpacity
        style={styles.wishlistBtn}
        onPress={() => onWishlist?.(product)}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <View style={[styles.wishlistIconBg, { backgroundColor: '#ffffff', ...theme.shadows.small }]}>
          <Heart
            size={20}
            color={isInWishlist ? theme.error : theme.textSecondary}
            fill={isInWishlist ? theme.error : 'transparent'}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#f8fafc',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  wishlistIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 14,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 18,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 9,
    fontWeight: '900',
  },
});

export default memo(ProductCard);

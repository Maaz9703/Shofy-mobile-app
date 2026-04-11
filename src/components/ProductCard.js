import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getQuantityDiscount } from '../utils/price';
import { LinearGradient } from 'expo-linear-gradient';

const ProductCard = ({ product, index, onPress, onWishlist, isInWishlist }) => {
  const { theme } = useTheme();
  const { unitPrice, hasDiscount, discountPercent } = getQuantityDiscount(product, 1);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify().damping(12)}
      style={[styles.card, { backgroundColor: '#ffffff' }]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1 }}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/300' }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Subtle gradient overlay at bottom of image for blending */}
          <LinearGradient
            colors={['transparent', 'rgba(10,10,20,0.8)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 }}
          />
          
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => onWishlist?.(product)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[styles.wishlistIconBg, { backgroundColor: '#ede9fe' }]}>
              <Ionicons
                name={isInWishlist ? 'heart' : 'heart'}
                size={18}
                color={isInWishlist ? '#ef4444' : '#0f172a'}
              />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={[styles.category, { color: theme.textSecondary }]}>
            {product.category}
          </Text>
          
          <View style={{ flex: 1 }} />
          
          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.price, { color: theme.primaryDark }]}>
                PKR {unitPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </Text>
              {hasDiscount && (
                <Text style={{ fontSize: 10, color: theme.success, marginTop: 2 }}>{discountPercent}% off</Text>
              )}
            </View>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: product.stock > 0 ? '#0d3320' : '#3b1515' }
              ]}
            >
              <Text style={{ fontSize: 9, fontWeight: '700', color: product.stock > 0 ? theme.success : theme.error }}>
                {product.stock > 0 ? 'STOCK' : 'OUT'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  wishlistIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 12,
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  category: {
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
});

export default ProductCard;

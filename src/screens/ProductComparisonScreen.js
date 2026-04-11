import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';

const { width: screenWidth } = Dimensions.get('window');

const ProductComparisonScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const [comparisonProducts, setComparisonProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.products) {
      setComparisonProducts(route.params.products);
    } else {
      fetchDefaultProducts();
    }
  }, []);

  const fetchDefaultProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      const products = res.data.data || [];
      setComparisonProducts(products.slice(0, 2));
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = (productId) => {
    setComparisonProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const addProduct = async () => {
    navigation.navigate('AdvancedSearch', {
      onSelect: (product) => {
        if (comparisonProducts.length < 4 && !comparisonProducts.find((p) => p._id === product._id)) {
          setComparisonProducts((prev) => [...prev, product]);
        } else {
          Toast.show({ type: 'error', text1: 'Maximum 4 products can be compared' });
        }
      },
    });
  };

  const comparisonFields = [
    { key: 'title', label: 'Model Name' },
    { key: 'price', label: 'Best Price', format: (val) => `PKR ${val?.toLocaleString()}` },
    { key: 'category', label: 'Specifications' },
    { key: 'stock', label: 'Availability' },
    { key: 'description', label: 'Overview', format: (val) => val?.substring(0, 100) + '...' },
  ];

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <TouchableOpacity 
        style={[styles.headerBtn, { backgroundColor: theme.card, ...theme.shadows.small }]} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Comparison</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{comparisonProducts.length} Premium items</Text>
      </View>
      {comparisonProducts.length < 4 ? (
        <TouchableOpacity style={[styles.addBtnHeader, { backgroundColor: theme.primary }]} onPress={addProduct}>
          <Ionicons name="add" size={22} color="#ffffff" />
        </TouchableOpacity>
      ) : <View style={{ width: 44 }} />}
    </View>
  );

  if (comparisonProducts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="dark-content" />
        {renderHeader()}
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconBg, { backgroundColor: theme.card, ...theme.shadows.medium }]}>
            <Ionicons name="git-compare" size={60} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Select Products</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Add products to compare their specs and pricing side-by-side.</Text>
          <AnimatedPressable onPress={addProduct} style={styles.emptyButtonContainer}>
            <View style={[styles.emptyButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.emptyButtonText}>Add Products</Text>
            </View>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
          <View>
            <View style={[styles.row, { backgroundColor: 'transparent' }]}>
              <View style={[styles.featureColumn, { backgroundColor: theme.background }]}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>Features</Text>
              </View>
              {comparisonProducts.map((product, index) => (
                <Animated.View 
                  key={product._id} 
                  entering={FadeInRight.delay(index * 100).springify()}
                  style={[styles.productColumn, { backgroundColor: theme.card, borderColor: theme.border, ...theme.shadows.small }]}
                >
                  <TouchableOpacity style={styles.removeIcon} onPress={() => removeProduct(product._id)}>
                    <Ionicons name="close-circle" size={22} color={theme.error} />
                  </TouchableOpacity>
                  <Image source={{ uri: product.image || 'https://via.placeholder.com/150' }} style={styles.productImage} />
                  <Text style={[styles.colProductTitle, { color: theme.text }]} numberOfLines={2}>{product.title}</Text>
                  <AnimatedPressable onPress={() => navigation.navigate('ProductDetails', { product })} style={{ marginTop: 'auto' }}>
                    <View style={[styles.viewBtn, { borderColor: theme.primary }]}>
                      <Text style={[styles.viewBtnText, { color: theme.primary }]}>Details</Text>
                    </View>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </View>

            {comparisonFields.map((field, fieldIdx) => (
              <View key={field.key} style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <View style={[styles.featureColumn, { backgroundColor: theme.background }]}>
                  <Text style={[styles.featureLabel, { color: theme.textSecondary }]}>{field.label}</Text>
                </View>
                {comparisonProducts.map((product) => (
                  <View key={`${product._id}-${field.key}`} style={[styles.valueColumn, { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
                    <Text style={[styles.valueText, { color: theme.text }]}>
                      {field.format ? field.format(product[field.key]) : product[field.key] || 'N/A'}
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.row}>
              <View style={[styles.featureColumn, { backgroundColor: theme.background }]}>
                <Text style={[styles.featureLabel, { color: theme.textSecondary }]}>Add to Cart</Text>
              </View>
              {comparisonProducts.map((product) => (
                <View key={`cart-${product._id}`} style={[styles.valueColumn, { borderLeftWidth: 1, borderLeftColor: theme.border, paddingTop: 20 }]}>
                  <TouchableOpacity 
                    style={[styles.cartBtn, { backgroundColor: theme.primary }]}
                    onPress={() => { addToCart(product); Toast.show({ type: 'success', text1: 'Added to cart! 🛒' }); }}
                  >
                    <Ionicons name="cart" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  addBtnHeader: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  row: { flexDirection: 'row' },
  featureColumn: { width: 120, padding: 20, justifyContent: 'center' },
  featureTitle: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  featureLabel: { fontSize: 13, fontWeight: '700' },
  
  productColumn: {
    width: 180, marginHorizontal: 10, marginVertical: 20,
    borderRadius: 24, padding: 16, alignItems: 'center',
    borderWidth: 1,
  },
  removeIcon: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  productImage: { width: 100, height: 100, borderRadius: 16, marginBottom: 12, backgroundColor: '#f1f5f9' },
  colProductTitle: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 16, height: 40 },
  viewBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  viewBtnText: { fontSize: 12, fontWeight: '800' },
  
  valueColumn: { width: 200, padding: 20, justifyContent: 'center' },
  valueText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  cartBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconBg: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 26, fontWeight: '900', marginBottom: 12 },
  emptySub: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  emptyButtonContainer: { marginTop: 40, width: '100%' },
  emptyButton: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
});

export default ProductComparisonScreen;


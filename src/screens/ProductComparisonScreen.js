import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';

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
      // If no products passed, fetch some default products
      fetchDefaultProducts();
    }
  }, []);

  const fetchDefaultProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      const products = res.data.data || [];
      setComparisonProducts(products.slice(0, 2)); // Default to first 2 products
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
    // Navigate to search to add more products
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
    { key: 'title', label: 'Product Name' },
    { key: 'price', label: 'Price', format: (val) => `PKR ${val?.toFixed(2)}` },
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Stock Available' },
    { key: 'description', label: 'Description', format: (val) => val?.substring(0, 100) + '...' },
  ];

  if (comparisonProducts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.card, paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Compare Products</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="git-compare" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No products to compare
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={addProduct}
          >
            <Ionicons name="add" size={20} color="#0f172a" />
            <Text style={styles.addButtonText}>Add Products to Compare</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Compare ({comparisonProducts.length})
        </Text>
        {comparisonProducts.length < 4 && (
          <TouchableOpacity
            style={styles.addHeaderButton}
            onPress={addProduct}
          >
            <Ionicons name="add" size={24} color={theme.primary} />
          </TouchableOpacity>
        )}
        {comparisonProducts.length === 4 && <View style={{ width: 40 }} />}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View>
          {/* Header Row */}
          <View style={[styles.row, { backgroundColor: theme.card }]}>
            <View style={[styles.labelColumn, { backgroundColor: theme.background }]}>
              <Text style={[styles.labelText, { color: theme.textSecondary }]}>Features</Text>
            </View>
            {comparisonProducts.map((product, index) => (
              <View key={product._id} style={styles.productColumn}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeProduct(product._id)}
                >
                  <Ionicons name="close-circle" size={20} color={theme.error} />
                </TouchableOpacity>
                <Image
                  source={{ uri: product.image || 'https://via.placeholder.com/100' }}
                  style={styles.productImage}
                />
                <Text
                  style={[styles.productTitle, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {product.title}
                </Text>
                <TouchableOpacity
                  style={[styles.viewButton, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('ProductDetails', { product })}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Comparison Rows */}
          {comparisonFields.map((field) => (
            <View
              key={field.key}
              style={[styles.row, { backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border }]}
            >
              <View style={[styles.labelColumn, { backgroundColor: theme.background }]}>
                <Text style={[styles.labelText, { color: theme.text }]}>{field.label}</Text>
              </View>
              {comparisonProducts.map((product) => (
                <View key={product._id} style={styles.productColumn}>
                  <Text style={[styles.valueText, { color: theme.text }]}>
                    {field.format
                      ? field.format(product[field.key])
                      : product[field.key] || 'N/A'}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {/* Action Row */}
          <View
            style={[styles.row, { backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border }]}
          >
            <View style={[styles.labelColumn, { backgroundColor: theme.background }]}>
              <Text style={[styles.labelText, { color: theme.text }]}>Actions</Text>
            </View>
            {comparisonProducts.map((product) => (
              <View key={product._id} style={styles.productColumn}>
                <TouchableOpacity
                  style={[styles.addToCartButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    addToCart(product, 1);
                    Toast.show({ type: 'success', text1: 'Added to cart' });
                  }}
                >
                  <Ionicons name="cart" size={16} color="#0f172a" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  addHeaderButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    minHeight: 80,
  },
  labelColumn: {
    width: 120,
    padding: 12,
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productColumn: {
    width: 180,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#334155',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  viewButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  valueText: {
    fontSize: 14,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addToCartText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductComparisonScreen;

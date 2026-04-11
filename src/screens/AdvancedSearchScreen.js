import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import api from '../config/api';
import { ArrowLeft, Search, XCircle, SlidersHorizontal, X } from 'lucide-react-native';

const AdvancedSearchScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { onSelect } = route.params || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() || selectedCategory) {
      const timer = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setProducts([]);
    }
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/list');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error('Fetch categories:', error);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const res = await api.get('/products', { params });
      let filteredProducts = res.data.data || [];

      // Apply price filter
      if (priceRange.min) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= parseFloat(priceRange.min)
        );
      }
      if (priceRange.max) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price <= parseFloat(priceRange.max)
        );
      }

      // Apply sorting
      filteredProducts.sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'name':
            return a.title.localeCompare(b.title);
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('relevance');
    setProducts([]);
  };

  const hasActiveFilters = searchQuery || selectedCategory || priceRange.min || priceRange.max;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search products..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <XCircle size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal
            size={24} 
            color={showFilters ? theme.primary : theme.text} 
          />
          {hasActiveFilters && (
            <View style={[styles.filterBadge, { backgroundColor: theme.primary }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <ScrollView
          style={[styles.filtersPanel, { backgroundColor: theme.card }]}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: !selectedCategory ? theme.primary : theme.background,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setSelectedCategory('')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: !selectedCategory ? '#0f172a' : theme.text },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedCategory === cat ? theme.primary : theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: selectedCategory === cat ? '#0f172a' : theme.text },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Price Range */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Price Range</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={[
                  styles.priceInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Min"
                placeholderTextColor={theme.textSecondary}
                value={priceRange.min}
                onChangeText={(text) => setPriceRange({ ...priceRange, min: text })}
                keyboardType="numeric"
              />
              <Text style={[styles.priceSeparator, { color: theme.textSecondary }]}>-</Text>
              <TextInput
                style={[
                  styles.priceInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Max"
                placeholderTextColor={theme.textSecondary}
                value={priceRange.max}
                onChangeText={(text) => setPriceRange({ ...priceRange, max: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Sort */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Sort By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'name', label: 'Name A-Z' },
                { value: 'newest', label: 'Newest' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: sortBy === option.value ? theme.primary : theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setSortBy(option.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: sortBy === option.value ? '#0f172a' : theme.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: theme.error }]}
              onPress={clearFilters}
            >
              <X size={16} color="#0f172a" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Results */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : products.length === 0 && (searchQuery || selectedCategory) ? (
          <View style={styles.emptyState}>
            <Search size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No products found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : products.length > 0 ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            <FlatList
              data={products}
              numColumns={2}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => {
                    if (onSelect) {
                      onSelect(item);
                      navigation.goBack();
                    } else {
                      navigation.navigate('ProductDetails', { product: item });
                    }
                  }}
                  onAddToCart={() => addToCart(item, 1)}
                />
              )}
              contentContainerStyle={styles.productsList}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={10}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Search size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Start searching for products
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filtersPanel: {
    maxHeight: 200,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e3a',
  },
  filterSection: {
    marginRight: 24,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    width: 80,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  priceSeparator: {
    fontSize: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  clearButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  productsList: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
});

export default AdvancedSearchScreen;

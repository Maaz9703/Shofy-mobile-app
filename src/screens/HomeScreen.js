import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Modal,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import LoadingShimmer from '../components/LoadingShimmer';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COLUMNS = 2;

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState('');

  // Scroll animations for header
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async (searchText = '', categoryFilter = '') => {
    try {
      const params = {};
      const trimmedSearch = searchText && searchText.trim() ? searchText.trim() : '';
      const trimmedCategory = categoryFilter && categoryFilter.trim() ? categoryFilter.trim() : '';
      
      if (trimmedSearch) {
        const exactCategoryMatch = categories.find(
          (cat) => cat.toLowerCase() === trimmedSearch.toLowerCase()
        );
        if (exactCategoryMatch) {
          params.category = exactCategoryMatch;
        } else {
          params.search = trimmedSearch;
          if (trimmedCategory) params.category = trimmedCategory;
        }
      } else if (trimmedCategory) {
        params.category = trimmedCategory;
      }
      
      const res = await api.get('/products', { params });
      setProducts(res.data.data || []);
    } catch (error) {
      console.error('Fetch products:', error);
      setProducts([]);
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/list');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error('Fetch categories:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      const ids = new Set((res.data.data || []).map((p) => p._id));
      setWishlistIds(ids);
    } catch {
      setWishlistIds(new Set());
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchWishlist()]);
      await fetchProducts('', '');
      setLoading(false);
    };
    initialLoad();
  }, []);

  useEffect(() => {
    if (!loading) fetchProducts(searchDebounce, category);
  }, [searchDebounce, category, fetchProducts, loading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(searchDebounce, category), fetchCategories(), fetchWishlist()]);
    setRefreshing(false);
  }, [searchDebounce, category, fetchProducts]);

  const toggleWishlist = async (product) => {
    const isIn = wishlistIds.has(product._id);
    try {
      if (isIn) {
        await api.delete(`/wishlist/${product._id}`);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(product._id);
          return next;
        });
      } else {
        await api.post('/wishlist', { productId: product._id });
        setWishlistIds((prev) => new Set([...prev, product._id]));
      }
    } catch (error) {
      console.error('Wishlist toggle:', error);
    }
  };

  const getCategorySuggestions = () => {
    if (!search || !search.trim() || categories.length === 0) return [];
    const searchLower = search.trim().toLowerCase();
    return categories.filter((cat) => cat.toLowerCase().includes(searchLower)).slice(0, 5);
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    setShowCategorySuggestions(!!(text && text.trim()));
  };

  const handleCategorySuggestionPress = (cat) => {
    setCategory(cat);
    setSearch(cat);
    setShowCategorySuggestions(false);
  };

  const renderProduct = useCallback(({ item, index }) => (
    <ProductCard
      product={item}
      index={index}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
      onWishlist={toggleWishlist}
      isInWishlist={wishlistIds.has(item._id)}
    />
  ), [navigation, toggleWishlist, wishlistIds]);

  const keyExtractor = useCallback((item) => item._id, []);

  // Header background opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 0.95],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#09090b', '#09090b']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Header */}
      <View style={[styles.headerWrap, { paddingTop: insets.top + 8 }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={['rgba(9,9,11,0.95)', 'rgba(9,9,11,0.9)', 'rgba(9,9,11,0)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        
        <View style={styles.headerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.logoText, { opacity: 0.95 }]}>
              <Text style={{ color: '#7c3aed' }}>S</Text>
              <Text style={{ color: '#fafafa' }}>h</Text>
              <Text style={{ color: '#06b6d4' }}>o</Text>
              <Text style={{ color: '#38bdf8' }}>f</Text>
              <Text style={{ color: '#f8fafc' }}>y</Text>
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'Notifications' })}>
              <View style={styles.bellBtn}>
                <Ionicons name="notifications" size={22} color="#f8fafc" />
                <View style={styles.bellBadge} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <View style={[styles.searchBox, { backgroundColor: '#27272a' }]}>
                <Ionicons name="search" size={18} color="#94a3b8" />
                <TextInput
                  style={[styles.searchInput, { color: '#f8fafc' }]}
                  placeholder="Search products..."
                  placeholderTextColor="#64748b"
                  value={search}
                  onChangeText={handleSearchChange}
                  onFocus={() => { if (search) setShowCategorySuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                  returnKeyType="search"
                />
                {search ? (
                  <TouchableOpacity onPress={() => { setSearch(''); setCategory(''); setShowCategorySuggestions(false); }}>
                    <Ionicons name="close-circle" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                ) : null}
              </View>
              {showCategorySuggestions && getCategorySuggestions().length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: '#1e293b', borderColor: '#2d3a4e' }]}>
                  {getCategorySuggestions().map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.suggestionItem, { borderBottomColor: '#2d3a4e' }]}
                      onPress={() => handleCategorySuggestionPress(cat)}
                    >
                      <Ionicons name="pricetag" size={16} color="#fafafa" />
                      <Text style={[styles.suggestionText, { color: '#f8fafc' }]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: category ? theme.primary : '#27272a' }
              ]}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Ionicons name="filter" size={20} color={category ? '#fff' : '#f8fafc'} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: '#1f1245' }]}
              onPress={() => navigation.navigate('Home', { screen: 'AdvancedSearch' })}
            >
              <Ionicons name="options" size={20} color="#fafafa" />
            </TouchableOpacity>
          </View>

          {categories.length > 0 && category && (
            <View style={styles.selectedCategoryContainer}>
              <View style={[styles.selectedCategoryChip, { backgroundColor: '#1f1245' }]}>
                <Text style={{ color: '#fafafa', fontSize: 13, fontWeight: '600' }}>{category}</Text>
                <TouchableOpacity onPress={() => setCategory('')}>
                  <Ionicons name="close-circle" size={16} color="#fafafa" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={{ paddingTop: insets.top + 130 }}>
          <LoadingShimmer />
        </View>
      ) : (
        <Animated.FlatList
          data={products}
          numColumns={COLUMNS}
          keyExtractor={keyExtractor}
          renderItem={renderProduct}
          contentContainerStyle={[styles.list, { paddingTop: insets.top + 130 }]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={10}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fafafa" colors={['#fafafa']} progressViewOffset={insets.top + 130} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search" size={64} color="#475569" style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: '#94a3b8' }]}>
                {search || category ? 'No products found matching your search' : 'No products found'}
              </Text>
              {(search || category) && (
                <TouchableOpacity style={styles.clearFilterBtn} onPress={() => { setSearch(''); setCategory(''); }}>
                  <Text style={{ color: '#fafafa', fontWeight: 'bold' }}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} transparent animationType="slide" onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#0f172a' }]}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#f8fafc' }}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity
                style={[styles.modalCategoryItem, !category ? styles.modalCategoryActive : null]}
                onPress={() => { setCategory(''); setCategoryModalVisible(false); }}
              >
                <Text style={{ fontSize: 16, color: !category ? '#fff' : '#cbd5e1', fontWeight: '500' }}>All Categories</Text>
                {!category && <Ionicons name="checkmark" size={20} color="#fff" />}
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalCategoryItem, cat === category ? styles.modalCategoryActive : null]}
                  onPress={() => { setCategory(cat); setCategoryModalVisible(false); }}
                >
                  <Text style={{ fontSize: 16, color: cat === category ? '#fff' : '#cbd5e1', fontWeight: '500' }}>{cat}</Text>
                  {cat === category && <Ionicons name="checkmark" size={20} color="#fff" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  headerWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#27272a',
    alignItems: 'center', justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5, borderColor: '#0f172a',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  searchContainer: { flex: 1, position: 'relative' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  iconBtn: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  suggestionsContainer: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    marginTop: 4, borderRadius: 14, // Removed border
    maxHeight: 200, zIndex: 1000,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 10, // Removed borderBottom
  },
  suggestionText: { fontSize: 14, fontWeight: '500' },
  selectedCategoryContainer: { marginTop: 12, flexDirection: 'row' },
  selectedCategoryChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 99,
  },
  list: { paddingHorizontal: 8, paddingBottom: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyText: { fontSize: 15, textAlign: 'center', marginBottom: 20 },
  clearFilterBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#1f1245',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 50, maxHeight: '75%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, // Removed borderBottom
  },
  modalScroll: { padding: 16 },
  modalCategoryItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 14, marginBottom: 8,
    backgroundColor: '#27272a',
  },
  modalCategoryActive: {
    backgroundColor: '#1f1245', // Highlight color instead of border
  },
});

export default HomeScreen;

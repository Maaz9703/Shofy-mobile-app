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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';
import LoadingShimmer from '../components/LoadingShimmer';
import api from '../config/api';
import { Bell, Search, SlidersHorizontal, X, CheckCircle2, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COLUMNS = 2;

import { useAuth } from '../context/AuthContext';
import AnimatedPressable from '../components/AnimatedPressable';
import { FadeInDown } from 'react-native-reanimated';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { settings } = useSettings();
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
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offerModalVisible, setOfferModalVisible] = useState(false);

  // Scroll animations for header
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async (searchText = '', categoryFilter = '', pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1 && !shouldRefresh) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      const params = {
        page: pageNum,
        limit: 20
      };

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
      const newData = res.data.data || [];

      if (pageNum === 1) {
        setProducts(newData);
      } else {
        setProducts(prev => [...prev, ...newData]);
      }

      setHasMore(pageNum < res.data.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Fetch products:', error);
      if (pageNum === 1) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
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
      await Promise.all([fetchCategories(), fetchWishlist()]);
      await fetchProducts('', '', 1);

      // Check for Daily Offer
      if (settings?.dailyOffer?.isActive) {
        setOfferModalVisible(true);
      }
      setLoading(false);
    };
    initialLoad();
  }, []);

  useEffect(() => {
    if (!loading) fetchProducts(searchDebounce, category, 1);
  }, [searchDebounce, category, fetchProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchCategories(), fetchWishlist()]);
    await fetchProducts(searchDebounce, category, 1, true);
  }, [searchDebounce, category, fetchProducts]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchProducts(searchDebounce, category, page + 1);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 100 }} />;
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center' }}>
        <LoadingShimmer height={150} />
      </View>
    );
  };

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
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background }]} />

      {settings.showPromoBanner && (
        <View style={{ backgroundColor: theme.primary, paddingVertical: 8, paddingHorizontal: 20 }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
            {settings.promoBannerText}
          </Text>
        </View>
      )}

      {/* Premium Floating Header */}
      <View style={[styles.headerWrap, { paddingTop: insets.top + 12 }]}>
        <Animated.View style={[StyleSheet.absoluteFill, {
          opacity: headerOpacity,
          backgroundColor: theme.card,
          ...theme.shadows.small
        }]} />

        <View style={styles.headerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <AnimatedPressable onPress={() => navigation.navigate('Profile')}>
              <View>
                <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
                  Good Morning,
                </Text>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}>
                  {user?.name?.split(' ')[0] || 'Trader'} 👋
                </Text>
              </View>
            </AnimatedPressable>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <AnimatedPressable onPress={() => navigation.navigate('Profile')}>
                <View style={[styles.bellBtn, { ...theme.shadows.small }]}>
                  <User size={22} color={theme.text} />
                </View>
              </AnimatedPressable>

              <AnimatedPressable onPress={() => navigation.navigate('Profile', { screen: 'Notifications' })}>
                <View style={[styles.bellBtn, { ...theme.shadows.small }]}>
                  <Bell size={22} color={theme.text} />
                  <View style={[styles.bellBadge, { backgroundColor: theme.error }]} />
                </View>
              </AnimatedPressable>
            </View>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <View style={[styles.searchBox, { backgroundColor: '#ffffff', ...theme.shadows.small, borderWidth: 1, borderColor: theme.border }]}>
                <Search size={18} color={theme.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="What are you looking for?"
                  placeholderTextColor={theme.textSecondary}
                  value={search}
                  onChangeText={handleSearchChange}
                  returnKeyType="search"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <AnimatedPressable
              style={[
                styles.iconBtn,
                { backgroundColor: category ? theme.primary : theme.card, ...theme.shadows.small }
              ]}
              onPress={() => setCategoryModalVisible(true)}
            >
              <SlidersHorizontal size={20} color={category ? '#ffffff' : theme.text} />
            </AnimatedPressable>
          </View>
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={{ paddingTop: insets.top + 140 }}>
          <LoadingShimmer />
        </View>
      ) : (
        <Animated.FlatList
          data={products}
          numColumns={COLUMNS}
          keyExtractor={keyExtractor}
          renderItem={renderProduct}
          contentContainerStyle={[styles.list, { paddingTop: insets.top + 140 }]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={10}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} progressViewOffset={insets.top + 140} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Search size={64} color={theme.textSecondary} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {search || category ? 'No products found matching your search' : 'No products found'}
              </Text>
              {(search || category) && (
                <AnimatedPressable style={[styles.clearFilterBtn, { backgroundColor: theme.primary }]} onPress={() => { setSearch(''); setCategory(''); }}>
                  <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Clear Filters</Text>
                </AnimatedPressable>
              )}
            </View>
          }
        />
      )}

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} transparent animationType="slide" onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text }}>Filter by Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.modalCategoryItem, !category ? { backgroundColor: theme.border } : null]}
                onPress={() => { setCategory(''); setCategoryModalVisible(false); }}
              >
                <Text style={{ fontSize: 16, color: !category ? theme.primary : theme.text, fontWeight: '700' }}>All Categories</Text>
                {!category && <CheckCircle2 size={22} color={theme.primary} />}
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalCategoryItem, cat === category ? { backgroundColor: theme.border } : null]}
                  onPress={() => { setCategory(cat); setCategoryModalVisible(false); }}
                >
                  <Text style={{ fontSize: 16, color: cat === category ? theme.primary : theme.text, fontWeight: '700' }}>{cat}</Text>
                  {cat === category && <CheckCircle2 size={22} color={theme.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Daily Offer Modal */}
      <Modal visible={offerModalVisible} transparent animationType="fade">
        <View style={styles.offerOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={[styles.offerContent, { backgroundColor: theme.card }]}>
            {settings?.dailyOffer?.image ? (
              <Image source={{ uri: settings.dailyOffer.image }} style={styles.offerImage} />
            ) : (
              <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.offerGradient}>
                <Bell size={60} color="#fff" />
              </LinearGradient>
            )}

            <View style={styles.offerTextContent}>
              <Text style={[styles.offerTitle, { color: theme.text }]}>{settings?.dailyOffer?.title || 'Special Offer!'}</Text>
              <Text style={[styles.offerMessage, { color: theme.textSecondary }]}>{settings?.dailyOffer?.message || 'Check out our latest deals today.'}</Text>

              <TouchableOpacity
                style={[styles.offerBtn, { backgroundColor: theme.primary }]}
                onPress={() => setOfferModalVisible(false)}
              >
                <Text style={styles.offerBtnText}>Claim Now</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setOfferModalVisible(false)} style={styles.offerCloseBtn}>
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bellBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute', top: 12, right: 12,
    width: 8, height: 8, borderRadius: 4,
    borderWidth: 2, borderColor: '#ffffff',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchContainer: { flex: 1 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  iconBtn: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingHorizontal: 10, paddingBottom: 100 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 24, fontWeight: '600' },
  clearFilterBtn: {
    paddingHorizontal: 32, height: 50,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24,
  },
  modalScroll: { paddingHorizontal: 20 },
  modalCategoryItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderRadius: 18, marginBottom: 12,
  },
  offerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  offerContent: { width: '100%', borderRadius: 30, overflow: 'hidden', alignItems: 'center' },
  offerImage: { width: '100%', height: 250, resizeMode: 'cover' },
  offerGradient: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center' },
  offerTextContent: { padding: 24, alignItems: 'center', width: '100%' },
  offerTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  offerMessage: { fontSize: 16, textAlign: 'center', color: '#64748b', marginBottom: 24, lineHeight: 22 },
  offerBtn: { width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  offerBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  offerCloseBtn: { marginTop: 16 },
});

export default HomeScreen;

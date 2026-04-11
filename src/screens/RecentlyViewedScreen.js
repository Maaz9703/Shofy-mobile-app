import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import ProductCard from '../components/ProductCard';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';

const { width } = Dimensions.get('window');

const RecentlyViewedScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: theme.card, ...theme.shadows.small }]} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Recently Viewed</Text>
        {recentlyViewed.length > 0 ? (
          <TouchableOpacity 
            style={[styles.clearBtn, { backgroundColor: theme.error + '10' }]} 
            onPress={() => clearRecentlyViewed()}
          >
            <Ionicons name="trash" size={20} color={theme.error} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {recentlyViewed.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconBg, { backgroundColor: theme.card, ...theme.shadows.medium }]}>
            <Ionicons name="eye" size={60} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your history is empty</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Products you view while browsing will appear here for easy access later.</Text>
          <AnimatedPressable onPress={() => navigation.navigate('Home')} style={styles.shopBtnContainer}>
            <View style={[styles.shopBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.shopBtnText}>Browse Products</Text>
            </View>
          </AnimatedPressable>
        </View>
      ) : (
        <FlatList
          data={recentlyViewed}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <Animated.View 
              entering={FadeInDown.delay(index * 100).springify()}
              layout={Layout.springify()}
              style={{ width: '50%' }}
            >
              <ProductCard
                product={item}
                index={index}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
              />
            </Animated.View>
          )}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 20,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  clearBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconBg: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  emptySub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  shopBtnContainer: { marginTop: 32, width: '100%' },
  shopBtn: {
    height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  shopBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  list: { paddingHorizontal: 10, paddingTop: 10 },
  row: { justifyContent: 'space-between' },
});

export default RecentlyViewedScreen;


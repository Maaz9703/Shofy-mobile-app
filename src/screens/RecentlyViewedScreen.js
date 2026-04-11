import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import ProductCard from '../components/ProductCard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RecentlyViewedScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#09090b', '#09090b']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recently Viewed</Text>
        {recentlyViewed.length > 0 ? (
          <TouchableOpacity style={styles.clearBtn} onPress={() => clearRecentlyViewed()}>
            <Ionicons name="trash" size={20} color="#f87171" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {recentlyViewed.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="eye" size={50} color="#fafafa" />
          </View>
          <Text style={styles.emptyText}>No recently viewed products</Text>
          <Text style={styles.emptySubtext}>Start browsing to see your recently viewed items here</Text>
        </View>
      ) : (
        <FlatList
          data={recentlyViewed}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <ProductCard
              product={item}
              index={index}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
            />
          )}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#27272a',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#f8fafc' },
  clearBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2a1020',
    justifyContent: 'center', alignItems: 'center',
  },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1f1245',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyText: { fontSize: 20, fontWeight: '800', color: '#f8fafc' },
  emptySubtext: { fontSize: 14, marginTop: 8, textAlign: 'center', color: '#64748b' },
  productsList: { padding: 8, paddingBottom: 100 },
});

export default RecentlyViewedScreen;

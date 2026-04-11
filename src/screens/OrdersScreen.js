import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import { ReceiptText, CheckCircle2, Truck, Clock, XCircle, ChevronRight, RefreshCcw } from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Delivered': return { color: '#10b981', label: 'Delivered', icon: CheckCircle2 };
      case 'Shipped': return { color: '#3b82f6', label: 'In Transit', icon: Truck };
      case 'Processing': return { color: '#f59e0b', label: 'Processing', icon: Clock };
      case 'Cancelled': return { color: '#ef4444', label: 'Cancelled', icon: XCircle };
      default: return { color: '#64748b', label: status, icon: ReceiptText };
    }
  };

  const renderOrder = ({ item, index }) => {
    const config = getStatusConfig(item.status);
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 80).springify()}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border }]}
          onPress={() => navigation.navigate('OrderDetails', { order: item })}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.orderIdent}>
              <View style={[styles.orderIconBg, { backgroundColor: theme.primary + '10' }]}>
                <ReceiptText size={18} color={theme.primary} />
              </View>
              <Text style={[styles.orderId, { color: theme.text }]}>
                #{item._id.slice(-8).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
              <config.icon size={14} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.statusText}>{config.label}</Text>
            </View>
          </View>
          
          <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.cardBody}>
            <View>
              <Text style={[styles.date, { color: theme.textSecondary }]}>
                {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
              <Text style={[styles.itemCount, { color: theme.textSecondary }]}>
                {item.items?.length || 0} Products ordered
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Grand Total</Text>
              <Text style={[styles.total, { color: theme.primary }]}>PKR {item.total?.toLocaleString()}</Text>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={[styles.viewDetailsText, { color: theme.textSecondary }]}>View Order Details</Text>
            <ChevronRight size={16} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Order History</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Track and manage your orders</Text>
        </View>
        <AnimatedPressable onPress={() => navigation.navigate('QuickReorder')}>
          <View style={[styles.reorderBtn, { backgroundColor: theme.primary }]}>
            <RefreshCcw size={20} color="#ffffff" />
          </View>
        </AnimatedPressable>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIconBg, { backgroundColor: theme.card, ...theme.shadows.medium }]}>
                <ReceiptText size={60} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Once you place an order, it will appear here.
              </Text>
              <AnimatedPressable onPress={() => navigation.navigate('Home')} style={styles.shopBtnContainer}>
                <View style={[styles.shopBtn, { backgroundColor: theme.primary }]}>
                  <Text style={styles.shopBtnText}>Start Shopping</Text>
                </View>
              </AnimatedPressable>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  headerSub: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  reorderBtn: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingTop: 10 },
  card: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderIdent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: '800' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' },
  cardDivider: { height: 1, width: '100%', marginBottom: 16, opacity: 0.1 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  date: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemCount: { fontSize: 12, fontWeight: '500' },
  priceContainer: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  total: { fontSize: 22, fontWeight: '900' },
  cardFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  viewDetailsText: { fontSize: 13, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyIconBg: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  shopBtnContainer: { marginTop: 32, width: '100%' },
  shopBtn: {
    height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  shopBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

export default OrdersScreen;


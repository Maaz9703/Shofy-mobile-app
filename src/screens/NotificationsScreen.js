import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import { ArrowLeft, CheckCircle2, Truck, Clock, XCircle, Bell, BellOff } from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';

const NotificationsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      const orders = res.data.data || [];
      const orderNotifications = orders.map((order) => ({
        id: order._id,
        type: 'order',
        title: getOrderNotificationTitle(order.status),
        message: `Order #${order._id.slice(-8).toUpperCase()} is now ${order.status}`,
        date: order.updatedAt || order.createdAt,
        read: false,
        orderId: order._id,
        status: order.status,
      }));
      orderNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      setNotifications(orderNotifications);
    } catch (error) {
      console.error('Fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const getOrderNotificationTitle = (status) => {
    switch (status) {
      case 'Delivered': return 'Order Delivered';
      case 'Shipped': return 'On Its Way';
      case 'Processing': return 'Payment Confirmed';
      case 'Cancelled': return 'Order Cancelled';
      default: return 'Order Update';
    }
  };

  const getNotificationConfig = (status) => {
    switch (status) {
      case 'Delivered': return { color: '#10b981', icon: CheckCircle2 };
      case 'Shipped': return { color: '#3b82f6', icon: Truck };
      case 'Processing': return { color: '#f59e0b', icon: Clock };
      case 'Cancelled': return { color: '#ef4444', icon: XCircle };
      default: return { color: theme.primary, icon: Bell };
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const renderItem = ({ item, index }) => {
    const config = getNotificationConfig(item.status);
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).springify()}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          style={[
            styles.card, 
            { backgroundColor: theme.card, borderColor: theme.border },
            !item.read && { ...theme.shadows.small },
            item.read && { opacity: 0.6 }
          ]}
          onPress={() => { markAsRead(item.id); navigation.navigate('Orders', { screen: 'OrderDetails', params: { orderId: item.orderId } }); }}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBg, { backgroundColor: config.color + '15' }]}>
            <config.icon size={22} color={config.color} />
          </View>
          <View style={styles.content}>
            <View style={styles.contentTop}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
            </View>
            <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={[styles.date, { color: theme.textSecondary }]}>
              {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: theme.card, ...theme.shadows.small }]} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {notifications.filter(n => !n.read).length} Unread alerts
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor={theme.primary} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIconBg, { backgroundColor: theme.card, ...theme.shadows.medium }]}>
                <BellOff size={60} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No alerts yet</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Stay tuned! You'll receive updates about your orders and exclusive offers here.
              </Text>
              <AnimatedPressable onPress={() => navigation.navigate('Home')} style={styles.homeBtnContainer}>
                <View style={[styles.homeBtn, { backgroundColor: theme.primary }]}>
                  <Text style={styles.homeBtnText}>Go Shopping</Text>
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 20,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingTop: 10 },
  card: {
    flexDirection: 'row', padding: 16, borderRadius: 20, marginBottom: 16,
    borderWidth: 1, alignItems: 'center',
  },
  iconBg: {
    width: 50, height: 50, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  content: { flex: 1 },
  contentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '800' },
  message: { fontSize: 13, fontWeight: '500', lineHeight: 18, marginBottom: 6 },
  date: { fontSize: 11, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyIconBg: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  emptySub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  homeBtnContainer: { marginTop: 32, width: '100%' },
  homeBtn: {
    height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  homeBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

export default NotificationsScreen;


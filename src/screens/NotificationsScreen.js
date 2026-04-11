import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      const orders = res.data.data || [];
      const orderNotifications = orders.map((order) => ({
        id: order._id,
        type: 'order',
        title: getOrderNotificationTitle(order.status),
        message: `Order #${order._id.slice(-8).toUpperCase()} — ${order.status}`,
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
  };

  const getOrderNotificationTitle = (status) => {
    switch (status) {
      case 'Delivered': return 'Order Delivered';
      case 'Shipped': return 'Order Shipped';
      case 'Processing': return 'Order Processing';
      case 'Cancelled': return 'Order Cancelled';
      default: return 'Order Update';
    }
  };

  const getNotificationIcon = (status) => {
    switch (status) {
      case 'Delivered': return 'checkmark-circle';
      case 'Shipped': return 'car';
      case 'Processing': return 'time';
      case 'Cancelled': return 'close-circle';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (status) => {
    switch (status) {
      case 'Delivered': return '#34d399';
      case 'Shipped': return '#06b6d4';
      case 'Processing': return '#f59e0b';
      case 'Cancelled': return '#f87171';
      default: return '#0f172a';
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      {notifications.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="notifications-off" size={50} color="#0f172a" />
          </View>
          <Text style={styles.emptyText}>No notifications</Text>
          <Text style={styles.emptySubtext}>You'll see order updates here</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const iconColor = getNotificationColor(item.status);
            return (
              <TouchableOpacity
                style={[styles.notificationCard, item.read && { opacity: 0.6 }]}
                onPress={() => { markAsRead(item.id); }}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                  <Ionicons name={getNotificationIcon(item.status)} size={22} color={iconColor} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.notificationDate}>{new Date(item.date).toLocaleString()}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor="#0f172a" colors={['#0f172a']} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#ede9fe',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyText: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  emptySubtext: { fontSize: 14, marginTop: 8, textAlign: 'center', color: '#64748b' },
  listContent: { padding: 16 },
  notificationCard: {
    flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center',
    backgroundColor: '#ffffff',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4, color: '#e2e8f0' },
  notificationMessage: { fontSize: 13, marginBottom: 4, color: '#64748b' },
  notificationDate: { fontSize: 11, color: '#94a3b8' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8, backgroundColor: '#0f172a' },
});

export default NotificationsScreen;

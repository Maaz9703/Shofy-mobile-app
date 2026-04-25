import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { order } = route.params || {};

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>Order not found</Text>
        </View>
      </View>
    );
  }

  const statusTimeline = order.statusHistory || [{ status: order.status }];
  const items = order.items || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#10b981';
      case 'Shipped': return '#6366f1';
      case 'Processing': return theme.primary;
      case 'Cancelled': return theme.error;
      default: return theme.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View entering={FadeInUp.delay(100)} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <AnimatedPressable
          style={[styles.backBtn, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Order Details</Text>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* ID Card */}
        <Animated.View entering={FadeInDown.delay(200)} style={[styles.idCard, { backgroundColor: theme.card, ...theme.shadows.small, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Order ID</Text>
            <Text style={[styles.idText, { color: theme.text }]}>#{order._id?.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
            <View style={[styles.badgeDot, { backgroundColor: getStatusColor(order.status) }]} />
            <Text style={[styles.badgeText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
          </View>
        </Animated.View>

        {/* Timeline */}
        <Animated.View entering={FadeInDown.delay(300)} style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tracking History</Text>
          {statusTimeline.map((entry, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: getStatusColor(entry.status) }]} />
                {idx !== statusTimeline.length - 1 && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineStatus, { color: theme.text }]}>{entry.status}</Text>
                <Text style={[styles.timelineDate, { color: theme.textSecondary }]}>
                  {entry.date ? new Date(entry.date).toLocaleString() : 'Recent Update'}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Items */}
        <Animated.View entering={FadeInDown.delay(400)} style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items ({items.length})</Text>
          {items.map((item, idx) => (
            <View key={idx} style={[styles.itemRow, idx !== items.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title || item.product?.title}
                </Text>
                {item.color && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color, borderColor: theme.border, borderWidth: 1 }} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary }}>{item.color}</Text>
                  </View>
                )}
                {item.flavor && (
                  <View style={{ backgroundColor: theme.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary }} numberOfLines={1}>{item.flavor}</Text>
                  </View>
                )}
                {item.note && (
                  <View style={{ backgroundColor: theme.background, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, marginTop: 6, borderLeftWidth: 3, borderLeftColor: theme.primary }}>
                    <Text style={{ fontSize: 11, color: theme.textSecondary }}>Note: {item.note}</Text>
                  </View>
                )}
                <Text style={[styles.itemQty, { color: theme.textSecondary }]}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.primary }]}>
                PKR {((item.price || 0) * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Shipping */}
        {order.shippingAddress && (
          <Animated.View entering={FadeInDown.delay(500)} style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <MapPin size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Shipping Address</Text>
            </View>
            <View style={styles.addressBox}>
              <Text style={[styles.addrName, { color: theme.text }]}>{order.shippingAddress.fullName}</Text>
              <Text style={[styles.addrText, { color: theme.textSecondary }]}>
                {order.shippingAddress.address}, {order.shippingAddress.city}
              </Text>
              <Text style={[styles.addrText, { color: theme.textSecondary }]}>
                {order.shippingAddress.phone}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Summary */}
        <Animated.View entering={FadeInDown.delay(600)} style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          {(() => {
            const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
            const shippingCharges = order.shippingCharges || 0;
            return (
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>PKR {subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Shipping</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>PKR {shippingCharges.toLocaleString()}</Text>
                </View>
                <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
                  <Text style={[styles.totalValue, { color: theme.primary }]}>PKR {order.total?.toLocaleString()}</Text>
                </View>
              </View>
            );
          })()}
          <View style={[styles.paymentBadge, { backgroundColor: theme.background }]}>
            <CreditCard size={16} color={theme.textSecondary} />
            <Text style={[styles.paymentText, { color: theme.textSecondary }]}>
              Paid via {order.paymentMethod || 'COD'}
            </Text>
          </View>
        </Animated.View>
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  scroll: { paddingHorizontal: 20 },
  idCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  idText: { fontSize: 18, fontWeight: '900' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  
  section: {
    padding: 20, borderRadius: 24, marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 16 },
  
  timelineItem: { flexDirection: 'row', minHeight: 60 },
  timelineLeft: { alignItems: 'center', marginRight: 16, width: 20 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, marginVertical: 4, borderRadius: 1 },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineStatus: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  timelineDate: { fontSize: 12, fontWeight: '500' },
  
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  itemQty: { fontSize: 13, fontWeight: '600' },
  itemPrice: { fontSize: 15, fontWeight: '800' },
  
  addressBox: { gap: 4 },
  addrName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  addrText: { fontSize: 14, fontWeight: '500' },
  
  summaryContainer: { gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 16, borderTopWidth: 1,
  },
  totalLabel: { fontSize: 17, fontWeight: '800' },
  totalValue: { fontSize: 22, fontWeight: '900' },
  
  paymentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    marginTop: 20,
  },
  paymentText: { fontSize: 12, fontWeight: '700' },
});


export default OrderDetailsScreen;

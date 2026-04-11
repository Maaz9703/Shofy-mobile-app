import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const OrderDetailsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { order } = route.params || {};

  if (!order) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#0f172a', fontSize: 18 }}>Order not found</Text>
        </View>
      </View>
    );
  }

  const statusTimeline = order.statusHistory || [{ status: order.status }];
  const items = order.items || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#34d399';
      case 'Shipped': case 'Processing': return '#0f172a';
      case 'Cancelled': return '#f87171';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />

      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#0f172a" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64 }]} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <View style={[styles.badgeDot, { backgroundColor: getStatusColor(order.status) }]} />
            <Text style={[styles.badgeText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          {statusTimeline.map((entry, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: getStatusColor(entry.status) }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{entry.status}</Text>
                <Text style={styles.timelineDate}>
                  {entry.date ? new Date(entry.date).toLocaleString() : ''}
                </Text>
                {entry.note && <Text style={styles.timelineNote}>{entry.note}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({items.length})</Text>
          {items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title || item.product?.title}
              </Text>
              <Text style={styles.itemQty}>
                x{item.quantity} — PKR {((item.price || 0) * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <Text style={styles.addrName}>{order.shippingAddress.fullName}</Text>
            <Text style={styles.addrText}>
              {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </Text>
            <Text style={styles.addrText}>{order.shippingAddress.phone}</Text>
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {(() => {
            const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
            const shippingCharges = order.shippingCharges || 0;
            return (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>PKR {subtotal.toLocaleString()}</Text>
                </View>
                {shippingCharges > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping:</Text>
                    <Text style={styles.summaryValue}>PKR {shippingCharges.toLocaleString()}</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>PKR {order.total?.toLocaleString()}</Text>
                </View>
              </>
            );
          })()}
          <Text style={styles.paymentMethod}>Payment: {order.paymentMethod || 'COD'}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  backBtn: {
    position: 'absolute', left: 20, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center',
  },
  scroll: { padding: 16, paddingBottom: 40 },
  section: {
    padding: 18, borderRadius: 18, marginBottom: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14, color: '#0f172a' },
  badge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 14, fontWeight: '700' },
  timelineItem: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, marginRight: 12 },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 15, fontWeight: '600', marginBottom: 2, color: '#e2e8f0' },
  timelineDate: { fontSize: 12, color: '#64748b' },
  timelineNote: { fontSize: 12, marginTop: 4, color: '#64748b' },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  itemTitle: { flex: 1, fontSize: 15, color: '#e2e8f0' },
  itemQty: { fontSize: 14, color: '#64748b' },
  addrName: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  addrText: { fontSize: 14, marginBottom: 4, color: '#64748b' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 15, color: '#64748b' },
  summaryValue: { fontSize: 15, color: '#e2e8f0' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  totalLabel: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  paymentMethod: { fontSize: 13, color: '#64748b', marginTop: 12 },
});

export default OrderDetailsScreen;

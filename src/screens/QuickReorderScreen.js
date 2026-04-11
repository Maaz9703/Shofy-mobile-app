import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';

const QuickReorderScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchPreviousOrders();
  }, []);

  const fetchPreviousOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      const orders = res.data.data || [];
      // Sort by date (newest first) and get delivered orders
      const deliveredOrders = orders
        .filter((o) => o.status === 'Delivered')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
      setPreviousOrders(deliveredOrders);
    } catch (error) {
      console.error('Fetch orders:', error);
      Toast.show({ type: 'error', text1: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (order) => {
    try {
      if (!order.items || order.items.length === 0) {
        Toast.show({ type: 'error', text1: 'Order has no items' });
        return;
      }

      // Add all items from order to cart
      order.items.forEach((item) => {
        if (item.product) {
          addToCart(item.product, item.quantity);
        }
      });

      Toast.show({
        type: 'success',
        text1: 'Items added to cart',
        text2: `${order.items.length} item(s) added`,
      });
      navigation.navigate('Cart');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to reorder' });
    }
  };

  const getOrderTotal = (order) => {
    return order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || order.total || 0;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.card, paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Quick Reorder</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Quick Reorder</Text>
        <View style={{ width: 40 }} />
      </View>

      {previousOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No previous orders found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Complete an order to see it here for quick reordering
          </Text>
        </View>
      ) : (
        <FlatList
          data={previousOrders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.orderCard, { backgroundColor: theme.card }]}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={[styles.orderId, { color: theme.text }]}>
                    Order #{item._id.slice(-8).toUpperCase()}
                  </Text>
                  <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.orderTotal, { color: theme.primary }]}>
                  PKR {getOrderTotal(item).toFixed(2)}
                </Text>
              </View>

              <View style={styles.itemsPreview}>
                {item.items?.slice(0, 3).map((orderItem, idx) => (
                  <View key={idx} style={styles.itemPreview}>
                    <Text style={[styles.itemName, { color: theme.text }]}>
                      {orderItem.product?.title || 'Product'}
                    </Text>
                    <Text style={[styles.itemQuantity, { color: theme.textSecondary }]}>
                      Qty: {orderItem.quantity}
                    </Text>
                  </View>
                ))}
                {item.items?.length > 3 && (
                  <Text style={[styles.moreItems, { color: theme.textSecondary }]}>
                    +{item.items.length - 3} more items
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.reorderButton, { backgroundColor: theme.primary }]}
                onPress={() => handleReorder(item)}
              >
                <Ionicons name="repeat" size={20} color="#fff" />
                <Text style={styles.reorderButtonText}>Reorder All Items</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemsPreview: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  itemPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
  },
  moreItems: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuickReorderScreen;

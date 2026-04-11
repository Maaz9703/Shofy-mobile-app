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
import Toast from 'react-native-toast-message';
import { MapPin, Phone, Pencil, Trash2, ArrowLeft, Plus } from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';

const AddressManagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data.data || []);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load addresses' });
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  }, [fetchAddresses]);

  const setDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      await fetchAddresses();
      Toast.show({ type: 'success', text1: 'Default address updated' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update' });
    }
  };

  const deleteAddress = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      await fetchAddresses();
      Toast.show({ type: 'success', text1: 'Address deleted' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete' });
    }
  };

  const renderItem = ({ item, index }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
    >
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, ...theme.shadows.small }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: theme.primary + '10' }]}>
            <MapPin size={20} color={theme.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: theme.text }]}>{item.fullName}</Text>
            {item.isDefault && (
              <View style={[styles.defaultBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.defaultText}>DEFAULT</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.addrText, { color: theme.textSecondary }]}>
          {item.address}, {item.city}, {item.state} {item.zipCode}
        </Text>
        <Text style={[styles.phone, { color: theme.textSecondary }]}>
          <Phone size={12} /> {item.phone}
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.actions}>
          {!item.isDefault && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: theme.border }]} 
              onPress={() => setDefault(item._id)}
            >
              <Text style={[styles.actionText, { color: theme.text }]}>Set Default</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: theme.border }]} 
            onPress={() => navigation.navigate('AddEditAddress', { address: item })}
          >
            <Pencil size={16} color={theme.text} />
            <Text style={[styles.actionText, { color: theme.text }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.deleteBtn, { backgroundColor: theme.error + '10' }]}
            onPress={() => deleteAddress(item._id)}
          >
            <Trash2 size={18} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          style={[styles.headerBtn, { backgroundColor: theme.card, ...theme.shadows.small }]} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Address Book</Text>
        <AnimatedPressable onPress={() => navigation.navigate('AddEditAddress')}>
          <View style={[styles.addBtn, { backgroundColor: theme.primary }]}>
            <Plus size={26} color="#ffffff" />
          </View>
        </AnimatedPressable>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIconBg, { backgroundColor: theme.card, ...theme.shadows.medium }]}>
                <MapPin size={60} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No addresses yet</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Please add your delivery address for a faster checkout experience.
              </Text>
              <AnimatedPressable onPress={() => navigation.navigate('AddEditAddress')} style={styles.addFirstBtnContainer}>
                <View style={[styles.addFirstBtn, { backgroundColor: theme.primary }]}>
                  <Text style={styles.addFirstBtnText}>Add Your First Address</Text>
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
  headerBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  addBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingTop: 10 },
  card: {
    padding: 20, borderRadius: 24, marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: '800' },
  defaultBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  defaultText: { color: '#ffffff', fontSize: 9, fontWeight: '900' },
  addrText: { fontSize: 15, fontWeight: '500', lineHeight: 22, marginBottom: 8 },
  phone: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1.5, width: '100%', marginVertical: 16, opacity: 0.1 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, height: 40, borderRadius: 10,
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  deleteBtn: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 'auto',
  },
  empty: { flex: 1, alignItems: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyIconBg: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  emptySub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  addFirstBtnContainer: { marginTop: 32, width: '100%' },
  addFirstBtn: {
    height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  addFirstBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

export default AddressManagementScreen;


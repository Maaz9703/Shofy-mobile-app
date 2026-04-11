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
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AddressManagementScreen = ({ navigation }) => {
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
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(14)}>
      <View style={styles.card}>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.addrText}>{item.address}, {item.city}, {item.state} {item.zipCode}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <View style={styles.actions}>
          {!item.isDefault && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => setDefault(item._id)}>
              <Text style={styles.actionText}>Set Default</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddEditAddress', { address: item })}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteAddress(item._id)}>
            <Ionicons name="trash" size={22} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#09090b', '#09090b']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddEditAddress')}>
          <LinearGradient colors={['#fafafa', '#fafafa']} style={styles.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="add" size={22} color="#09090b" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fafafa" />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fafafa" colors={['#fafafa']} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="location" size={50} color="#fafafa" />
              </View>
              <Text style={styles.emptyTitle}>No addresses yet</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddEditAddress')}>
                <LinearGradient colors={['#fafafa', '#fafafa']} style={styles.emptyBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.emptyBtnText}>Add your first address</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
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
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    padding: 18, borderRadius: 18, marginBottom: 12, position: 'relative',
    backgroundColor: '#18181b',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  defaultBadge: {
    position: 'absolute', top: 14, right: 14,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    backgroundColor: '#3f3f46',
  },
  defaultText: { color: '#fafafa', fontSize: 11, fontWeight: '700' },
  name: { fontSize: 17, fontWeight: '700', marginBottom: 6, color: '#f8fafc' },
  addrText: { fontSize: 14, marginBottom: 4, color: '#94a3b8' },
  phone: { fontSize: 13, marginBottom: 14, color: '#64748b' },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  actionBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    backgroundColor: '#3f3f46',
  },
  actionText: { fontSize: 13, fontWeight: '600', color: '#fafafa' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIconBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#27272a',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#f8fafc', marginBottom: 24 },
  emptyBtn: { paddingHorizontal: 28, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  emptyBtnText: { color: '#09090b', fontSize: 15, fontWeight: '700' },
});

export default AddressManagementScreen;

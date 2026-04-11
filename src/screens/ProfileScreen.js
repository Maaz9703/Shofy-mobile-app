import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: 'location', label: 'Address Management', onPress: () => navigation.navigate('AddressManagement') },
    { icon: 'heart', label: 'Wishlist', onPress: () => navigation.navigate('Wishlist') },
    { icon: 'eye', label: 'Recently Viewed', onPress: () => navigation.navigate('RecentlyViewed') },
    { icon: 'notifications', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
    { icon: 'repeat', label: 'Quick Reorder', onPress: () => navigation.navigate('Orders', { screen: 'QuickReorder' }) },
    { icon: 'git-compare', label: 'Compare Products', onPress: () => navigation.navigate('Home', { screen: 'ProductComparison' }) },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#f8fafc', '#f8fafc']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#ffffff', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <LinearGradient colors={['#0f172a', '#0f172a']} style={StyleSheet.absoluteFill} />
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
        </LinearGradient>

        <View style={styles.menuBox}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 ? null : styles.menuItemBorder
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBg}>
                <Ionicons name={item.icon} size={20} color="#0f172a" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={logout} activeOpacity={0.8} style={styles.logoutBtn}>
          <Ionicons name="log-out" size={22} color="#f87171" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', letterSpacing: 0.5 },
  scroll: { padding: 16, paddingBottom: 20 },
  
  profileCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    marginBottom: 24,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, overflow: 'hidden',
    borderWidth: 2, borderColor: '#e2e8f0',
  },
  avatarText: { color: '#f8fafc', fontSize: 36, fontWeight: '800' },
  name: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 6, letterSpacing: -0.5 },
  email: { fontSize: 15, color: '#64748b' },

  menuBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  menuIconBg: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0f172a' },
  
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 18, borderRadius: 18,
    backgroundColor: '#e2e8f0',
    gap: 10, marginTop: 10,
  },
  logoutText: { fontSize: 17, fontWeight: '700', color: '#f87171' },
});

export default ProfileScreen;

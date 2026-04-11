import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { theme, logout } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: 'location', label: 'Address Management', onPress: () => navigation.navigate('AddressManagement'), color: '#3b82f6' },
    { icon: 'heart', label: 'My Wishlist', onPress: () => navigation.navigate('Wishlist'), color: '#ef4444' },
    { icon: 'eye', label: 'Recently Viewed', onPress: () => navigation.navigate('RecentlyViewed'), color: '#6366f1' },
    { icon: 'notifications', label: 'Notifications', onPress: () => navigation.navigate('Notifications'), color: '#f59e0b' },
    { icon: 'repeat', label: 'Quick Reorder', onPress: () => navigation.navigate('Orders', { screen: 'QuickReorder' }), color: '#10b981' },
    { icon: 'git-compare', label: 'Compare Products', onPress: () => navigation.navigate('Home', { screen: 'ProductComparison' }), color: '#8b5cf6' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 100 }]} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800).springify()}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
            <AnimatedPressable onPress={() => navigation.navigate('Home')}>
              <View style={[styles.headerBtn, { backgroundColor: theme.card, ...theme.shadows.small }]}>
                <Ionicons name="close" size={24} color={theme.text} />
              </View>
            </AnimatedPressable>
          </View>

          <View style={[styles.profileCard, { backgroundColor: theme.card, ...theme.shadows.medium }]}>
            <View style={[styles.avatarContainer, { borderColor: theme.primary + '20' }]}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
              </View>
              <TouchableOpacity style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                <Ionicons name="camera" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.name, { color: theme.text }]}>{user?.name || 'Maaz'}</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email || 'maaz@example.com'}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Orders</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>5</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Reviews</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>8</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Wishlist</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Animated.View 
              key={item.label}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBg, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(800)}>
          <TouchableOpacity 
            onPress={logout} 
            activeOpacity={0.8} 
            style={[styles.logoutBtn, { borderColor: theme.error + '40' }]}
          >
            <Ionicons name="log-out" size={22} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>Version 1.0.4.Premium</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  headerBtn: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  profileCard: {
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    padding: 4,
    borderWidth: 1,
    borderRadius: 44,
    marginBottom: 16,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#ffffff', fontSize: 32, fontWeight: '800' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#ffffff',
  },
  name: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  email: { fontSize: 14, fontWeight: '500', marginBottom: 20 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 24, opacity: 0.1 },
  
  menuContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  menuIconBg: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
  
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 18, borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
    marginTop: 8,
  },
  logoutText: { fontSize: 17, fontWeight: '800' },
  versionText: { 
    textAlign: 'center', 
    marginTop: 20, 
    fontSize: 12, 
    fontWeight: '600',
    opacity: 0.5 
  },
});

export default ProfileScreen;


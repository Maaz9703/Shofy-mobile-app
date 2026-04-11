import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

import HomeScreen from '../screens/HomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ProductReviewsScreen from '../screens/ProductReviewsScreen';
import AdvancedSearchScreen from '../screens/AdvancedSearchScreen';
import RecentlyViewedScreen from '../screens/RecentlyViewedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProductComparisonScreen from '../screens/ProductComparisonScreen';
import QuickReorderScreen from '../screens/QuickReorderScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddressManagementScreen from '../screens/AddressManagementScreen';
import AddEditAddressScreen from '../screens/AddEditAddressScreen';
import WishlistScreen from '../screens/WishlistScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const getTabBarVisibility = (route) => {
  const routeName = route.state
    ? route.state.routes[route.state.index]?.name
    : route.params?.screen || '';
  const rootScreens = ['HomeMain', 'CartMain', 'OrdersMain', 'ProfileMain'];
  if (route.state && !rootScreens.includes(routeName)) {
    return { display: 'none' };
  }
  return undefined;
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} />
    <Stack.Screen name="AdvancedSearch" component={AdvancedSearchScreen} />
    <Stack.Screen name="ProductComparison" component={ProductComparisonScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="CartMain" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="OrdersMain" component={OrdersScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="QuickReorder" component={QuickReorderScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="AddressManagement" component={AddressManagementScreen} />
    <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  const { theme } = useTheme();
  const { cartCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Cart': iconName = 'cart'; break;
            case 'Orders': iconName = 'receipt'; break;
            case 'Profile': iconName = 'person'; break;
            default: iconName = 'ellipse';
          }
          return (
            <View style={styles.iconContainer}>
              {focused && <View style={[styles.activeIndicator, { backgroundColor: theme.primary + '15' }]} />}
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: [styles.tabBar, { borderTopColor: theme.border, backgroundColor: theme.card }],
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: [styles.tabBar, { borderTopColor: theme.border, backgroundColor: theme.card }, getTabBarVisibility(route)],
        })}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={({ route }) => ({
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.error, color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
          tabBarStyle: [styles.tabBar, { borderTopColor: theme.border, backgroundColor: theme.card }, getTabBarVisibility(route)],
        })}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={({ route }) => ({
          tabBarStyle: [styles.tabBar, { borderTopColor: theme.border, backgroundColor: theme.card }, getTabBarVisibility(route)],
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={({ route }) => ({
          tabBarStyle: [styles.tabBar, { borderTopColor: theme.border, backgroundColor: theme.card }, getTabBarVisibility(route)],
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 85,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    paddingTop: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 14,
  },
});

export default MainNavigator;


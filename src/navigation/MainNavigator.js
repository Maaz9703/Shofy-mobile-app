import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { LinearGradient } from 'expo-linear-gradient';

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

// Helper: returns tabBarStyle based on whether we're on the root screen
const getTabBarVisibility = (route) => {
  const routeName = route.state
    ? route.state.routes[route.state.index]?.name
    : route.params?.screen || '';
  // Only show tab bar on the main/root screen of each stack
  const rootScreens = ['HomeMain', 'CartMain', 'OrdersMain', 'ProfileMain'];
  if (route.state && !rootScreens.includes(routeName)) {
    return { display: 'none' };
  }
  return undefined;
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} />
    <Stack.Screen name="AdvancedSearch" component={AdvancedSearchScreen} />
    <Stack.Screen name="ProductComparison" component={ProductComparisonScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartMain" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OrdersMain" component={OrdersScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="QuickReorder" component={QuickReorderScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="AddressManagement" component={AddressManagementScreen} />
    <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const CustomTabBarBackground = () => (
  <View style={[StyleSheet.absoluteFill, { backgroundColor: '#f8fafc' }]}>
    <View style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: '#e2e8f0'
    }} />
  </View>
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
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused && (
                <View style={{
                  position: 'absolute', width: 36, height: 36, borderRadius: 18,
                  backgroundColor: '#f1f5f9',
                }} />
              )}
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: 80,
          backgroundColor: '#f8fafc',
        },
        tabBarBackground: () => <CustomTabBarBackground />,
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            height: 80,
            backgroundColor: '#f8fafc',
            ...getTabBarVisibility(route),
          },
        })}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={({ route }) => ({
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444', color: '#0f172a' },
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            height: 80,
            backgroundColor: '#f8fafc',
            ...getTabBarVisibility(route),
          },
        })}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={({ route }) => ({
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            height: 80,
            backgroundColor: '#f8fafc',
            ...getTabBarVisibility(route),
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={({ route }) => ({
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            height: 80,
            backgroundColor: '#f8fafc',
            ...getTabBarVisibility(route),
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

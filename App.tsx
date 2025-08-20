
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import LoginScreen from './components/screens/LoginScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import HomeScreen from './components/screens/HomeScreen';
import MapScreen from './components/screens/MapScreen';
import ActivityScreen from './components/screens/ActivityScreen';
import SocialScreen from './components/screens/SocialScreen';
import ChatScreen from './components/screens/ChatScreen';
import FundraiserListScreen from './components/screens/FundraiserListScreen';
import CreateFundraiserScreen from './components/screens/CreateFundraiserScreen';
import FundraiserDetailScreen from './components/screens/FundraiserDetailScreen';
import NotificationsScreen from './components/screens/NotificationsScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import { theme } from './config/theme';
import { DeviceProvider } from './context/DeviceContext';
import { ActivityProvider } from './context/ActivityContext';
import { NotificationProvider } from './context/NotificationContext';
import { FundraiserProvider } from './context/FundraiserContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
};

const MainStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="FundraiserList" component={FundraiserListScreen} />
      <Stack.Screen name="CreateFundraiser" component={CreateFundraiserScreen} />
      <Stack.Screen name="FundraiserDetail" component={FundraiserDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  if (!user.isOnboardingCompleted) {
    return <OnboardingScreen />;
  }

  return <MainStackNavigator />;
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <PreferencesProvider>
            <NotificationProvider>
              <DeviceProvider>
                <ActivityProvider>
                  <FundraiserProvider>
                    <NavigationContainer>
                      <StatusBar style="auto" />
                      <AppContent />
                    </NavigationContainer>
                  </FundraiserProvider>
                </ActivityProvider>
              </DeviceProvider>
            </NotificationProvider>
          </PreferencesProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { LaunchDetailsScreen } from '../screens/LaunchDetailsScreen';
import { LaunchListScreen } from '../screens/LaunchListScreen';
import { LaunchpadsScreen } from '../screens/LaunchpadsScreen';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#09111f',
    card: '#0b1324',
    text: '#f8fafc',
    border: '#213047',
    primary: '#3dd6c6',
  },
};

const MainTabs = () => (
  <Tabs.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#0b1324' },
      headerTintColor: '#f8fafc',
      tabBarStyle: { backgroundColor: '#0b1324', borderTopColor: '#213047' },
      tabBarActiveTintColor: '#3dd6c6',
      tabBarInactiveTintColor: '#9fb0c8',
    }}
  >
    <Tabs.Screen name="Launches" component={LaunchListScreen} />
    <Tabs.Screen name="Bookmarks" component={BookmarksScreen} />
    <Tabs.Screen name="Launchpads" component={LaunchpadsScreen} />
  </Tabs.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer theme={theme}>
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0b1324' }, headerTintColor: '#f8fafc' }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="LaunchDetails" component={LaunchDetailsScreen} options={{ title: 'Mission Detail' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  const { user, userRole } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
      }}>
      
      {/* Commuter Tabs */}
      {(userRole === 'commuter' || userRole === 'admin') && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ size, color }) => (
                <MaterialIcons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="routes"
            options={{
              title: 'Routes',
              tabBarIcon: ({ size, color }) => (
                <MaterialIcons name="directions-bus" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="favorites"
            options={{
              title: 'Favorites',
              tabBarIcon: ({ size, color }) => (
                <MaterialIcons name="favorite" size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* Driver Tabs */}
      {(userRole === 'driver' || userRole === 'admin') && (
        <>
          <Tabs.Screen
            name="driver"
            options={{
              title: 'Drive',
              tabBarIcon: ({ size, color }) => (
                <MaterialIcons name="local-taxi" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="trips"
            options={{
              title: 'Trips',
              tabBarIcon: ({ size, color }) => (
                <MaterialIcons name="history" size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* Admin Tabs */}
      {userRole === 'admin' && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ size, color }) => (
              <MaterialIcons name="admin-panel-settings" size={size} color={color} />
            ),
          }}
        />
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    height: 80,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
});
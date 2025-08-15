import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Route {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
}

interface Trip {
  id: string;
  driver_id: string;
  route_id: string;
  status: 'active' | 'completed' | 'cancelled';
  started_at: string;
  ended_at: string | null;
}

export default function DriverScreen() {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);

  useEffect(() => {
    requestLocationPermission();
    fetchRoutes();
    checkActiveTrip();
  }, []);

  useEffect(() => {
    if (isOnline && activeTrip) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [isOnline, activeTrip]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Location permission is needed for driver tracking');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const checkActiveTrip = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', user?.id)
        .eq('status', 'active')
        .single();

      if (data) {
        setActiveTrip(data);
        setIsOnline(true);
      }
    } catch (error) {
      console.log('No active trip found');
    }
  };

  const startLocationTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setLocation(newLocation);
          updateLocationInDatabase(newLocation);
        }
      );
      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  const updateLocationInDatabase = async (newLocation: any) => {
    if (!activeTrip) return;

    try {
      const { error } = await supabase
        .from('locations')
        .insert({
          trip_id: activeTrip.id,
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
          timestamp: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const startTrip = async () => {
    if (!selectedRoute) {
      Alert.alert('Select Route', 'Please select a route before starting a trip');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          driver_id: user?.id,
          route_id: selectedRoute.id,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setActiveTrip(data);
      setIsOnline(true);
      Alert.alert('Trip Started', `You are now driving the ${selectedRoute.name} route`);
    } catch (error) {
      console.error('Error starting trip:', error);
      Alert.alert('Error', 'Could not start trip. Please try again.');
    }
  };

  const endTrip = async () => {
    if (!activeTrip) return;

    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('trips')
                .update({
                  status: 'completed',
                  ended_at: new Date().toISOString(),
                })
                .eq('id', activeTrip.id);

              if (error) throw error;

              setActiveTrip(null);
              setIsOnline(false);
              Alert.alert('Trip Ended', 'Your trip has been completed successfully');
            } catch (error) {
              console.error('Error ending trip:', error);
              Alert.alert('Error', 'Could not end trip. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Dashboard</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Online</Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            disabled={!activeTrip}
            thumbColor={isOnline ? '#059669' : '#6B7280'}
            trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
          />
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.coords.latitude || -15.4067,
            longitude: location?.coords.longitude || 28.2871,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              description="Driver Position"
            >
              <View style={styles.driverMarker}>
                <MaterialIcons name="local-taxi" size={20} color="#FFFFFF" />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      <View style={styles.controlsContainer}>
        {!activeTrip ? (
          <>
            <Text style={styles.sectionTitle}>Select Route</Text>
            <View style={styles.routeSelector}>
              {routes.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.routeOption,
                    selectedRoute?.id === route.id && styles.selectedRoute,
                  ]}
                  onPress={() => setSelectedRoute(route)}
                >
                  <Text
                    style={[
                      styles.routeOptionText,
                      selectedRoute?.id === route.id && styles.selectedRouteText,
                    ]}
                  >
                    {route.name}
                  </Text>
                  <Text
                    style={[
                      styles.routeOptionDetails,
                      selectedRoute?.id === route.id && styles.selectedRouteText,
                    ]}
                  >
                    {route.start_point} → {route.end_point}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.startButton} onPress={startTrip}>
              <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Trip</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.activeTripContainer}>
            <View style={styles.tripInfo}>
              <Text style={styles.activeTripTitle}>Active Trip</Text>
              <Text style={styles.activeTripRoute}>
                {routes.find(r => r.id === activeTrip.route_id)?.name}
              </Text>
              <Text style={styles.tripStarted}>
                Started: {new Date(activeTrip.started_at).toLocaleTimeString()}
              </Text>
            </View>

            <TouchableOpacity style={styles.endButton} onPress={endTrip}>
              <MaterialIcons name="stop" size={24} color="#FFFFFF" />
              <Text style={styles.endButtonText}>End Trip</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#059669',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    backgroundColor: '#059669',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  routeSelector: {
    marginBottom: 20,
  },
  routeOption: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedRoute: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  routeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  routeOptionDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedRouteText: {
    color: '#059669',
  },
  startButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  activeTripContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tripInfo: {
    marginBottom: 20,
  },
  activeTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  activeTripRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  tripStarted: {
    fontSize: 14,
    color: '#6B7280',
  },
  endButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  endButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
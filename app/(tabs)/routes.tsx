import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Route {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  distance_km: number;
  estimated_time: number;
}

interface Fare {
  id: string;
  route_id: string;
  amount: number;
  currency: string;
}

export default function RoutesScreen() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [fares, setFares] = useState<Fare[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchRoutes();
    fetchFares();
    loadFavorites();
  }, []);

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

  const fetchFares = async () => {
    try {
      const { data, error } = await supabase
        .from('fares')
        .select('*');

      if (error) throw error;
      setFares(data || []);
    } catch (error) {
      console.error('Error fetching fares:', error);
    }
  };

  const loadFavorites = async () => {
    // In a real app, this would load from AsyncStorage or user preferences
    setFavorites(['route-1', 'route-3']);
  };

  const getRouteFare = (routeId: string) => {
    const fare = fares.find(f => f.route_id === routeId);
    return fare ? `${fare.currency} ${fare.amount}` : 'N/A';
  };

  const toggleFavorite = (routeId: string) => {
    if (favorites.includes(routeId)) {
      setFavorites(favorites.filter(id => id !== routeId));
    } else {
      setFavorites([...favorites, routeId]);
    }
  };

  const initiatePayment = (route: Route) => {
    Alert.alert(
      'Payment Method',
      'Select your preferred payment method:',
      [
        {
          text: 'MTN Money',
          onPress: () => processPayment(route, 'mtn_money'),
        },
        {
          text: 'Airtel Money',
          onPress: () => processPayment(route, 'airtel_money'),
        },
        {
          text: 'Zamtel Kwacha',
          onPress: () => processPayment(route, 'zamtel_kwacha'),
        },
        {
          text: 'Cash',
          onPress: () => processPayment(route, 'cash'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const processPayment = async (route: Route, method: string) => {
    try {
      if (method === 'cash') {
        Alert.alert('Cash Payment', 'Please pay the driver directly when boarding.');
        return;
      }

      // In a real app, this would integrate with mobile money APIs
      const { data, error } = await supabase
        .from('payments')
        .insert({
          trip_id: 'temp-trip-id',
          amount: getRouteFare(route.id).split(' ')[1],
          method: method,
          status: 'pending',
          transaction_ref: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });

      if (error) throw error;

      Alert.alert('Payment Initiated', `Your ${method.replace('_', ' ')} payment is being processed.`);
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Error', 'There was an issue processing your payment. Please try again.');
    }
  };

  const renderRoute = ({ item }: { item: Route }) => (
    <TouchableOpacity
      style={styles.routeCard}
      onPress={() => {
        setSelectedRoute(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.routeHeader}>
        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{item.name}</Text>
          <Text style={styles.routeDetails}>
            {item.start_point} → {item.end_point}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={styles.favoriteButton}
        >
          <MaterialIcons
            name={favorites.includes(item.id) ? 'favorite' : 'favorite-border'}
            size={24}
            color={favorites.includes(item.id) ? '#DC2626' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.routeFooter}>
        <Text style={styles.routeDistance}>{item.distance_km} km</Text>
        <Text style={styles.routeTime}>{item.estimated_time} min</Text>
        <Text style={styles.routeFare}>{getRouteFare(item.id)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Routes</Text>
        <Text style={styles.headerSubtitle}>{routes.length} routes available</Text>
      </View>

      <FlatList
        data={routes}
        renderItem={renderRoute}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRoute && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedRoute.name}</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={20} color="#6B7280" />
                    <Text style={styles.detailText}>
                      From {selectedRoute.start_point} to {selectedRoute.end_point}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="straighten" size={20} color="#6B7280" />
                    <Text style={styles.detailText}>{selectedRoute.distance_km} km</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="schedule" size={20} color="#6B7280" />
                    <Text style={styles.detailText}>{selectedRoute.estimated_time} minutes</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="attach-money" size={20} color="#6B7280" />
                    <Text style={styles.detailText}>Fare: {getRouteFare(selectedRoute.id)}</Text>
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => {
                      setModalVisible(false);
                      initiatePayment(selectedRoute);
                    }}
                  >
                    <MaterialIcons name="payment" size={20} color="#FFFFFF" />
                    <Text style={styles.payButtonText}>Pay Fare</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.favoriteModalButton}
                    onPress={() => toggleFavorite(selectedRoute.id)}
                  >
                    <MaterialIcons
                      name={favorites.includes(selectedRoute.id) ? 'favorite' : 'favorite-border'}
                      size={20}
                      color={favorites.includes(selectedRoute.id) ? '#DC2626' : '#6B7280'}
                    />
                    <Text style={styles.favoriteModalText}>
                      {favorites.includes(selectedRoute.id) ? 'Remove' : 'Add to Favorites'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#93C5FD',
  },
  listContainer: {
    padding: 16,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  routeDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  favoriteButton: {
    padding: 4,
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeDistance: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routeTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  routeFare: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  payButton: {
    flex: 1,
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  favoriteModalButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  favoriteModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
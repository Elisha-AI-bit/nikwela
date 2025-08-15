import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

interface Route {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  distance_km: number;
  estimated_time: number;
}

export default function FavoritesScreen() {
  const [favoriteRoutes, setFavoriteRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // In a real app, this would load user's favorite route IDs from storage or database
      const favoriteIds = ['route-1', 'route-3']; // Mock data
      
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .in('id', favoriteIds);

      if (error) throw error;
      setFavoriteRoutes(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (routeId: string) => {
    setFavoriteRoutes(favoriteRoutes.filter(route => route.id !== routeId));
  };

  const renderFavoriteRoute = ({ item }: { item: Route }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.name}</Text>
        <Text style={styles.routeDetails}>
          {item.start_point} → {item.end_point}
        </Text>
        <View style={styles.routeMetrics}>
          <Text style={styles.metric}>{item.distance_km} km</Text>
          <Text style={styles.metric}>•</Text>
          <Text style={styles.metric}>{item.estimated_time} min</Text>
        </View>
      </View>
      
      <TouchableOpacity
        onPress={() => removeFavorite(item.id)}
        style={styles.removeButton}
      >
        <MaterialIcons name="favorite" size={24} color="#DC2626" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorite Routes</Text>
        <Text style={styles.headerSubtitle}>
          {favoriteRoutes.length} saved routes
        </Text>
      </View>

      {favoriteRoutes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="favorite-border" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start adding routes to your favorites for quick access
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteRoutes}
          renderItem={renderFavoriteRoute}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#DC2626',
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
    color: '#FCA5A5',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
  },
  favoriteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 8,
  },
  routeMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metric: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
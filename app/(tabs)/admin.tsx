import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
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

interface Stats {
  totalTrips: number;
  activeTrips: number;
  totalDrivers: number;
  totalRevenue: number;
}

export default function AdminScreen() {
  const [stats, setStats] = useState<Stats>({
    totalTrips: 0,
    activeTrips: 0,
    totalDrivers: 0,
    totalRevenue: 0,
  });
  const [routes, setRoutes] = useState<Route[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_point: '',
    end_point: '',
    distance_km: '',
    estimated_time: '',
  });

  useEffect(() => {
    fetchStats();
    fetchRoutes();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total trips
      const { count: totalTrips } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true });

      // Fetch active trips
      const { count: activeTrips } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total drivers
      const { count: totalDrivers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'driver');

      // Fetch total revenue (mock calculation)
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      setStats({
        totalTrips: totalTrips || 0,
        activeTrips: activeTrips || 0,
        totalDrivers: totalDrivers || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
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

  const openModal = (route?: Route) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        name: route.name,
        start_point: route.start_point,
        end_point: route.end_point,
        distance_km: route.distance_km.toString(),
        estimated_time: route.estimated_time.toString(),
      });
    } else {
      setEditingRoute(null);
      setFormData({
        name: '',
        start_point: '',
        end_point: '',
        distance_km: '',
        estimated_time: '',
      });
    }
    setModalVisible(true);
  };

  const saveRoute = async () => {
    try {
      const routeData = {
        name: formData.name,
        start_point: formData.start_point,
        end_point: formData.end_point,
        distance_km: parseFloat(formData.distance_km),
        estimated_time: parseInt(formData.estimated_time),
      };

      if (editingRoute) {
        const { error } = await supabase
          .from('routes')
          .update(routeData)
          .eq('id', editingRoute.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('routes')
          .insert(routeData);

        if (error) throw error;
      }

      setModalVisible(false);
      fetchRoutes();
      Alert.alert('Success', `Route ${editingRoute ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving route:', error);
      Alert.alert('Error', 'Could not save route. Please try again.');
    }
  };

  const deleteRoute = (route: Route) => {
    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete ${route.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('routes')
                .delete()
                .eq('id', route.id);

              if (error) throw error;
              
              fetchRoutes();
              Alert.alert('Success', 'Route deleted successfully');
            } catch (error) {
              console.error('Error deleting route:', error);
              Alert.alert('Error', 'Could not delete route. Please try again.');
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statText}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <MaterialIcons name={icon} size={32} color={color} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your transport system</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Trips"
            value={stats.totalTrips}
            icon="directions-bus"
            color="#1E40AF"
          />
          <StatCard
            title="Active Trips"
            value={stats.activeTrips}
            icon="play-arrow"
            color="#059669"
          />
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            icon="people"
            color="#EA580C"
          />
          <StatCard
            title="Revenue (ZMW)"
            value={`${stats.totalRevenue.toFixed(2)}`}
            icon="attach-money"
            color="#7C3AED"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Route Management</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openModal()}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Route</Text>
            </TouchableOpacity>
          </View>

          {routes.map((route) => (
            <View key={route.id} style={styles.routeItem}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.name}</Text>
                <Text style={styles.routeDetails}>
                  {route.start_point} → {route.end_point}
                </Text>
                <Text style={styles.routeMetrics}>
                  {route.distance_km}km • {route.estimated_time} min
                </Text>
              </View>
              <View style={styles.routeActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openModal(route)}
                >
                  <MaterialIcons name="edit" size={18} color="#1E40AF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteRoute(route)}
                >
                  <MaterialIcons name="delete" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Route Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="e.g., Lusaka - Kitwe Express"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Point</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.start_point}
                  onChangeText={(text) => setFormData({ ...formData, start_point: text })}
                  placeholder="e.g., Lusaka Central"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End Point</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.end_point}
                  onChangeText={(text) => setFormData({ ...formData, end_point: text })}
                  placeholder="e.g., Kitwe CBD"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Distance (km)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.distance_km}
                    onChangeText={(text) => setFormData({ ...formData, distance_km: text })}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Time (minutes)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.estimated_time}
                    onChangeText={(text) => setFormData({ ...formData, estimated_time: text })}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveRoute}>
                <Text style={styles.saveButtonText}>
                  {editingRoute ? 'Update Route' : 'Create Route'}
                </Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#7C3AED',
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
    color: '#C4B5FD',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  addButton: {
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  routeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    marginBottom: 2,
  },
  routeMetrics: {
    fontSize: 12,
    color: '#6B7280',
  },
  routeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
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
    maxHeight: '90%',
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
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
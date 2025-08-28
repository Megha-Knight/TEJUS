import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Navigation, 
  Clock, 
  Heart,
  Building2,
  Pill,
  RefreshCw
} from 'lucide-react-native';
import { getNearbyFacilities, MedicalFacility } from '@/utils/medicalFacilities';


export default function GoToSaveScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [nearbyFacilities, setNearbyFacilities] = useState<MedicalFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hospital' | 'pharmacy'>('all');

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    setIsLoading(true);
    setLocationError(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please enable location services.');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setUserLocation(location);
      
      // Get nearby facilities based on current location
      const facilities = await getNearbyFacilities(location);
      setNearbyFacilities(facilities);
      
    } catch (error) {
      console.error('Failed to get location and facilities:', error);
      setLocationError('Unable to get your location. Please check your GPS settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await initializeLocation();
  };

  const openDirections = async (facility: MedicalFacility) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const { latitude, longitude } = facility.coordinates;
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    });

    try {
      await Linking.openURL(url);
    } catch (error) {
      // Fallback to web maps
      await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
    }
  };

  const makeCall = async (phone: string, name: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      Alert.alert('Error', 'Unable to make call');
    }
  };

  const openInGoogleMaps = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (userLocation) {
      const { latitude, longitude } = userLocation.coords;
      const url = `https://www.google.com/maps/search/hospitals+near+me/@${latitude},${longitude},15z`;
      await Linking.openURL(url);
    } else {
      await Linking.openURL('https://www.google.com/maps/search/hospitals+near+me');
    }
  };

  const filteredFacilities = nearbyFacilities.filter(facility => 
    selectedCategory === 'all' || facility.type === selectedCategory
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Help Nearby</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Finding nearby medical facilities...</Text>
          <Text style={styles.loadingSubtext}>Getting your location and searching for hospitals</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Help Nearby</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.errorContainer}>
          <MapPin size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Location Required</Text>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Heart size={20} color="#DC2626" />;
      case 'clinic':
        return <Building2 size={20} color="#1E40AF" />;
      case 'pharmacy':
        return <Pill size={20} color="#059669" />;
      default:
        return <Heart size={20} color="#DC2626" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Help Nearby</Text>
        <TouchableOpacity style={styles.headerButton} onPress={openInGoogleMaps}>
          <MapPin size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.locationBar}>
        <MapPin size={16} color="#10B981" />
        <Text style={styles.locationText}>
          {userLocation 
            ? `${userLocation.coords.latitude.toFixed(4)}, ${userLocation.coords.longitude.toFixed(4)}`
            : 'Location not available'
          }
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshLocation}>
          <RefreshCw size={16} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryFilter}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedCategory === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.filterText, selectedCategory === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedCategory === 'hospital' && styles.filterButtonActive]}
          onPress={() => setSelectedCategory('hospital')}
        >
          <Text style={[styles.filterText, selectedCategory === 'hospital' && styles.filterTextActive]}>
            Hospitals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedCategory === 'pharmacy' && styles.filterButtonActive]}
          onPress={() => setSelectedCategory('pharmacy')}
        >
          <Text style={[styles.filterText, selectedCategory === 'pharmacy' && styles.filterTextActive]}>
            Pharmacies
          </Text>
        </TouchableOpacity>
      </View>

      {filteredFacilities.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No {selectedCategory === 'all' ? 'medical facilities' : selectedCategory + 's'} found nearby</Text>
        </View>
      )}

      <ScrollView style={styles.facilitiesList} showsVerticalScrollIndicator={false}>
        {filteredFacilities.map((facility) => (
          <View key={facility.id} style={styles.facilityCard}>
            <View style={styles.facilityHeader}>
              <View style={styles.facilityInfo}>
                <View style={styles.facilityTitleRow}>
                  {getTypeIcon(facility.type)}
                  <Text style={styles.facilityName}>{facility.name}</Text>
                  <View style={[styles.statusBadge, facility.isOpen ? styles.openBadge : styles.closedBadge]}>
                    <Text style={[styles.statusText, facility.isOpen ? styles.openText : styles.closedText]}>
                      {facility.isOpen ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.facilityAddress}>{facility.address}</Text>
                {facility.specialties && (
                  <Text style={styles.specialties}>
                    {facility.specialties.join(' • ')}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.facilityMeta}>
              <View style={styles.metaItem}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.metaText}>{facility.distance.toFixed(1)} km</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.metaText}>{facility.estimatedTime}</Text>
              </View>
            </View>

            <View style={styles.facilityActions}>
              <TouchableOpacity 
                style={styles.callButton}
                onPress={() => makeCall(facility.phone, facility.name)}
              >
                <Phone size={18} color="#FFFFFF" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.directionsButton}
                onPress={() => openDirections(facility)}
              >
                <Navigation size={18} color="#FFFFFF" />
                <Text style={styles.directionsButtonText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.emergencyFooter}>
        <TouchableOpacity 
          style={styles.emergencyCallButton}
          onPress={() => makeCall('108', 'Emergency Services')}
        >
          <Phone size={20} color="#FFFFFF" />
          <Text style={styles.emergencyCallText}>Emergency Call 108</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#10B981',
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
  },
  categoryFilter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  filterButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  facilitiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  facilityCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  facilityHeader: {
    marginBottom: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  closedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  openText: {
    color: '#10B981',
  },
  closedText: {
    color: '#EF4444',
  },
  facilityAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  specialties: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  facilityMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 6,
  },
  facilityActions: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  directionsButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  emergencyFooter: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  emergencyCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
  },
  emergencyCallText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
});
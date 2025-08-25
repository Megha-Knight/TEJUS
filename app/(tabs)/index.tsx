import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Camera, MapPin, MessageSquare, Shield, Navigation, Wifi } from 'lucide-react-native';

export default function EmergencyScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Getting location...');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('Location permission denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setLocationStatus('Location ready');
    } catch (error) {
      setLocationStatus('Location unavailable');
    }
  };

  const handleSnapToSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/camera');
  };

  const handleGoToSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/go-to-save');
  };

  const handleSMSToSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/sms-to-save');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Response System</Text>
          <Text style={styles.subtitle}>Quick access to emergency services across Tamil Nadu</Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#10B981" />
            <Text style={styles.locationText}>{locationStatus}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleSnapToSave}
            activeOpacity={0.8}
          >
            <Camera size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Snap to Save</Text>
            <Text style={styles.buttonSubtext}>Instant accident detection & reporting</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleGoToSave}
            activeOpacity={0.8}
          >
            <Navigation size={24} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>Go to Save</Text>
            <Text style={styles.buttonSubtext}>Find nearest hospitals & medical facilities</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.tertiaryButton]} 
            onPress={handleSMSToSave}
            activeOpacity={0.8}
          >
            <Wifi size={24} color="#FFFFFF" />
            <Text style={styles.tertiaryButtonText}>SMS to Save</Text>
            <Text style={styles.buttonSubtext}>Offline emergency reporting via SMS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Shield size={20} color="#10B981" />
            <Text style={styles.infoText}>
              Emergency response system powered by AI detection and real-time location services
            </Text>
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>How it works:</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>1</Text>
            <Text style={styles.featureText}>Tap "Snap to Save" to open camera</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>2</Text>
            <Text style={styles.featureText}>AI analyzes accident type and severity</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>3</Text>
            <Text style={styles.featureText}>Location is automatically pinned</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>4</Text>
            <Text style={styles.featureText}>Report sent to emergency services instantly</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 6,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 32,
  },
  button: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: '#DC2626',
  },
  secondaryButton: {
    backgroundColor: '#1E40AF',
  },
  tertiaryButton: {
    backgroundColor: '#EA580C',
  },
  primaryButtonText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  tertiaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    marginLeft: 12,
    flex: 1,
  },
  features: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
    backgroundColor: '#1F2937',
    width: 28,
    height: 28,
    textAlign: 'center',
    lineHeight: 28,
    borderRadius: 14,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    flex: 1,
  },
});
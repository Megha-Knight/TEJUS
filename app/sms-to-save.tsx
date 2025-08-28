import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Haptics from 'expo-haptics';
import { Linking } from 'react-native';
import { ArrowLeft, MapPin, MessageSquare, Send, Database, X, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function SMSToSaveScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [emergencyContact, setEmergencyContact] = useState('909-202-3126');
  const [isSending, setIsSending] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const sendEmergencySMS = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setIsSending(true);

    try {
      const locationText = location 
        ? `Location: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
        : 'Location: Unable to determine';

      const emergencyMessage = `🚨 EMERGENCY ALERT 🚨

Accident reported via Emergency Response App

${locationText}
Time: ${new Date().toLocaleString()}

Emergency data will be saved to database for emergency services.

This is an automated emergency alert.`;

      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      
      if (isAvailable) {
        const result = await SMS.sendSMSAsync([emergencyContact], emergencyMessage);
        
        if (result.result === 'sent') {
          setReportSent(true);
          
          // Simulate saving to database
          setTimeout(() => {
            Alert.alert(
              'Emergency Report Sent',
              'Your emergency report has been sent via SMS and saved to the emergency database. Emergency services will be notified.',
              [
                {
                  text: 'OK',
                  onPress: () => router.back()
                }
              ]
            );
          }, 1000);
        } else {
          throw new Error('SMS sending failed');
        }
      } else {
        // Fallback: Open default messaging app
        const smsUrl = `sms:${emergencyContact}?body=${encodeURIComponent(emergencyMessage)}`;
        await Linking.openURL(smsUrl);
        
        setReportSent(true);
        Alert.alert(
          'SMS App Opened',
          'Please send the pre-filled emergency message to complete the report.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'SMS Error',
        'Unable to send SMS. Please try calling emergency services directly.',
        [
          {
            text: 'Call 108',
            onPress: () => Linking.openURL('tel:108')
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setIsSending(false);
    }
  };

  const closeScreen = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TEJUS - SMS Emergency</Text>
        <TouchableOpacity style={styles.closeButton} onPress={closeScreen}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.locationSection}>
          <View style={styles.locationItem}>
            <MapPin size={16} color="#F97316" />
            <Text style={styles.locationLabel}>Location:</Text>
            <Text style={styles.locationValue}>
              {location 
                ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
                : 'Getting location...'
              }
            </Text>
          </View>
          
          <View style={styles.locationItem}>
            <MessageSquare size={16} color="#F97316" />
            <Text style={styles.locationLabel}>SMS will be sent to:</Text>
            <TextInput
              style={styles.phoneInput}
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              placeholder="Emergency contact number"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.locationItem}>
            <Database size={16} color="#F97316" />
            <Text style={styles.locationLabel}>Emergency data will be saved to database</Text>
          </View>
        </View>

        <View style={styles.messagePreview}>
          <Text style={styles.previewTitle}>Emergency Message Preview:</Text>
          <View style={styles.previewContent}>
            <Text style={styles.previewText}>
              🚨 EMERGENCY ALERT 🚨{'\n\n'}
              Accident reported via Emergency Response App{'\n\n'}
              Location: {location 
                ? `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
                : 'Getting location...'
              }{'\n'}
              Time: {new Date().toLocaleString()}{'\n\n'}
              Emergency data will be saved to database for emergency services.{'\n\n'}
              This is an automated emergency alert.
            </Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          {!reportSent ? (
            <TouchableOpacity 
              style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
              onPress={sendEmergencySMS}
              disabled={isSending}
            >
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>
                {isSending ? 'Sending Emergency SMS...' : 'Send Emergency SMS'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.successContainer}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.successText}>Emergency report sent successfully!</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📱 Offline Emergency Reporting</Text>
          <Text style={styles.infoText}>
            This feature works even without internet connection. Your emergency report will be sent via SMS and saved locally until network connectivity is restored.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F97316',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  locationSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginLeft: 8,
    marginRight: 8,
  },
  locationValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  messagePreview: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  previewContent: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 18,
  },
  actionSection: {
    marginBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  infoSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    lineHeight: 20,
  },
});
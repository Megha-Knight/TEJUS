import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Phone, MessageSquare, MapPin } from 'lucide-react-native';

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  color: string;
  description: string;
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Ambulance',
    number: '108',
    color: '#DC2626',
    description: 'Medical emergencies & patient transport'
  },
  {
    id: '2',
    name: 'Police',
    number: '100',
    color: '#1E40AF',
    description: 'Crime reporting & law enforcement'
  },
  {
    id: '3',
    name: 'Fire Service',
    number: '101',
    color: '#EA580C',
    description: 'Fire emergencies & rescue operations'
  },
  {
    id: '4',
    name: 'Emergency Disaster',
    number: '108',
    color: '#7C3AED',
    description: 'Natural disasters & emergency coordination'
  },
  {
    id: '5',
    name: 'Women Helpline',
    number: '1091',
    color: '#DB2777',
    description: 'Women safety & harassment reporting'
  }
];

export default function ContactsScreen() {
  const makeCall = async (number: string, name: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      await Linking.openURL(`tel:${number}`);
    } catch (error) {
      console.error('Failed to make call:', error);
    }
  };

  const sendSMS = async (number: string, name: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const message = `Emergency alert sent via Emergency Response App. Location will be shared if available.`;
      await Linking.openURL(`sms:${number}?body=${encodeURIComponent(message)}`);
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Phone size={32} color="#DC2626" />
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.subtitle}>Quick access to emergency services across Tamil Nadu</Text>
        </View>

        <View style={styles.contactsGrid}>
          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={[styles.contactNumber, { color: contact.color }]}>
                  {contact.number}
                </Text>
              </View>
              
              <Text style={styles.contactDescription}>{contact.description}</Text>
              
              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: contact.color }]}
                  onPress={() => makeCall(contact.number, contact.name)}
                  activeOpacity={0.8}
                >
                  <Phone size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.smsButton]}
                  onPress={() => sendSMS(contact.number, contact.name)}
                  activeOpacity={0.8}
                >
                  <MessageSquare size={20} color="#6B7280" />
                  <Text style={styles.smsButtonText}>SMS</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.locationCard}>
          <MapPin size={24} color="#10B981" />
          <View style={styles.locationContent}>
            <Text style={styles.locationTitle}>Location Services</Text>
            <Text style={styles.locationText}>
              Your location will be automatically shared with emergency services when you use the contact options above.
            </Text>
          </View>
        </View>

        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyInfoTitle}>🚨 Emergency Guidelines</Text>
          <Text style={styles.emergencyInfoText}>
            • Stay calm and speak clearly{'\n'}
            • Provide your exact location{'\n'}
            • Describe the nature of emergency{'\n'}
            • Follow dispatcher instructions{'\n'}
            • Keep phone line open unless told otherwise
          </Text>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  contactsGrid: {
    gap: 16,
    marginBottom: 32,
  },
  contactCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  contactNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  contactDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginBottom: 16,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  smsButton: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  smsButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 8,
  },
  locationCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  locationContent: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    lineHeight: 18,
  },
  emergencyInfo: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  emergencyInfoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emergencyInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    lineHeight: 22,
  },
});
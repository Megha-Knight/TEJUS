import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Linking, Platform } from 'react-native';

export interface AccidentReport {
  type: string;
  severity: string;
  estimatedInjuries: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  timestamp: Date;
  imageUri?: string;
}

export interface EmergencyContact {
  name: string;
  number: string;
  type: 'call' | 'sms';
}

export const emergencyContacts: EmergencyContact[] = [
  { name: 'Ambulance', number: '108', type: 'call' },
  { name: 'Police', number: '100', type: 'call' },
  { name: 'Fire Service', number: '101', type: 'call' },
  { name: 'Emergency Disaster', number: '108', type: 'call' },
];

export const sendEmergencyReport = async (report: AccidentReport): Promise<boolean> => {
  try {
    // In a real app, this would send to emergency services API
    console.log('Sending emergency report:', report);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Failed to send emergency report:', error);
    return false;
  }
};

export const sendEmergencySMS = async (report: AccidentReport): Promise<boolean> => {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    
    if (!isAvailable) {
      // Fallback to phone app with pre-filled message
      const message = createEmergencyMessage(report);
      await Linking.openURL(`tel:108`);
      return true;
    }

    const message = createEmergencyMessage(report);
    
    const result = await SMS.sendSMSAsync(['108', '100'], message);
    
    return result.result === 'sent';
  } catch (error) {
    console.error('Failed to send emergency SMS:', error);
    return false;
  }
};

export const createEmergencyMessage = (report: AccidentReport): string => {
  let message = `🚨 EMERGENCY ALERT 🚨\n\n`;
  message += `Accident Type: ${report.type}\n`;
  message += `Severity: ${report.severity}\n`;
  message += `Estimated Injuries: ${report.estimatedInjuries}\n`;
  message += `Time: ${report.timestamp.toLocaleString()}\n\n`;
  
  if (report.location) {
    message += `📍 Location:\n`;
    message += `Lat: ${report.location.latitude.toFixed(6)}\n`;
    message += `Lng: ${report.location.longitude.toFixed(6)}\n`;
    if (report.location.address) {
      message += `Address: ${report.location.address}\n`;
    }
    message += `\nGoogle Maps: https://maps.google.com/?q=${report.location.latitude},${report.location.longitude}\n\n`;
  }
  
  message += `Sent via Emergency Response App`;
  
  return message;
};

export const makeEmergencyCall = async (number: string): Promise<void> => {
  try {
    await Linking.openURL(`tel:${number}`);
  } catch (error) {
    console.error('Failed to make emergency call:', error);
    throw error;
  }
};

export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    return location;
  } catch (error) {
    console.error('Failed to get location:', error);
    return null;
  }
};
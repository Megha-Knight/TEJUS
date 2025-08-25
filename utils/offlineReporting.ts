import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineEmergencyReport {
  id: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  reportType: 'accident' | 'medical' | 'fire' | 'general';
  description?: string;
  contactNumber: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
}

const STORAGE_KEY = 'emergency_reports_offline';
const MAX_RETRY_ATTEMPTS = 3;

export const createOfflineReport = async (
  reportType: OfflineEmergencyReport['reportType'],
  contactNumber: string,
  description?: string
): Promise<OfflineEmergencyReport> => {
  const reportId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Get current location
  let locationData = null;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      };
    }
  } catch (error) {
    console.error('Failed to get location for offline report:', error);
  }

  const report: OfflineEmergencyReport = {
    id: reportId,
    timestamp: new Date(),
    location: locationData,
    reportType,
    description,
    contactNumber,
    status: 'pending',
    retryCount: 0
  };

  // Save to local storage
  await saveReportToStorage(report);
  
  return report;
};

export const sendOfflineReportViaSMS = async (
  report: OfflineEmergencyReport
): Promise<boolean> => {
  try {
    const message = formatEmergencyMessage(report);
    
    // Check if SMS is available
    const isAvailable = await SMS.isAvailableAsync();
    
    if (isAvailable) {
      const result = await SMS.sendSMSAsync([report.contactNumber], message);
      
      if (result.result === 'sent') {
        // Update report status
        report.status = 'sent';
        await updateReportInStorage(report);
        return true;
      } else {
        throw new Error('SMS sending failed');
      }
    } else {
      // Fallback: Open default messaging app
      const smsUrl = `sms:${report.contactNumber}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(smsUrl);
      
      // Mark as sent (user will manually send)
      report.status = 'sent';
      await updateReportInStorage(report);
      return true;
    }
  } catch (error) {
    console.error('Failed to send offline report via SMS:', error);
    
    // Update retry count
    report.retryCount += 1;
    if (report.retryCount >= MAX_RETRY_ATTEMPTS) {
      report.status = 'failed';
    }
    await updateReportInStorage(report);
    
    return false;
  }
};

export const formatEmergencyMessage = (report: OfflineEmergencyReport): string => {
  let message = `🚨 EMERGENCY ALERT - TEJUS APP 🚨\n\n`;
  
  message += `Report Type: ${report.reportType.toUpperCase()}\n`;
  message += `Time: ${report.timestamp.toLocaleString()}\n`;
  message += `Report ID: ${report.id}\n\n`;
  
  if (report.location) {
    message += `📍 LOCATION:\n`;
    message += `Lat: ${report.location.latitude.toFixed(6)}\n`;
    message += `Lng: ${report.location.longitude.toFixed(6)}\n`;
    if (report.location.accuracy) {
      message += `Accuracy: ±${report.location.accuracy.toFixed(0)}m\n`;
    }
    message += `\nGoogle Maps: https://maps.google.com/?q=${report.location.latitude},${report.location.longitude}\n\n`;
  } else {
    message += `📍 LOCATION: Unable to determine\n\n`;
  }
  
  if (report.description) {
    message += `Description: ${report.description}\n\n`;
  }
  
  message += `⚠️ This is an automated emergency alert sent via TEJUS Emergency Response App.\n`;
  message += `Emergency data has been saved to database for emergency services coordination.\n\n`;
  message += `Please respond immediately if this is a genuine emergency.`;
  
  return message;
};

const saveReportToStorage = async (report: OfflineEmergencyReport): Promise<void> => {
  try {
    const existingReports = await getStoredReports();
    const updatedReports = [...existingReports, report];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
  } catch (error) {
    console.error('Failed to save report to storage:', error);
  }
};

const updateReportInStorage = async (updatedReport: OfflineEmergencyReport): Promise<void> => {
  try {
    const existingReports = await getStoredReports();
    const updatedReports = existingReports.map(report => 
      report.id === updatedReport.id ? updatedReport : report
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
  } catch (error) {
    console.error('Failed to update report in storage:', error);
  }
};

export const getStoredReports = async (): Promise<OfflineEmergencyReport[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get stored reports:', error);
    return [];
  }
};

export const getPendingReports = async (): Promise<OfflineEmergencyReport[]> => {
  const allReports = await getStoredReports();
  return allReports.filter(report => report.status === 'pending' && report.retryCount < MAX_RETRY_ATTEMPTS);
};

export const retryPendingReports = async (): Promise<number> => {
  const pendingReports = await getPendingReports();
  let successCount = 0;
  
  for (const report of pendingReports) {
    const success = await sendOfflineReportViaSMS(report);
    if (success) {
      successCount++;
    }
  }
  
  return successCount;
};

export const clearOldReports = async (olderThanDays: number = 30): Promise<void> => {
  try {
    const allReports = await getStoredReports();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const recentReports = allReports.filter(report => 
      new Date(report.timestamp) > cutoffDate
    );
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recentReports));
  } catch (error) {
    console.error('Failed to clear old reports:', error);
  }
};
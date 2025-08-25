import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { X, Camera, RotateCcw, Zap, MapPin, Send, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Camera size={48} color="#DC2626" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need camera permission to capture accident photos and enable emergency reporting.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setHasFlash(!hasFlash);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    try {
      setIsAnalyzing(true);
      
      // Simulate photo capture
      const photo = await cameraRef.current.takePictureAsync();
      
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let locationData = null;
      
      if (status === 'granted') {
        locationData = await Location.getCurrentPositionAsync({});
      }

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI analysis results
      const analysisResults = {
        accidentType: 'Vehicle Collision',
        severity: 'Moderate',
        estimatedInjuries: 2,
        confidence: 0.89,
        location: locationData ? {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          address: 'Chennai - Bangalore Highway, km 45'
        } : null
      };

      setIsAnalyzing(false);
      
      Alert.alert(
        'Analysis Complete',
        `Accident Type: ${analysisResults.accidentType}\n` +
        `Severity: ${analysisResults.severity}\n` +
        `Estimated Injuries: ${analysisResults.estimatedInjuries}\n` +
        `Confidence: ${(analysisResults.confidence * 100).toFixed(0)}%\n\n` +
        'Emergency services have been notified.',
        [
          { 
            text: 'Send Report', 
            onPress: () => {
              Alert.alert('Report Sent', 'Emergency services have been notified with your location and accident details.');
              router.back();
            }
          },
          { text: 'Retake Photo', style: 'cancel' }
        ]
      );
      
    } catch (error) {
      setIsAnalyzing(false);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const closeCamera = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
        flash={hasFlash ? 'on' : 'off'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={closeCamera}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Camera</Text>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
            <Zap size={24} color={hasFlash ? "#F59E0B" : "#FFFFFF"} />
          </TouchableOpacity>
        </View>

        <View style={styles.overlay}>
          <View style={styles.instructionContainer}>
            <AlertTriangle size={24} color="#F59E0B" />
            <Text style={styles.instructionText}>
              Point camera at accident scene. AI will analyze the situation automatically.
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <RotateCcw size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]} 
            onPress={capturePhoto}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <View style={styles.analyzing}>
                <Text style={styles.analyzingText}>Analyzing...</Text>
              </View>
            ) : (
              <>
                <Camera size={32} color="#FFFFFF" />
                <Text style={styles.captureText}>Capture</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.locationButton}>
            <MapPin size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomInfo}>
          <View style={styles.infoItem}>
            <Send size={16} color="#10B981" />
            <Text style={styles.infoText}>Auto-report to emergency services</Text>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={16} color="#10B981" />
            <Text style={styles.infoText}>GPS location will be included</Text>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  instructionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  flipButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 28,
  },
  captureButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  captureText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  analyzing: {
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  locationButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 28,
  },
  bottomInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
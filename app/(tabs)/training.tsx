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
import { Camera, Play, ExternalLink } from 'lucide-react-native';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
}

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Basic First Aid Tutorial',
    description: 'Learn essential first aid techniques for emergencies',
    thumbnail: 'https://images.pexels.com/photos/6994322/pexels-photo-6994322.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=BQRMDj_hDUY',
    duration: '8:24'
  },
  {
    id: '2',
    title: 'CPR Tutorial',
    description: 'Step-by-step guide to performing CPR correctly',
    thumbnail: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=a8RhpHCO_N8',
    duration: '5:12'
  },
  {
    id: '3',
    title: 'Wound Care & Bandaging',
    description: 'Proper techniques for wound cleaning and bandaging',
    thumbnail: 'https://images.pexels.com/photos/6975442/pexels-photo-6975442.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=GGE71dnrxks',
    duration: '6:45'
  },
  {
    id: '4',
    title: 'Emergency Response for Vehicle Accidents',
    description: 'How to respond safely to road traffic accidents',
    thumbnail: 'https://images.pexels.com/photos/6975465/pexels-photo-6975465.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=RQMXM0f8C1A',
    duration: '9:30'
  }
];

export default function TrainingScreen() {
  const openVideo = async (videoUrl: string, title: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      await Linking.openURL(videoUrl);
    } catch (error) {
      console.error('Failed to open video:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Camera size={32} color="#DC2626" />
          <Text style={styles.title}>Emergency Medical Training</Text>
          <Text style={styles.subtitle}>Essential skills for emergency situations</Text>
        </View>

        <View style={styles.tutorialSection}>
          {tutorials.map((tutorial) => (
            <TouchableOpacity
              key={tutorial.id}
              style={styles.tutorialCard}
              onPress={() => openVideo(tutorial.videoUrl, tutorial.title)}
              activeOpacity={0.8}
            >
              <View style={styles.thumbnailContainer}>
                <View style={styles.thumbnail}>
                  <Camera size={40} color="#6B7280" />
                </View>
                <View style={styles.playOverlay}>
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                </View>
                <Text style={styles.duration}>{tutorial.duration}</Text>
              </View>
              
              <View style={styles.tutorialContent}>
                <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
                <Text style={styles.tutorialDescription}>{tutorial.description}</Text>
                
                <View style={styles.tutorialFooter}>
                  <ExternalLink size={16} color="#DC2626" />
                  <Text style={styles.watchText}>Watch on YouTube</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.emergencyTip}>
          <Text style={styles.tipTitle}>💡 Emergency Tip</Text>
          <Text style={styles.tipText}>
            Download these videos for offline viewing when network connectivity is limited during emergencies.
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
  tutorialSection: {
    gap: 16,
    marginBottom: 32,
  },
  tutorialCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnailContainer: {
    height: 180,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  tutorialContent: {
    padding: 16,
  },
  tutorialTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tutorialDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 12,
  },
  tutorialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginLeft: 6,
  },
  emergencyTip: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    lineHeight: 20,
  },
});
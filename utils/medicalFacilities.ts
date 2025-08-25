import * as Location from 'expo-location';
import { Linking } from 'react-native';

export interface MedicalFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'emergency_center';
  address: string;
  phone: string;
  distance: number; // in kilometers
  estimatedTime: string;
  isOpen: boolean;
  rating?: number;
  specialties?: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  emergencyServices?: boolean;
  hasAmbulance?: boolean;
}

// Mock data for Tamil Nadu medical facilities
export const tamilNaduMedicalFacilities: MedicalFacility[] = [
  {
    id: '1',
    name: 'Salem Government Hospital',
    type: 'hospital',
    address: 'Omalur Main Road, Salem, Tamil Nadu 636003',
    phone: '+91-427-2444444',
    distance: 1.1,
    estimatedTime: '3 mins',
    isOpen: true,
    rating: 4.2,
    specialties: ['Emergency Medicine', 'Trauma Care', 'ICU', 'Surgery'],
    coordinates: { latitude: 11.6740, longitude: 78.1489 },
    emergencyServices: true,
    hasAmbulance: true
  },
  {
    id: '2',
    name: 'Manipal Hospital Salem',
    type: 'hospital',
    address: 'Dalmia Board, Salem, Tamil Nadu 636004',
    phone: '+91-427-2677777',
    distance: 2.1,
    estimatedTime: '6 mins',
    isOpen: true,
    rating: 4.5,
    specialties: ['Emergency', 'Cardiology', 'Neurology', 'Orthopedics'],
    coordinates: { latitude: 11.6640, longitude: 78.1389 },
    emergencyServices: true,
    hasAmbulance: true
  },
  {
    id: '3',
    name: 'KMC Specialty Hospital',
    type: 'hospital',
    address: 'Attur Road, Salem, Tamil Nadu 636007',
    phone: '+91-427-2555555',
    distance: 3.2,
    estimatedTime: '8 mins',
    isOpen: true,
    rating: 4.3,
    specialties: ['Emergency', 'Orthopedics', 'General Surgery', 'Pediatrics'],
    coordinates: { latitude: 11.6540, longitude: 78.1289 },
    emergencyServices: true,
    hasAmbulance: false
  },
  {
    id: '4',
    name: 'Apollo Pharmacy',
    type: 'pharmacy',
    address: 'Junction Main Road, Salem, Tamil Nadu 636001',
    phone: '+91-427-2333333',
    distance: 0.8,
    estimatedTime: '2 mins',
    isOpen: true,
    rating: 4.1,
    coordinates: { latitude: 11.6780, longitude: 78.1520 },
    emergencyServices: false,
    hasAmbulance: false
  },
  {
    id: '5',
    name: 'MedPlus Pharmacy',
    type: 'pharmacy',
    address: 'Cherry Road, Salem, Tamil Nadu 636002',
    phone: '+91-427-2222222',
    distance: 1.5,
    estimatedTime: '4 mins',
    isOpen: false,
    rating: 3.9,
    coordinates: { latitude: 11.6680, longitude: 78.1420 },
    emergencyServices: false,
    hasAmbulance: false
  },
  {
    id: '6',
    name: 'Primary Health Centre',
    type: 'clinic',
    address: 'Mettur Road, Salem, Tamil Nadu 636005',
    phone: '+91-427-2111111',
    distance: 2.8,
    estimatedTime: '7 mins',
    isOpen: true,
    rating: 3.8,
    specialties: ['General Medicine', 'Basic Emergency Care'],
    coordinates: { latitude: 11.6440, longitude: 78.1189 },
    emergencyServices: true,
    hasAmbulance: false
  }
];

export const calculateDistance = (
  userLat: number,
  userLng: number,
  facilityLat: number,
  facilityLng: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (facilityLat - userLat) * Math.PI / 180;
  const dLng = (facilityLng - userLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(facilityLat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getNearbyFacilities = async (
  userLocation: Location.LocationObject,
  type?: 'hospital' | 'clinic' | 'pharmacy'
): Promise<MedicalFacility[]> => {
  const { latitude, longitude } = userLocation.coords;
  
  let facilities = tamilNaduMedicalFacilities.map(facility => ({
    ...facility,
    distance: calculateDistance(latitude, longitude, facility.coordinates.latitude, facility.coordinates.longitude)
  }));

  if (type) {
    facilities = facilities.filter(facility => facility.type === type);
  }

  // Sort by distance
  facilities.sort((a, b) => a.distance - b.distance);

  // Update estimated time based on actual distance
  facilities = facilities.map(facility => ({
    ...facility,
    estimatedTime: `${Math.ceil(facility.distance * 2)} mins` // Rough estimate: 2 mins per km
  }));

  return facilities;
};

export const openDirectionsToFacility = async (facility: MedicalFacility): Promise<void> => {
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

export const callFacility = async (phone: string): Promise<void> => {
  try {
    await Linking.openURL(`tel:${phone}`);
  } catch (error) {
    throw new Error('Unable to make call');
  }
};

export const findNearestHospital = (
  userLocation: Location.LocationObject
): MedicalFacility | null => {
  const hospitals = tamilNaduMedicalFacilities.filter(f => f.type === 'hospital');
  
  if (hospitals.length === 0) return null;
  
  const { latitude, longitude } = userLocation.coords;
  
  let nearest = hospitals[0];
  let minDistance = calculateDistance(latitude, longitude, nearest.coordinates.latitude, nearest.coordinates.longitude);
  
  for (const hospital of hospitals) {
    const distance = calculateDistance(latitude, longitude, hospital.coordinates.latitude, hospital.coordinates.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = hospital;
    }
  }
  
  return {
    ...nearest,
    distance: minDistance,
    estimatedTime: `${Math.ceil(minDistance * 2)} mins`
  };
};
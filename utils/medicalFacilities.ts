import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

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

// Function to search for nearby medical facilities using Google Places API simulation
const searchNearbyFacilities = async (
  latitude: number,
  longitude: number,
  type: 'hospital' | 'pharmacy' | 'clinic',
  radius: number = 10000 // 10km radius
): Promise<MedicalFacility[]> => {
  // In a real app, this would call Google Places API or similar service
  // For now, we'll simulate the API response with realistic data
  
  const facilityTemplates = {
    hospital: [
      { name: 'Government Hospital', phone: '+91-427-244', specialties: ['Emergency', 'Trauma', 'ICU'] },
      { name: 'Apollo Hospital', phone: '+91-427-267', specialties: ['Emergency', 'Cardiology', 'Neurology'] },
      { name: 'Manipal Hospital', phone: '+91-427-255', specialties: ['Emergency', 'Orthopedics', 'Surgery'] },
      { name: 'KMC Hospital', phone: '+91-427-233', specialties: ['Emergency', 'Pediatrics', 'General Medicine'] },
      { name: 'Primary Health Centre', phone: '+91-427-211', specialties: ['General Medicine', 'Basic Emergency'] },
    ],
    pharmacy: [
      { name: 'Apollo Pharmacy', phone: '+91-427-333' },
      { name: 'MedPlus', phone: '+91-427-222' },
      { name: 'Netmeds', phone: '+91-427-444' },
      { name: 'Wellness Forever', phone: '+91-427-555' },
      { name: 'Local Medical Store', phone: '+91-427-666' },
    ],
    clinic: [
      { name: 'Family Clinic', phone: '+91-427-777', specialties: ['General Medicine'] },
      { name: 'Dental Clinic', phone: '+91-427-888', specialties: ['Dental Care'] },
      { name: 'Eye Care Center', phone: '+91-427-999', specialties: ['Ophthalmology'] },
    ]
  };

  const templates = facilityTemplates[type];
  const facilities: MedicalFacility[] = [];

  // Generate realistic nearby facilities
  for (let i = 0; i < Math.min(templates.length, 5); i++) {
    const template = templates[i];
    const distance = Math.random() * 8 + 0.5; // 0.5 to 8.5 km
    const estimatedTime = Math.ceil(distance * 2.5); // Rough estimate
    
    // Generate coordinates within radius
    const angle = Math.random() * 2 * Math.PI;
    const radiusInDegrees = (distance / 111); // Rough conversion km to degrees
    const facilityLat = latitude + (radiusInDegrees * Math.cos(angle));
    const facilityLng = longitude + (radiusInDegrees * Math.sin(angle));

    facilities.push({
      id: `${type}_${i + 1}`,
      name: template.name,
      type,
      address: `Near ${template.name}, Tamil Nadu`,
      phone: `${template.phone}${Math.floor(1000 + Math.random() * 9000)}`,
      distance,
      estimatedTime: `${estimatedTime} mins`,
      isOpen: Math.random() > 0.2, // 80% chance of being open
      rating: 3.5 + Math.random() * 1.5,
      specialties: template.specialties,
      coordinates: {
        latitude: facilityLat,
        longitude: facilityLng,
      },
      emergencyServices: type === 'hospital',
      hasAmbulance: type === 'hospital' && Math.random() > 0.3,
    });
  }

  return facilities.sort((a, b) => a.distance - b.distance);
};

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
  
  try {
    // Search for different types of facilities
    const hospitalPromise = searchNearbyFacilities(latitude, longitude, 'hospital');
    const pharmacyPromise = searchNearbyFacilities(latitude, longitude, 'pharmacy');
    const clinicPromise = searchNearbyFacilities(latitude, longitude, 'clinic');
    
    const [hospitals, pharmacies, clinics] = await Promise.all([
      hospitalPromise,
      pharmacyPromise,
      clinicPromise
    ]);
    
    let allFacilities = [...hospitals, ...pharmacies, ...clinics];

    if (type) {
      allFacilities = allFacilities.filter(facility => facility.type === type);
    }

    // Sort by distance and limit results
    allFacilities.sort((a, b) => a.distance - b.distance);
    
    return allFacilities.slice(0, 20); // Limit to 20 nearest facilities
    
  } catch (error) {
    console.error('Failed to get nearby facilities:', error);
    return [];
  }
};

// Function to get address from coordinates (reverse geocoding simulation)
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    // In a real app, this would use Google Geocoding API or similar
    // For now, we'll return a simulated address
    const areas = ['Main Road', 'Junction', 'Bus Stand', 'Railway Station', 'Market'];
    const cities = ['Salem', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy'];
    
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    return `Near ${randomArea}, ${randomCity}, Tamil Nadu`;
  } catch (error) {
    return 'Tamil Nadu, India';
  }
};

// Function to search for specific facility types near user
export const searchFacilitiesByType = async (
  userLocation: Location.LocationObject,
  facilityType: 'hospital' | 'pharmacy' | 'clinic'
): Promise<MedicalFacility[]> => {
  const { latitude, longitude } = userLocation.coords;
  return await searchNearbyFacilities(latitude, longitude, facilityType);
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
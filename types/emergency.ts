export interface EmergencyReport {
  id: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  accidentAnalysis: {
    type: string;
    severity: string;
    estimatedInjuries: number;
    confidence: number;
  };
  imageUri?: string;
  reportedToServices: boolean;
  smsBackupSent: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface EmergencyService {
  id: string;
  name: string;
  number: string;
  type: 'ambulance' | 'police' | 'fire' | 'disaster' | 'helpline';
  color: string;
}
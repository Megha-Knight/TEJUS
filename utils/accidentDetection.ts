export interface AccidentAnalysis {
  type: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  estimatedInjuries: number;
  confidence: number;
  recommendations: string[];
}

// Simulated AI accident detection
// In a production app, this would connect to a machine learning service
export const analyzeAccidentImage = async (imageUri: string): Promise<AccidentAnalysis> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock analysis results - in production this would use actual AI/ML
  const accidentTypes = [
    'Vehicle Collision',
    'Pedestrian Accident',
    'Motorcycle Accident',
    'Multi-vehicle Crash',
    'Single Vehicle Accident'
  ];
  
  const severityLevels: AccidentAnalysis['severity'][] = ['Minor', 'Moderate', 'Severe', 'Critical'];
  
  const randomType = accidentTypes[Math.floor(Math.random() * accidentTypes.length)];
  const randomSeverity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
  const randomInjuries = Math.floor(Math.random() * 5) + 1;
  const confidence = 0.8 + Math.random() * 0.2; // 80-100% confidence
  
  const recommendations = generateRecommendations(randomSeverity, randomInjuries);
  
  return {
    type: randomType,
    severity: randomSeverity,
    estimatedInjuries: randomInjuries,
    confidence,
    recommendations
  };
};

const generateRecommendations = (severity: string, injuries: number): string[] => {
  const baseRecommendations = [
    'Ensure scene safety before approaching',
    'Call emergency services immediately',
    'Do not move injured persons unless necessary'
  ];
  
  const severityRecommendations: Record<string, string[]> = {
    'Minor': [
      'Apply basic first aid if trained',
      'Document the scene with photos',
      'Exchange contact information'
    ],
    'Moderate': [
      'Check for signs of shock',
      'Apply pressure to bleeding wounds',
      'Keep injured persons warm and calm'
    ],
    'Severe': [
      'Check airways, breathing, circulation',
      'Apply tourniquets if necessary',
      'Prepare for emergency responders'
    ],
    'Critical': [
      'Begin CPR if trained and necessary',
      'Control massive bleeding immediately',
      'Prepare for helicopter evacuation'
    ]
  };
  
  return [
    ...baseRecommendations,
    ...severityRecommendations[severity] || []
  ];
};

export const formatAnalysisForReport = (analysis: AccidentAnalysis): string => {
  return `
AI Analysis Results:
- Type: ${analysis.type}
- Severity: ${analysis.severity}
- Estimated Injuries: ${analysis.estimatedInjuries}
- Confidence: ${(analysis.confidence * 100).toFixed(1)}%

Recommendations:
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}
  `.trim();
};
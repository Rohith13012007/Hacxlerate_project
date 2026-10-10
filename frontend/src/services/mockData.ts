import type {
  UserHealthProfile,
  MedicalReport,
  Prescription,
  MedicineSchedule,
  MedicationLog,
  Appointment,
  NearbyDoctor,
  TimelineEvent,
  DailyActivityStats,
  FoodScanResult,
  HealthImageAnalysis,
  AIConversation
} from '../types';

export const initialProfile: UserHealthProfile = {
  id: 'user_001',
  name: 'Akhil Sharma',
  age: 28,
  gender: 'Male',
  bloodGroup: 'B+',
  heightCm: 175,
  weightKg: 70,
  allergies: ['Penicillin', 'Peanut'],
  existingConditions: ['Mild Eczema', 'Seasonal Asthma'],
  currentMedicines: ['Cetirizine 10mg', 'Vitamin D3 60k IU'],
  emergencyContact: {
    name: 'Rohan Sharma',
    relationship: 'Brother',
    phone: '+91 98765 43210'
  },
  dietPreference: 'Vegetarian',
  languagePreference: 'en'
};

export const initialDailyStats: DailyActivityStats = {
  stepsCount: 6245,
  stepsGoal: 8000,
  waterIntakeMl: 1600,
  waterGoalMl: 2500,
  sleepHours: 7.2,
  sleepGoalHours: 8.0,
  moodRating: 4
};

export const initialReports: MedicalReport[] = [
  {
    id: 'rep_001',
    title: 'Comprehensive Annual Blood Panel',
    date: '2026-10-01',
    doctorName: 'Dr. Ramesh Kumar',
    hospitalName: 'Care Diagnostic Center & Labs',
    reportType: 'Blood Test',
    fileName: 'Blood_Test_Report_Oct2026.pdf',
    values: [
      { parameter: 'Hemoglobin', result: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', isAbnormal: false },
      { parameter: 'WBC Count', result: '7,400', unit: '/mcL', referenceRange: '4,000 - 11,000', isAbnormal: false },
      { parameter: 'Fasting Blood Sugar', result: '94', unit: 'mg/dL', referenceRange: '70 - 99', isAbnormal: false },
      { parameter: 'Serum Vitamin D3', result: '18.5', unit: 'ng/mL', referenceRange: '30.0 - 100.0', isAbnormal: true, notes: 'Deficiency noted. Supplementation recommended by physician.' },
      { parameter: 'Total Cholesterol', result: '175', unit: 'mg/dL', referenceRange: '< 200', isAbnormal: false },
    ],
    aiSummary: 'Your hemoglobin and white blood cell levels are normal. Fasting glucose is within optimal limits. However, your Serum Vitamin D3 level (18.5 ng/mL) is below the recommended reference threshold (30-100 ng/mL). Discuss vitamin D supplementation with your doctor.',
    doctorNotes: 'Patient advised to take weekly 60,000 IU Vitamin D3 for 8 weeks and retest.'
  },
  {
    id: 'rep_002',
    title: 'Allergy & Skin Surface Evaluation',
    date: '2026-08-15',
    doctorName: 'Dr. Priya Sharma',
    hospitalName: 'Apollo Specialty Hospital',
    reportType: 'Dermatology Consultation',
    fileName: 'Skin_Consultation_Aug2026.pdf',
    values: [
      { parameter: 'Skin Lesion Type', result: 'Erythematous Patch', referenceRange: 'Normal Epidermis', isAbnormal: true },
      { parameter: 'IgE Total Antibody', result: '240', unit: 'IU/mL', referenceRange: '< 100', isAbnormal: true },
    ],
    aiSummary: 'IgE antibody levels are elevated, supporting mild atopic eczema / allergic reaction. No sign of bacterial skin infection.',
    doctorNotes: 'Prescribed topical moisturizer and mild corticosteroid as needed for eczema flare-ups.'
  }
];

export const initialPrescriptions: Prescription[] = [
  {
    id: 'rx_001',
    doctorName: 'Dr. Ramesh Kumar',
    hospitalName: 'Care Health Clinic',
    date: '2026-10-01',
    items: [
      {
        id: 'rx_item_1',
        medicationName: 'Vitamin D3 (Cholecalciferol)',
        dosage: '60,000 IU',
        frequency: 'Once weekly',
        duration: '8 weeks',
        instructions: 'Take 1 capsule every Sunday morning after breakfast with warm milk.'
      }
    ],
    notes: 'Recheck Vitamin D3 levels after completing 8-week course.'
  },
  {
    id: 'rx_002',
    doctorName: 'Dr. Priya Sharma',
    hospitalName: 'Apollo Specialty Hospital',
    date: '2026-08-15',
    items: [
      {
        id: 'rx_item_2',
        medicationName: 'Cetirizine HCI',
        dosage: '10 mg',
        frequency: 'Once daily at bedtime',
        duration: '10 days',
        instructions: 'Take 1 tablet before sleeping when skin itchiness occurs.'
      }
    ]
  }
];

export const initialMedicines: MedicineSchedule[] = [
  {
    id: 'med_001',
    name: 'Vitamin D3 (60k IU)',
    dosage: '60,000 IU Capsule',
    time: '08:00',
    frequency: 'Once Weekly (Sunday)',
    durationDays: 56,
    startDate: '2026-10-04',
    instructions: 'Take with warm milk after meal'
  },
  {
    id: 'med_002',
    name: 'Cetirizine 10mg',
    dosage: '1 Tablet',
    time: '21:30',
    frequency: 'Once Daily',
    durationDays: 14,
    startDate: '2026-10-01',
    instructions: 'Take at night before bed'
  }
];

export const initialMedLogs: MedicationLog[] = [
  {
    id: 'log_001',
    medicineId: 'med_002',
    medicineName: 'Cetirizine 10mg',
    scheduledTime: '21:30',
    date: '2026-10-06',
    status: 'taken',
    timestamp: '2026-10-06T21:32:00Z'
  },
  {
    id: 'log_002',
    medicineId: 'med_001',
    medicineName: 'Vitamin D3 (60k IU)',
    scheduledTime: '08:00',
    date: '2026-10-04',
    status: 'taken',
    timestamp: '2026-10-04T08:15:00Z'
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 'appt_001',
    doctorName: 'Dr. Priya Sharma',
    specialization: 'Dermatologist',
    hospitalName: 'Apollo Dermatology Clinic',
    date: '2026-10-10',
    time: '4:30 PM',
    location: 'Road No. 36, Jubilee Hills, Hyderabad',
    reason: 'Follow-up consultation for persistent skin rash on forearm',
    status: 'Upcoming',
    lat: 17.4325,
    lng: 78.4071
  },
  {
    id: 'appt_002',
    doctorName: 'Dr. Ramesh Kumar',
    specialization: 'General Physician',
    hospitalName: 'Care Diagnostic & Health Center',
    date: '2026-10-01',
    time: '11:00 AM',
    location: 'Banjara Hills, Hyderabad',
    reason: 'Routine annual checkup and lab report review',
    status: 'Completed',
    lat: 17.4156,
    lng: 78.4487
  }
];

export const nearbyDoctorsList: NearbyDoctor[] = [
  {
    id: 'doc_1',
    name: 'Dr. Priya Sharma',
    specialization: 'Dermatologist',
    hospital: 'Apollo Dermatology & Skin Clinic',
    rating: 4.9,
    distanceKm: 1.8,
    travelTimeMins: 8,
    address: 'Plot 42, Road No 36, Jubilee Hills, Hyderabad',
    phone: '+91 40 2360 7777',
    availability: 'Today 4:30 PM - 7:00 PM',
    lat: 17.4325,
    lng: 78.4071
  },
  {
    id: 'doc_2',
    name: 'Dr. Ramesh Kumar',
    specialization: 'General Physician',
    hospital: 'Care Family Health Clinic',
    rating: 4.8,
    distanceKm: 2.4,
    travelTimeMins: 10,
    address: 'Road No 1, Banjara Hills, Hyderabad',
    phone: '+91 98765 00002',
    availability: 'Today 5:00 PM - 8:00 PM',
    lat: 17.4180,
    lng: 78.4350
  },
  {
    id: 'doc_3',
    name: 'Dr. D. Nageshwar Reddy',
    specialization: 'Gastroenterologist',
    hospital: 'AIG Hospitals (Asian Institute of Gastroenterology)',
    rating: 5.0,
    distanceKm: 4.1,
    travelTimeMins: 14,
    address: 'Mindspace Road, Gachibowli, Hyderabad',
    phone: '+91 40 2337 8888',
    availability: 'Tomorrow 10:00 AM',
    lat: 17.4435,
    lng: 78.3772
  },
  {
    id: 'doc_4',
    name: 'Dr. B. Soma Raju',
    specialization: 'Cardiologist',
    hospital: 'Care Hospitals Heart Institute',
    rating: 4.9,
    distanceKm: 2.1,
    travelTimeMins: 9,
    address: 'Road No 10, Banjara Hills, Hyderabad',
    phone: '+91 40 3041 8888',
    availability: 'Today 3:00 PM',
    lat: 17.4150,
    lng: 78.4410
  },
  {
    id: 'doc_5',
    name: 'Dr. Sudhir Kumar',
    specialization: 'Neurologist',
    hospital: 'Apollo Hospitals Neurological Institute',
    rating: 4.9,
    distanceKm: 3.5,
    travelTimeMins: 12,
    address: 'Road No 12, Jubilee Hills, Hyderabad',
    phone: '+91 40 2360 7777',
    availability: 'Tomorrow 11:00 AM',
    lat: 17.4290,
    lng: 78.4110
  },
  {
    id: 'doc_6',
    name: 'Dr. V. S. Murthy',
    specialization: 'Pulmonologist / Asthma Specialist',
    hospital: 'Yashoda Chest & Allergy Center',
    rating: 4.9,
    distanceKm: 3.8,
    travelTimeMins: 15,
    address: 'Raj Bhavan Road, Somajiguda, Hyderabad',
    phone: '+91 40 2456 8888',
    availability: 'Today 6:00 PM',
    lat: 17.4245,
    lng: 78.4590
  },
  {
    id: 'doc_7',
    name: 'Dr. K. S. Murthy',
    specialization: 'Ophthalmologist',
    hospital: 'LV Prasad Eye Institute',
    rating: 4.9,
    distanceKm: 2.9,
    travelTimeMins: 11,
    address: 'Kallam Anji Reddy Campus, Banjara Hills, Hyderabad',
    phone: '+91 40 3061 2345',
    availability: 'Tomorrow 9:30 AM',
    lat: 17.4260,
    lng: 78.4320
  },
  {
    id: 'doc_8',
    name: 'Dr. Sneha Kulkarni',
    specialization: 'Dentist',
    hospital: 'Smile Care Dental Specialty Center',
    rating: 4.9,
    distanceKm: 1.5,
    travelTimeMins: 6,
    address: 'Near Inorbit Mall, Madhapur, Hyderabad',
    phone: '+91 98765 44321',
    availability: 'Today 5:30 PM',
    lat: 17.4380,
    lng: 78.3820
  },
  {
    id: 'doc_9',
    name: 'Dr. Manjula Anagani',
    specialization: 'Gynecologist',
    hospital: "Yashoda Hospitals Women's Health Center",
    rating: 4.9,
    distanceKm: 2.7,
    travelTimeMins: 10,
    address: 'Hitec City, Madhapur, Hyderabad',
    phone: '+91 40 4567 8900',
    availability: 'Tomorrow 2:00 PM',
    lat: 17.4470,
    lng: 78.3780
  }
];

export const initialTimelineEvents: TimelineEvent[] = [
  {
    id: 'evt_001',
    date: '2026-10-07',
    time: '10:15 AM',
    type: 'Symptom Reported',
    title: 'Mild Forearm Rash & Itchiness Reported',
    description: 'Patient consulted AI Copilot about dry red patch on left inner arm.'
  },
  {
    id: 'evt_002',
    date: '2026-10-06',
    time: '09:30 PM',
    type: 'Medicine Taken',
    title: 'Cetirizine 10mg Taken',
    description: 'Dose marked as completed for evening allergy management.'
  },
  {
    id: 'evt_003',
    date: '2026-10-01',
    time: '11:00 AM',
    type: 'Report Uploaded',
    title: 'Annual Blood Panel Uploaded & Analyzed',
    description: 'Extracted 5 key parameters. Vitamin D3 deficiency identified.'
  },
  {
    id: 'evt_004',
    date: '2026-10-01',
    time: '11:45 AM',
    type: 'Prescription Added',
    title: 'Prescription from Dr. Ramesh Kumar',
    description: 'Added Vitamin D3 60,000 IU weekly dosage schedule.'
  }
];

export const initialFoodScans: FoodScanResult[] = [
  {
    id: 'food_001',
    foodName: 'Rice + Dal + Mixed Veg Curry',
    estimatedNutrition: {
      calories: 420,
      carbsGrams: 65,
      proteinGrams: 14,
      fatGrams: 10,
      fiberGrams: 8
    },
    personalizedSuitability: 'Suitable',
    personalizedNotes: 'Well balanced vegetarian meal. High in fiber and protein from lentil dal. Matches your vegetarian preference.',
    timestamp: '2026-10-07T13:00:00Z'
  }
];

export const initialVisionScans: HealthImageAnalysis[] = [
  {
    id: 'vision_001',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
    observation: 'Erythematous Dry Patch (Possible Mild Atopic Eczema)',
    confidenceScore: 84,
    riskLevel: 'Low',
    explanation: 'Localized redness with dry surface texture on forearm epidermic layer, non-vesicular in appearance.',
    recommendedAction: 'Apply fragrance-free moisturizing emollient. If itching worsens or spreads, consult a dermatologist.',
    suggestedSpecialist: 'Dermatologist',
    timestamp: '2026-10-07T10:20:00Z'
  }
];

export const initialConversations: AIConversation[] = [
  {
    id: 'conv_live_1',
    title: 'Live Health Consultation',
    startDate: new Date().toISOString().split('T')[0],
    detectedLanguage: 'en',
    messages: []
  }
];

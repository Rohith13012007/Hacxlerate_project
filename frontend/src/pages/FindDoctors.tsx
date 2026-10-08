import React, { useState } from 'react';
import { SafetyBanner } from '../components/SafetyBanner';
import { nearbyDoctorsList } from '../services/mockData';
import type { NearbyDoctor } from '../types';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Star, 
  Calendar, 
  Search, 
  CheckCircle2,
  Map as MapIcon,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

interface FindDoctorsProps {
  onNavigateDoctorPortal?: () => void;
}

export const FindDoctors: React.FC<FindDoctorsProps> = ({ onNavigateDoctorPortal }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<NearbyDoctor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string }>({
    lat: 17.4401,
    lng: 78.3489,
    address: 'Gachibowli / Jubilee Hills, Hyderabad'
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const specialties = [
    'All',
    'General Physician',
    'Dermatologist',
    'Cardiologist',
    'Ophthalmologist'
  ];

  const filteredDoctors = nearbyDoctorsList.filter(doc => {
    const matchesSpec = selectedSpecialty === 'All' || doc.specialization === selectedSpecialty;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: `Lat ${position.coords.latitude.toFixed(4)}, Lng ${position.coords.longitude.toFixed(4)}`
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not fetch precise location. Using default Hyderabad city coordinates.');
      }
    );
  };

  const handleOpenBooking = (doc: NearbyDoctor) => {
    setSelectedDoctorForBooking(doc);
    setIsBookingModalOpen(true);
  };

  const handleDirections = (doc: NearbyDoctor) => {
    const originParam = `${userLocation.lat},${userLocation.lng}`;
    const destinationParam = encodeURIComponent(doc.address || `${doc.lat},${doc.lng}`);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destinationParam}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner customMessage="Specialist recommendations match clinical criteria. Choose your preferred doctor for booking." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            <span>Find Doctors & Clinics Near You</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time GPS distance calculation, Google Maps directions, and instant appointment booking.
          </p>
        </div>

        {/* Current Location Badge */}
        <button
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-colors"
        >
          <Compass className={`w-4 h-4 text-teal-600 ${isLocating ? 'animate-spin' : ''}`} />
          <div className="text-left">
            <div className="text-[10px] text-slate-400 leading-none">CURRENT LOCATION</div>
            <div className="text-xs font-bold text-slate-900">{userLocation.address}</div>
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="app-card p-3 flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by doctor name, hospital, or specialty (e.g., Dermatologist)..."
          className="flex-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium bg-transparent"
        />
        <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Specialty Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {specialties.map(spec => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSpecialty === spec
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Split View: Doctor Cards Left + Interactive Map Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Doctor Cards */}
        <div className="space-y-4">
          {filteredDoctors.map(doc => (
            <div key={doc.id} className="app-card p-5 space-y-4 hover:border-teal-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                    {doc.name.charAt(4) || 'D'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900">{doc.name}</h3>
                      <CheckCircle2 className="w-4 h-4 text-teal-600 fill-teal-100" />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{doc.specialization} • {doc.hospital}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 font-medium">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                        {doc.rating}
                      </span>
                      <span>•</span>
                      <span className="text-teal-700 font-bold">{doc.distanceKm} km away</span>
                      <span>•</span>
                      <span>{doc.travelTimeMins} mins drive</span>
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-bold text-xs border border-teal-200">
                  {doc.distanceKm} km
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${doc.phone}`}
                  className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call</span>
                </a>

                <button
                  onClick={() => handleDirections(doc)}
                  className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                  title="Open Google Maps Navigation"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Directions</span>
                </button>

                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-teal-600/20 transition-all transform hover:scale-[1.02]"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Interactive Map Card */}
        <div className="app-card overflow-hidden p-4 space-y-3 sticky top-20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <MapIcon className="w-4 h-4 text-teal-600" />
              <span>Interactive Map View</span>
            </span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Live Radius Active
            </span>
          </div>

          <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop" 
              alt="Map view location" 
              className="w-full h-full object-cover opacity-80"
            />
            
            {/* Custom Map Markers */}
            <div className="absolute top-1/4 left-1/3 flex items-center space-x-1 bg-white px-2.5 py-1 rounded-full shadow-lg border border-slate-200 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-teal-600 fill-teal-100" />
              <span>Dr. Priya Sharma (1.8 km)</span>
            </div>
            <div className="absolute top-1/2 left-2/3 flex items-center space-x-1 bg-white px-2.5 py-1 rounded-full shadow-lg border border-slate-200 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-teal-600 fill-teal-100" />
              <span>Dr. Ramesh Kumar (2.4 km)</span>
            </div>
            <div className="absolute bottom-1/4 left-1/2 flex items-center space-x-1 bg-white px-2.5 py-1 rounded-full shadow-lg border border-slate-200 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-teal-600 fill-teal-100" />
              <span>Dr. Ananya Reddy (4.1 km)</span>
            </div>

            {/* User Blue Location Pulse Dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center animate-ping" />
              <div className="absolute inset-1 rounded-full bg-blue-600 border-2 border-white shadow-md" />
            </div>

            {/* Navigation Overlay Bar */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Apollo Skin Clinic</span>
                <span className="text-[10px] text-slate-500">1.8 km • 5 min drive</span>
              </div>
              <button
                onClick={() => {
                  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Apollo Skin Clinic, Jubilee Hills, Hyderabad')}`;
                  window.open(mapsUrl, '_blank');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                Open Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        doctor={selectedDoctorForBooking}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onNavigateDoctorPortal={() => {
          setIsBookingModalOpen(false);
          if (onNavigateDoctorPortal) onNavigateDoctorPortal();
        }}
      />
    </div>
  );
};

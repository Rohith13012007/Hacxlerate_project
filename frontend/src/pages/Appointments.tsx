import React, { useState } from 'react';
import { SafetyBanner } from '../components/SafetyBanner';
import { useHealth } from '../context/HealthContext';
import { Calendar, MapPin, Clock, Plus, Navigation } from 'lucide-react';

export const Appointments: React.FC = () => {
  const { appointments, userLocation } = useHealth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const currentCity = userLocation.address && !userLocation.address.includes('Detecting') && !userLocation.address.includes('Lat ')
    ? userLocation.address.split(',')[0].trim()
    : 'Your Local City';

  const upcomingList = appointments.length > 0 ? appointments.map(a => {
    const d = new Date(a.date);
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate().toString();
    const weekDay = d.toLocaleString('en-US', { weekday: 'short' });
    return {
      id: a.id,
      day,
      month,
      weekDay,
      doctorName: a.doctorName,
      specialization: a.specialization,
      hospital: a.hospitalName.includes(currentCity) ? a.hospitalName : `${currentCity} ${a.hospitalName}`,
      location: a.location,
      time: a.time,
      lat: a.lat,
      lng: a.lng
    };
  }) : [
    {
      id: 'appt_1',
      day: '12',
      month: 'OCT',
      weekDay: 'Mon',
      doctorName: 'Dr. Priya Sharma',
      specialization: 'Dermatologist',
      hospital: `${currentCity} Specialty Skin & Dermatology Clinic`,
      location: `Central Medical District, ${currentCity}`,
      time: '10:00 AM',
      lat: userLocation.lat + 0.008,
      lng: userLocation.lng + 0.005
    },
    {
      id: 'appt_2',
      day: '15',
      month: 'OCT',
      weekDay: 'Thu',
      doctorName: 'Dr. Ramesh Kumar',
      specialization: 'General Physician',
      hospital: `${currentCity} Family Health & Primary Care Center`,
      location: `Main Health Plaza, ${currentCity}`,
      time: '11:30 AM',
      lat: userLocation.lat - 0.006,
      lng: userLocation.lng + 0.009
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <SafetyBanner customMessage="Appointment notifications trigger 24h, 1h, and 15m prior to scheduled time." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Appointments</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Your upcoming and past specialist appointments in <strong className="text-slate-800">{currentCity}</strong>.
          </p>
        </div>

        <button
          onClick={() => window.location.hash = '/doctors'}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Upcoming / Past Tabs */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming ({upcomingList.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'past'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Past (0)
        </button>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {activeTab === 'upcoming' && upcomingList.map((appt) => (
          <div key={appt.id} className="app-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center space-x-4">
              {/* Left Date Badge */}
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">{appt.month}</span>
                <span className="text-lg font-black text-slate-900 leading-none">{appt.day}</span>
                <span className="text-[9px] text-slate-400 font-semibold">{appt.weekDay}</span>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">{appt.doctorName}</h3>
                <p className="text-xs text-blue-600 font-semibold">{appt.specialization} • {appt.hospital}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 mr-1" />
                    {appt.location}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    {appt.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(appt.doctorName + ' ' + appt.hospital)}&travelmode=driving`;
                  window.open(mapsUrl, '_blank');
                }}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Google Maps</span>
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'past' && (
          <div className="app-card p-8 text-center text-slate-500 text-xs font-medium">
            No past completed appointments recorded.
          </div>
        )}
      </div>
    </div>
  );
};

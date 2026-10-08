import React, { useState } from 'react';
import { SafetyBanner } from '../components/SafetyBanner';
import { Calendar, MapPin, Clock, Plus } from 'lucide-react';

export const Appointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingList = [
    {
      day: '12',
      month: 'DEC',
      weekDay: 'Thu',
      doctorName: 'Dr. Priya Sharma',
      specialization: 'Dermatologist',
      hospital: 'City Care Hospital',
      time: '10:00 AM'
    },
    {
      day: '20',
      month: 'DEC',
      weekDay: 'Fri',
      doctorName: 'Dr. Karthik Rao',
      specialization: 'General Physician',
      hospital: 'Sunrise Clinic',
      time: '11:30 AM'
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
            Your upcoming and past appointments.
          </p>
        </div>

        <button
          onClick={() => window.location.hash = '/doctors'}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Upcoming / Past Tabs (Matching Reference Screenshot Panel 8) */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming (2)
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Past (3)
        </button>
      </div>

      {/* Appointment Cards List matching Panel 8 */}
      <div className="space-y-4">
        {upcomingList.map((appt, idx) => (
          <div key={idx} className="app-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center space-x-4">
              {/* Left Date Badge matching Panel 8 */}
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">{appt.month}</span>
                <span className="text-lg font-black text-slate-900 leading-none">{appt.day}</span>
                <span className="text-[9px] text-slate-400 font-semibold">{appt.weekDay}</span>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">{appt.doctorName}</h3>
                <p className="text-xs text-blue-600 font-semibold">{appt.specialization}</p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    {appt.hospital}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    {appt.time}
                  </span>
                </div>
              </div>
            </div>

            {/* View Details button */}
            <button
              onClick={() => alert(`Appointment details for ${appt.doctorName} on ${appt.month} ${appt.day} at ${appt.time}`)}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 text-xs font-bold flex items-center justify-center space-x-1"
            >
              <span>View Details</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import type { NearbyDoctor, Appointment } from '../types';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  X, 
  FileText, 
  User, 
  Video, 
  Building, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AppointmentBookingModalProps {
  doctor: NearbyDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateDoctorPortal: () => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onNavigateDoctorPortal
}) => {
  const { profile, addAppointment, conversations } = useHealth();

  const [date, setDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('04:30 PM');
  const [consultationType, setConsultationType] = useState<'In-Person' | 'Video Call'>('In-Person');
  const [diseaseCategory, setDiseaseCategory] = useState<string>(() => {
    if (doctor?.specialization === 'Dermatologist') return 'Skin Irritation / Rash';
    if (doctor?.specialization === 'Neurologist') return 'Headache / Migraine';
    if (doctor?.specialization === 'Gastroenterologist') return 'Stomach Pain / Acid Reflux';
    return 'General Health Checkup';
  });
  const [diseaseDescription, setDiseaseDescription] = useState<string>(() => {
    const lastConv = conversations[0];
    if (lastConv && lastConv.messages.length > 0) {
      const userMsgs = lastConv.messages.filter(m => m.sender === 'user').map(m => m.text).join('; ');
      if (userMsgs) return userMsgs;
    }
    return 'Experiencing mild discomfort and would like a professional medical evaluation.';
  });
  const [symptomsDuration, setSymptomsDuration] = useState<string>('3-5 Days');
  const [severityLevel, setSeverityLevel] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [patientNotes, setPatientNotes] = useState<string>('Please review my recent AI Copilot report and blood test results before consultation.');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  if (!isOpen || !doctor) return null;

  const availableSlots = ['09:30 AM', '11:00 AM', '02:30 PM', '04:30 PM', '06:00 PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newApptData: Omit<Appointment, 'id'> = {
      doctorName: doctor.name,
      specialization: doctor.specialization,
      hospitalName: doctor.hospital,
      date,
      time: timeSlot,
      location: doctor.address,
      reason: diseaseCategory,
      status: 'Upcoming',
      lat: doctor.lat,
      lng: doctor.lng,
      consultationType,
      diseaseCategory,
      diseaseDescription,
      symptomsDuration,
      severityLevel,
      patientNotes
    };

    addAppointment(newApptData);
    
    const createdAppt: Appointment = {
      ...newApptData,
      id: `appt_${Date.now()}`
    };
    
    setCreatedAppointment(createdAppt);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCreatedAppointment(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Title */}
            <div>
              <div className="flex items-center space-x-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Book Doctor Appointment</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Schedule Consultation with {doctor.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Fill out your symptom details. A Patient Pre-Consultation Summary Document will be automatically sent to {doctor.name}.
              </p>
            </div>

            {/* Selected Doctor Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-lg">
                  {doctor.name.charAt(4) || 'D'}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{doctor.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{doctor.specialization} • {doctor.hospital}</p>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center mt-0.5">
                    <MapPin className="w-3 h-3 mr-1 text-teal-600" />
                    {doctor.distanceKm} km away ({doctor.address})
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200">
                ⭐ {doctor.rating}
              </span>
            </div>

            {/* Consultation Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">Consultation Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType('In-Person')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2.5 transition-all ${
                    consultationType === 'In-Person'
                      ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4 text-teal-600" />
                  <span>In-Person Clinic Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType('Video Call')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2.5 transition-all ${
                    consultationType === 'Video Call'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Video Consultation</span>
                </button>
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Select Preferred Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Available Time Slots</label>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        timeSlot === slot
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Disease & Symptoms Information */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Medical Concern & Disease Details</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Pre-filled from AI Copilot
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Disease / Concern Category</label>
                  <input
                    type="text"
                    value={diseaseCategory}
                    onChange={(e) => setDiseaseCategory(e.target.value)}
                    placeholder="e.g. Skin Rash, Migraine, Acid Reflux"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">How long have you had symptoms?</label>
                  <select
                    value={symptomsDuration}
                    onChange={(e) => setSymptomsDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-500"
                  >
                    <option value="1-2 Days">1-2 Days</option>
                    <option value="3-5 Days">3-5 Days</option>
                    <option value="1-2 Weeks">1-2 Weeks</option>
                    <option value="More than a month">More than a month</option>
                  </select>
                </div>
              </div>

              {/* Symptom Severity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Severity Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Mild', 'Moderate', 'Severe'] as const).map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverityLevel(sev)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        severityLevel === sev
                          ? sev === 'Severe'
                            ? 'bg-rose-50 border-rose-500 text-rose-800'
                            : sev === 'Moderate'
                            ? 'bg-amber-50 border-amber-500 text-amber-800'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Detailed Symptoms Description</label>
                <textarea
                  value={diseaseDescription}
                  onChange={(e) => setDiseaseDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="Describe your pain, swelling, fever, or any specific symptoms..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Additional notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Additional Notes / History for Doctor</label>
                <input
                  type="text"
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="e.g. Taking Cetirizine daily, allergic to Penicillin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-lg shadow-teal-600/30 transition-all flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Generate Appointment Document</span>
              </button>
            </div>
          </form>
        ) : (
          /* Success Screen & Patient Document View */
          <div className="space-y-6 text-slate-900">
            <div className="flex items-center space-x-3 text-emerald-600">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-emerald-950">Appointment Booked Successfully!</h2>
                <p className="text-xs text-emerald-700 font-medium">
                  Pre-Consultation Summary Document generated for {doctor.name}.
                </p>
              </div>
            </div>

            {/* Generated Patient Pre-Consultation Summary Document Card */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-teal-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                    PATIENT PRE-CONSULTATION SUMMARY DOCUMENT
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full font-bold">
                  DOC_REF_{createdAppointment?.id.toUpperCase()}
                </span>
              </div>

              {/* Patient Basic Profile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">PATIENT</span>
                  <span className="font-extrabold text-slate-900">{profile.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">AGE / GENDER</span>
                  <span className="font-bold text-slate-800">{profile.age} yrs • {profile.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">BLOOD GROUP</span>
                  <span className="font-bold text-rose-600">{profile.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">ALLERGIES</span>
                  <span className="font-bold text-amber-600">{profile.allergies.join(', ') || 'None'}</span>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="space-y-2 text-xs bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 text-teal-700">
                    <User className="w-4 h-4" />
                    Consulted Doctor: {doctor.name} ({doctor.specialization})
                  </span>
                  <span className="text-slate-500 font-normal">
                    {date} at {timeSlot} ({consultationType})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">CHIEF COMPLAINT / DISEASE</span>
                    <span className="font-bold text-slate-900">{diseaseCategory}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">SYMPTOM DURATION & SEVERITY</span>
                    <span className="font-bold text-slate-800">{symptomsDuration} • <span className="text-amber-600">{severityLevel}</span></span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">DETAILED SYMPTOM DESCRIPTION</span>
                  <p className="text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{diseaseDescription}"
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">ACTIVE MEDICATIONS</span>
                  <span className="font-semibold text-blue-700">{profile.currentMedicines.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500 font-medium">
                The doctor can access this document upon authentication in the Doctor Access Portal.
              </span>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={handleReset}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  Done
                </button>

                <button
                  onClick={() => {
                    handleReset();
                    onNavigateDoctorPortal();
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2"
                >
                  <span>Open Doctor Portal View</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

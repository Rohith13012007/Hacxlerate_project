"""
FHIR-Ready Adapter Layer for HealthCopilot
Maps internal domain entities (Patient, Observations, Prescriptions, Appointments)
to standard HL7 FHIR (Release 4) JSON representations.
"""

from typing import Dict, Any, List, Optional
import datetime

class FHIRAdapter:
    @staticmethod
    def to_fhir_patient(patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maps internal patient profile to FHIR Patient resource."""
        name_parts = (patient_data.get("name") or "Anonymous Patient").split()
        family_name = name_parts[-1] if len(name_parts) > 1 else ""
        given_names = name_parts[:-1] if len(name_parts) > 1 else name_parts

        return {
            "resourceType": "Patient",
            "id": str(patient_data.get("user_id") or patient_data.get("id") or "pat_001"),
            "active": True,
            "name": [
                {
                    "use": "official",
                    "family": family_name,
                    "given": given_names
                }
            ],
            "gender": (patient_data.get("gender") or "unknown").lower(),
            "birthDate": (
                datetime.date.today() - datetime.timedelta(days=365 * int(patient_data.get("age", 28)))
            ).isoformat(),
            "telecom": [
                {
                    "system": "email",
                    "value": patient_data.get("email") or "patient@healthcopilot.ai"
                }
            ],
            "extension": [
                {
                    "url": "http://hl7.org/fhir/StructureDefinition/patient-bloodType",
                    "valueString": patient_data.get("blood_group") or patient_data.get("bloodGroup") or "B+"
                }
            ]
        }

    @staticmethod
    def to_fhir_observation(obs_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maps lab result or vital measurement to FHIR Observation resource."""
        return {
            "resourceType": "Observation",
            "id": str(obs_data.get("id") or f"obs_{datetime.datetime.now().timestamp()}"),
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "laboratory",
                            "display": "Laboratory"
                        }
                    ]
                }
            ],
            "code": {
                "text": obs_data.get("parameter") or obs_data.get("title") or "Health Parameter"
            },
            "subject": {
                "reference": f"Patient/{obs_data.get('patient_id', 'pat_001')}"
            },
            "effectiveDateTime": obs_data.get("date") or datetime.date.today().isoformat(),
            "valueQuantity": {
                "value": obs_data.get("value"),
                "unit": obs_data.get("unit") or ""
            },
            "interpretation": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                            "code": (obs_data.get("status") or "normal").upper()[:1]
                        }
                    ],
                    "text": obs_data.get("status") or "Normal"
                }
            ]
        }

    @staticmethod
    def to_fhir_medication_request(med_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maps internal medicine schedule/prescription to FHIR MedicationRequest resource."""
        return {
            "resourceType": "MedicationRequest",
            "id": str(med_data.get("id") or f"medreq_{datetime.datetime.now().timestamp()}"),
            "status": "active",
            "intent": "order",
            "medicationCodeableConcept": {
                "text": med_data.get("name") or med_data.get("medicineName") or "Medication"
            },
            "subject": {
                "reference": f"Patient/{med_data.get('patient_id', 'pat_001')}"
            },
            "dosageInstruction": [
                {
                    "text": f"Dose: {med_data.get('dosage', '1 tablet')}, Time: {med_data.get('time', '09:00 AM')}",
                    "timing": {
                        "repeat": {
                            "frequency": 1,
                            "period": 1,
                            "periodUnit": "d"
                        }
                    }
                }
            ]
        }

    @staticmethod
    def to_fhir_appointment(appt_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maps internal appointment to FHIR Appointment resource."""
        return {
            "resourceType": "Appointment",
            "id": str(appt_data.get("id") or f"appt_{datetime.datetime.now().timestamp()}"),
            "status": (appt_data.get("status") or "booked").lower(),
            "description": appt_data.get("reason") or "Routine Consultation",
            "start": f"{appt_data.get('date', datetime.date.today().isoformat())}T{appt_data.get('time', '10:00')}:00Z",
            "participant": [
                {
                    "actor": {
                        "display": appt_data.get("doctorName") or "Doctor"
                    },
                    "status": "accepted"
                }
            ]
        }

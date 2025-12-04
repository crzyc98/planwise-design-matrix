import { PlanData } from '../types';

// Interface for backend extraction format
export interface ExtractedField {
    field_name: string;
    field_category: string;
    value: any;
    confidence_score: number;
    status: string;
}

// Map backend field names to UI keys
const FIELD_MAPPING: Record<string, keyof PlanData> = {
    'Eligibility': 'minAge', // Note: This might need refinement based on actual data
    'Service Requirement': 'serviceRequirement',
    'Entry Date': 'entryDate',
    'Employer Match': 'employerMatch',
    'Match Effective Rate': 'matchCap',
    'Non-Elective Contribution': 'nonElectiveContribution',
    'Vesting Schedule': 'vestingSchedule',
    'Vesting Period': 'vestingCliff',
    'Auto-Enrollment': 'autoEnrollment',
    'Auto-Enrollment Rate': 'autoEnrollmentRate',
    'Auto-Escalation': 'autoEscalation',
    'Auto-Escalation Rate': 'autoEscalationRate',
    'Auto-Escalation Cap': 'autoEscalationCap'
};

// Reverse mapping for updates
const REVERSE_FIELD_MAPPING: Record<string, string> = Object.entries(FIELD_MAPPING).reduce(
    (acc, [backend, ui]) => ({ ...acc, [ui]: backend }),
    {} as Record<string, string>
);

export const backendToUI = (extractions: ExtractedField[]): PlanData => {
    // Default empty plan data
    const planData: PlanData = {
        minAge: 0,
        serviceRequirement: '',
        entryDate: '',
        employerMatch: '',
        matchCap: 0,
        nonElectiveContribution: 0,
        vestingSchedule: '',
        vestingCliff: 0,
        autoEnrollment: false,
        autoEnrollmentRate: 0,
        autoEscalation: false,
        autoEscalationRate: 0,
        autoEscalationCap: 0
    };

    extractions.forEach(field => {
        const uiKey = FIELD_MAPPING[field.field_name];
        if (!uiKey) return;

        let value = field.value;

        // Handle Percentage Fields (Backend 0.03 -> UI 3)
        if (['matchCap', 'nonElectiveContribution', 'autoEnrollmentRate', 'autoEscalationRate', 'autoEscalationCap'].includes(uiKey)) {
            value = value !== null ? Number(value) * 100 : 0;
        }

        // Handle Boolean Fields
        if (['autoEnrollment', 'autoEscalation'].includes(uiKey)) {
            value = value === true || value === 'true' || value === 'Yes';
        }

        // Handle Number Fields
        if (['minAge', 'vestingCliff'].includes(uiKey)) {
            value = Number(value) || 0;
        }

        // @ts-ignore - Dynamic assignment
        planData[uiKey] = value;
    });

    return planData;
};

export const uiToBackend = (fieldId: string, value: any): { field_name: string, value: any } => {
    const backendName = REVERSE_FIELD_MAPPING[fieldId];

    if (!backendName) {
        throw new Error(`No backend mapping found for field: ${fieldId}`);
    }

    let backendValue = value;

    // Handle Percentage Fields (UI 3 -> Backend 0.03)
    if (['matchCap', 'nonElectiveContribution', 'autoEnrollmentRate', 'autoEscalationRate', 'autoEscalationCap'].includes(fieldId)) {
        backendValue = Number(value) / 100;
    }

    return {
        field_name: backendName,
        value: backendValue
    };
};

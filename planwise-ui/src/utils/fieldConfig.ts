export interface FieldConfig {
    type: 'text' | 'number' | 'boolean' | 'enum';
    label: string;
    options?: string[]; // For enum
    min?: number;
    max?: number;
    step?: number;
    format?: 'percent' | 'currency' | 'text';
    description?: string;
}

export const FIELD_CONFIG: Record<string, FieldConfig> = {
    // Eligibility
    'Eligibility': {
        type: 'text',
        label: 'Eligibility Requirement',
        description: 'e.g., "Immediate", "1 Year / 1000 Hours"'
    },

    // Employer Match
    'Employer Match': {
        type: 'text',
        label: 'Match Formula',
        description: 'e.g., "100% on first 3%, 50% on next 2%"'
    },
    'Match Effective Rate': {
        type: 'number',
        label: 'Effective Match Rate',
        min: 0,
        max: 0.15,
        step: 0.001,
        format: 'percent',
        description: 'Maximum employer match as a percentage of pay (e.g., 0.04 for 4%)'
    },
    'Match True-Up': {
        type: 'boolean',
        label: 'True-Up Provision',
        description: 'Does the plan offer a true-up contribution?'
    },
    'Match Last Day Work Rule': {
        type: 'boolean',
        label: 'Last Day Requirement',
        description: 'Must be employed on last day of year to receive match?'
    },

    // Non-Elective
    'Non-Elective Contribution': {
        type: 'text',
        label: 'Non-Elective Formula',
        description: 'e.g., "3% of eligible compensation"'
    },

    // Vesting
    'Vesting Schedule': {
        type: 'enum',
        label: 'Vesting Schedule',
        options: [
            'Immediate',
            '2-year cliff',
            '3-year cliff',
            '5-year cliff',
            'Graded',
            'Other'
        ]
    },

    // Auto-Enrollment
    'Auto-Enrollment': {
        type: 'boolean',
        label: 'Auto-Enrollment Enabled',
        description: 'Is automatic enrollment active?'
    },
    'Auto-Enrollment Rate': {
        type: 'enum',
        label: 'Default Deferral Rate',
        options: ['1%', '2%', '3%', '4%', '5%', '6%', '7%', '8%', '9%', '10%'],
        description: 'Initial default contribution rate'
    },

    // Auto-Escalation
    'Auto-Escalation': {
        type: 'boolean',
        label: 'Auto-Escalation Enabled',
        description: 'Is automatic escalation active?'
    },
    'Auto-Escalation Rate': {
        type: 'enum',
        label: 'Annual Escalation Rate',
        options: ['0.5%', '1%', '1.5%', '2%', '2.5%', '3%', '3.5%', '4%'],
        description: 'Annual increase in contribution rate (default: 1%)'
    },
    'Auto-Escalation Cap': {
        type: 'enum',
        label: 'Escalation Cap',
        options: ['4%', '5%', '6%', '7%', '8%', '9%', '10%', '11%', '12%', '13%', '14%', '15%'],
        description: 'Maximum contribution rate after escalation'
    },
};

export const getFieldConfig = (fieldName: string): FieldConfig => {
    return FIELD_CONFIG[fieldName] || {
        type: 'text',
        label: fieldName,
        description: ''
    };
};

import { Client, PlanCategory, PlanFieldDefinition } from './types';

export const FIELD_DEFINITIONS: PlanFieldDefinition[] = [
  // Eligibility
  { id: 'minAge', label: 'Minimum Age', category: PlanCategory.ELIGIBILITY, type: 'number', tooltip: 'Minimum age required to participate.' },
  { id: 'serviceRequirement', label: 'Service Requirement', category: PlanCategory.ELIGIBILITY, type: 'select', options: ['Immediate', '3 Months', '6 Months', '1,000 Hours', '1 Year', '1 Year + 1,000 Hours'] },
  { id: 'entryDate', label: 'Entry Date', category: PlanCategory.ELIGIBILITY, type: 'select', options: ['Immediate', 'Monthly', 'Quarterly', 'Semi-Annual'] },

  // Contributions
  { id: 'employerMatch', label: 'Match Formula', category: PlanCategory.CONTRIBUTIONS, type: 'text', tooltip: 'The formula used for employer matching contributions.' },
  { id: 'matchCap', label: 'Match Cap', category: PlanCategory.CONTRIBUTIONS, type: 'percent' },
  { id: 'nonElectiveContribution', label: 'Non-Elective Contrib.', category: PlanCategory.CONTRIBUTIONS, type: 'percent', tooltip: 'Employer contribution regardless of employee deferral.' },

  // Vesting
  { id: 'vestingSchedule', label: 'Vesting Schedule', category: PlanCategory.VESTING, type: 'select', options: ['Immediate', 'Cliff', 'Graded'] },
  { id: 'vestingCliff', label: 'Vesting Period (Years)', category: PlanCategory.VESTING, type: 'number', dependencyFieldId: 'vestingSchedule', dependencyValue: ['Cliff', 'Graded'] },

  // Auto Features
  { id: 'autoEnrollment', label: 'Auto-Enrollment', category: PlanCategory.AUTO_FEATURES, type: 'boolean' },
  { id: 'autoEnrollmentRate', label: 'Default Rate', category: PlanCategory.AUTO_FEATURES, type: 'percent', dependencyFieldId: 'autoEnrollment', dependencyValue: true },
  { id: 'autoEscalation', label: 'Auto-Escalation', category: PlanCategory.AUTO_FEATURES, type: 'boolean' },
  { id: 'autoEscalationRate', label: 'Escalation Step', category: PlanCategory.AUTO_FEATURES, type: 'percent', dependencyFieldId: 'autoEscalation', dependencyValue: true },
  { id: 'autoEscalationCap', label: 'Escalation Cap', category: PlanCategory.AUTO_FEATURES, type: 'percent', dependencyFieldId: 'autoEscalation', dependencyValue: true },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Acme Corp',
    industry: 'Manufacturing',
    region: 'Midwest',
    lastUpdated: '2023-10-24 14:30',
    plan: {
      minAge: 21,
      serviceRequirement: '1 Year',
      entryDate: 'Quarterly',
      employerMatch: '100% on first 3%, 50% on next 2%',
      matchCap: 4,
      nonElectiveContribution: 0,
      vestingSchedule: 'Graded',
      vestingCliff: 5,
      autoEnrollment: true,
      autoEnrollmentRate: 3,
      autoEscalation: true,
      autoEscalationRate: 1,
      autoEscalationCap: 10,
    }
  },
  {
    id: 'c2',
    name: 'TechFlow Systems',
    industry: 'Technology',
    region: 'West Coast',
    lastUpdated: '2023-10-25 09:15',
    plan: {
      minAge: 18,
      serviceRequirement: 'Immediate',
      entryDate: 'Immediate',
      employerMatch: '100% up to 4%',
      matchCap: 4,
      nonElectiveContribution: 3,
      vestingSchedule: 'Immediate',
      vestingCliff: 0,
      autoEnrollment: true,
      autoEnrollmentRate: 6,
      autoEscalation: true,
      autoEscalationRate: 1,
      autoEscalationCap: 15,
    }
  },
  {
    id: 'c3',
    name: 'Summit Healthcare',
    industry: 'Healthcare',
    region: 'Northeast',
    lastUpdated: '2023-10-20 11:45',
    plan: {
      minAge: 21,
      serviceRequirement: '6 Months',
      entryDate: 'Monthly',
      employerMatch: '50% up to 6%',
      matchCap: 3,
      nonElectiveContribution: 2,
      vestingSchedule: 'Cliff',
      vestingCliff: 3,
      autoEnrollment: false,
      autoEnrollmentRate: 0,
      autoEscalation: false,
      autoEscalationRate: 0,
      autoEscalationCap: 0,
    }
  }
];
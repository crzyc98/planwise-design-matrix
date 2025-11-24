export enum PlanCategory {
  ELIGIBILITY = "Eligibility",
  CONTRIBUTIONS = "Contributions",
  VESTING = "Vesting",
  AUTO_FEATURES = "Auto Features",
}

export enum ComparisonMetric {
  AUTO_ENROLL_RATE = "Auto-Enrollment Rate",
  EMPLOYER_MATCH = "Employer Match Cap",
  VESTING_YEARS = "Vesting Period (Years)",
}

export interface PlanFieldDefinition {
  id: string;
  label: string;
  category: PlanCategory;
  type: 'text' | 'number' | 'percent' | 'boolean' | 'select';
  options?: string[]; // For select type
  tooltip?: string;
  dependencyFieldId?: string;
  dependencyValue?: any; // The value required in the dependency field to enable this field
}

export interface PlanData {
  // Eligibility
  minAge: number;
  serviceRequirement: string;
  entryDate: string;
  
  // Contributions
  employerMatch: string; // e.g., "50% up to 6%"
  matchCap: number; // Percent
  nonElectiveContribution: number; // Percent

  // Vesting
  vestingSchedule: string;
  vestingCliff: number; // Years

  // Auto Features
  autoEnrollment: boolean;
  autoEnrollmentRate: number; // Percent
  autoEscalation: boolean;
  autoEscalationRate: number; // Percent
  autoEscalationCap: number; // Percent
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  region: string;
  state?: string;
  plan: PlanData;
  lastUpdated: string;
}

export interface BenchmarkDataPoint {
  metric: string;
  clientValue: number;
  regionMedian: number;
  regionTopQuartile: number;
}
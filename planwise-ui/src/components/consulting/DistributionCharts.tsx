import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import DistributionCard from './DistributionCard';

interface DistributionBin {
  bin: string;
  count: number;
  binStart: number;
  binEnd: number;
}

interface DistributionSeries {
  title: string;
  unit: '%' | 'count' | 'rate' | 'years';
  bins: DistributionBin[];
  peerAverage: number;
  nationalAverage?: number;
  clientValue: number | null;
  cohortSize: number;
}

interface DistributionChartsProps {
  clientId: string;
  clientName: string;
}

type CohortScope = 'regional' | 'national';

function DistributionCharts({ clientId, clientName }: DistributionChartsProps) {
  const [cohortScope, setCohortScope] = useState<CohortScope>('national');

  // Fetch all four distribution charts
  const { data: contributionData, isLoading: loadingContribution, error: errorContribution } = useQuery({
    queryKey: ['distribution', clientId, 'contribution', cohortScope],
    queryFn: async () => {
      const response = await axios.get<DistributionSeries>(
        `/api/v1/clients/${clientId}/distributions?metric=contribution&type=match_plus_core&cohort=${cohortScope}`
      );
      return response.data;
    },
  });

  const { data: autoEnrollData, isLoading: loadingAutoEnroll, error: errorAutoEnroll } = useQuery({
    queryKey: ['distribution', clientId, 'auto_enroll', cohortScope],
    queryFn: async () => {
      const response = await axios.get<DistributionSeries>(
        `/api/v1/clients/${clientId}/distributions?metric=auto_enroll&cohort=${cohortScope}`
      );
      return response.data;
    },
  });

  const { data: vestingData, isLoading: loadingVesting, error: errorVesting } = useQuery({
    queryKey: ['distribution', clientId, 'vesting', cohortScope],
    queryFn: async () => {
      const response = await axios.get<DistributionSeries>(
        `/api/v1/clients/${clientId}/distributions?metric=vesting&cohort=${cohortScope}`
      );
      return response.data;
    },
  });

  const { data: autoEscalationData, isLoading: loadingAutoEscalation, error: errorAutoEscalation } = useQuery({
    queryKey: ['distribution', clientId, 'auto_escalation', cohortScope],
    queryFn: async () => {
      const response = await axios.get<DistributionSeries>(
        `/api/v1/clients/${clientId}/distributions?metric=auto_escalation&cohort=${cohortScope}`
      );
      return response.data;
    },
  });

  const cohortSize = contributionData?.cohortSize || 260;
  const isLoading = loadingContribution || loadingAutoEnroll || loadingVesting || loadingAutoEscalation;

  return (
    <div className="distribution-charts">
      {/* Header */}
      <div className="charts-header">
        <h2>Distribution Analysis</h2>
        <p className="subtitle">
          Benchmark to Fidelity Healthcare {cohortScope === 'national' ? 'National' : 'Regional'} peer set (n={cohortSize})
        </p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="control-group">
          <button
            className={`control-btn ${cohortScope === 'regional' ? 'active' : ''}`}
            onClick={() => setCohortScope('regional')}
            disabled={isLoading}
          >
            Regional (n=8)
          </button>
          <button
            className={`control-btn ${cohortScope === 'national' ? 'active' : ''}`}
            onClick={() => setCohortScope('national')}
            disabled={isLoading}
          >
            National (n={cohortSize})
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Contribution Chart */}
        <div className="chart-container">
          {loadingContribution ? (
            <div className="chart-loading">
              <div className="loading-skeleton"></div>
            </div>
          ) : errorContribution ? (
            <div className="chart-error">Error loading contribution data</div>
          ) : contributionData ? (
            <DistributionCard series={contributionData} />
          ) : null}
        </div>

        {/* Auto-Enrollment Chart */}
        <div className="chart-container">
          {loadingAutoEnroll ? (
            <div className="chart-loading">
              <div className="loading-skeleton"></div>
            </div>
          ) : errorAutoEnroll ? (
            <div className="chart-error">Error loading auto-enrollment data</div>
          ) : autoEnrollData ? (
            <DistributionCard series={autoEnrollData} />
          ) : null}
        </div>

        {/* Vesting Chart */}
        <div className="chart-container">
          {loadingVesting ? (
            <div className="chart-loading">
              <div className="loading-skeleton"></div>
            </div>
          ) : errorVesting ? (
            <div className="chart-error">Error loading vesting data</div>
          ) : vestingData ? (
            <DistributionCard series={vestingData} />
          ) : null}
        </div>

        {/* Auto-Escalation Chart */}
        <div className="chart-container">
          {loadingAutoEscalation ? (
            <div className="chart-loading">
              <div className="loading-skeleton"></div>
            </div>
          ) : errorAutoEscalation ? (
            <div className="chart-error">Error loading auto-escalation data</div>
          ) : autoEscalationData ? (
            <DistributionCard series={autoEscalationData} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default DistributionCharts;

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface AssessmentFeature {
  lever: string;
  current_design: string;
  status: 'above' | 'median' | 'below';
  percentile: number;
  peer_summary: string;
  assessment: string;
}

interface PeerAssessmentData {
  client_name: string;
  cohort_description: string;
  features: AssessmentFeature[];
}

interface PeerAssessmentTableProps {
  clientId: string;
  clientName: string;
}

// Badge component for status indicators
const StatusBadge = ({ status }: { status: 'above' | 'median' | 'below' }) => {
  const config = {
    above: { icon: '▲', color: 'text-green-500' },
    median: { icon: '●', color: 'text-amber-500' },
    below: { icon: '▼', color: 'text-red-500' },
  };

  const { icon, color } = config[status];

  return (
    <span className={`inline-block text-lg ${color} mr-2`}>
      {icon}
    </span>
  );
};

function PeerAssessmentTable({ clientId, clientName }: PeerAssessmentTableProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['peer-assessment', clientId],
    queryFn: async () => {
      const response = await axios.get<PeerAssessmentData>(
        `/api/v1/clients/${clientId}/peer-assessment`
      );
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="loading">Loading peer assessment...</div>;
  }

  if (error) {
    return <div className="error">Error loading assessment data</div>;
  }

  return (
    <div className="peer-assessment-clean">
      {/* Header */}
      <div className="assessment-clean-header">
        <h2 className="assessment-clean-title">Peer Benchmarking & Assessment</h2>
        <p className="assessment-clean-subtitle">
          Comparison to {data?.cohort_description || 'Healthcare peer cohort (n=260 employers)'}
        </p>
      </div>

      {/* Table */}
      <div className="assessment-clean-table">
        {/* Header Row */}
        <div className="assessment-clean-header-row">
          <div className="col-lever-clean">Lever</div>
          <div className="col-current-clean">Current Design</div>
          <div className="col-peer-clean">Peer Average</div>
          <div className="col-delta-clean">Assessment</div>
        </div>

        {/* Body Rows */}
        {data?.features.map((feature, index) => (
          <div key={feature.lever} className="assessment-clean-row">
            {/* Lever */}
            <div className="col-lever-clean">
              <span className="lever-label-clean">{feature.lever}</span>
            </div>

            {/* Current Design */}
            <div className="col-current-clean">
              <div className="current-design-clean">
                <StatusBadge status={feature.status} />
                <span className="current-value-clean">{feature.current_design}</span>
              </div>
            </div>

            {/* Peer Average */}
            <div className="col-peer-clean">
              <p className="peer-text-clean">
                <strong>Peers:</strong>
              </p>
              <p className="peer-detail-clean">{feature.peer_summary}</p>
            </div>

            {/* Assessment */}
            <div className="col-delta-clean">
              <p className="delta-text-clean">
                <strong>Δ vs Peers:</strong>
              </p>
              <p className="delta-detail-clean">{feature.assessment}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="legend-clean">
        <span className="legend-label-clean">Legend:</span>
        <span className="legend-item-clean">
          <StatusBadge status="above" /> Above peers/best practice
        </span>
        <span className="legend-item-clean">
          <StatusBadge status="median" /> At peer median
        </span>
        <span className="legend-item-clean">
          <StatusBadge status="below" /> Below peers
        </span>
      </div>
    </div>
  );
}

export default PeerAssessmentTable;
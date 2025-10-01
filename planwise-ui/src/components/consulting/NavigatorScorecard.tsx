import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type ImpactLevel = 'strong' | 'positive' | 'negative' | 'neutral';

interface ScorecardFeature {
  lever: string;
  current_design: string;
  impacts: {
    recruitment: ImpactLevel;
    retention: ImpactLevel;
    cost_roi: ImpactLevel;
    retirement: ImpactLevel;
    efficiency: ImpactLevel;
  };
}

interface Recommendation {
  priority: 'now' | 'next' | 'later';
  title: string;
  description: string;
  impact_level: string;
  financial_impact: string;
  complexity: string;
}

interface NavigatorScorecardData {
  client_name: string;
  summary: string;
  features: ScorecardFeature[];
  recommendations: Recommendation[];
}

interface NavigatorScorecardProps {
  clientId: string;
  clientName: string;
}

function NavigatorScorecard({ clientId, clientName }: NavigatorScorecardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['navigator-scorecard', clientId],
    queryFn: async () => {
      const response = await axios.get<NavigatorScorecardData>(
        `/api/v1/clients/${clientId}/navigator-scorecard`
      );
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="loading">Loading scorecard...</div>;
  }

  if (error) {
    return <div className="error">Error loading scorecard data</div>;
  }

  const getImpactIcon = (impact: ImpactLevel) => {
    switch (impact) {
      case 'strong':
        return <span className="impact-icon strong">▲▲</span>;
      case 'positive':
        return <span className="impact-icon positive">▲</span>;
      case 'negative':
        return <span className="impact-icon negative">▼</span>;
      case 'neutral':
        return <span className="impact-icon neutral">-</span>;
    }
  };

  return (
    <div className="navigator-scorecard">
      <div className="scorecard-header">
        <h2>PlanWise Navigator Scorecard</h2>
        <p className="subtitle">Multi-dimensional impact analysis across 5 key dimensions</p>
      </div>

      <div className="summary-box">
        <strong>Summary:</strong> {data?.summary ||
          'Competitive blended contribution design with strong auto features; consider 3-year cliff vesting to promote retention and limit plan leakage, and increase auto-escalation cap to 15% to drive retirement readiness.'}
      </div>

      <table className="scorecard-table">
        <thead>
          <tr>
            <th className="col-lever">Lever</th>
            <th className="col-design">Current Design</th>
            <th className="col-impact">
              <div className="impact-header">
                <span className="icon">🎯</span>
                <span className="label">Rec</span>
              </div>
            </th>
            <th className="col-impact">
              <div className="impact-header">
                <span className="icon">👥</span>
                <span className="label">Ret</span>
              </div>
            </th>
            <th className="col-impact">
              <div className="impact-header">
                <span className="icon">💰</span>
                <span className="label">ROI</span>
              </div>
            </th>
            <th className="col-impact">
              <div className="impact-header">
                <span className="icon">🏖️</span>
                <span className="label">Ret</span>
              </div>
            </th>
            <th className="col-impact">
              <div className="impact-header">
                <span className="icon">⚡</span>
                <span className="label">Eff</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.features.map((feature, index) => (
            <tr key={feature.lever} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
              <td className="lever-name"><strong>{feature.lever}</strong></td>
              <td className="design-value">{feature.current_design}</td>
              <td className="impact-cell">{getImpactIcon(feature.impacts.recruitment)}</td>
              <td className="impact-cell">{getImpactIcon(feature.impacts.retention)}</td>
              <td className="impact-cell">{getImpactIcon(feature.impacts.cost_roi)}</td>
              <td className="impact-cell">{getImpactIcon(feature.impacts.retirement)}</td>
              <td className="impact-cell">{getImpactIcon(feature.impacts.efficiency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="recommendations-panel">
        <h3>🎯 PlanWise Navigator Considerations</h3>
        <p className="recommendations-subtitle">(Impact / Cost / Complexity)</p>

        {data?.recommendations.map((rec, index) => (
          <div key={index} className={`recommendation ${rec.priority}`}>
            <span className={`priority-badge ${rec.priority}`}>
              {rec.priority.toUpperCase()}
            </span>
            <div className="recommendation-content">
              <p className="recommendation-text">
                {rec.description}
              </p>
              <span className="recommendation-meta">
                ({rec.impact_level}, {rec.financial_impact}, {rec.complexity})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NavigatorScorecard;
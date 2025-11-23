import { useState } from 'react';
import PeerAssessmentTable from '../components/consulting/PeerAssessmentTable';
import NavigatorScorecard from '../components/consulting/NavigatorScorecard';
import DistributionCharts from '../components/consulting/DistributionCharts';

interface ConsultingViewsProps {
  clientId: string;
  clientName: string;
}

function ConsultingViews({ clientId, clientName }: ConsultingViewsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scorecard' | 'distributions'>('overview');

  return (
    <div className="consulting-views">
      {/* Header */}
      <div className="consulting-header">
        <div className="header-left">
          <h1 className="logo">PlanWise</h1>
          <span className="separator">|</span>
          <span className="client-name">Client: {clientName}</span>
          <span className="cohort-badge">Healthcare | n=260</span>
        </div>
        <button className="btn-export">Export PDF</button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'scorecard' ? 'active' : ''}`}
          onClick={() => setActiveTab('scorecard')}
        >
          🎯 Scorecard
        </button>
        <button
          className={`tab ${activeTab === 'distributions' ? 'active' : ''}`}
          onClick={() => setActiveTab('distributions')}
        >
          📈 Distributions
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && <PeerAssessmentTable clientId={clientId} />}
        {activeTab === 'scorecard' && <NavigatorScorecard clientId={clientId} />}
        {activeTab === 'distributions' && <DistributionCharts clientId={clientId} />}
      </div>
    </div>
  );
}

export default ConsultingViews;
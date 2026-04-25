const moment = require('moment');

class RiskVisualization {
  constructor() {
    this.colorSchemes = {
      risk: {
        critical: '#dc3545',
        high: '#fd7e14',
        medium: '#ffc107',
        low: '#28a745'
      },
      heatmap: {
        critical: 'rgba(220, 53, 69, 0.8)',
        high: 'rgba(253, 126, 20, 0.8)',
        medium: 'rgba(255, 193, 7, 0.8)',
        low: 'rgba(40, 167, 69, 0.8)'
      }
    };
  }

  async generateHeatmap(workflowId) {
    const heatmapData = {
      workflowId,
      timestamp: new Date().toISOString(),
      grid: this.generateRiskGrid(),
      factors: this.generateFactorHeatmap(),
      trends: this.generateTrendData(),
      summary: this.generateHeatmapSummary()
    };

    return heatmapData;
  }

  generateRiskGrid() {
    const factors = [
      'dataTypes', 'processingActivities', 'dataFlows', 'storage',
      'access', 'thirdParties', 'retention', 'encryption', 'consent', 'crossBorder'
    ];

    const grid = factors.map(factor => ({
      factor,
      cells: this.generateFactorCells(factor),
      metadata: {
        weight: this.getFactorWeight(factor),
        category: this.getFactorCategory(factor)
      }
    }));

    return grid;
  }

  generateFactorCells(factor) {
    const cells = [];
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    
    riskLevels.forEach(level => {
      const intensity = this.calculateIntensity(level, factor);
      cells.push({
        level,
        intensity,
        color: this.colorSchemes.heatmap[level],
        value: this.getRiskValue(level, factor),
        tooltip: this.generateTooltip(level, factor)
      });
    });

    return cells;
  }

  calculateIntensity(level, factor) {
    const baseIntensity = {
      low: 0.2,
      medium: 0.5,
      high: 0.75,
      critical: 1.0
    };

    const factorMultiplier = {
      dataTypes: 1.2,
      processingActivities: 1.3,
      encryption: 1.1,
      access: 1.15,
      thirdParties: 1.25,
      crossBorder: 1.4
    };

    const multiplier = factorMultiplier[factor] || 1.0;
    return Math.min(1.0, baseIntensity[level] * multiplier);
  }

  getRiskValue(level, factor) {
    const values = {
      low: 25,
      medium: 50,
      high: 75,
      critical: 95
    };

    const adjustments = {
      dataTypes: 5,
      processingActivities: 10,
      encryption: -5,
      access: 8,
      thirdParties: 12,
      crossBorder: 15
    };

    const baseValue = values[level];
    const adjustment = adjustments[factor] || 0;
    return Math.max(0, Math.min(100, baseValue + adjustment));
  }

  generateTooltip(level, factor) {
    const descriptions = {
      dataTypes: `Data type sensitivity: ${level} risk`,
      processingActivities: `Processing activity risk: ${level}`,
      dataFlows: `Data flow security: ${level} risk`,
      storage: `Data storage security: ${level} risk`,
      access: `Access control: ${level} risk`,
      thirdParties: `Third-party sharing: ${level} risk`,
      retention: `Data retention: ${level} risk`,
      encryption: `Encryption strength: ${level} risk`,
      consent: `Consent management: ${level} risk`,
      crossBorder: `Cross-border transfer: ${level} risk`
    };

    return {
      title: factor,
      description: descriptions[factor] || `${factor}: ${level} risk`,
      level,
      recommendations: this.getTooltipRecommendations(level, factor)
    };
  }

  getTooltipRecommendations(level, factor) {
    const recommendations = {
      critical: [
        'Immediate action required',
        'Comprehensive privacy impact assessment',
        'Implement enhanced controls'
      ],
      high: [
        'Urgent attention needed',
        'Review and strengthen controls',
        'Consider additional safeguards'
      ],
      medium: [
        'Monitor and review',
        'Implement standard controls',
        'Regular assessment recommended'
      ],
      low: [
        'Maintain current controls',
        'Periodic review',
        'Standard procedures sufficient'
      ]
    };

    return recommendations[level] || [];
  }

  generateFactorHeatmap() {
    const factors = [
      'dataTypes', 'processingActivities', 'dataFlows', 'storage',
      'access', 'thirdParties', 'retention', 'encryption', 'consent', 'crossBorder'
    ];

    return factors.map(factor => ({
      name: factor,
      displayName: this.getFactorDisplayName(factor),
      score: this.generateSampleScore(factor),
      trend: this.generateSampleTrend(),
      riskLevel: this.calculateRiskLevel(this.generateSampleScore(factor)),
      change: this.generateSampleChange(),
      details: this.getFactorDetails(factor)
    }));
  }

  getFactorDisplayName(factor) {
    const names = {
      dataTypes: 'Data Types',
      processingActivities: 'Processing Activities',
      dataFlows: 'Data Flows',
      storage: 'Storage Security',
      access: 'Access Control',
      thirdParties: 'Third Parties',
      retention: 'Data Retention',
      encryption: 'Encryption',
      consent: 'Consent Management',
      crossBorder: 'Cross-Border Transfer'
    };

    return names[factor] || factor;
  }

  generateSampleScore(factor) {
    const baseScores = {
      dataTypes: 65,
      processingActivities: 72,
      dataFlows: 58,
      storage: 45,
      access: 68,
      thirdParties: 75,
      retention: 52,
      encryption: 38,
      consent: 62,
      crossBorder: 78
    };

    const variation = Math.random() * 20 - 10;
    return Math.max(0, Math.min(100, baseScores[factor] + variation));
  }

  generateSampleTrend() {
    const trends = ['improving', 'stable', 'declining'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  generateSampleChange() {
    return Math.round((Math.random() * 20 - 10) * 10) / 10;
  }

  calculateRiskLevel(score) {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  getFactorDetails(factor) {
    const details = {
      dataTypes: {
        description: 'Analysis of personal and sensitive data types processed',
        metrics: ['sensitive data count', 'personal data categories', 'data volume'],
        controls: ['data classification', 'minimization', 'anonymization']
      },
      processingActivities: {
        description: 'Evaluation of data processing operations and purposes',
        metrics: ['processing complexity', 'automation level', 'decision impact'],
        controls: ['purpose limitation', 'processing records', 'impact assessments']
      },
      dataFlows: {
        description: 'Assessment of data movement and transfer patterns',
        metrics: ['flow complexity', 'border crossings', 'third-party involvement'],
        controls: ['flow monitoring', 'transfer agreements', 'transit encryption']
      },
      storage: {
        description: 'Review of data storage locations and security measures',
        metrics: ['storage duration', 'location security', 'backup protection'],
        controls: ['encryption at rest', 'access logs', 'secure deletion']
      },
      access: {
        description: 'Analysis of data access controls and permissions',
        metrics: ['user access scope', 'authentication strength', 'privilege levels'],
        controls: ['RBAC', 'MFA', 'access reviews']
      },
      thirdParties: {
        description: 'Evaluation of third-party data sharing and processing',
        metrics: ['vendor count', 'DPAs in place', 'international transfers'],
        controls: ['vendor assessments', 'contractual safeguards', 'audits']
      },
      retention: {
        description: 'Assessment of data retention policies and practices',
        metrics: ['retention periods', 'deletion processes', 'policy compliance'],
        controls: ['retention schedules', 'automated deletion', 'policy documentation']
      },
      encryption: {
        description: 'Review of encryption implementation and key management',
        metrics: ['algorithm strength', 'key rotation', 'coverage scope'],
        controls: ['strong encryption', 'key management', 'crypto policies']
      },
      consent: {
        description: 'Analysis of consent collection and management processes',
        metrics: ['consent coverage', 'withdrawal mechanisms', 'record keeping'],
        controls: ['explicit consent', 'consent management', 'withdrawal processes']
      },
      crossBorder: {
        description: 'Evaluation of international data transfer mechanisms',
        metrics: ['transfer volume', 'destination countries', 'legal bases'],
        controls: ['transfer mechanisms', 'impact assessments', 'adequacy checks']
      }
    };

    return details[factor] || { description: 'Factor analysis', metrics: [], controls: [] };
  }

  generateTrendData() {
    const periods = 12;
    const trends = [];

    for (let i = periods - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'months').format('YYYY-MM');
      trends.push({
        period: date,
        overall: Math.max(20, Math.min(95, 65 + Math.random() * 30 - 15 + (periods - i) * 2)),
        critical: Math.max(0, Math.floor(Math.random() * 5)),
        high: Math.max(0, Math.floor(Math.random() * 8)),
        medium: Math.max(0, Math.floor(Math.random() * 12)),
        low: Math.max(0, Math.floor(Math.random() * 15))
      });
    }

    return trends;
  }

  generateHeatmapSummary() {
    return {
      totalAssessments: Math.floor(Math.random() * 50) + 10,
      averageRisk: Math.round((Math.random() * 40 + 30) * 10) / 10,
      riskDistribution: {
        critical: Math.floor(Math.random() * 5),
        high: Math.floor(Math.random() * 10) + 2,
        medium: Math.floor(Math.random() * 15) + 5,
        low: Math.floor(Math.random() * 20) + 10
      },
      trend: this.generateSampleTrend(),
      lastUpdated: new Date().toISOString(),
      keyInsights: [
        'Processing activities show highest risk concentration',
        'Encryption controls need improvement',
        'Cross-border transfers require attention',
        'Access controls are generally adequate'
      ]
    };
  }

  getFactorWeight(factor) {
    const weights = {
      dataTypes: 0.15,
      processingActivities: 0.20,
      dataFlows: 0.15,
      storage: 0.10,
      access: 0.15,
      thirdParties: 0.10,
      retention: 0.05,
      encryption: 0.05,
      consent: 0.03,
      crossBorder: 0.02
    };

    return weights[factor] || 0.1;
  }

  getFactorCategory(factor) {
    const categories = {
      dataTypes: 'data',
      processingActivities: 'processing',
      dataFlows: 'transfer',
      storage: 'storage',
      access: 'security',
      thirdParties: 'governance',
      retention: 'compliance',
      encryption: 'security',
      consent: 'rights',
      crossBorder: 'transfer'
    };

    return categories[factor] || 'general';
  }

  generateRiskDashboard(workflowId) {
    return {
      workflowId,
      timestamp: new Date().toISOString(),
      heatmap: this.generateHeatmap(workflowId),
      charts: this.generateChartData(),
      alerts: this.generateRiskAlerts(),
      metrics: this.generateKeyMetrics()
    };
  }

  generateChartData() {
    return {
      riskTrend: this.generateTrendData(),
      factorComparison: this.generateFactorComparison(),
      riskDistribution: this.generateRiskDistribution(),
      mitigationProgress: this.generateMitigationProgress()
    };
  }

  generateFactorComparison() {
    const factors = [
      'dataTypes', 'processingActivities', 'dataFlows', 'storage',
      'access', 'thirdParties', 'retention', 'encryption', 'consent', 'crossBorder'
    ];

    return factors.map(factor => ({
      factor: this.getFactorDisplayName(factor),
      current: this.generateSampleScore(factor),
      target: Math.max(20, this.generateSampleScore(factor) - 20),
      benchmark: 45
    }));
  }

  generateRiskDistribution() {
    return {
      categories: ['Critical', 'High', 'Medium', 'Low'],
      values: [
        Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 10) + 2,
        Math.floor(Math.random() * 15) + 5,
        Math.floor(Math.random() * 20) + 10
      ],
      colors: [
        this.colorSchemes.risk.critical,
        this.colorSchemes.risk.high,
        this.colorSchemes.risk.medium,
        this.colorSchemes.risk.low
      ]
    };
  }

  generateMitigationProgress() {
    return {
      completed: Math.floor(Math.random() * 20) + 5,
      inProgress: Math.floor(Math.random() * 15) + 3,
      planned: Math.floor(Math.random() * 10) + 2,
      overdue: Math.floor(Math.random() * 5)
    };
  }

  generateRiskAlerts() {
    const alerts = [];
    const alertTypes = [
      {
        level: 'critical',
        message: 'Critical risk detected in processing activities',
        action: 'Conduct immediate privacy impact assessment'
      },
      {
        level: 'high',
        message: 'High risk in third-party data sharing',
        action: 'Review and update data processing agreements'
      },
      {
        level: 'medium',
        message: 'Medium risk in data retention practices',
        action: 'Update retention policies and schedules'
      }
    ];

    const numAlerts = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numAlerts; i++) {
      const alert = alertTypes[i % alertTypes.length];
      alerts.push({
        ...alert,
        id: `alert-${Date.now()}-${i}`,
        timestamp: new Date().toISOString(),
        factor: this.getRandomFactor()
      });
    }

    return alerts;
  }

  getRandomFactor() {
    const factors = ['dataTypes', 'processingActivities', 'dataFlows', 'storage', 'access'];
    return factors[Math.floor(Math.random() * factors.length)];
  }

  generateKeyMetrics() {
    return {
      totalRiskScore: Math.round((Math.random() * 40 + 40) * 10) / 10,
      riskTrend: this.generateSampleTrend(),
      complianceRate: Math.round(Math.random() * 30 + 70),
      mitigationCoverage: Math.round(Math.random() * 40 + 50),
      lastAssessment: moment().subtract(Math.floor(Math.random() * 30), 'days').format('YYYY-MM-DD')
    };
  }
}

module.exports = RiskVisualization;

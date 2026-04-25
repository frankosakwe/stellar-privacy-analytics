const moment = require('moment');
const _ = require('lodash');

class RiskTracker {
  constructor() {
    this.riskHistory = new Map();
    this.trendAnalysis = new Map();
    this.baselineMetrics = new Map();
  }

  async trackRiskAssessment(assessment) {
    const workflowId = assessment.workflowId;
    const timestamp = new Date().toISOString();

    const riskEntry = {
      id: assessment.id,
      timestamp,
      workflowId,
      overallScore: assessment.scores.overall,
      category: assessment.category.level,
      factorScores: { ...assessment.scores },
      riskFactors: this.summarizeRiskFactors(assessment.riskFactors),
      mitigations: assessment.mitigations.length,
      recommendations: assessment.recommendations.length
    };

    if (!this.riskHistory.has(workflowId)) {
      this.riskHistory.set(workflowId, []);
    }

    this.riskHistory.get(workflowId).push(riskEntry);
    this.updateTrendAnalysis(workflowId);
    this.updateBaselineMetrics(workflowId);

    return riskEntry;
  }

  summarizeRiskFactors(riskFactors) {
    const summary = {};
    
    Object.keys(riskFactors).forEach(factor => {
      const factorData = riskFactors[factor];
      summary[factor] = {
        score: factorData.score,
        level: this.calculateRiskLevel(factorData.score),
        keyIssues: factorData.details ? factorData.details.slice(0, 3) : []
      };
    });

    return summary;
  }

  calculateRiskLevel(score) {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  updateTrendAnalysis(workflowId) {
    const history = this.riskHistory.get(workflowId) || [];
    if (history.length < 2) return;

    const recent = history.slice(-10);
    const older = history.slice(-20, -10);

    const trends = {
      overall: this.calculateTrend(recent, older, 'overallScore'),
      factors: {}
    };

    const factors = ['dataTypes', 'processingActivities', 'dataFlows', 'storage', 'access', 'thirdParties', 'retention', 'encryption', 'consent', 'crossBorder'];
    
    factors.forEach(factor => {
      trends.factors[factor] = this.calculateFactorTrend(recent, older, factor);
    });

    this.trendAnalysis.set(workflowId, trends);
  }

  calculateTrend(recent, older, metric) {
    if (recent.length === 0 || older.length === 0) {
      return {
        direction: 'stable',
        change: 0,
        confidence: 'low'
      };
    }

    const recentAvg = recent.reduce((sum, item) => sum + item[metric], 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item[metric], 0) / older.length;

    const change = recentAvg - olderAvg;
    const direction = change > 5 ? 'improving' : (change < -5 ? 'declining' : 'stable');
    
    let confidence = 'medium';
    if (recent.length >= 5 && older.length >= 5) {
      confidence = 'high';
    } else if (recent.length < 3 || older.length < 3) {
      confidence = 'low';
    }

    return {
      direction,
      change: Math.round(change * 10) / 10,
      confidence,
      recentAverage: Math.round(recentAvg * 10) / 10,
      olderAverage: Math.round(olderAvg * 10) / 10,
      dataPoints: recent.length + older.length
    };
  }

  calculateFactorTrend(recent, older, factor) {
    const recentFactorScores = recent.map(entry => entry.factorScores[factor] || 0);
    const olderFactorScores = older.map(entry => entry.factorScores[factor] || 0);

    if (recentFactorScores.length === 0 || olderFactorScores.length === 0) {
      return {
        direction: 'stable',
        change: 0,
        confidence: 'low'
      };
    }

    const recentAvg = recentFactorScores.reduce((sum, score) => sum + score, 0) / recentFactorScores.length;
    const olderAvg = olderFactorScores.reduce((sum, score) => sum + score, 0) / olderFactorScores.length;

    const change = recentAvg - olderAvg;
    const direction = change > 3 ? 'improving' : (change < -3 ? 'declining' : 'stable');
    
    let confidence = 'medium';
    if (recentFactorScores.length >= 5 && olderFactorScores.length >= 5) {
      confidence = 'high';
    } else if (recentFactorScores.length < 3 || olderFactorScores.length < 3) {
      confidence = 'low';
    }

    return {
      direction,
      change: Math.round(change * 10) / 10,
      confidence,
      recentAverage: Math.round(recentAvg * 10) / 10,
      olderAverage: Math.round(olderAvg * 10) / 10
    };
  }

  updateBaselineMetrics(workflowId) {
    const history = this.riskHistory.get(workflowId) || [];
    if (history.length < 5) return;

    const recentHistory = history.slice(-30);
    
    const baseline = {
      workflowId,
      established: new Date().toISOString(),
      dataPoints: recentHistory.length,
      overall: {
        average: this.calculateAverage(recentHistory, 'overallScore'),
        min: Math.min(...recentHistory.map(h => h.overallScore)),
        max: Math.max(...recentHistory.map(h => h.overallScore)),
        standardDeviation: this.calculateStandardDeviation(recentHistory, 'overallScore')
      },
      factors: {},
      categoryDistribution: this.calculateCategoryDistribution(recentHistory),
      riskVelocity: this.calculateRiskVelocity(recentHistory),
      riskVolatility: this.calculateRiskVolatility(recentHistory)
    };

    const factors = ['dataTypes', 'processingActivities', 'dataFlows', 'storage', 'access', 'thirdParties', 'retention', 'encryption', 'consent', 'crossBorder'];
    
    factors.forEach(factor => {
      const scores = recentHistory.map(h => h.factorScores[factor] || 0);
      baseline.factors[factor] = {
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        min: Math.min(...scores),
        max: Math.max(...scores),
        standardDeviation: this.calculateStandardDeviation(scores)
      };
    });

    this.baselineMetrics.set(workflowId, baseline);
  }

  calculateAverage(history, field) {
    const values = history.map(h => h[field]);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  calculateStandardDeviation(history, field = null) {
    const values = field ? history.map(h => h[field]) : history;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(variance);
  }

  calculateCategoryDistribution(history) {
    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    history.forEach(entry => {
      if (distribution.hasOwnProperty(entry.category)) {
        distribution[entry.category]++;
      }
    });

    const total = history.length;
    Object.keys(distribution).forEach(key => {
      distribution[key] = {
        count: distribution[key],
        percentage: Math.round((distribution[key] / total) * 100)
      };
    });

    return distribution;
  }

  calculateRiskVelocity(history) {
    if (history.length < 2) return 0;

    const scores = history.map(h => h.overallScore);
    const velocities = [];
    
    for (let i = 1; i < scores.length; i++) {
      const velocity = scores[i] - scores[i - 1];
      velocities.push(velocity);
    }

    const averageVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    return Math.round(averageVelocity * 100) / 100;
  }

  calculateRiskVolatility(history) {
    if (history.length < 3) return 0;

    const scores = history.map(h => h.overallScore);
    const standardDeviation = this.calculateStandardDeviation(scores);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return mean > 0 ? Math.round((standardDeviation / mean) * 100) / 100 : 0;
  }

  async getRiskHistory(workflowId, options = {}) {
    const history = this.riskHistory.get(workflowId) || [];
    
    let filteredHistory = history;
    
    if (options.startDate && options.endDate) {
      const start = new Date(options.startDate);
      const end = new Date(options.endDate);
      filteredHistory = history.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= start && entryDate <= end;
      });
    }

    if (options.limit) {
      filteredHistory = filteredHistory.slice(-options.limit);
    }

    if (options.sortBy) {
      filteredHistory = _.orderBy(filteredHistory, [options.sortBy], [options.sortOrder || 'desc']);
    }

    return {
      workflowId,
      totalEntries: history.length,
      filteredEntries: filteredHistory.length,
      entries: filteredHistory,
      summary: this.generateHistorySummary(filteredHistory)
    };
  }

  generateHistorySummary(history) {
    if (history.length === 0) {
      return {
        averageScore: 0,
        riskTrend: 'stable',
        categoryDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
        firstAssessment: null,
        lastAssessment: null
      };
    }

    const scores = history.map(h => h.overallScore);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const trend = this.calculateSimpleTrend(scores);
    const categoryDistribution = this.calculateCategoryDistribution(history);

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      riskTrend: trend,
      categoryDistribution,
      firstAssessment: history[0].timestamp,
      lastAssessment: history[history.length - 1].timestamp,
      assessmentCount: history.length
    };
  }

  calculateSimpleTrend(scores) {
    if (scores.length < 2) return 'stable';

    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    
    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  async getTrendAnalysis(workflowId) {
    return this.trendAnalysis.get(workflowId) || {
      overall: { direction: 'stable', change: 0, confidence: 'low' },
      factors: {}
    };
  }

  async getBaselineMetrics(workflowId) {
    return this.baselineMetrics.get(workflowId) || null;
  }

  async generateRiskReport(workflowId, options = {}) {
    const history = await this.getRiskHistory(workflowId, options);
    const trends = await this.getTrendAnalysis(workflowId);
    const baseline = await this.getBaselineMetrics(workflowId);

    const report = {
      workflowId,
      generatedAt: new Date().toISOString(),
      period: {
        start: options.startDate || (history.entries[0]?.timestamp || null),
        end: options.endDate || (history.entries[history.entries.length - 1]?.timestamp || null)
      },
      summary: history.summary,
      trends,
      baseline,
      insights: this.generateRiskInsights(history, trends, baseline),
      recommendations: this.generateTrendRecommendations(trends, baseline),
      visualizations: {
        sparkline: this.generateSparklineData(history.entries),
        distribution: this.generateDistributionData(history.entries),
        timeline: this.generateTimelineData(history.entries)
      }
    };

    return report;
  }

  generateRiskInsights(history, trends, baseline) {
    const insights = [];

    if (history.summary.averageScore > 70) {
      insights.push({
        type: 'warning',
        title: 'High Average Risk Score',
        description: `The average risk score of ${history.summary.averageScore} indicates elevated privacy risk levels`,
        priority: 'high'
      });
    }

    if (trends.overall.direction === 'declining' && Math.abs(trends.overall.change) > 10) {
      insights.push({
        type: 'alert',
        title: 'Deteriorating Risk Trend',
        description: `Risk scores have declined by ${Math.abs(trends.overall.change)} points recently`,
        priority: 'high'
      });
    }

    if (trends.overall.direction === 'improving' && Math.abs(trends.overall.change) > 5) {
      insights.push({
        type: 'positive',
        title: 'Improving Risk Trend',
        description: `Risk scores have improved by ${trends.overall.change} points recently`,
        priority: 'low'
      });
    }

    if (baseline && baseline.riskVolatility > 0.3) {
      insights.push({
        type: 'warning',
        title: 'High Risk Volatility',
        description: 'Risk scores show high volatility, indicating inconsistent privacy controls',
        priority: 'medium'
      });
    }

    const criticalFactors = this.identifyCriticalFactors(trends);
    if (criticalFactors.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Critical Risk Factors',
        description: `The following factors show declining trends: ${criticalFactors.join(', ')}`,
        priority: 'medium'
      });
    }

    return insights;
  }

  identifyCriticalFactors(trends) {
    const criticalFactors = [];
    
    Object.keys(trends.factors).forEach(factor => {
      const factorTrend = trends.factors[factor];
      if (factorTrend.direction === 'declining' && Math.abs(factorTrend.change) > 5) {
        criticalFactors.push(factor);
      }
    });

    return criticalFactors;
  }

  generateTrendRecommendations(trends, baseline) {
    const recommendations = [];

    if (trends.overall.direction === 'declining') {
      recommendations.push({
        priority: 'high',
        action: 'Address declining risk trend',
        description: 'Implement immediate corrective actions to reverse the declining risk trend',
        timeframe: '1-2 weeks'
      });
    }

    const criticalFactors = this.identifyCriticalFactors(trends);
    criticalFactors.forEach(factor => {
      recommendations.push({
        priority: 'medium',
        action: `Improve ${factor} controls`,
        description: `Focus on improving ${factor} to address declining trend`,
        timeframe: '2-4 weeks'
      });
    });

    if (baseline && baseline.riskVolatility > 0.3) {
      recommendations.push({
        priority: 'medium',
        action: 'Reduce risk volatility',
        description: 'Implement consistent privacy controls to reduce score volatility',
        timeframe: '4-6 weeks'
      });
    }

    if (trends.overall.direction === 'improving') {
      recommendations.push({
        priority: 'low',
        action: 'Maintain positive trend',
        description: 'Continue current practices to maintain improving risk trend',
        timeframe: 'ongoing'
      });
    }

    return recommendations;
  }

  generateSparklineData(entries) {
    return entries.map((entry, index) => ({
      index,
      date: entry.timestamp,
      value: entry.overallScore,
      category: entry.category
    }));
  }

  generateDistributionData(entries) {
    const distribution = { critical: 0, high: 0, medium: 0, low: 0 };
    
    entries.forEach(entry => {
      if (distribution.hasOwnProperty(entry.category)) {
        distribution[entry.category]++;
      }
    });

    return Object.keys(distribution).map(key => ({
      category: key,
      count: distribution[key],
      percentage: Math.round((distribution[key] / entries.length) * 100)
    }));
  }

  generateTimelineData(entries) {
    return entries.map(entry => ({
      timestamp: entry.timestamp,
      overallScore: entry.overallScore,
      category: entry.category,
      mitigations: entry.mitigations,
      recommendations: entry.recommendations
    }));
  }

  async compareWorkflows(workflowIds, options = {}) {
    const comparisons = {
      workflows: workflowIds,
      comparisonDate: new Date().toISOString(),
      metrics: {},
      rankings: {},
      insights: []
    };

    const workflowData = {};
    
    for (const workflowId of workflowIds) {
      const history = await this.getRiskHistory(workflowId, options);
      const trends = await this.getTrendAnalysis(workflowId);
      const baseline = await this.getBaselineMetrics(workflowId);
      
      workflowData[workflowId] = {
        history: history.summary,
        trends,
        baseline
      };
    }

    comparisons.metrics = this.calculateComparativeMetrics(workflowData);
    comparisons.rankings = this.calculateRankings(comparisons.metrics);
    comparisons.insights = this.generateComparativeInsights(comparisons.metrics, comparisons.rankings);

    return comparisons;
  }

  calculateComparativeMetrics(workflowData) {
    const metrics = {
      averageScores: {},
      riskTrends: {},
      volatilities: {},
      categoryDistributions: {}
    };

    Object.keys(workflowData).forEach(workflowId => {
      const data = workflowData[workflowId];
      metrics.averageScores[workflowId] = data.history.averageScore;
      metrics.riskTrends[workflowId] = data.trends.overall.direction;
      metrics.volatilities[workflowId] = data.baseline?.riskVolatility || 0;
      metrics.categoryDistributions[workflowId] = data.history.categoryDistribution;
    });

    return metrics;
  }

  calculateRankings(metrics) {
    const rankings = {
      byAverageScore: this.rankByScore(metrics.averageScores, 'asc'),
      byVolatility: this.rankByScore(metrics.volatilities, 'desc'),
      byCriticalCount: this.rankByCriticalCount(metrics.categoryDistributions)
    };

    return rankings;
  }

  rankByScore(scores, order = 'asc') {
    const sorted = Object.keys(scores)
      .map(workflowId => ({
        workflowId,
        score: scores[workflowId]
      }))
      .sort((a, b) => order === 'asc' ? a.score - b.score : b.score - a.score);

    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }

  rankByCriticalCount(distributions) {
    const criticalCounts = {};
    Object.keys(distributions).forEach(workflowId => {
      criticalCounts[workflowId] = distributions[workflowId].critical?.count || 0;
    });

    return this.rankByScore(criticalCounts, 'desc');
  }

  generateComparativeInsights(metrics, rankings) {
    const insights = [];

    const bestWorkflow = rankings.byAverageScore[0].workflowId;
    const worstWorkflow = rankings.byAverageScore[rankings.byAverageScore.length - 1].workflowId;

    insights.push({
      type: 'comparison',
      title: 'Best Performing Workflow',
      description: `Workflow ${bestWorkflow} has the lowest average risk score`,
      priority: 'info'
    });

    insights.push({
      type: 'comparison',
      title: 'Workflow Requiring Attention',
      description: `Workflow ${worstWorkflow} has the highest average risk score`,
      priority: 'warning'
    });

    const highVolatilityWorkflows = rankings.byVolatility.slice(0, 2);
    if (highVolatilityWorkflows.length > 0) {
      insights.push({
        type: 'volatility',
        title: 'High Volatility Workflows',
        description: `Workflows ${highVolatilityWorkflows.map(w => w.workflowId).join(', ')} show high risk volatility`,
        priority: 'medium'
      });
    }

    return insights;
  }

  async exportRiskData(workflowId, format = 'json') {
    const history = await this.getRiskHistory(workflowId);
    const trends = await this.getTrendAnalysis(workflowId);
    const baseline = await this.getBaselineMetrics(workflowId);

    const exportData = {
      workflowId,
      exportDate: new Date().toISOString(),
      format,
      history,
      trends,
      baseline
    };

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    }

    return exportData;
  }

  convertToCSV(data) {
    const headers = ['Timestamp', 'OverallScore', 'Category', 'DataTypes', 'ProcessingActivities', 'DataFlows', 'Storage', 'Access', 'ThirdParties', 'Retention', 'Encryption', 'Consent', 'CrossBorder'];
    
    const rows = data.history.entries.map(entry => [
      entry.timestamp,
      entry.overallScore,
      entry.category,
      entry.factorScores.dataTypes || 0,
      entry.factorScores.processingActivities || 0,
      entry.factorScores.dataFlows || 0,
      entry.factorScores.storage || 0,
      entry.factorScores.access || 0,
      entry.factorScores.thirdParties || 0,
      entry.factorScores.retention || 0,
      entry.factorScores.encryption || 0,
      entry.factorScores.consent || 0,
      entry.factorScores.crossBorder || 0
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  async cleanupOldData(retentionDays = 365) {
    const cutoffDate = moment().subtract(retentionDays, 'days').toDate();
    let deletedCount = 0;

    for (const [workflowId, history] of this.riskHistory.entries()) {
      const originalLength = history.length;
      const filteredHistory = history.filter(entry => new Date(entry.timestamp) >= cutoffDate);
      
      if (filteredHistory.length !== originalLength) {
        this.riskHistory.set(workflowId, filteredHistory);
        deletedCount += originalLength - filteredHistory.length;
      }
    }

    return {
      deletedCount,
      retentionDays,
      cutoffDate: cutoffDate.toISOString()
    };
  }
}

module.exports = RiskTracker;

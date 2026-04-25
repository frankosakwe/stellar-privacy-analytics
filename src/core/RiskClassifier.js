class RiskClassifier {
  constructor() {
    this.thresholds = {
      critical: 90,
      high: 70,
      medium: 40,
      low: 0
    };
  }

  classifyRisk(score) {
    if (score >= this.thresholds.critical) {
      return {
        level: 'critical',
        score: score,
        description: 'Critical privacy risk requiring immediate action',
        color: '#dc3545',
        priority: 1
      };
    } else if (score >= this.thresholds.high) {
      return {
        level: 'high',
        score: score,
        description: 'High privacy risk requiring urgent attention',
        color: '#fd7e14',
        priority: 2
      };
    } else if (score >= this.thresholds.medium) {
      return {
        level: 'medium',
        score: score,
        description: 'Medium privacy risk requiring mitigation',
        color: '#ffc107',
        priority: 3
      };
    } else {
      return {
        level: 'low',
        score: score,
        description: 'Low privacy risk with standard controls',
        color: '#28a745',
        priority: 4
      };
    }
  }

  classifyMultipleScores(scores) {
    const classifications = {};
    
    Object.keys(scores).forEach(key => {
      if (key !== 'overall') {
        classifications[key] = this.classifyRisk(scores[key]);
      }
    });

    classifications.overall = this.classifyRisk(scores.overall);

    return classifications;
  }

  getRiskLevelDistribution(assessments) {
    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    assessments.forEach(assessment => {
      const level = assessment.category.level;
      if (distribution.hasOwnProperty(level)) {
        distribution[level]++;
      }
    });

    return distribution;
  }

  getRiskTrends(history) {
    if (history.length < 2) {
      return {
        trend: 'stable',
        change: 0,
        direction: 'none'
      };
    }

    const recent = history.slice(-10);
    const older = history.slice(-20, -10);

    if (older.length === 0) {
      return {
        trend: 'insufficient_data',
        change: 0,
        direction: 'none'
      };
    }

    const recentAvg = recent.reduce((sum, item) => sum + item.overallScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.overallScore, 0) / older.length;

    const change = recentAvg - olderAvg;
    const trend = Math.abs(change) < 5 ? 'stable' : (change > 0 ? 'increasing' : 'decreasing');
    const direction = change > 0 ? 'up' : (change < 0 ? 'down' : 'stable');

    return {
      trend,
      change: Math.round(change * 10) / 10,
      direction,
      recentAverage: Math.round(recentAvg * 10) / 10,
      olderAverage: Math.round(olderAvg * 10) / 10
    };
  }

  setCustomThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  getThresholds() {
    return { ...this.thresholds };
  }

  validateThresholds(thresholds) {
    const required = ['critical', 'high', 'medium', 'low'];
    const missing = required.filter(key => !thresholds.hasOwnProperty(key));
    
    if (missing.length > 0) {
      throw new Error(`Missing threshold values: ${missing.join(', ')}`);
    }

    if (thresholds.critical <= thresholds.high ||
        thresholds.high <= thresholds.medium ||
        thresholds.medium <= thresholds.low ||
        thresholds.low < 0 ||
        thresholds.critical > 100) {
      throw new Error('Invalid threshold values. Must be: critical > high > medium > low >= 0, critical <= 100');
    }

    return true;
  }
}

module.exports = RiskClassifier;

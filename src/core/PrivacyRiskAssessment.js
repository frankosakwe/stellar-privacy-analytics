const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
const RiskClassifier = require('./RiskClassifier');
const MitigationEngine = require('./MitigationEngine');

class PrivacyRiskAssessment {
  constructor() {
    this.classifier = new RiskClassifier();
    this.mitigationEngine = new MitigationEngine();
    this.assessments = new Map();
    this.riskHistory = new Map();
  }

  async assessWorkflow(workflow, customCriteria = {}) {
    const assessmentId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const riskFactors = this.analyzeRiskFactors(workflow);
    const scores = this.calculateRiskScores(riskFactors, customCriteria);
    const category = this.classifier.classifyRisk(scores.overall);
    const mitigations = this.mitigationEngine.generateMitigations(riskFactors, category);
    
    const assessment = {
      id: assessmentId,
      workflowId: workflow.id || uuidv4(),
      timestamp,
      workflow: this.sanitizeWorkflow(workflow),
      riskFactors,
      scores,
      category,
      mitigations,
      recommendations: this.generateRecommendations(scores, category, mitigations)
    };

    this.assessments.set(assessmentId, assessment);
    this.updateRiskHistory(assessment);
    
    return assessment;
  }

  analyzeRiskFactors(workflow) {
    const factors = {
      dataTypes: this.analyzeDataTypes(workflow.dataTypes || []),
      processingActivities: this.analyzeProcessingActivities(workflow.activities || []),
      dataFlows: this.analyzeDataFlows(workflow.dataFlows || []),
      storage: this.analyzeStorage(workflow.storage || {}),
      access: this.analyzeAccess(workflow.access || {}),
      thirdParties: this.analyzeThirdParties(workflow.thirdParties || []),
      retention: this.analyzeRetention(workflow.retention || {}),
      encryption: this.analyzeEncryption(workflow.encryption || {}),
      consent: this.analyzeConsent(workflow.consent || {}),
      crossBorder: this.analyzeCrossBorder(workflow.crossBorder || false)
    };

    return factors;
  }

  calculateRiskScores(riskFactors, customCriteria) {
    const weights = {
      ...this.getDefaultWeights(),
      ...customCriteria.weights
    };

    const scores = {
      dataTypes: this.calculateFactorScore(riskFactors.dataTypes, weights.dataTypes),
      processingActivities: this.calculateFactorScore(riskFactors.processingActivities, weights.processingActivities),
      dataFlows: this.calculateFactorScore(riskFactors.dataFlows, weights.dataFlows),
      storage: this.calculateFactorScore(riskFactors.storage, weights.storage),
      access: this.calculateFactorScore(riskFactors.access, weights.access),
      thirdParties: this.calculateFactorScore(riskFactors.thirdParties, weights.thirdParties),
      retention: this.calculateFactorScore(riskFactors.retention, weights.retention),
      encryption: this.calculateFactorScore(riskFactors.encryption, weights.encryption),
      consent: this.calculateFactorScore(riskFactors.consent, weights.consent),
      crossBorder: this.calculateFactorScore(riskFactors.crossBorder, weights.crossBorder)
    };

    scores.overall = this.calculateOverallScore(scores, weights);

    return scores;
  }

  calculateFactorScore(factor, weight) {
    if (!factor || typeof factor.score !== 'number') {
      return 0;
    }
    return factor.score * weight;
  }

  calculateOverallScore(factorScores, weights) {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const weightedSum = Object.values(factorScores).reduce((sum, score) => sum + score, 0);
    return Math.min(100, Math.max(0, (weightedSum / totalWeight) * 100));
  }

  getDefaultWeights() {
    return {
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
  }

  analyzeDataTypes(dataTypes) {
    const sensitiveTypes = ['biometric', 'health', 'financial', 'political', 'religious', 'criminal'];
    const personalTypes = ['name', 'email', 'phone', 'address', 'id'];
    
    let score = 0;
    let details = [];

    dataTypes.forEach(type => {
      if (sensitiveTypes.includes(type.toLowerCase())) {
        score += 25;
        details.push(`High sensitivity: ${type}`);
      } else if (personalTypes.includes(type.toLowerCase())) {
        score += 15;
        details.push(`Personal data: ${type}`);
      } else {
        score += 5;
        details.push(`General data: ${type}`);
      }
    });

    return {
      score: Math.min(100, score),
      details,
      count: dataTypes.length,
      sensitiveCount: dataTypes.filter(t => sensitiveTypes.includes(t.toLowerCase())).length
    };
  }

  analyzeProcessingActivities(activities) {
    const highRiskActivities = ['profiling', 'automated_decision', 'large_scale_processing', 'systematic_monitoring'];
    const mediumRiskActivities = ['analytics', 'marketing', 'sharing', 'transfer'];
    
    let score = 0;
    let details = [];

    activities.forEach(activity => {
      if (highRiskActivities.includes(activity.toLowerCase())) {
        score += 30;
        details.push(`High risk activity: ${activity}`);
      } else if (mediumRiskActivities.includes(activity.toLowerCase())) {
        score += 15;
        details.push(`Medium risk activity: ${activity}`);
      } else {
        score += 5;
        details.push(`Low risk activity: ${activity}`);
      }
    });

    return {
      score: Math.min(100, score),
      details,
      count: activities.length,
      highRiskCount: activities.filter(a => highRiskActivities.includes(a.toLowerCase())).length
    };
  }

  analyzeDataFlows(dataFlows) {
    let score = 0;
    let details = [];

    dataFlows.forEach(flow => {
      if (flow.crossBorder) {
        score += 20;
        details.push(`Cross-border data flow: ${flow.from} → ${flow.to}`);
      }
      if (flow.thirdParty) {
        score += 15;
        details.push(`Third-party data flow: ${flow.from} → ${flow.to}`);
      }
      if (flow.public) {
        score += 25;
        details.push(`Public data exposure: ${flow.from} → ${flow.to}`);
      } else {
        score += 5;
        details.push(`Internal data flow: ${flow.from} → ${flow.to}`);
      }
    });

    return {
      score: Math.min(100, score),
      details,
      count: dataFlows.length,
      crossBorderCount: dataFlows.filter(f => f.crossBorder).length
    };
  }

  analyzeStorage(storage) {
    let score = 0;
    let details = [];

    if (!storage.encrypted) {
      score += 30;
      details.push('Unencrypted storage');
    }

    if (storage.location === 'cloud_public') {
      score += 20;
      details.push('Public cloud storage');
    } else if (storage.location === 'cloud_private') {
      score += 10;
      details.push('Private cloud storage');
    }

    if (storage.duration && storage.duration > 365) {
      score += 15;
      details.push(`Long-term storage: ${storage.duration} days`);
    }

    if (storage.backup && !storage.backup.encrypted) {
      score += 10;
      details.push('Unencrypted backups');
    }

    return {
      score: Math.min(100, score),
      details,
      encrypted: storage.encrypted || false,
      location: storage.location || 'unknown'
    };
  }

  analyzeAccess(access) {
    let score = 0;
    let details = [];

    if (access.publicAccess) {
      score += 40;
      details.push('Public access enabled');
    }

    if (access.wideAccess && access.wideAccess > 100) {
      score += 20;
      details.push(`Wide access: ${access.wideAccess} users`);
    }

    if (!access.authentication || access.authentication === 'none') {
      score += 25;
      details.push('No authentication required');
    }

    if (!access.authorization || access.authorization === 'none') {
      score += 15;
      details.push('No authorization controls');
    }

    return {
      score: Math.min(100, score),
      details,
      publicAccess: access.publicAccess || false,
      userCount: access.wideAccess || 0
    };
  }

  analyzeThirdParties(thirdParties) {
    let score = 0;
    let details = [];

    thirdParties.forEach(party => {
      if (party.type === 'data_processor') {
        score += 15;
        details.push(`Data processor: ${party.name}`);
      } else if (party.type === 'data_controller') {
        score += 20;
        details.push(`Data controller: ${party.name}`);
      }

      if (!party.dpa) {
        score += 10;
        details.push(`No DPA with: ${party.name}`);
      }

      if (party.international) {
        score += 15;
        details.push(`International third party: ${party.name}`);
      }
    });

    return {
      score: Math.min(100, score),
      details,
      count: thirdParties.length,
      withoutDPA: thirdParties.filter(p => !p.dpa).length
    };
  }

  analyzeRetention(retention) {
    let score = 0;
    let details = [];

    if (retention.indefinite) {
      score += 40;
      details.push('Indefinite data retention');
    } else if (retention.period && retention.period > 2555) { // 7 years
      score += 25;
      details.push(`Extended retention: ${retention.period} days`);
    } else if (retention.period && retention.period > 365) {
      score += 15;
      details.push(`Long retention: ${retention.period} days`);
    }

    if (!retention.policy) {
      score += 20;
      details.push('No retention policy');
    }

    return {
      score: Math.min(100, score),
      details,
      period: retention.period || 0,
      hasPolicy: !!retention.policy
    };
  }

  analyzeEncryption(encryption) {
    let score = 0;
    let details = [];

    if (!encryption.atRest) {
      score += 25;
      details.push('No encryption at rest');
    }

    if (!encryption.inTransit) {
      score += 25;
      details.push('No encryption in transit');
    }

    if (encryption.strength === 'weak') {
      score += 15;
      details.push('Weak encryption strength');
    } else if (encryption.strength === 'strong') {
      score += 0;
      details.push('Strong encryption strength');
    }

    if (!encryption.keyManagement) {
      score += 10;
      details.push('No key management');
    }

    return {
      score: Math.min(100, score),
      details,
      atRest: encryption.atRest || false,
      inTransit: encryption.inTransit || false
    };
  }

  analyzeConsent(consent) {
    let score = 0;
    let details = [];

    if (!consent.required) {
      score += 30;
      details.push('Consent not required but should be');
    }

    if (consent.required && !consent.obtained) {
      score += 40;
      details.push('Consent required but not obtained');
    }

    if (!consent.method || consent.method === 'implicit') {
      score += 15;
      details.push('Implicit or no consent method');
    }

    if (!consent.withdrawal) {
      score += 10;
      details.push('No consent withdrawal mechanism');
    }

    return {
      score: Math.min(100, score),
      details,
      obtained: consent.obtained || false,
      method: consent.method || 'none'
    };
  }

  analyzeCrossBorder(crossBorder) {
    let score = 0;
    let details = [];

    if (crossBorder) {
      score += 50;
      details.push('Cross-border data transfer involved');
    }

    return {
      score: Math.min(100, score),
      details,
      enabled: !!crossBorder
    };
  }

  generateRecommendations(scores, category, mitigations) {
    const recommendations = [];

    if (scores.overall > 70) {
      recommendations.push({
        priority: 'high',
        action: 'Immediate privacy impact assessment required',
        description: 'High overall risk score requires immediate attention and formal assessment'
      });
    }

    if (scores.encryption > 50) {
      recommendations.push({
        priority: 'high',
        action: 'Implement comprehensive encryption',
        description: 'Enable encryption at rest and in transit with strong cryptographic algorithms'
      });
    }

    if (scores.access > 50) {
      recommendations.push({
        priority: 'high',
        action: 'Restrict data access',
        description: 'Implement role-based access control and strong authentication mechanisms'
      });
    }

    mitigations.forEach(mitigation => {
      recommendations.push({
        priority: mitigation.priority,
        action: mitigation.action,
        description: mitigation.description
      });
    });

    return recommendations;
  }

  sanitizeWorkflow(workflow) {
    const sanitized = _.cloneDeep(workflow);
    delete sanitized.sensitiveData;
    delete sanitized.credentials;
    return sanitized;
  }

  updateRiskHistory(assessment) {
    const workflowId = assessment.workflowId;
    
    if (!this.riskHistory.has(workflowId)) {
      this.riskHistory.set(workflowId, []);
    }
    
    this.riskHistory.get(workflowId).push({
      timestamp: assessment.timestamp,
      overallScore: assessment.scores.overall,
      category: assessment.category,
      assessmentId: assessment.id
    });

    const history = this.riskHistory.get(workflowId);
    if (history.length > 100) {
      this.riskHistory.set(workflowId, history.slice(-100));
    }
  }

  async getRiskHistory(workflowId) {
    return this.riskHistory.get(workflowId) || [];
  }

  async getAssessment(assessmentId) {
    return this.assessments.get(assessmentId);
  }

  async getAllAssessments() {
    return Array.from(this.assessments.values());
  }
}

module.exports = PrivacyRiskAssessment;

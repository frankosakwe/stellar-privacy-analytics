const _ = require('lodash');

class CustomCriteriaManager {
  constructor() {
    this.customCriteria = new Map();
    this.criteriaTemplates = new Map();
    this.criteriaValidators = new Map();
    this.initializeDefaultTemplates();
  }

  initializeDefaultTemplates() {
    this.criteriaTemplates.set('industry_specific', {
      name: 'Industry-Specific Risk Criteria',
      description: 'Template for industry-specific privacy risk assessment',
      factors: [
        {
          name: 'industry_regulations',
          type: 'regulatory',
          weight: 0.15,
          description: 'Compliance with industry-specific regulations'
        },
        {
          name: 'industry_data_types',
          type: 'data_classification',
          weight: 0.20,
          description: 'Industry-specific sensitive data types'
        },
        {
          name: 'industry_standards',
          type: 'standards',
          weight: 0.10,
          description: 'Adherence to industry privacy standards'
        }
      ],
      scoringRules: {
        regulatory: {
          compliant: 0,
          partially_compliant: 30,
          non_compliant: 70
        },
        data_classification: {
          standard: 10,
          sensitive: 40,
          highly_sensitive: 80
        },
        standards: {
          certified: 0,
          in_progress: 20,
          not_implemented: 60
        }
      }
    });

    this.criteriaTemplates.set('geographic', {
      name: 'Geographic-Specific Risk Criteria',
      description: 'Template for geographic privacy requirements',
      factors: [
        {
          name: 'data_location',
          type: 'location',
          weight: 0.25,
          description: 'Data storage and processing location requirements'
        },
        {
          name: 'cross_border_transfers',
          type: 'transfer',
          weight: 0.20,
          description: 'Cross-border data transfer compliance'
        },
        {
          name: 'local_laws',
          type: 'legal',
          weight: 0.15,
          description: 'Local privacy law compliance'
        }
      ],
      scoringRules: {
        location: {
          compliant: 0,
          restricted: 35,
          prohibited: 80
        },
        transfer: {
          allowed: 0,
          with_safeguards: 25,
          restricted: 60
        },
        legal: {
          fully_compliant: 0,
          partially_compliant: 30,
          non_compliant: 70
        }
      }
    });

    this.criteriaTemplates.set('organizational', {
      name: 'Organizational Risk Criteria',
      description: 'Template for organizational privacy maturity',
      factors: [
        {
          name: 'privacy_maturity',
          type: 'maturity',
          weight: 0.20,
          description: 'Organizational privacy program maturity'
        },
        {
          name: 'resource_allocation',
          type: 'resources',
          weight: 0.15,
          description: 'Resources allocated to privacy'
        },
        {
          name: 'training_awareness',
          type: 'training',
          weight: 0.10,
          description: 'Privacy training and awareness programs'
        }
      ],
      scoringRules: {
        maturity: {
          optimized: 0,
          defined: 20,
          repeatable: 40,
          initial: 60,
          ad_hoc: 80
        },
        resources: {
          adequate: 0,
          minimal: 30,
          insufficient: 70
        },
        training: {
          comprehensive: 0,
          regular: 15,
          occasional: 40,
          none: 70
        }
      }
    });
  }

  createCustomCriteria(name, config) {
    const criteria = {
      id: this.generateCriteriaId(),
      name,
      description: config.description || '',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      factors: config.factors || [],
      weights: config.weights || {},
      scoringRules: config.scoringRules || {},
      thresholds: config.thresholds || this.getDefaultThresholds(),
      validators: config.validators || [],
      metadata: config.metadata || {}
    };

    this.validateCriteria(criteria);
    this.customCriteria.set(criteria.id, criteria);

    return criteria;
  }

  generateCriteriaId() {
    return `criteria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDefaultThresholds() {
    return {
      critical: 90,
      high: 70,
      medium: 40,
      low: 0
    };
  }

  validateCriteria(criteria) {
    if (!criteria.name || criteria.name.trim() === '') {
      throw new Error('Criteria name is required');
    }

    if (!criteria.factors || criteria.factors.length === 0) {
      throw new Error('At least one factor must be defined');
    }

    const totalWeight = Object.values(criteria.weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 1.0) {
      throw new Error('Total weight cannot exceed 1.0');
    }

    if (totalWeight < 0.5) {
      throw new Error('Total weight must be at least 0.5');
    }

    criteria.factors.forEach(factor => {
      if (!factor.name || factor.name.trim() === '') {
        throw new Error('Factor name is required');
      }
      if (!factor.type) {
        throw new Error('Factor type is required');
      }
    });

    this.validateThresholds(criteria.thresholds);
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
  }

  updateCriteria(criteriaId, updates) {
    const criteria = this.customCriteria.get(criteriaId);
    if (!criteria) {
      throw new Error(`Criteria not found: ${criteriaId}`);
    }

    const updatedCriteria = {
      ...criteria,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: this.incrementVersion(criteria.version)
    };

    this.validateCriteria(updatedCriteria);
    this.customCriteria.set(criteriaId, updatedCriteria);

    return updatedCriteria;
  }

  incrementVersion(version) {
    const parts = version.split('.');
    parts[2] = String(parseInt(parts[2]) + 1);
    return parts.join('.');
  }

  deleteCriteria(criteriaId) {
    return this.customCriteria.delete(criteriaId);
  }

  getCriteria(criteriaId) {
    return this.customCriteria.get(criteriaId);
  }

  getAllCriteria() {
    return Array.from(this.customCriteria.values());
  }

  getCriteriaTemplate(templateName) {
    return this.criteriaTemplates.get(templateName);
  }

  createFromTemplate(templateName, name, customizations = {}) {
    const template = this.criteriaTemplates.get(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const config = {
      description: template.description,
      factors: template.factors,
      weights: this.calculateDefaultWeights(template.factors),
      scoringRules: template.scoringRules,
      ...customizations
    };

    return this.createCustomCriteria(name, config);
  }

  calculateDefaultWeights(factors) {
    const weights = {};
    const equalWeight = 1.0 / factors.length;
    
    factors.forEach(factor => {
      weights[factor.name] = factor.weight || equalWeight;
    });

    return weights;
  }

  applyCustomCriteria(workflow, criteriaId) {
    const criteria = this.customCriteria.get(criteriaId);
    if (!criteria) {
      throw new Error(`Criteria not found: ${criteriaId}`);
    }

    const assessment = {
      criteriaId,
      criteriaName: criteria.name,
      timestamp: new Date().toISOString(),
      factorScores: {},
      overallScore: 0,
      category: 'unknown',
      details: {}
    };

    criteria.factors.forEach(factor => {
      const factorScore = this.evaluateFactor(workflow, factor, criteria.scoringRules);
      assessment.factorScores[factor.name] = factorScore;
      assessment.details[factor.name] = {
        type: factor.type,
        weight: criteria.weights[factor.name] || 0,
        score: factorScore.score,
        level: this.determineRiskLevel(factorScore.score, criteria.thresholds),
        details: factorScore.details
      };
    });

    assessment.overallScore = this.calculateOverallScore(assessment.factorScores, criteria.weights);
    assessment.category = this.determineRiskLevel(assessment.overallScore, criteria.thresholds);

    return assessment;
  }

  evaluateFactor(workflow, factor, scoringRules) {
    const factorType = factor.type;
    const scoringRule = scoringRules[factorType];
    
    if (!scoringRule) {
      return {
        score: 50,
        details: [`No scoring rule defined for factor type: ${factorType}`]
      };
    }

    const evaluation = this.performFactorEvaluation(workflow, factor, scoringRule);
    
    return {
      score: evaluation.score,
      details: evaluation.details,
      evidence: evaluation.evidence || []
    };
  }

  performFactorEvaluation(workflow, factor, scoringRule) {
    const factorName = factor.name;
    const workflowData = workflow[factorName] || {};
    
    let score = 50;
    let details = [];
    let evidence = [];

    switch (factor.type) {
      case 'regulatory':
        score = this.evaluateRegulatoryCompliance(workflowData, scoringRule);
        details.push(`Regulatory compliance assessment: ${score}`);
        break;
      
      case 'data_classification':
        score = this.evaluateDataClassification(workflowData, scoringRule);
        details.push(`Data classification assessment: ${score}`);
        break;
      
      case 'standards':
        score = this.evaluateStandardsCompliance(workflowData, scoringRule);
        details.push(`Standards compliance assessment: ${score}`);
        break;
      
      case 'location':
        score = this.evaluateDataLocation(workflowData, scoringRule);
        details.push(`Data location assessment: ${score}`);
        break;
      
      case 'transfer':
        score = this.evaluateDataTransfers(workflowData, scoringRule);
        details.push(`Data transfer assessment: ${score}`);
        break;
      
      case 'legal':
        score = this.evaluateLegalCompliance(workflowData, scoringRule);
        details.push(`Legal compliance assessment: ${score}`);
        break;
      
      case 'maturity':
        score = this.evaluatePrivacyMaturity(workflowData, scoringRule);
        details.push(`Privacy maturity assessment: ${score}`);
        break;
      
      case 'resources':
        score = this.evaluateResourceAllocation(workflowData, scoringRule);
        details.push(`Resource allocation assessment: ${score}`);
        break;
      
      case 'training':
        score = this.evaluateTrainingProgram(workflowData, scoringRule);
        details.push(`Training program assessment: ${score}`);
        break;
      
      default:
        score = this.evaluateGenericFactor(workflowData, scoringRule);
        details.push(`Generic factor assessment: ${score}`);
    }

    return {
      score,
      details,
      evidence
    };
  }

  evaluateRegulatoryCompliance(data, scoringRule) {
    if (data.complianceStatus === 'fully_compliant') {
      return scoringRule.compliant || 0;
    } else if (data.complianceStatus === 'partially_compliant') {
      return scoringRule.partially_compliant || 30;
    } else {
      return scoringRule.non_compliant || 70;
    }
  }

  evaluateDataClassification(data, scoringRule) {
    const sensitivityLevel = data.sensitivityLevel || 'standard';
    return scoringRule[sensitivityLevel] || 50;
  }

  evaluateStandardsCompliance(data, scoringRule) {
    const certificationStatus = data.certificationStatus || 'not_implemented';
    return scoringRule[certificationStatus] || 60;
  }

  evaluateDataLocation(data, scoringRule) {
    const locationStatus = data.locationStatus || 'compliant';
    return scoringRule[locationStatus] || 50;
  }

  evaluateDataTransfers(data, scoringRule) {
    const transferStatus = data.transferStatus || 'allowed';
    return scoringRule[transferStatus] || 50;
  }

  evaluateLegalCompliance(data, scoringRule) {
    const legalStatus = data.legalStatus || 'partially_compliant';
    return scoringRule[legalStatus] || 50;
  }

  evaluatePrivacyMaturity(data, scoringRule) {
    const maturityLevel = data.maturityLevel || 'initial';
    return scoringRule[maturityLevel] || 60;
  }

  evaluateResourceAllocation(data, scoringRule) {
    const resourceStatus = data.resourceStatus || 'minimal';
    return scoringRule[resourceStatus] || 50;
  }

  evaluateTrainingProgram(data, scoringRule) {
    const trainingStatus = data.trainingStatus || 'occasional';
    return scoringRule[trainingStatus] || 50;
  }

  evaluateGenericFactor(data, scoringRule) {
    const status = data.status || 'unknown';
    return scoringRule[status] || 50;
  }

  calculateOverallScore(factorScores, weights) {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.keys(factorScores).forEach(factorName => {
      const weight = weights[factorName] || 0;
      const score = factorScores[factorName].score || 0;
      
      weightedSum += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
  }

  determineRiskLevel(score, thresholds) {
    if (score >= thresholds.critical) return 'critical';
    if (score >= thresholds.high) return 'high';
    if (score >= thresholds.medium) return 'medium';
    return 'low';
  }

  addCustomValidator(criteriaId, validator) {
    const criteria = this.customCriteria.get(criteriaId);
    if (!criteria) {
      throw new Error(`Criteria not found: ${criteriaId}`);
    }

    if (!this.criteriaValidators.has(criteriaId)) {
      this.criteriaValidators.set(criteriaId, []);
    }

    this.criteriaValidators.get(criteriaId).push(validator);
  }

  validateWithCustomRules(criteriaId, assessment) {
    const validators = this.criteriaValidators.get(criteriaId) || [];
    const validationResults = [];

    validators.forEach(validator => {
      try {
        const result = validator(assessment);
        validationResults.push({
          validator: validator.name || 'unnamed',
          valid: result.valid,
          message: result.message,
          score: result.score
        });
      } catch (error) {
        validationResults.push({
          validator: validator.name || 'unnamed',
          valid: false,
          message: `Validation error: ${error.message}`,
          score: 0
        });
      }
    });

    return validationResults;
  }

  createIndustrySpecificCriteria(industry, requirements) {
    const template = this.criteriaTemplates.get('industry_specific');
    const industryFactors = this.generateIndustryFactors(industry, requirements);
    
    const config = {
      description: `${industry} industry-specific privacy risk criteria`,
      factors: [...template.factors, ...industryFactors],
      weights: this.calculateIndustryWeights(template.factors, industryFactors, requirements),
      scoringRules: this.generateIndustryScoringRules(industry, requirements),
      metadata: {
        industry,
        requirements,
        customFactors: industryFactors.length
      }
    };

    return this.createCustomCriteria(`${industry} Privacy Criteria`, config);
  }

  generateIndustryFactors(industry, requirements) {
    const commonFactors = [
      {
        name: 'industry_specific_data',
        type: 'data_classification',
        weight: 0.15,
        description: `${industry} specific sensitive data types`
      },
      {
        name: 'industry_compliance',
        type: 'regulatory',
        weight: 0.20,
        description: `${industry} regulatory compliance`
      }
    ];

    const industrySpecificFactors = {
      healthcare: [
        {
          name: 'phi_protection',
          type: 'data_protection',
          weight: 0.25,
          description: 'Protected Health Information safeguards'
        },
        {
          name: 'hipaa_compliance',
          type: 'regulatory',
          weight: 0.20,
          description: 'HIPAA compliance requirements'
        }
      ],
      finance: [
        {
          name: 'financial_data_protection',
          type: 'data_protection',
          weight: 0.25,
          description: 'Financial data protection requirements'
        },
        {
          name: 'pci_compliance',
          type: 'standards',
          weight: 0.15,
          description: 'PCI DSS compliance'
        }
      ],
      education: [
        {
          name: 'student_records',
          type: 'data_classification',
          weight: 0.20,
          description: 'Student record protection (FERPA)'
        },
        {
          name: 'educational_privacy',
          type: 'regulatory',
          weight: 0.15,
          description: 'Educational privacy compliance'
        }
      ]
    };

    return [...commonFactors, ...(industrySpecificFactors[industry] || [])];
  }

  calculateIndustryWeights(baseFactors, industryFactors, requirements) {
    const allFactors = [...baseFactors, ...industryFactors];
    const weights = {};
    
    allFactors.forEach(factor => {
      weights[factor.name] = factor.weight;
    });

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    Object.keys(weights).forEach(factor => {
      weights[factor] = weights[factor] / totalWeight;
    });

    return weights;
  }

  generateIndustryScoringRules(industry, requirements) {
    const baseRules = {
      data_classification: {
        standard: 10,
        sensitive: 40,
        highly_sensitive: 80
      },
      regulatory: {
        compliant: 0,
        partially_compliant: 30,
        non_compliant: 70
      },
      data_protection: {
        strong: 0,
        adequate: 25,
        weak: 60
      },
      standards: {
        certified: 0,
        in_progress: 20,
        not_implemented: 60
      }
    };

    const industrySpecificRules = {
      healthcare: {
        phi_protection: {
          fully_compliant: 0,
          partially_compliant: 35,
          non_compliant: 75
        },
        hipaa_compliance: {
          fully_compliant: 0,
          partially_compliant: 30,
          non_compliant: 70
        }
      },
      finance: {
        financial_data_protection: {
          strong: 0,
          adequate: 20,
          weak: 65
        },
        pci_compliance: {
          compliant: 0,
          partially_compliant: 25,
          non_compliant: 75
        }
      },
      education: {
        student_records: {
          fully_protected: 0,
          partially_protected: 30,
          minimally_protected: 70
        },
        educational_privacy: {
          compliant: 0,
          partially_compliant: 35,
          non_compliant: 75
        }
      }
    };

    return {
      ...baseRules,
      ...(industrySpecificRules[industry] || {})
    };
  }

  exportCriteria(criteriaId, format = 'json') {
    const criteria = this.customCriteria.get(criteriaId);
    if (!criteria) {
      throw new Error(`Criteria not found: ${criteriaId}`);
    }

    if (format === 'json') {
      return JSON.stringify(criteria, null, 2);
    } else if (format === 'csv') {
      return this.convertCriteriaToCSV(criteria);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  convertCriteriaToCSV(criteria) {
    const headers = ['Factor Name', 'Type', 'Weight', 'Description'];
    const rows = criteria.factors.map(factor => [
      factor.name,
      factor.type,
      criteria.weights[factor.name] || 0,
      factor.description
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  importCriteria(criteriaData, format = 'json') {
    let criteria;
    
    if (format === 'json') {
      criteria = typeof criteriaData === 'string' ? JSON.parse(criteriaData) : criteriaData;
    } else {
      throw new Error(`Unsupported import format: ${format}`);
    }

    criteria.id = this.generateCriteriaId();
    criteria.createdAt = new Date().toISOString();
    criteria.updatedAt = new Date().toISOString();

    this.validateCriteria(criteria);
    this.customCriteria.set(criteria.id, criteria);

    return criteria;
  }

  getCriteriaStatistics() {
    const criteria = Array.from(this.customCriteria.values());
    
    const stats = {
      totalCriteria: criteria.length,
      averageFactors: criteria.reduce((sum, c) => sum + c.factors.length, 0) / criteria.length || 0,
      factorTypes: {},
      versions: {},
      recentlyUpdated: []
    };

    criteria.forEach(c => {
      c.factors.forEach(factor => {
        stats.factorTypes[factor.type] = (stats.factorTypes[factor.type] || 0) + 1;
      });

      stats.versions[c.version] = (stats.versions[c.version] || 0) + 1;
    });

    stats.recentlyUpdated = criteria
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(c => ({ id: c.id, name: c.name, updatedAt: c.updatedAt }));

    return stats;
  }
}

module.exports = CustomCriteriaManager;

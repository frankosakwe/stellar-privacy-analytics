class MitigationEngine {
  constructor() {
    this.mitigationStrategies = this.initializeMitigationStrategies();
  }

  initializeMitigationStrategies() {
    return {
      dataTypes: {
        high: [
          {
            action: 'Data minimization',
            description: 'Collect only necessary data types and limit sensitive information',
            priority: 'high',
            effort: 'medium',
            effectiveness: 85
          },
          {
            action: 'Data anonymization',
            description: 'Remove or pseudonymize personally identifiable information',
            priority: 'high',
            effort: 'high',
            effectiveness: 90
          },
          {
            action: 'Purpose limitation',
            description: 'Clearly define and document data collection purposes',
            priority: 'medium',
            effort: 'low',
            effectiveness: 70
          }
        ],
        medium: [
          {
            action: 'Data classification',
            description: 'Implement proper data classification and labeling',
            priority: 'medium',
            effort: 'medium',
            effectiveness: 75
          },
          {
            action: 'Access logging',
            description: 'Enable comprehensive access logging for sensitive data',
            priority: 'medium',
            effort: 'low',
            effectiveness: 60
          }
        ],
        low: [
          {
            action: 'Regular review',
            description: 'Periodically review data collection practices',
            priority: 'low',
            effort: 'low',
            effectiveness: 50
          }
        ]
      },
      processingActivities: {
        high: [
          {
            action: 'Privacy impact assessment',
            description: 'Conduct comprehensive DPIA for high-risk processing',
            priority: 'critical',
            effort: 'high',
            effectiveness: 95
          },
          {
            action: 'Processing limitation',
            description: 'Restrict processing to specified, explicit purposes',
            priority: 'high',
            effort: 'medium',
            effectiveness: 80
          },
          {
            action: 'Automated safeguards',
            description: 'Implement automated privacy safeguards in processing systems',
            priority: 'high',
            effort: 'high',
            effectiveness: 85
          }
        ],
        medium: [
          {
            action: 'Process documentation',
            description: 'Document all processing activities and data flows',
            priority: 'medium',
            effort: 'medium',
            effectiveness: 70
          },
          {
            action: 'Regular audits',
            description: 'Conduct regular privacy audits of processing activities',
            priority: 'medium',
            effort: 'medium',
            effectiveness: 75
          }
        ],
        low: [
          {
            action: 'Basic controls',
            description: 'Implement standard privacy controls and procedures',
            priority: 'low',
            effort: 'low',
            effectiveness: 60
          }
        ]
      },
      encryption: {
        high: [
          {
            action: 'End-to-end encryption',
            description: 'Implement comprehensive encryption at rest and in transit',
            priority: 'critical',
            effort: 'high',
            effectiveness: 95
          },
          {
            action: 'Key management',
            description: 'Establish robust cryptographic key management system',
            priority: 'high',
            effort: 'high',
            effectiveness: 90
          },
          {
            action: 'Strong algorithms',
            description: 'Use industry-standard strong encryption algorithms',
            priority: 'high',
            effort: 'medium',
            effectiveness: 85
          }
        ],
        medium: [
          {
            action: 'Encryption policy',
            description: 'Develop and implement encryption policies',
            priority: 'medium',
            effort: 'medium',
            effectiveness: 75
          }
        ],
        low: [
          {
            action: 'Basic encryption',
            description: 'Implement standard encryption for sensitive data',
            priority: 'medium',
            effort: 'low',
            effectiveness: 70
          }
        ]
      },
      access: {
        high: [
          {
            action: 'Role-based access control',
            description: 'Implement granular RBAC with principle of least privilege',
            priority: 'critical',
            effort: 'high',
            effectiveness: 90
          },
          {
            action: 'Multi-factor authentication',
            description: 'Require MFA for all data access',
            priority: 'high',
            effort: 'medium',
            effectiveness: 85
          },
          {
            action: 'Access reviews',
            description: 'Conduct regular access rights reviews',
            priority: 'high',
            effort: 'medium',
            effectiveness: 80
          }
        ],
        medium: [
          {
            action: 'Access logging',
            description: 'Enable comprehensive access logging and monitoring',
            priority: 'medium',
            effort: 'low',
            effectiveness: 70
          },
          {
            action: 'Session management',
            description: 'Implement proper session timeout and management',
            priority: 'medium',
            effort: 'low',
            effectiveness: 65
          }
        ],
        low: [
          {
            action: 'Basic authentication',
            description: 'Ensure proper authentication mechanisms',
            priority: 'medium',
            effort: 'low',
            effectiveness: 60
          }
        ]
      },
      thirdParties: {
        high: [
          {
            action: 'Data processing agreements',
            description: 'Establish comprehensive DPAs with all third parties',
            priority: 'critical',
            effort: 'high',
            effectiveness: 90
          },
          {
            action: 'Third-party audits',
            description: 'Conduct regular privacy audits of third-party processors',
            priority: 'high',
            effort: 'high',
            effectiveness: 85
          },
          {
            action: 'Data transfer mechanisms',
            description: 'Use approved mechanisms for international data transfers',
            priority: 'high',
            effort: 'medium',
            effectiveness: 80
          }
        ],
        medium: [
          {
            action: 'Vendor assessment',
            description: 'Implement third-party privacy assessment process',
            priority: 'medium',
            effort: 'medium',
            effectiveness: 75
          }
        ],
        low: [
          {
            action: 'Basic contracts',
            description: 'Ensure basic privacy clauses in vendor contracts',
            priority: 'medium',
            effort: 'low',
            effectiveness: 60
          }
        ]
      },
      consent: {
        high: [
          {
            action: 'Explicit consent',
            description: 'Obtain explicit, informed consent for data processing',
            priority: 'critical',
            effort: 'medium',
            effectiveness: 90
          },
          {
            action: 'Consent management',
            description: 'Implement robust consent management system',
            priority: 'high',
            effort: 'high',
            effectiveness: 85
          },
          {
            action: 'Withdrawal mechanisms',
            description: 'Provide easy consent withdrawal mechanisms',
            priority: 'high',
            effort: 'medium',
            effectiveness: 80
          }
        ],
        medium: [
          {
            action: 'Consent documentation',
            description: 'Maintain detailed consent records and preferences',
            priority: 'medium',
            effort: 'medium',
            effectiveness: 75
          }
        ],
        low: [
          {
            action: 'Basic consent',
            description: 'Implement basic consent collection process',
            priority: 'medium',
            effort: 'low',
            effectiveness: 65
          }
        ]
      },
      retention: {
        high: [
          {
            action: 'Retention policies',
            description: 'Establish clear data retention and deletion policies',
            priority: 'high',
            effort: 'medium',
            effectiveness: 85
          },
          {
            action: 'Automated deletion',
            description: 'Implement automated data deletion based on retention schedules',
            priority: 'high',
            effort: 'high',
            effectiveness: 90
          },
          {
            action: 'Regular cleanup',
            description: 'Conduct regular data cleanup and review processes',
            priority: 'medium',
            effort: 'medium',
            effectiveness: 75
          }
        ],
        medium: [
          {
            action: 'Retention schedules',
            description: 'Document specific retention schedules for data types',
            priority: 'medium',
            effort: 'low',
            effectiveness: 70
          }
        ],
        low: [
          {
            action: 'Basic policies',
            description: 'Implement basic data retention guidelines',
            priority: 'low',
            effort: 'low',
            effectiveness: 60
          }
        ]
      }
    };
  }

  generateMitigations(riskFactors, category) {
    const mitigations = [];
    const riskLevel = category.level;

    Object.keys(riskFactors).forEach(factor => {
      const factorData = riskFactors[factor];
      const strategies = this.getStrategiesForFactor(factor, riskLevel, factorData.score);
      
      strategies.forEach(strategy => {
        mitigations.push({
          factor,
          ...strategy,
          riskScore: factorData.score,
          category: riskLevel
        });
      });
    });

    return this.prioritizeMitigations(mitigations);
  }

  getStrategiesForFactor(factor, riskLevel, score) {
    const strategies = this.mitigationStrategies[factor];
    if (!strategies) return [];

    let selectedStrategies = [];
    
    if (riskLevel === 'critical') {
      selectedStrategies = [...(strategies.high || []), ...(strategies.medium || [])];
    } else if (riskLevel === 'high') {
      selectedStrategies = strategies.high || [];
    } else if (riskLevel === 'medium') {
      selectedStrategies = strategies.medium || [];
    } else {
      selectedStrategies = strategies.low || [];
    }

    return selectedStrategies.filter(strategy => {
      if (riskLevel === 'critical' && strategy.priority !== 'critical') {
        return score > 80;
      }
      return true;
    });
  }

  prioritizeMitigations(mitigations) {
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    
    return mitigations.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.effectiveness - a.effectiveness;
    });
  }

  getMitigationPlan(mitigations, maxEffort = 'high') {
    const effortOrder = { low: 1, medium: 2, high: 3 };
    const maxEffortLevel = effortOrder[maxEffort] || 3;
    
    const filteredMitigations = mitigations.filter(m => 
      effortOrder[m.effort] <= maxEffortLevel
    );

    const phases = {
      immediate: filteredMitigations.filter(m => m.priority === 'critical'),
      shortTerm: filteredMitigations.filter(m => m.priority === 'high'),
      mediumTerm: filteredMitigations.filter(m => m.priority === 'medium'),
      longTerm: filteredMitigations.filter(m => m.priority === 'low')
    };

    return {
      phases,
      totalMitigations: filteredMitigations.length,
      estimatedTimeline: this.calculateTimeline(phases),
      resourceRequirements: this.calculateResources(phases)
    };
  }

  calculateTimeline(phases) {
    const timelines = {
      immediate: '0-30 days',
      shortTerm: '30-90 days',
      mediumTerm: '90-180 days',
      longTerm: '180+ days'
    };

    return Object.keys(phases).map(phase => ({
      phase,
      count: phases[phase].length,
      timeline: timelines[phase],
      priority: phase
    })).filter(item => item.count > 0);
  }

  calculateResources(phases) {
    const resources = {
      technical: 0,
      legal: 0,
      operational: 0,
      financial: 0
    };

    Object.values(phases).flat().forEach(mitigation => {
      if (mitigation.effort === 'high') {
        resources.technical += 2;
        resources.legal += 1;
        resources.operational += 2;
        resources.financial += 3;
      } else if (mitigation.effort === 'medium') {
        resources.technical += 1;
        resources.legal += 0.5;
        resources.operational += 1;
        resources.financial += 2;
      } else {
        resources.technical += 0.5;
        resources.legal += 0.25;
        resources.operational += 0.5;
        resources.financial += 1;
      }
    });

    return resources;
  }

  addCustomStrategy(factor, riskLevel, strategy) {
    if (!this.mitigationStrategies[factor]) {
      this.mitigationStrategies[factor] = { high: [], medium: [], low: [] };
    }

    this.mitigationStrategies[factor][riskLevel].push({
      action: strategy.action,
      description: strategy.description,
      priority: strategy.priority || 'medium',
      effort: strategy.effort || 'medium',
      effectiveness: strategy.effectiveness || 70,
      custom: true
    });
  }

  getEffectivenessReport(mitigations) {
    const totalEffectiveness = mitigations.reduce((sum, m) => sum + m.effectiveness, 0);
    const averageEffectiveness = mitigations.length > 0 ? totalEffectiveness / mitigations.length : 0;

    const byFactor = {};
    mitigations.forEach(mitigation => {
      if (!byFactor[mitigation.factor]) {
        byFactor[mitigation.factor] = [];
      }
      byFactor[mitigation.factor].push(mitigation.effectiveness);
    });

    Object.keys(byFactor).forEach(factor => {
      const effects = byFactor[factor];
      byFactor[factor] = {
        average: effects.reduce((sum, e) => sum + e, 0) / effects.length,
        count: effects.length,
        max: Math.max(...effects),
        min: Math.min(...effects)
      };
    });

    return {
      overall: {
        average: Math.round(averageEffectiveness),
        total: Math.round(totalEffectiveness),
        count: mitigations.length
      },
      byFactor
    };
  }
}

module.exports = MitigationEngine;

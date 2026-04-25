// Compliance JavaScript for Stellar Privacy Analytics

class ComplianceManager {
    constructor() {
        this.currentCompliance = null;
        this.frameworks = [];
        this.init();
    }

    init() {
        this.loadFrameworks();
        this.setupEventListeners();
    }

    async loadFrameworks() {
        try {
            const response = await fetch('/api/compliance/frameworks');
            this.frameworks = await response.json();
            this.populateFrameworkSelector();
        } catch (error) {
            console.error('Error loading frameworks:', error);
            // Use mock data for development
            this.frameworks = [
                { key: 'gdpr', name: 'GDPR', jurisdiction: 'European Union' },
                { key: 'ccpa', name: 'CCPA', jurisdiction: 'California, USA' },
                { key: 'hipaa', name: 'HIPAA', jurisdiction: 'USA' },
                { key: 'pdpa', name: 'PDPA', jurisdiction: 'Singapore' }
            ];
            this.populateFrameworkSelector();
        }
    }

    populateFrameworkSelector() {
        const selector = document.getElementById('complianceFramework');
        if (!selector) return;

        selector.innerHTML = '<option value="">Select Framework...</option>' +
            this.frameworks.map(framework => 
                `<option value="${framework.key}">${framework.name} - ${framework.jurisdiction}</option>`
            ).join('');
    }

    setupEventListeners() {
        const checkBtn = document.getElementById('checkCompliance');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                this.checkCompliance();
            });
        }

        const frameworkSelector = document.getElementById('complianceFramework');
        if (frameworkSelector) {
            frameworkSelector.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.showFrameworkInfo(e.target.value);
                }
            });
        }
    }

    async checkCompliance() {
        const framework = document.getElementById('complianceFramework').value;
        if (!framework) {
            this.showNotification('Please select a compliance framework', 'warning');
            return;
        }

        this.showComplianceLoading();

        try {
            const response = await fetch('/api/compliance/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    framework: framework,
                    workflowId: 'current-workflow' // In production, this would be the actual workflow ID
                })
            });

            if (!response.ok) {
                throw new Error('Compliance check failed');
            }

            const compliance = await response.json();
            this.displayComplianceResults(compliance);
            this.showNotification('Compliance check completed', 'success');

        } catch (error) {
            console.error('Compliance check error:', error);
            this.showComplianceError(error);
            this.showNotification('Compliance check failed. Please try again.', 'error');
        }
    }

    showComplianceLoading() {
        const resultsContainer = document.getElementById('complianceResults');
        resultsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner mb-3"></div>
                <p class="text-muted">Checking compliance...</p>
            </div>
        `;
    }

    displayComplianceResults(compliance) {
        const resultsContainer = document.getElementById('complianceResults');
        resultsContainer.innerHTML = this.generateComplianceHTML(compliance);
        
        // Add animation
        resultsContainer.querySelector('.compliance-results').classList.add('fade-in');
        
        this.currentCompliance = compliance;
    }

    generateComplianceHTML(compliance) {
        const statusColor = this.getComplianceStatusColor(compliance.status);
        const statusIcon = this.getComplianceStatusIcon(compliance.status);

        return `
            <div class="compliance-results">
                <div class="text-center mb-4">
                    <div class="mb-2">
                        <i class="fas ${statusIcon} fa-3x text-${statusColor}"></i>
                    </div>
                    <h4 class="text-${statusColor}">${compliance.status.replace('_', ' ').toUpperCase()}</h4>
                    <p class="text-muted">${compliance.framework} Compliance</p>
                </div>

                <div class="compliance-overview mb-4">
                    <div class="compliance-metric">
                        <div class="score text-${statusColor}">${compliance.overallScore}%</div>
                        <div class="label">Overall Score</div>
                    </div>
                    <div class="compliance-metric">
                        <div class="score text-success">${compliance.summary.requirementsSummary.compliant}</div>
                        <div class="label">Compliant</div>
                    </div>
                    <div class="compliance-metric">
                        <div class="score text-warning">${compliance.summary.requirementsSummary.partiallyCompliant}</div>
                        <div class="label">Partial</div>
                    </div>
                    <div class="compliance-metric">
                        <div class="score text-danger">${compliance.summary.requirementsSummary.nonCompliant}</div>
                        <div class="label">Non-Compliant</div>
                    </div>
                </div>

                <div class="mb-4">
                    <h6>Requirements Breakdown</h6>
                    <div class="requirements-list">
                        ${this.generateRequirementsHTML(compliance.requirements)}
                    </div>
                </div>

                <div class="mb-4">
                    <h6>Key Findings</h6>
                    <div class="findings-list">
                        ${this.generateFindingsHTML(compliance.summary.keyFindings)}
                    </div>
                </div>

                <div class="mb-4">
                    <h6>Next Steps</h6>
                    <div class="steps-list">
                        ${this.generateNextStepsHTML(compliance.summary.nextSteps)}
                    </div>
                </div>

                <div class="text-center">
                    <button class="btn btn-primary btn-sm me-2" onclick="complianceManager.exportComplianceReport()">
                        <i class="fas fa-download me-1"></i>Export Report
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="complianceManager.scheduleReassessment()">
                        <i class="fas fa-calendar me-1"></i>Schedule Re-assessment
                    </button>
                </div>
            </div>
        `;
    }

    generateRequirementsHTML(requirements) {
        return requirements.map(req => {
            const statusClass = this.getRequirementStatusClass(req.status);
            const statusColor = this.getRequirementStatusColor(req.status);
            
            return `
                <div class="compliance-requirement ${statusClass}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <div class="requirement-title">${req.requirement}</div>
                            <small class="text-muted">Weight: ${(req.weight * 100).toFixed(0)}%</small>
                        </div>
                        <span class="requirement-score bg-${statusColor}">${req.score}%</span>
                    </div>
                    
                    <div class="mt-2">
                        <small class="text-muted">Checks: ${req.checks.length}</small>
                        <button class="btn btn-sm btn-outline-secondary ms-2" onclick="complianceManager.showRequirementDetails('${req.requirement}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    generateFindingsHTML(findings) {
        if (!findings || findings.length === 0) {
            return '<p class="text-muted">No specific findings identified.</p>';
        }

        return findings.map(finding => {
            const typeColor = this.getFindingTypeColor(finding.type);
            
            return `
                <div class="alert alert-${typeColor} py-2">
                    <div class="d-flex align-items-start">
                        <i class="fas fa-${this.getFindingIcon(finding.type)} me-2 mt-1"></i>
                        <div>
                            <strong>${finding.title}</strong>
                            <p class="mb-0 small">${finding.description}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    generateNextStepsHTML(nextSteps) {
        if (!nextSteps || nextSteps.length === 0) {
            return '<p class="text-muted">No specific next steps identified.</p>';
        }

        return `
            <ol class="small">
                ${nextSteps.map(step => `<li class="mb-2">${step}</li>`).join('')}
            </ol>
        `;
    }

    getComplianceStatusColor(status) {
        const colorMap = {
            fully_compliant: 'success',
            largely_compliant: 'info',
            partially_compliant: 'warning',
            non_compliant: 'danger'
        };
        return colorMap[status] || 'secondary';
    }

    getComplianceStatusIcon(status) {
        const iconMap = {
            fully_compliant: 'fa-check-circle',
            largely_compliant: 'fa-thumbs-up',
            partially_compliant: 'fa-exclamation-triangle',
            non_compliant: 'fa-times-circle'
        };
        return iconMap[status] || 'fa-question-circle';
    }

    getRequirementStatusClass(status) {
        return status.replace('_', '-');
    }

    getRequirementStatusColor(status) {
        const colorMap = {
            compliant: 'success',
            partially_compliant: 'warning',
            non_compliant: 'danger'
        };
        return colorMap[status] || 'secondary';
    }

    getFindingTypeColor(type) {
        const colorMap = {
            positive: 'success',
            warning: 'warning',
            alert: 'danger',
            comparison: 'info',
            volatility: 'warning'
        };
        return colorMap[type] || 'secondary';
    }

    getFindingIcon(type) {
        const iconMap = {
            positive: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            alert: 'fa-exclamation-circle',
            comparison: 'fa-balance-scale',
            volatility: 'fa-chart-line'
        };
        return iconMap[type] || 'fa-info-circle';
    }

    showFrameworkInfo(frameworkKey) {
        const framework = this.frameworks.find(f => f.key === frameworkKey);
        if (!framework) return;

        const modal = new bootstrap.Modal(document.getElementById('frameworkInfoModal') || this.createFrameworkInfoModal());
        const modalBody = document.querySelector('#frameworkInfoModal .modal-body');
        
        modalBody.innerHTML = `
            <h5>${framework.name}</h5>
            <p><strong>Jurisdiction:</strong> ${framework.jurisdiction}</p>
            
            <h6>Overview</h6>
            <p>${this.getFrameworkDescription(frameworkKey)}</p>
            
            <h6>Key Requirements</h6>
            <ul>
                ${this.getFrameworkRequirements(frameworkKey)}
            </ul>
            
            <h6>Assessment Scope</h6>
            <p>${this.getFrameworkScope(frameworkKey)}</p>
        `;
        
        modal.show();
    }

    getFrameworkDescription(frameworkKey) {
        const descriptions = {
            gdpr: 'The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy for all individuals within the European Union and the European Economic Area.',
            ccpa: 'The California Consumer Privacy Act (CCPA) enhances privacy rights and consumer protection for residents of California, USA.',
            hipaa: 'The Health Insurance Portability and Accountability Act (HIPAA) protects sensitive patient health information from being disclosed without the patient\'s consent or knowledge.',
            pdpa: 'The Personal Data Protection Act (PDPA) governs the collection, use, and disclosure of personal data by organizations in Singapore.'
        };
        return descriptions[frameworkKey] || 'Compliance framework for data protection and privacy.';
    }

    getFrameworkRequirements(frameworkKey) {
        const requirements = {
            gdpr: [
                'Lawful basis for processing',
                'Data subject rights',
                'Privacy by design and default',
                'Data breach notification',
                'Data protection impact assessment',
                'International data transfers'
            ],
            ccpa: [
                'Right to know',
                'Right to delete',
                'Right to opt-out',
                'Non-discrimination',
                'Data minimization',
                'Reasonable security'
            ],
            hipaa: [
                'Privacy rule compliance',
                'Security rule implementation',
                'Breach notification',
                'Administrative safeguards',
                'Physical safeguards',
                'Technical safeguards'
            ],
            pdpa: [
                'Consent obligation',
                'Notification obligation',
                'Access and correction',
                'Data accuracy',
                'Protection obligation',
                'Retention limitation'
            ]
        };
        
        return (requirements[frameworkKey] || []).map(req => `<li>${req}</li>`).join('');
    }

    getFrameworkScope(frameworkKey) {
        const scopes = {
            gdpr: 'Applies to all organizations processing personal data of EU residents, regardless of the organization\'s location.',
            ccpa: 'Applies to for-profit businesses that collect personal information from California residents and meet certain revenue or data processing thresholds.',
            hipaa: 'Applies to covered entities (healthcare providers, health plans, healthcare clearinghouses) and their business associates.',
            pdpa: 'Applies to all organizations in Singapore that collect, use, or disclose personal data, with some exemptions.'
        };
        return scopes[frameworkKey] || 'Applies to organizations within the specified jurisdiction.';
    }

    createFrameworkInfoModal() {
        const modalHTML = `
            <div class="modal fade" id="frameworkInfoModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Framework Information</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Content will be populated dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return document.getElementById('frameworkInfoModal');
    }

    showRequirementDetails(requirementName) {
        if (!this.currentCompliance) return;

        const requirement = this.currentCompliance.requirements.find(req => req.requirement === requirementName);
        if (!requirement) return;

        const modal = new bootstrap.Modal(document.getElementById('requirementDetailsModal') || this.createRequirementDetailsModal());
        const modalBody = document.querySelector('#requirementDetailsModal .modal-body');
        
        modalBody.innerHTML = `
            <h5>${requirement.requirement}</h5>
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <span>Overall Score: <strong>${requirement.score}%</strong></span>
                    <span class="badge bg-${this.getRequirementStatusColor(requirement.status)}">${requirement.status.replace('_', ' ')}</span>
                </div>
                <div class="progress progress-risk mt-2">
                    <div class="progress-bar bg-${this.getRequirementStatusColor(requirement.status)}" style="width: ${requirement.score}%"></div>
                </div>
            </div>
            
            <h6>Individual Checks</h6>
            <div class="checks-list">
                ${this.generateChecksHTML(requirement.checks)}
            </div>
        `;
        
        modal.show();
    }

    generateChecksHTML(checks) {
        return checks.map(check => {
            const statusColor = check.status === 'compliant' ? 'success' : 
                               check.status === 'partially_compliant' ? 'warning' : 'danger';
            
            return `
                <div class="card mb-2">
                    <div class="card-body py-2">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="fw-bold">${check.check.replace('_', ' ').toUpperCase()}</div>
                                <small class="text-muted">${check.details}</small>
                            </div>
                            <span class="badge bg-${statusColor}">${check.status.replace('_', ' ')}</span>
                        </div>
                        <div class="mt-1">
                            <small>Score: ${check.score}%</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    createRequirementDetailsModal() {
        const modalHTML = `
            <div class="modal fade" id="requirementDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Requirement Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Content will be populated dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return document.getElementById('requirementDetailsModal');
    }

    showComplianceError(error) {
        const resultsContainer = document.getElementById('complianceResults');
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>Compliance Check Failed</h6>
                <p class="mb-0">Unable to complete the compliance check. Please try again.</p>
                <small class="text-muted">${error.message}</small>
            </div>
        `;
    }

    exportComplianceReport() {
        if (!this.currentCompliance) {
            this.showNotification('No compliance data to export', 'warning');
            return;
        }

        const reportData = {
            ...this.currentCompliance,
            exportedAt: new Date().toISOString(),
            exportedBy: 'Stellar Privacy Analytics'
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${this.currentCompliance.framework}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Compliance report exported successfully', 'success');
    }

    scheduleReassessment() {
        const modal = new bootstrap.Modal(document.getElementById('scheduleModal') || this.createScheduleModal());
        const modalBody = document.querySelector('#scheduleModal .modal-body');
        
        modalBody.innerHTML = `
            <h5>Schedule Compliance Re-assessment</h5>
            <form id="scheduleForm">
                <div class="mb-3">
                    <label for="assessmentDate" class="form-label">Assessment Date</label>
                    <input type="date" class="form-control" id="assessmentDate" required>
                </div>
                <div class="mb-3">
                    <label for="assessmentFrequency" class="form-label">Frequency</label>
                    <select class="form-select" id="assessmentFrequency">
                        <option value="once">One-time</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="notificationEmail" class="form-label">Notification Email</label>
                    <input type="email" class="form-control" id="notificationEmail" placeholder="Enter email for notifications">
                </div>
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="autoRemediate">
                        <label class="form-check-label" for="autoRemediate">
                            Enable automatic remediation suggestions
                        </label>
                    </div>
                </div>
            </form>
        `;
        
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('assessmentDate').min = tomorrow.toISOString().split('T')[0];
        
        modal.show();
    }

    createScheduleModal() {
        const modalHTML = `
            <div class="modal fade" id="scheduleModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Schedule Assessment</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Content will be populated dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="complianceManager.saveSchedule()">Schedule</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return document.getElementById('scheduleModal');
    }

    saveSchedule() {
        const form = document.getElementById('scheduleForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const scheduleData = {
            framework: this.currentCompliance.framework,
            date: document.getElementById('assessmentDate').value,
            frequency: document.getElementById('assessmentFrequency').value,
            email: document.getElementById('notificationEmail').value,
            autoRemediate: document.getElementById('autoRemediate').checked,
            scheduledAt: new Date().toISOString()
        };

        // Save to localStorage (in production, this would be sent to server)
        const schedules = JSON.parse(localStorage.getItem('complianceSchedules') || '[]');
        schedules.push(scheduleData);
        localStorage.setItem('complianceSchedules', JSON.stringify(schedules));

        const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
        modal.hide();

        this.showNotification('Compliance assessment scheduled successfully', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize compliance manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.complianceManager = new ComplianceManager();
});

// Export for use in other modules
window.ComplianceManager = ComplianceManager;

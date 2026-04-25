// Assessment JavaScript for Stellar Privacy Analytics

class AssessmentManager {
    constructor() {
        this.currentAssessment = null;
        this.assessmentHistory = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAssessmentHistory();
        this.setupFormValidation();
    }

    setupEventListeners() {
        const form = document.getElementById('assessmentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.runAssessment();
            });
        }

        // Real-time form validation
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.validateField(input);
                this.updateRiskPreview();
            });
        });

        // Data type selection helpers
        this.setupDataTypeHelpers();
        this.setupActivityHelpers();
    }

    setupFormValidation() {
        const form = document.getElementById('assessmentForm');
        if (!form) return;

        // Custom validation rules
        form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.showValidationErrors();
            }
        });
    }

    validateForm() {
        const form = document.getElementById('assessmentForm');
        const workflowName = document.getElementById('workflowName');
        let isValid = true;

        // Validate workflow name
        if (!workflowName.value.trim()) {
            this.showFieldError(workflowName, 'Workflow name is required');
            isValid = false;
        } else {
            this.clearFieldError(workflowName);
        }

        // Validate at least one data type is selected
        const dataTypes = form.querySelectorAll('input[name="dataTypes"]:checked');
        if (dataTypes.length === 0) {
            this.showFieldError(form.querySelector('#dataTypes'), 'At least one data type must be selected');
            isValid = false;
        } else {
            this.clearFieldError(form.querySelector('#dataTypes'));
        }

        return isValid;
    }

    validateField(field) {
        if (field.type === 'checkbox') {
            return true; // Checkboxes are validated at group level
        }

        if (field.required && !field.value.trim()) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showValidationErrors() {
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        this.showNotification('Please correct the errors before submitting', 'error');
    }

    setupDataTypeHelpers() {
        // Add quick select buttons for common data type combinations
        const dataTypeContainer = document.getElementById('dataTypes');
        if (dataTypeContainer) {
            const helperHTML = `
                <div class="mb-2">
                    <small class="text-muted">Quick select:</small>
                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" onclick="assessmentManager.selectDataTypes(['name', 'email', 'phone'])">
                        Basic Contact
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" onclick="assessmentManager.selectDataTypes(['name', 'email', 'phone', 'address'])">
                        Full Contact
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="assessmentManager.selectDataTypes(['health', 'financial'])">
                        Sensitive Data
                    </button>
                </div>
            `;
            dataTypeContainer.insertAdjacentHTML('afterbegin', helperHTML);
        }
    }

    setupActivityHelpers() {
        const activityContainer = document.getElementById('processingActivities');
        if (activityContainer) {
            const helperHTML = `
                <div class="mb-2">
                    <small class="text-muted">Quick select:</small>
                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" onclick="assessmentManager.selectActivities(['analytics'])">
                        Analytics Only
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" onclick="assessmentManager.selectActivities(['analytics', 'marketing'])">
                        Analytics & Marketing
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="assessmentManager.selectActivities(['profiling', 'automated_decision'])">
                        High Risk
                    </button>
                </div>
            `;
            activityContainer.insertAdjacentHTML('afterbegin', helperHTML);
        }
    }

    selectDataTypes(types) {
        // Clear all selections first
        document.querySelectorAll('#dataTypes input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Select specified types
        types.forEach(type => {
            const checkbox = document.getElementById(`dataType_${type}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        this.updateRiskPreview();
    }

    selectActivities(activities) {
        // Clear all selections first
        document.querySelectorAll('#processingActivities input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Select specified activities
        activities.forEach(activity => {
            const checkbox = document.getElementById(`activity_${activity}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        this.updateRiskPreview();
    }

    updateRiskPreview() {
        const formData = this.getFormData();
        const quickScore = this.calculateQuickScore(formData);
        
        // Update preview if element exists
        const previewElement = document.getElementById('riskPreview');
        if (previewElement) {
            previewElement.innerHTML = this.generateRiskPreviewHTML(quickScore);
        }
    }

    calculateQuickScore(formData) {
        let score = 20; // Base score

        // Data types contribution
        const sensitiveTypes = ['health', 'financial', 'biometric', 'political'];
        const personalTypes = ['name', 'email', 'phone', 'address'];
        
        formData.dataTypes.forEach(type => {
            if (sensitiveTypes.includes(type)) score += 15;
            else if (personalTypes.includes(type)) score += 8;
            else score += 3;
        });

        // Processing activities contribution
        const highRiskActivities = ['profiling', 'automated_decision', 'systematic_monitoring'];
        const mediumRiskActivities = ['marketing', 'sharing'];
        
        formData.processingActivities.forEach(activity => {
            if (highRiskActivities.includes(activity)) score += 20;
            else if (mediumRiskActivities.includes(activity)) score += 10;
            else score += 5;
        });

        // Encryption contribution
        const encryptionScores = { none: 25, partial: 10, full: -5 };
        score += encryptionScores[formData.encryptionStatus] || 0;

        // Access control contribution
        const accessScores = { none: 20, basic: 10, rbac: 0, advanced: -5 };
        score += accessScores[formData.accessControl] || 0;

        return Math.min(100, Math.max(0, score));
    }

    generateRiskPreviewHTML(score) {
        const category = this.getRiskCategory(score);
        const colorClass = this.getRiskColorClass(category);
        
        return `
            <div class="alert alert-${colorClass} mb-2">
                <strong>Estimated Risk Score:</strong> ${score} (${category})
            </div>
            <div class="progress progress-risk mb-2">
                <div class="progress-bar bg-${colorClass}" style="width: ${score}%">
                    ${score}%
                </div>
            </div>
            <small class="text-muted">This is a preliminary estimate. Run full assessment for detailed analysis.</small>
        `;
    }

    getRiskCategory(score) {
        if (score >= 90) return 'critical';
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    getRiskColorClass(category) {
        const colorMap = {
            critical: 'danger',
            high: 'warning',
            medium: 'info',
            low: 'success'
        };
        return colorMap[category] || 'secondary';
    }

    async runAssessment() {
        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();
        this.showAssessmentLoading();

        try {
            const response = await fetch('/api/assess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workflow: formData
                })
            });

            if (!response.ok) {
                throw new Error('Assessment failed');
            }

            const assessment = await response.json();
            this.displayAssessmentResults(assessment);
            this.saveAssessment(assessment);
            this.showNotification('Assessment completed successfully', 'success');

        } catch (error) {
            console.error('Assessment error:', error);
            this.showAssessmentError(error);
            this.showNotification('Assessment failed. Please try again.', 'error');
        }
    }

    getFormData() {
        const form = document.getElementById('assessmentForm');
        const formData = {
            name: document.getElementById('workflowName').value,
            dataTypes: [],
            processingActivities: [],
            encryption: {
                atRest: document.getElementById('encryptionStatus').value !== 'none',
                inTransit: document.getElementById('encryptionStatus').value !== 'none',
                strength: document.getElementById('encryptionStatus').value === 'full' ? 'strong' : 'weak'
            },
            access: {
                authentication: document.getElementById('accessControl').value !== 'none' ? 'enabled' : 'none',
                authorization: document.getElementById('accessControl').value,
                publicAccess: false
            }
        };

        // Get selected data types
        form.querySelectorAll('#dataTypes input[type="checkbox"]:checked').forEach(checkbox => {
            formData.dataTypes.push(checkbox.value);
        });

        // Get selected activities
        form.querySelectorAll('#processingActivities input[type="checkbox"]:checked').forEach(checkbox => {
            formData.processingActivities.push(checkbox.value);
        });

        return formData;
    }

    showAssessmentLoading() {
        const resultsContainer = document.getElementById('assessmentResults');
        resultsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner mb-3"></div>
                <p class="text-muted">Running privacy risk assessment...</p>
            </div>
        `;
    }

    displayAssessmentResults(assessment) {
        const resultsContainer = document.getElementById('assessmentResults');
        resultsContainer.innerHTML = this.generateResultsHTML(assessment);
        
        // Add animation
        resultsContainer.querySelector('.results-panel').classList.add('fade-in');
        
        // Setup result interactions
        this.setupResultInteractions(assessment);
    }

    generateResultsHTML(assessment) {
        const score = assessment.scores.overall;
        const category = assessment.category.level;
        const colorClass = this.getRiskColorClass(category);

        return `
            <div class="results-panel">
                <div class="text-center mb-3">
                    <div class="score-display text-${colorClass}">${score}</div>
                    <span class="category-badge bg-${colorClass} text-white">${category.toUpperCase()}</span>
                </div>
                
                <div class="mb-3">
                    <h6>Overall Risk Score</h6>
                    <div class="progress progress-risk">
                        <div class="progress-bar bg-${colorClass}" style="width: ${score}%">
                            ${score}%
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <h6>Factor Breakdown</h6>
                    ${this.generateFactorBreakdownHTML(assessment.scores)}
                </div>

                <div class="mb-3">
                    <h6>Top Recommendations</h6>
                    ${this.generateRecommendationsHTML(assessment.recommendations.slice(0, 3))}
                </div>

                <div class="text-center">
                    <button class="btn btn-primary btn-sm me-2" onclick="assessmentManager.viewFullDetails('${assessment.id}')">
                        <i class="fas fa-eye me-1"></i>Full Details
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="assessmentManager.exportAssessment('${assessment.id}')">
                        <i class="fas fa-download me-1"></i>Export
                    </button>
                </div>
            </div>
        `;
    }

    generateFactorBreakdownHTML(scores) {
        const factors = [
            { key: 'dataTypes', label: 'Data Types' },
            { key: 'processingActivities', label: 'Processing' },
            { key: 'encryption', label: 'Encryption' },
            { key: 'access', label: 'Access Control' }
        ];

        return factors.map(factor => {
            const score = Math.round(scores[factor.key] || 0);
            const category = this.getRiskCategory(score);
            const colorClass = this.getRiskColorClass(category);
            
            return `
                <div class="mb-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <small>${factor.label}</small>
                        <small class="text-${colorClass}">${score}%</small>
                    </div>
                    <div class="progress" style="height: 4px;">
                        <div class="progress-bar bg-${colorClass}" style="width: ${score}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    generateRecommendationsHTML(recommendations) {
        if (recommendations.length === 0) {
            return '<p class="text-muted">No specific recommendations at this time.</p>';
        }

        return recommendations.map((rec, index) => {
            const priorityClass = rec.priority === 'high' ? 'high-priority' : 
                                 rec.priority === 'medium' ? 'medium-priority' : '';
            
            return `
                <div class="recommendation-item ${priorityClass}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${rec.action}</strong>
                            <p class="mb-0 small text-muted">${rec.description}</p>
                        </div>
                        <span class="badge bg-${rec.priority === 'high' ? 'danger' : 'warning'}">${rec.priority}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupResultInteractions(assessment) {
        // Add click handlers for detailed views
        const factorElements = document.querySelectorAll('.factor-breakdown .progress-bar');
        factorElements.forEach(element => {
            element.addEventListener('click', () => {
                const factor = element.dataset.factor;
                this.showFactorDetails(factor, assessment);
            });
        });
    }

    showFactorDetails(factor, assessment) {
        const factorData = assessment.riskFactors[factor];
        if (!factorData) return;

        const modal = new bootstrap.Modal(document.getElementById('factorModal') || this.createFactorModal());
        const modalBody = document.querySelector('#factorModal .modal-body');
        
        modalBody.innerHTML = `
            <h5>${factor.charAt(0).toUpperCase() + factor.slice(1)} Details</h5>
            <div class="mb-3">
                <div class="progress progress-risk">
                    <div class="progress-bar bg-${this.getRiskColorClass(this.getRiskCategory(factorData.score))}" 
                         style="width: ${factorData.score}%">
                        ${factorData.score}%
                    </div>
                </div>
            </div>
            <h6>Issues Found:</h6>
            <ul>
                ${(factorData.details || []).map(detail => `<li>${detail}</li>`).join('')}
            </ul>
            <h6>Recommendations:</h6>
            <ul>
                ${this.getFactorRecommendations(factor, factorData.score)}
            </ul>
        `;
        
        modal.show();
    }

    createFactorModal() {
        const modalHTML = `
            <div class="modal fade" id="factorModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Risk Factor Details</h5>
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
        return document.getElementById('factorModal');
    }

    getFactorRecommendations(factor, score) {
        const recommendations = {
            dataTypes: [
                'Implement data minimization principles',
                'Classify data by sensitivity level',
                'Review data collection necessity'
            ],
            processingActivities: [
                'Conduct privacy impact assessment',
                'Review processing purposes',
                'Implement privacy by design'
            ],
            encryption: [
                'Enable encryption at rest and in transit',
                'Use strong cryptographic algorithms',
                'Implement proper key management'
            ],
            access: [
                'Implement role-based access control',
                'Enable multi-factor authentication',
                'Review access permissions regularly'
            ]
        };

        const factorRecs = recommendations[factor] || [
            'Review current controls',
            'Implement additional safeguards',
            'Monitor for improvements'
        ];

        return factorRecs.map(rec => `<li>${rec}</li>`).join('');
    }

    showAssessmentError(error) {
        const resultsContainer = document.getElementById('assessmentResults');
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>Assessment Failed</h6>
                <p class="mb-0">Unable to complete the assessment. Please check your inputs and try again.</p>
                <small class="text-muted">${error.message}</small>
            </div>
        `;
    }

    saveAssessment(assessment) {
        // Save to local storage for history
        const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
        history.unshift({
            ...assessment,
            savedAt: new Date().toISOString()
        });
        
        // Keep only last 50 assessments
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem('assessmentHistory', JSON.stringify(history));
        this.assessmentHistory = history;
    }

    loadAssessmentHistory() {
        const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
        this.assessmentHistory = history;
    }

    viewFullDetails(assessmentId) {
        const assessment = this.assessmentHistory.find(a => a.id === assessmentId);
        if (assessment) {
            // Navigate to detailed view or show detailed modal
            console.log('Viewing full details for:', assessment);
            this.showNotification('Full details view coming soon', 'info');
        }
    }

    exportAssessment(assessmentId) {
        const assessment = this.assessmentHistory.find(a => a.id === assessmentId);
        if (assessment) {
            const blob = new Blob([JSON.stringify(assessment, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `assessment-${assessmentId}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Assessment exported successfully', 'success');
        }
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

// Initialize assessment manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.assessmentManager = new AssessmentManager();
});

// Export for use in other modules
window.AssessmentManager = AssessmentManager;

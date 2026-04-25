// Visualization JavaScript for Stellar Privacy Analytics

class VisualizationManager {
    constructor() {
        this.charts = {};
        this.heatmapData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadVisualizationData();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Heatmap interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('heatmap-cell')) {
                this.handleHeatmapClick(e.target);
            }
        });

        // Filter controls
        const factorFilter = document.getElementById('factorFilter');
        if (factorFilter) {
            factorFilter.addEventListener('change', (e) => {
                this.filterHeatmap(e.target.value);
            });
        }

        // Export visualization
        const exportBtn = document.getElementById('exportVisualization');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportVisualization();
            });
        }

        // View mode toggle
        const viewModeToggle = document.getElementById('viewModeToggle');
        if (viewModeToggle) {
            viewModeToggle.addEventListener('change', (e) => {
                this.changeViewMode(e.target.value);
            });
        }
    }

    async loadVisualizationData() {
        try {
            const response = await fetch('/api/visualization/heatmap/current');
            this.heatmapData = await response.json();
        } catch (error) {
            console.error('Error loading visualization data:', error);
            // Use mock data for development
            this.heatmapData = this.generateMockHeatmapData();
        }
    }

    generateMockHeatmapData() {
        return {
            workflowId: 'demo-workflow',
            timestamp: new Date().toISOString(),
            grid: [
                {
                    factor: 'dataTypes',
                    cells: [
                        { level: 'low', intensity: 0.2, color: 'rgba(40, 167, 69, 0.8)', value: 25 },
                        { level: 'medium', intensity: 0.5, color: 'rgba(255, 193, 7, 0.8)', value: 50 },
                        { level: 'high', intensity: 0.75, color: 'rgba(253, 126, 20, 0.8)', value: 75 },
                        { level: 'critical', intensity: 1.0, color: 'rgba(220, 53, 69, 0.8)', value: 95 }
                    ]
                },
                {
                    factor: 'processingActivities',
                    cells: [
                        { level: 'low', intensity: 0.2, color: 'rgba(40, 167, 69, 0.8)', value: 20 },
                        { level: 'medium', intensity: 0.5, color: 'rgba(255, 193, 7, 0.8)', value: 55 },
                        { level: 'high', intensity: 0.75, color: 'rgba(253, 126, 20, 0.8)', value: 78 },
                        { level: 'critical', intensity: 1.0, color: 'rgba(220, 53, 69, 0.8)', value: 92 }
                    ]
                },
                {
                    factor: 'dataFlows',
                    cells: [
                        { level: 'low', intensity: 0.2, color: 'rgba(40, 167, 69, 0.8)', value: 30 },
                        { level: 'medium', intensity: 0.5, color: 'rgba(255, 193, 7, 0.8)', value: 48 },
                        { level: 'high', intensity: 0.75, color: 'rgba(253, 126, 20, 0.8)', value: 72 },
                        { level: 'critical', intensity: 1.0, color: 'rgba(220, 53, 69, 0.8)', value: 88 }
                    ]
                }
            ],
            factors: [
                { name: 'Data Types', score: 65, trend: 'stable', riskLevel: 'high' },
                { name: 'Processing Activities', score: 78, trend: 'increasing', riskLevel: 'high' },
                { name: 'Data Flows', score: 58, trend: 'decreasing', riskLevel: 'medium' },
                { name: 'Storage Security', score: 45, trend: 'stable', riskLevel: 'medium' },
                { name: 'Access Control', score: 68, trend: 'stable', riskLevel: 'high' },
                { name: 'Third Parties', score: 75, trend: 'increasing', riskLevel: 'high' },
                { name: 'Data Retention', score: 52, trend: 'decreasing', riskLevel: 'medium' },
                { name: 'Encryption', score: 38, trend: 'stable', riskLevel: 'low' },
                { name: 'Consent Management', score: 62, trend: 'stable', riskLevel: 'medium' },
                { name: 'Cross-Border Transfer', score: 82, trend: 'increasing', riskLevel: 'high' }
            ],
            trends: this.generateMockTrends(),
            summary: {
                totalAssessments: 47,
                averageRisk: 65.4,
                riskDistribution: { critical: 3, high: 8, medium: 12, low: 24 },
                trend: 'stable',
                lastUpdated: new Date().toISOString(),
                keyInsights: [
                    'Processing activities show highest risk concentration',
                    'Encryption controls need improvement',
                    'Cross-border transfers require attention',
                    'Access controls are generally adequate'
                ]
            }
        };
    }

    generateMockTrends() {
        const trends = [];
        const now = new Date();
        
        for (let i = 12; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 30 * 86400000);
            trends.push({
                period: date.toISOString().split('T')[0].substring(0, 7),
                overall: Math.max(20, Math.min(95, 65 + Math.random() * 30 - 15 + (12 - i) * 2)),
                critical: Math.floor(Math.random() * 5),
                high: Math.floor(Math.random() * 8) + 2,
                medium: Math.floor(Math.random() * 12) + 5,
                low: Math.floor(Math.random() * 15) + 10
            });
        }
        
        return trends;
    }

    initializeCharts() {
        this.setupInteractiveHeatmap();
        this.setupTrendChart();
        this.setupRiskDistributionChart();
        this.setupFactorComparisonChart();
    }

    setupInteractiveHeatmap() {
        const container = document.getElementById('interactiveHeatmap');
        if (!container || !this.heatmapData) return;

        const heatmapHTML = this.generateHeatmapHTML();
        container.innerHTML = heatmapHTML;
        
        this.setupHeatmapInteractions();
        this.addHeatmapAnimations();
    }

    generateHeatmapHTML() {
        const factors = this.heatmapData.factors;
        
        let html = '<div class="heatmap-container">';
        html += '<div class="heatmap-controls mb-3">';
        html += '<div class="row">';
        html += '<div class="col-md-6">';
        html += '<select id="factorFilter" class="form-select form-select-sm">';
        html += '<option value="all">All Factors</option>';
        html += factors.map(f => `<option value="${f.name}">${f.name}</option>`).join('');
        html += '</select>';
        html += '</div>';
        html += '<div class="col-md-6">';
        html += '<select id="viewModeToggle" class="form-select form-select-sm">';
        html += '<option value="grid">Grid View</option>';
        html += '<option value="list">List View</option>';
        html += '<option value="chart">Chart View</option>';
        html += '</select>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        
        html += '<div class="heatmap-grid-container">';
        html += '<div class="heatmap-grid">';
        
        factors.forEach(factor => {
            const riskClass = this.getRiskClass(factor.riskLevel);
            const trendIcon = this.getTrendIcon(factor.trend);
            
            html += `
                <div class="heatmap-cell ${riskClass}" data-factor="${factor.name}" data-score="${factor.score}" data-trend="${factor.trend}">
                    <div class="heatmap-cell-content">
                        <div class="heatmap-score">${factor.score}</div>
                        <div class="heatmap-factor">${factor.name}</div>
                        <div class="heatmap-trend">
                            <i class="fas ${trendIcon}"></i>
                        </div>
                    </div>
                    <div class="heatmap-overlay">
                        <div class="heatmap-details">
                            <strong>${factor.name}</strong><br>
                            Score: ${factor.score}<br>
                            Trend: ${factor.trend}<br>
                            <small>Click for details</small>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        html += '</div>';
        
        // Add legend
        html += '<div class="heatmap-legend mt-3">';
        html += '<div class="d-flex justify-content-center align-items-center gap-3">';
        html += '<span class="legend-item"><span class="legend-color bg-risk-low"></span> Low Risk</span>';
        html += '<span class="legend-item"><span class="legend-color bg-risk-medium"></span> Medium Risk</span>';
        html += '<span class="legend-item"><span class="legend-color bg-risk-high"></span> High Risk</span>';
        html += '<span class="legend-item"><span class="legend-color bg-risk-critical"></span> Critical Risk</span>';
        html += '</div>';
        html += '</div>';
        
        html += '</div>';
        
        return html;
    }

    getRiskClass(level) {
        const classMap = {
            critical: 'risk-critical',
            high: 'risk-high',
            medium: 'risk-medium',
            low: 'risk-low'
        };
        return classMap[level] || 'risk-low';
    }

    getTrendIcon(trend) {
        const iconMap = {
            increasing: 'fa-arrow-up text-danger',
            decreasing: 'fa-arrow-down text-success',
            stable: 'fa-minus text-secondary'
        };
        return iconMap[trend] || 'fa-minus text-secondary';
    }

    setupHeatmapInteractions() {
        const cells = document.querySelectorAll('.heatmap-cell');
        
        cells.forEach(cell => {
            cell.addEventListener('mouseenter', (e) => {
                this.showHeatmapTooltip(e, cell);
            });

            cell.addEventListener('mouseleave', () => {
                this.hideHeatmapTooltip();
            });

            cell.addEventListener('click', () => {
                this.showFactorModal(cell);
            });
        });
    }

    showHeatmapTooltip(event, cell) {
        const factor = cell.dataset.factor;
        const score = cell.dataset.score;
        const trend = cell.dataset.trend;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <strong>${factor}</strong>
            </div>
            <div class="tooltip-body">
                <div>Risk Score: <span class="score-${this.getRiskCategory(score)}">${score}%</span></div>
                <div>Trend: ${trend}</div>
                <div class="tooltip-actions">
                    <small>Click for detailed analysis</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = cell.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        setTimeout(() => tooltip.classList.add('show'), 10);
    }

    hideHeatmapTooltip() {
        const tooltip = document.querySelector('.heatmap-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    showFactorModal(cell) {
        const factor = cell.dataset.factor;
        const score = parseInt(cell.dataset.score);
        const trend = cell.dataset.trend;
        
        const modal = new bootstrap.Modal(document.getElementById('factorVisualizationModal') || this.createFactorVisualizationModal());
        const modalBody = document.querySelector('#factorVisualizationModal .modal-body');
        
        modalBody.innerHTML = `
            <div class="factor-visualization">
                <div class="row">
                    <div class="col-md-6">
                        <h5>${factor}</h5>
                        <div class="factor-score-display">
                            <div class="score-circle score-${this.getRiskCategory(score)}">
                                <span class="score-value">${score}</span>
                                <span class="score-label">%</span>
                            </div>
                        </div>
                        <div class="factor-trend">
                            <i class="fas ${this.getTrendIcon(trend)} me-2"></i>
                            <span>Trend: ${trend}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <canvas id="factorTrendChart" width="200" height="200"></canvas>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <h6>Historical Performance</h6>
                        <canvas id="factorHistoryChart" height="100"></canvas>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <h6>Recommendations</h6>
                        <div class="recommendations-list">
                            ${this.generateFactorRecommendations(factor, score)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.show();
        
        // Setup charts after modal is shown
        setTimeout(() => {
            this.setupFactorCharts(factor, score, trend);
        }, 300);
    }

    createFactorVisualizationModal() {
        const modalHTML = `
            <div class="modal fade" id="factorVisualizationModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Factor Visualization</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Content will be populated dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="visualizationManager.exportFactorData()">Export Data</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return document.getElementById('factorVisualizationModal');
    }

    setupFactorCharts(factor, score, trend) {
        // Donut chart for current score
        const donutCtx = document.getElementById('factorTrendChart');
        if (donutCtx) {
            this.charts.factorDonut = new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [score, 100 - score],
                        backgroundColor: [this.getRiskColor(score), '#e9ecef'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
        }

        // Line chart for historical data
        const historyCtx = document.getElementById('factorHistoryChart');
        if (historyCtx && this.heatmapData.trends) {
            const trendData = this.heatmapData.trends.map(t => ({
                x: t.period,
                y: Math.max(20, Math.min(95, score + (Math.random() * 20 - 10)))
            }));

            this.charts.factorHistory = new Chart(historyCtx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: factor,
                        data: trendData,
                        borderColor: this.getRiskColor(score),
                        backgroundColor: this.getRiskColor(score) + '20',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
    }

    getRiskCategory(score) {
        if (score >= 90) return 'critical';
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    getRiskColor(score) {
        const category = this.getRiskCategory(score);
        const colorMap = {
            critical: '#dc3545',
            high: '#fd7e14',
            medium: '#ffc107',
            low: '#28a745'
        };
        return colorMap[category] || '#6c757d';
    }

    generateFactorRecommendations(factor, score) {
        const recommendations = {
            'Data Types': [
                'Implement data minimization principles',
                'Classify data by sensitivity level',
                'Review data collection necessity'
            ],
            'Processing Activities': [
                'Conduct privacy impact assessment',
                'Review processing purposes',
                'Implement privacy by design'
            ],
            'Access Control': [
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

        return factorRecs.map(rec => `
            <div class="recommendation-item">
                <i class="fas fa-lightbulb me-2"></i>
                ${rec}
            </div>
        `).join('');
    }

    addHeatmapAnimations() {
        const cells = document.querySelectorAll('.heatmap-cell');
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.classList.add('fade-in');
            }, index * 50);
        });
    }

    setupTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx || !this.heatmapData.trends) return;

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.heatmapData.trends.map(t => t.period),
                datasets: [
                    {
                        label: 'Overall Risk',
                        data: this.heatmapData.trends.map(t => t.overall),
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Critical',
                        data: this.heatmapData.trends.map(t => t.critical * 10),
                        borderColor: '#dc3545',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    setupRiskDistributionChart() {
        const ctx = document.getElementById('riskDistributionChart');
        if (!ctx || !this.heatmapData.summary) return;

        const distribution = this.heatmapData.summary.riskDistribution;
        
        this.charts.distribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    label: 'Risk Distribution',
                    data: [distribution.critical, distribution.high, distribution.medium, distribution.low],
                    backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    setupFactorComparisonChart() {
        const ctx = document.getElementById('factorComparisonChart');
        if (!ctx || !this.heatmapData.factors) return;

        this.charts.comparison = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: this.heatmapData.factors.map(f => f.name),
                datasets: [{
                    label: 'Current Risk Scores',
                    data: this.heatmapData.factors.map(f => f.score),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#007bff',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#007bff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    filterHeatmap(factor) {
        const cells = document.querySelectorAll('.heatmap-cell');
        
        cells.forEach(cell => {
            if (factor === 'all') {
                cell.style.display = 'block';
            } else {
                const shouldShow = cell.dataset.factor === factor;
                cell.style.display = shouldShow ? 'block' : 'none';
            }
        });
    }

    changeViewMode(mode) {
        const container = document.querySelector('.heatmap-grid-container');
        if (!container) return;

        container.className = `heatmap-grid-container view-${mode}`;
        
        // Re-render based on mode
        if (mode === 'list') {
            this.renderListView();
        } else if (mode === 'chart') {
            this.renderChartView();
        } else {
            this.renderGridView();
        }
    }

    renderListView() {
        const container = document.querySelector('.heatmap-grid-container');
        if (!container || !this.heatmapData.factors) return;

        const listHTML = this.heatmapData.factors.map(factor => `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-header">
                        <span class="factor-name">${factor.name}</span>
                        <span class="factor-score score-${this.getRiskCategory(factor.score)}">${factor.score}%</span>
                    </div>
                    <div class="list-item-details">
                        <span class="trend-indicator">
                            <i class="fas ${this.getTrendIcon(factor.trend)}"></i>
                            ${factor.trend}
                        </span>
                        <span class="risk-level ${this.getRiskClass(factor.riskLevel)}">${factor.riskLevel}</span>
                    </div>
                    <div class="progress mt-2" style="height: 4px;">
                        <div class="progress-bar bg-${this.getRiskColor(factor.score).replace('#', '')}" 
                             style="width: ${factor.score}%"></div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `<div class="factor-list">${listHTML}</div>`;
    }

    renderChartView() {
        const container = document.querySelector('.heatmap-grid-container');
        if (!container) return;

        container.innerHTML = `
            <div class="chart-view">
                <canvas id="factorBarChart" height="300"></canvas>
            </div>
        `;

        setTimeout(() => {
            this.setupFactorBarChart();
        }, 100);
    }

    setupFactorBarChart() {
        const ctx = document.getElementById('factorBarChart');
        if (!ctx || !this.heatmapData.factors) return;

        this.charts.factorBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.heatmapData.factors.map(f => f.name),
                datasets: [{
                    label: 'Risk Score',
                    data: this.heatmapData.factors.map(f => f.score),
                    backgroundColor: this.heatmapData.factors.map(f => this.getRiskColor(f.score)),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderGridView() {
        // Re-render the original grid view
        this.setupInteractiveHeatmap();
    }

    exportVisualization() {
        if (!this.heatmapData) {
            this.showNotification('No visualization data to export', 'warning');
            return;
        }

        const exportData = {
            ...this.heatmapData,
            exportedAt: new Date().toISOString(),
            exportedBy: 'Stellar Privacy Analytics'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `risk-visualization-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Visualization data exported successfully', 'success');
    }

    exportFactorData() {
        const factor = document.querySelector('#factorVisualizationModal .modal-title').textContent;
        const score = document.querySelector('.score-value').textContent;
        
        const factorData = {
            factor,
            score: parseInt(score),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(factorData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factor-${factor.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Factor data exported successfully', 'success');
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

// Initialize visualization manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.visualizationManager = new VisualizationManager();
});

// Export for use in other modules
window.VisualizationManager = VisualizationManager;

// Dashboard JavaScript for Stellar Privacy Analytics

class Dashboard {
    constructor() {
        this.charts = {};
        this.data = {
            metrics: {},
            assessments: [],
            trends: []
        };
        this.init();
    }

    async init() {
        await this.loadDashboardData();
        this.setupCharts();
        this.setupEventListeners();
        this.updateMetrics();
        this.startRealTimeUpdates();
    }

    async loadDashboardData() {
        try {
            // Simulate API calls - in production, these would be real API calls
            const response = await fetch('/api/dashboard/metrics');
            this.data.metrics = await response.json();
            
            const assessmentsResponse = await fetch('/api/assessments/recent');
            this.data.assessments = await assessmentsResponse.json();
            
            const trendsResponse = await fetch('/api/trends');
            this.data.trends = await trendsResponse.json();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Use mock data for development
            this.loadMockData();
        }
    }

    loadMockData() {
        this.data.metrics = {
            criticalCount: 3,
            highCount: 8,
            avgRiskScore: 65.4,
            complianceRate: 72,
            totalAssessments: 47,
            riskTrend: 'stable'
        };

        this.data.assessments = [
            {
                id: '1',
                name: 'Customer Data Processing',
                score: 78,
                category: 'high',
                timestamp: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Marketing Analytics',
                score: 45,
                category: 'medium',
                timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: '3',
                name: 'Payment Processing',
                score: 92,
                category: 'critical',
                timestamp: new Date(Date.now() - 172800000).toISOString()
            }
        ];

        this.data.trends = this.generateMockTrends();
    }

    generateMockTrends() {
        const trends = [];
        const now = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 86400000);
            trends.push({
                date: date.toISOString().split('T')[0],
                critical: Math.floor(Math.random() * 5),
                high: Math.floor(Math.random() * 10) + 2,
                medium: Math.floor(Math.random() * 15) + 5,
                low: Math.floor(Math.random() * 20) + 10,
                averageScore: Math.random() * 30 + 50
            });
        }
        
        return trends;
    }

    updateMetrics() {
        // Update metric cards
        document.getElementById('criticalCount').textContent = this.data.metrics.criticalCount;
        document.getElementById('highCount').textContent = this.data.metrics.highCount;
        document.getElementById('avgRiskScore').textContent = this.data.metrics.avgRiskScore.toFixed(1);
        document.getElementById('complianceRate').textContent = this.data.metrics.complianceRate + '%';

        // Add animations
        this.animateMetricCards();
    }

    animateMetricCards() {
        const cards = document.querySelectorAll('.card-body');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
    }

    setupCharts() {
        this.setupRiskDistributionChart();
        this.setupRiskTrendsChart();
        this.setupRiskHeatmap();
    }

    setupRiskDistributionChart() {
        const ctx = document.getElementById('riskDistributionChart').getContext('2d');
        
        this.charts.riskDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    data: [
                        this.data.metrics.criticalCount,
                        this.data.metrics.highCount,
                        12, // medium count
                        24  // low count
                    ],
                    backgroundColor: [
                        '#dc3545',
                        '#fd7e14',
                        '#ffc107',
                        '#28a745'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    setupRiskTrendsChart() {
        const ctx = document.getElementById('riskTrendsChart').getContext('2d');
        
        this.charts.riskTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.trends.slice(-7).map(t => {
                    const date = new Date(t.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Average Risk Score',
                    data: this.data.trends.slice(-7).map(t => t.averageScore),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
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
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Risk Score: ${context.parsed.y.toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    setupRiskHeatmap() {
        const container = document.getElementById('riskHeatmap');
        const factors = [
            { name: 'Data Types', score: 65, category: 'high' },
            { name: 'Processing', score: 78, category: 'high' },
            { name: 'Data Flows', score: 45, category: 'medium' },
            { name: 'Storage', score: 32, category: 'low' },
            { name: 'Access', score: 88, category: 'critical' },
            { name: 'Third Parties', score: 56, category: 'medium' },
            { name: 'Retention', score: 41, category: 'medium' },
            { name: 'Encryption', score: 25, category: 'low' },
            { name: 'Consent', score: 69, category: 'medium' },
            { name: 'Cross Border', score: 82, category: 'high' }
        ];

        const heatmapHTML = factors.map(factor => `
            <div class="heatmap-cell ${factor.category}" data-factor="${factor.name}" data-score="${factor.score}">
                <span class="score">${factor.score}</span>
                <span class="factor">${factor.name}</span>
            </div>
        `).join('');

        container.innerHTML = `<div class="heatmap-grid">${heatmapHTML}</div>`;
        this.setupHeatmapInteractions();
    }

    setupHeatmapInteractions() {
        const cells = document.querySelectorAll('.heatmap-cell');
        
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const factor = cell.dataset.factor;
                const score = cell.dataset.score;
                this.showFactorDetails(factor, score);
            });

            cell.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, cell);
            });

            cell.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showFactorDetails(factor, score) {
        const modal = new bootstrap.Modal(document.getElementById('factorModal') || this.createFactorModal());
        const modalBody = document.querySelector('#factorModal .modal-body');
        
        modalBody.innerHTML = `
            <h5>${factor}</h5>
            <div class="mb-3">
                <div class="progress progress-risk">
                    <div class="progress-bar bg-${this.getRiskCategory(score)}" style="width: ${score}%">
                        ${score}%
                    </div>
                </div>
            </div>
            <h6>Recommendations:</h6>
            <ul>
                ${this.getFactorRecommendations(factor, score)}
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

    getRiskCategory(score) {
        if (score >= 90) return 'danger';
        if (score >= 70) return 'warning';
        if (score >= 40) return 'info';
        return 'success';
    }

    getFactorRecommendations(factor, score) {
        const recommendations = {
            'Data Types': [
                'Implement data minimization principles',
                'Classify data by sensitivity level',
                'Review data collection necessity'
            ],
            'Processing': [
                'Conduct privacy impact assessment',
                'Review processing purposes',
                'Implement privacy by design'
            ],
            'Access': [
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

    showTooltip(event, cell) {
        const factor = cell.dataset.factor;
        const score = cell.dataset.score;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-custom';
        tooltip.innerHTML = `
            <strong>${factor}</strong><br>
            Risk Score: ${score}%<br>
            Click for details
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = cell.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        setTimeout(() => tooltip.classList.add('show'), 10);
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip-custom');
        if (tooltip) {
            tooltip.remove();
        }
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportDashboard');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDashboardData();
            });
        }

        // Filter controls
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filterByDate(e.target.value);
            });
        }
    }

    async refreshDashboard() {
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Refreshing...';
        }

        try {
            await this.loadDashboardData();
            this.updateMetrics();
            this.updateCharts();
            this.showNotification('Dashboard refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            this.showNotification('Error refreshing dashboard', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh';
            }
        }
    }

    updateCharts() {
        // Update risk distribution chart
        if (this.charts.riskDistribution) {
            this.charts.riskDistribution.data.datasets[0].data = [
                this.data.metrics.criticalCount,
                this.data.metrics.highCount,
                12, // medium count
                24  // low count
            ];
            this.charts.riskDistribution.update();
        }

        // Update trends chart
        if (this.charts.riskTrends) {
            this.charts.riskTrends.data.datasets[0].data = this.data.trends.slice(-7).map(t => t.averageScore);
            this.charts.riskTrends.update();
        }
    }

    exportDashboardData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            metrics: this.data.metrics,
            assessments: this.data.assessments,
            trends: this.data.trends
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Dashboard data exported successfully', 'success');
    }

    filterByDate(period) {
        // Implement date filtering logic
        console.log(`Filtering by period: ${period}`);
        this.showNotification(`Filter applied: ${period}`, 'info');
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

    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.simulateRealTimeUpdate();
        }, 30000);
    }

    simulateRealTimeUpdate() {
        // Simulate a small change in metrics
        const change = Math.random() > 0.5 ? 1 : -1;
        this.data.metrics.avgRiskScore = Math.max(0, Math.min(100, 
            this.data.metrics.avgRiskScore + (Math.random() * 2 - 1)
        ));
        
        this.updateMetrics();
        
        // Show subtle notification
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator online';
        indicator.style.cssText = 'position: fixed; top: 20px; left: 20px; z-index: 9999;';
        indicator.title = 'Data updated';
        document.body.appendChild(indicator);
        
        setTimeout(() => indicator.remove(), 3000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Export for use in other modules
window.Dashboard = Dashboard;

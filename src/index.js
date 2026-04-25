const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

const PrivacyRiskAssessment = require('./core/PrivacyRiskAssessment');
const RiskVisualization = require('./visualization/RiskVisualization');
const ComplianceManager = require('./compliance/ComplianceManager');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const riskAssessment = new PrivacyRiskAssessment();
const visualization = new RiskVisualization();
const complianceManager = new ComplianceManager();

app.post('/api/assess', async (req, res) => {
  try {
    const { workflow, customCriteria } = req.body;
    const assessment = await riskAssessment.assessWorkflow(workflow, customCriteria);
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/visualization/heatmap/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const heatmap = await visualization.generateHeatmap(workflowId);
    res.json(heatmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/history/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const history = await riskAssessment.getRiskHistory(workflowId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/compliance/check', async (req, res) => {
  try {
    const { framework, workflowId } = req.query;
    const compliance = await complianceManager.checkCompliance(framework, workflowId);
    res.json(compliance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Stellar Privacy Analytics server running on port ${PORT}`);
});

module.exports = app;

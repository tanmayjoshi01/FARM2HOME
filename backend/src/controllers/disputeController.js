const disputeModel = require('../models/disputeModel');

async function getDisputes(req, res) {
  try {
    const disputes = await disputeModel.getAllDisputes();
    res.json(disputes);
  } catch (e) {
    console.error('Get disputes error:', e);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
}

async function createDispute(req, res) {
  try {
    const { auction_id, farmer_id, issue_type, description } = req.body;
    const buyer_id = req.user.id;
    if (!farmer_id || !issue_type) return res.status(400).json({ error: 'farmer_id and issue_type are required' });
    const dispute = await disputeModel.createDispute(buyer_id, farmer_id, auction_id, issue_type, description);
    res.status(201).json({ message: 'Dispute filed', dispute });
  } catch (e) {
    console.error('Create dispute error:', e);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
}

async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['open', 'investigating', 'resolved'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    const dispute = await disputeModel.updateDisputeStatus(id, status);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    res.json({ message: 'Status updated', dispute });
  } catch (e) {
    console.error('Update dispute error:', e);
    res.status(500).json({ error: 'Failed to update dispute' });
  }
}

module.exports = { getDisputes, createDispute, updateStatus };

const express = require('express');
const router = express.Router();
const Draft = require('../models/Draft');

// Create a new shareable draft
router.post('/share', async (req, res) => {
  try {
    const draftData = req.body;

    // Ensure draft is marked as public
    draftData.isPublic = true;

    // Create new draft in database
    const newDraft = new Draft(draftData);
    const savedDraft = await newDraft.save();

    res.status(201).json({ 
      success: true, 
      draftId: savedDraft._id,
      message: 'Shareable draft created successfully' 
    });
  } catch (error) {
    console.error('Error creating shareable draft:', error);
    res.status(500).json({ success: false, message: 'Failed to create shareable draft' });
  }
});

// Mark draft as public (for sharing)
router.patch('/:draftId/public', async (req, res) => {
  try {
    const { draftId } = req.params;
    const { isPublic } = req.body;

    const updatedDraft = await Draft.findByIdAndUpdate(
      draftId,
      { isPublic },
      { new: true }
    );

    if (!updatedDraft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    res.status(200).json({ 
      success: true, 
      draft: updatedDraft,
      message: 'Draft updated successfully' 
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ success: false, message: 'Failed to update draft' });
  }
});

module.exports = router;

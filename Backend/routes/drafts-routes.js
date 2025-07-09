// Get a single draft by ID
router.get('/single/:id', async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Check if draft is public or if user ID matches
    const isPublic = draft.isPublic === true;
    const isOwner = req.query.userId && draft.userId === req.query.userId;

    if (!isPublic && !isOwner) {
      return res.status(403).json({ message: 'Access denied to this draft' });
    }

    res.json(draft);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

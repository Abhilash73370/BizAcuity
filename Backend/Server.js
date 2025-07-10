const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

// Import models and middleware
const User = require('./models/User');
const Draft = require('./models/Draft');
const { generateToken, verifyToken } = require('./middleware/auth');

const app = express();
const PORT = 5001;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/WallDesign', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// CORS config
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Increase payload size limit for base64 images
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Image upload endpoint - Protected
app.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create hash from file content
    const fileBuffer = req.file.buffer;
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const ext = path.extname(req.file.originalname);
    const filename = `${hash}${ext}`;
    const fullPath = path.join(uploadsDir, filename);

    // Check if file already exists
    if (fs.existsSync(fullPath)) {
      // File already exists, return existing URL
      const fileUrl = `http://localhost:${PORT}/uploads/${filename}`;
      console.log('Duplicate image detected, returning existing URL:', fileUrl);
      return res.json({ 
        url: fileUrl,
        message: 'Image already exists'
      });
    }

    // Save new file
    fs.writeFileSync(fullPath, fileBuffer);
    const fileUrl = `http://localhost:${PORT}/uploads/${filename}`;
    console.log('New image uploaded:', fileUrl);
    
    res.json({ 
      url: fileUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File size too large',
          limit: '30MB'
        });
      }
    }
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message 
    });
  }
});

// Register
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user (password will be hashed by the model middleware)
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({ 
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password using the model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send user data and token
    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected route - Get user
app.get('/user/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
      
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Draft Routes
// Protected route - Create new draft
app.post('/drafts', verifyToken, async (req, res) => {
  try {
    const { name, wallData, previewImage } = req.body;
    
    if (!name || !wallData || !previewImage) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          name: !name,
          wallData: !wallData,
          previewImage: !previewImage
        }
      });
    }

    const draft = new Draft({
      name,
      userId: req.userId, // Use the userId from the token
      wallData,
      previewImage
    });
    
    await draft.save();
    
    res.status(201).json({
      message: 'Draft saved successfully',
      draft
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ 
      error: 'Failed to save draft',
      details: error.message
    });
  }
});

// Protected route - Get user's drafts
app.get('/drafts/:userId', verifyToken, async (req, res) => {
  try {
    // Ensure user can only access their own drafts
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const drafts = await Draft.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .select('name userId previewImage createdAt updatedAt');
    
    res.json(drafts);
  } catch (error) {
    console.error('Get drafts error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drafts',
      details: error.message
    });
  }
});

// Get specific draft - Protected, but allows access to shared drafts
app.get('/drafts/single/:draftId', verifyToken, async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.draftId)
      .populate('userId', 'name email');
      
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    // Allow access if user owns the draft or if it's shared with them
    const isOwner = draft.userId._id.toString() === req.userId;
    const isSharedWithUser = draft.sharedWith && Array.isArray(draft.sharedWith) && 
      draft.sharedWith.some(share => share.userId && share.userId.toString() === req.userId);

    if (!isOwner && !isSharedWithUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(draft);
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch draft',
      details: error.message
    });
  }
});

// Update draft - Protected
app.put('/drafts/:draftId', verifyToken, async (req, res) => {
  try {
    const { name, wallData, previewImage } = req.body;
    
    if (!name || !wallData || !previewImage) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          name: !name,
          wallData: !wallData,
          previewImage: !previewImage
        }
      });
    }

    const draft = await Draft.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    // Ensure user can only update their own drafts
    if (draft.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    draft.name = name;
    draft.wallData = wallData;
    draft.previewImage = previewImage;
    draft.lastModified = new Date();
    await draft.save();
    
    res.json({
      message: 'Draft updated successfully',
      draft
    });
  } catch (error) {
    console.error('Update draft error:', error);
    res.status(500).json({ 
      error: 'Failed to update draft',
      details: error.message
    });
  }
});

// Delete draft - Protected
app.delete('/drafts/:draftId', verifyToken, async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    // Ensure user can only delete their own drafts
    if (draft.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await draft.deleteOne();
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ 
      error: 'Failed to delete draft',
      details: error.message
    });
  }
});

// Update password - Protected
app.put('/user/update-password/:id', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Ensure user can only update their own password
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare password using the model method
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Search users endpoint - Protected
app.get('/users/search', verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id name email')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Share draft endpoint - Protected
app.post('/drafts/:draftId/share', verifyToken, async (req, res) => {
  try {
    const { draftId } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    const draft = await Draft.findById(draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    // Ensure user can only share their own drafts
    if (draft.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Initialize sharedWith array if it doesn't exist
    if (!draft.sharedWith) {
      draft.sharedWith = [];
    }

    // Add new users to sharedWith array (avoid duplicates)
    const existingUserIds = draft.sharedWith.map(share => share.userId.toString());
    const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

    // Add new shares with proper format
    draft.sharedWith.push(...newUserIds.map(userId => ({
      userId: userId,
      sharedAt: new Date()
    })));

    await draft.save();

    res.json({ message: 'Draft shared successfully', draft });
  } catch (error) {
    console.error('Share draft error:', error);
    res.status(500).json({ error: 'Failed to share draft' });
  }
});

// Get shared drafts endpoint - Protected
app.get('/drafts/shared/:userId', verifyToken, async (req, res) => {
  try {
    // Ensure user can only view their own shared drafts
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const sharedDrafts = await Draft.find({
      'sharedWith.userId': req.userId
    })
    .populate('userId', 'name email')
    .sort({ 'sharedWith.sharedAt': -1 })
    .select('name userId previewImage createdAt updatedAt');

    res.json(sharedDrafts);
  } catch (error) {
    console.error('Get shared drafts error:', error);
    res.status(500).json({ error: 'Failed to fetch shared drafts' });
  }
});

// Protected route - Get user's wall
app.get('/wall/:userId', verifyToken, async (req, res) => {
  try {
    // Ensure user can only access their own wall
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ wall: user.wall || {} });
  } catch (error) {
    console.error('Get wall error:', error);
    res.status(500).json({ error: 'Failed to fetch wall' });
  }
});

// Protected route - Update user's wall
app.post('/wall', verifyToken, async (req, res) => {
  try {
    const { wall } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.wall = wall;
    await user.save();

    res.json({ message: 'Wall updated successfully', wall });
  } catch (error) {
    console.error('Update wall error:', error);
    res.status(500).json({ error: 'Failed to update wall' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
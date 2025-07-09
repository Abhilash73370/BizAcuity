const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

// Import models
const User = require('./models/User');
const Draft = require('./models/Draft');

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
  allowedHeaders: ['Content-Type'],
  credentials: true,
};
app.use(cors(corsOptions));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Increase payload size limit for base64 images
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Image upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
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

    // Create new user with plain text password
    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ 
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email }
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

    // Direct password comparison
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Send user data without password
    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user
app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password'); // Exclude password from the response
      
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
// Create new draft
app.post('/drafts', async (req, res) => {
  try {
    const { name, userId, wallData, previewImage } = req.body;
    
    if (!name || !userId || !wallData || !previewImage) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          name: !name,
          userId: !userId,
          wallData: !wallData,
          previewImage: !previewImage
        }
      });
    }

    const draft = new Draft({
      name,
      userId,
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

// Get user's drafts
app.get('/drafts/:userId', async (req, res) => {
  try {
    const drafts = await Draft.find({ userId: req.params.userId })
      .sort({ lastModified: -1 });
    res.json(drafts);
  } catch (error) {
    console.error('Get drafts error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drafts',
      details: error.message
    });
  }
});

// Get specific draft
app.get('/drafts/single/:draftId', async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
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

// Update draft
app.put('/drafts/:draftId', async (req, res) => {
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

    const draft = await Draft.findByIdAndUpdate(
      req.params.draftId,
      { 
        $set: { 
          name,
          wallData,
          previewImage,
          lastModified: new Date()
        } 
      },
      { new: true }
    );
    
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
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

// Delete draft
app.delete('/drafts/:draftId', async (req, res) => {
  try {
    const draft = await Draft.findByIdAndDelete(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ 
      error: 'Failed to delete draft',
      details: error.message
    });
  }
});

// Update password
app.put('/user/update-password/:id', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Direct password comparison
    if (user.password !== currentPassword) {
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

// Search users endpoint
app.get('/users/search', async (req, res) => {
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

// Share draft endpoint
app.post('/drafts/:draftId/share', async (req, res) => {
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

    // Add new users to sharedWith array (avoid duplicates)
    const existingUserIds = draft.sharedWith.map(share => share.userId.toString());
    const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

    draft.sharedWith.push(...newUserIds.map(userId => ({ userId })));
    await draft.save();

    res.json({ message: 'Draft shared successfully', draft });
  } catch (error) {
    console.error('Share draft error:', error);
    res.status(500).json({ error: 'Failed to share draft' });
  }
});

// Get shared drafts endpoint
app.get('/drafts/shared/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sharedDrafts = await Draft.find({
      'sharedWith.userId': userId
    })
    .populate('userId', 'name email')
    .sort({ 'sharedWith.sharedAt': -1 });

    res.json(sharedDrafts);
  } catch (error) {
    console.error('Get shared drafts error:', error);
    res.status(500).json({ error: 'Failed to fetch shared drafts' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

// Import models
const User = require('./models/User');
const WallDesign = require('./models/WallDesign');
const Draft = require('./models/Draft');

const app = express();
const PORT = 5001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename using timestamp and random string
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB limit
  }
});

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
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return the URL for the uploaded file
    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
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
      .select('-password') // Exclude password from the response
      .populate('wallDesigns');
      
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      wallDesigns: user.wallDesigns
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create wall design
app.post('/wall-designs', async (req, res) => {
  try {
    const { userId, name, wallSize, backgroundColor, images } = req.body;
    
    const wallDesign = new WallDesign({
      userId,
      name,
      wallSize,
      backgroundColor,
      images
    });
    
    await wallDesign.save();

    // Add the design to user's wallDesigns array
    await User.findByIdAndUpdate(userId, {
      $push: { wallDesigns: wallDesign._id }
    });

    res.status(201).json({
      message: 'Wall design created successfully',
      wallDesign
    });
  } catch (error) {
    console.error('Create wall design error:', error);
    res.status(500).json({ error: 'Failed to create wall design' });
  }
});

// Get user's wall designs
app.get('/wall-designs/:userId', async (req, res) => {
  try {
    const wallDesigns = await WallDesign.find({ userId: req.params.userId })
      .sort({ lastModified: -1 });
    res.json(wallDesigns);
  } catch (error) {
    console.error('Get wall designs error:', error);
    res.status(500).json({ error: 'Failed to fetch wall designs' });
  }
});

// Update wall design
app.put('/wall-designs/:id', async (req, res) => {
  try {
    const wallDesign = await WallDesign.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!wallDesign) {
      return res.status(404).json({ error: 'Wall design not found' });
    }
    
    res.json({
      message: 'Wall design updated successfully',
      wallDesign
    });
  } catch (error) {
    console.error('Update wall design error:', error);
    res.status(500).json({ error: 'Failed to update wall design' });
  }
});

// Delete wall design
app.delete('/wall-designs/:id', async (req, res) => {
  try {
    const wallDesign = await WallDesign.findById(req.params.id);
    if (!wallDesign) {
      return res.status(404).json({ error: 'Wall design not found' });
    }

    // Remove the design from user's wallDesigns array
    await User.findByIdAndUpdate(wallDesign.userId, {
      $pull: { wallDesigns: wallDesign._id }
    });

    await WallDesign.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Wall design deleted successfully' });
  } catch (error) {
    console.error('Delete wall design error:', error);
    res.status(500).json({ error: 'Failed to delete wall design' });
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

    // Update password directly
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add these after middleware
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

// Add error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker')
  .then(async () => {
    console.log('Connected to MongoDB');
    await createAdminUser();
  })
  .catch(err => console.log('Error:', err));

// Function to create admin user - SIMPLE VERSION
const createAdminUser = async () => {
  try {
    console.log('🔄 Starting admin user creation...');
    
    const User = require('./models/User');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists in database');
      return;
    }

    console.log('🔧 Creating new admin user...');
    
    // ✅ SIMPLE: Plain text password
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@test.com', 
      password: 'admin123', 
      role: 'admin'
    });

    await adminUser.save();
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123 (plain text)');

  } catch (error) {
    console.log('❌ ADMIN CREATION FAILED:', error.message);
  }
};

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is working!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
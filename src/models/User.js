import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-()]{10,}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  address: {
    street: { 
      type: String, 
      required: [true, 'Street address is required'] 
    },
    city: { 
      type: String, 
      required: [true, 'City is required'] 
    },
    state: { 
      type: String, 
      required: [true, 'State is required'] 
    },
    zipCode: { 
      type: String, 
      required: [true, 'ZIP code is required'] 
    },
    country: { 
      type: String, 
      default: 'US' 
    }
  },
  accountNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  meterNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  customerType: {
    type: String,
    enum: ['residential', 'commercial'],
    default: 'residential'
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    paperlessBilling: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Generate account number and meter number before saving
userSchema.pre('save', function(next) {
  if (this.isNew) {
    if (!this.accountNumber) {
      this.accountNumber = 'ACC' + Date.now().toString().slice(-8);
    }
    if (!this.meterNumber) {
      this.meterNumber = 'MTR' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Get full name virtual
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});


// Transform output
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
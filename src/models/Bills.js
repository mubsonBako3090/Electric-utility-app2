import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  billingPeriod: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  dueDate: {
    type: Date,
    required: true
  },
  energyUsage: {
    type: Number,
    required: true, // in kWh
    min: 0
  },
  rate: {
    type: Number,
    required: true, // $ per kWh
    default: 0.15
  },
  energyCharge: {
    type: Number,
    required: true
  },
  serviceFee: {
    type: Number,
    default: 15.00
  },
  taxes: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountDue: {
    type: Number,
    required: true
  },
  previousBalance: {
    type: Number,
    default: 0
  },
  payments: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', null],
    default: null
  },
  meterReadings: {
    previous: { type: Number, required: true },
    current: { type: Number, required: true }
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
billSchema.pre('save', function(next) {
  if (this.isModified('energyUsage') || this.isModified('rate') || this.isModified('serviceFee') || this.isModified('taxes')) {
    this.energyCharge = parseFloat((this.energyUsage * this.rate).toFixed(2));
    this.totalAmount = parseFloat((this.energyCharge + this.serviceFee + this.taxes).toFixed(2));
    this.amountDue = parseFloat((this.totalAmount + this.previousBalance - this.payments).toFixed(2));
  }
  next();
});

// Static method to get user's bills
billSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ dueDate: -1 });
};

// Static method to get overdue bills
billSchema.statics.findOverdue = function() {
  return this.find({ 
    status: 'pending', 
    dueDate: { $lt: new Date() } 
  });
};

// Instance method to mark as paid
billSchema.methods.markAsPaid = function(paymentMethod) {
  this.status = 'paid';
  this.paidAt = new Date();
  this.paymentMethod = paymentMethod;
  return this.save();
};

// Virtual for days overdue
billSchema.virtual('daysOverdue').get(function() {
  if (this.status !== 'pending' || new Date() <= this.dueDate) {
    return 0;
  }
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((new Date() - this.dueDate) / oneDay);
});

// Virtual for billing period days
billSchema.virtual('billingDays').get(function() {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((this.billingPeriod.end - this.billingPeriod.start) / oneDay)) + 1;
});

// Transform output
billSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Bill || mongoose.model('Bill', billSchema);
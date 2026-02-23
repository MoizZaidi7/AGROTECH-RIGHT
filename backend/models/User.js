import mongoose from "mongoose";

const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'agrotech.com']; // Add your valid domains here

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(email) {
        const domain = email.split('@')[1]; // Extract domain
        return allowedDomains.includes(domain); // Check if domain is in allowed list
      },
      message: (props) => `${props.value} is not a valid email domain!` 
    }
  },
  password: { type: String, required: true, select: false },
  userType: { 
    type: String, 
    enum: ['Admin', 'Farmer', 'Customer', 'Seller'], 
    required: true 
  },
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String, default: null },
  phoneNumber: { type: String, required: false },
  location: { 
    type: String, 
    required: true, 
    default: "Not provided" 
  }, // <-- Added this field
  isActive: { type: Boolean, default: true },
  isLoggedIn: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpire: { type: Date },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
    rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    breakdown: {
      productQuality: { type: Number, default: 0 },
      shippingSpeed: { type: Number, default: 0 },
      communication: { type: Number, default: 0 }
    }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
});

const User = mongoose.model('User', userSchema);

export default User;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
   
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',   
    default: [],
  }],
  phoneNumber: {
    type: String,
    required: true,
  }  
}, { timestamps: true})

const User = mongoose.model('User', userSchema);
module.exports = User;
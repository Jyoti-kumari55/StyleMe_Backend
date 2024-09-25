const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  color: [{
    type: String,
    required: true,
  }],
  price: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  size: [{
    type: String,
    required: true,
  }],
  imageUrl: {
    type: String,
    required: true,
  } 
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
const mongoose = require("mongoose");

const whislistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ]
}, { timestamps: true });

const Whislist = mongoose.model("Whislist", whislistSchema);
module.exports =  Whislist ;
                                  
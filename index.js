require('./db/dbConnect');
const Product  = require('./models/productModel');
const Cart = require('./models/cartModel');
const User = require('./models/userModel');
const Whislist = require('./models/whislistModel');
const Address = require('./models/addressModel');


const express = require("express");
const cors = require("cors");
const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Hello, StyleMe Web!");
});

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.post("/products", async (req, res) => {
//   const { name, age, grade } = req.body;

//   try {
//     const student = new Student({ name, age, grade });
//     await student.save();
//     res.status(201).json(student);
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

//Add New DATA
async function createProduct(newProduct) {
  try{
    const products = new Product(newProduct);
    const saveProduct = await products.save();
    return saveProduct;

  }catch(error){
    throw error
  }
}

app.post('/products', async(request, response) => {
  try{
    const savedProduct =  await createProduct(request.body);
    response.status(201).json({message: "Product added successfully.", event: savedProduct })
  }catch (error) {
    response.status(500).json({error: "Failed to add Product."})
  }
})

app.put("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const updatedProductData = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedProductData,
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res
      .status(200)
      .json({
        message: "Product deleted successfully",
        student: deletedProduct,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// user
// app.post('/users', async(req, res) => {
//   try {
//     const user = new User(req.body);
//     const savedUser = await user.save();
//     res.status(201).json({ message: "User added successfully", user: savedUser });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to add User." });
    
//   }
// });

app.post('/users', async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Create a new user
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json({ message: "User added successfully", user: savedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to add User." });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
})

app.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate({ path: 'cart.products.productId', model: 'Product' });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.put('/users/:id', async (req, res) => {
//   const userId = req.params.id;

//   try {
//     const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found." });
//     }
//     res.status(200).json({ message: "User updated successfully", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update User." });
//   }
// });

app.delete('/users/:userId', async (req, res) => {
  const {userId} = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete User." , error: error});
  }
});

app.put("/users/:userId", async (req, res) => {
  const { userId} = req.params;
  const userUpdates = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userUpdates, { new: true });
    if(updatedUser){
      res.status(200).json({ message: "User updated successfully", user: updatedUser });
    }else {
      res.status(404).json({error: "User not found"});
    }
  }catch (error) {
    res.status(500).json({error: "Failed to update user.", userDetails: error.message});
  }
})

// cart
app.post('/carts/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const newCart = new Cart({ userId, products: [] });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/carts/:userId/products", async (req, res) => {
  const  { userId } = req.params;
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if(!cart) {
      cart = new Cart({ 
        userId, products: [{ productId, quantity }]
      });
    }
    else {
      const prevProduct = cart.products.find((item) => item.productId.toString() === productId);
      if(prevProduct) {
        prevProduct.quantity += quantity;
      }else {
        cart.products.push({ productId, quantity });
      }
    }

    const savedCart = await cart.save();
    res.status(201).json(savedCart);    
  } catch (error) {
    res.status(500).json({ error: "Internal server error", error: error.message });
  }
});

app.get("/carts/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await Cart.findOne({ userId }).populate({ path: 'products.productId', model: 'Product' });
    if(!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put('/carts/:userId/products/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if(!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    const product = cart.products.find((item) => item.productId.toString() === productId);
    if(!product) {
      return res.status(404).json({ error: "Product not found in cart" });
    }
    product.quantity = quantity;
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete('/carts/:userId/products/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  try {
    const cart = await Cart.findOne({ userId });
    if(!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    cart.products = cart.products.filter((item) => item.productId.toString() !== productId);
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/carts/:userId/products/:productId/moveToWishlist", async(req, res) => {
  const  { userId, productId } = req.params;
  // const { productId } = req.body;
   try {
    const cart = await Cart.findOne({ userId });
    if(!userId) {
      return res.status(404).json({ error: "Cart not found.."});
    }

    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);
    if(productIndex === -1){
      return res.status(404).json({ error: "Product not found in cart."})
    }
    const product = cart.products[productIndex];

    let wishlist = await Whislist.findOne({ userId });
    if(!wishlist) {
      wishlist = new Whislist({ userId, products: []});
    }

    const existingProductInWishlist = wishlist.products.find(item => item.productId.toString() === productId);
    if(existingProductInWishlist) {
      wishlist.products
    }else {
      wishlist.products.push({ productId });
    }

    cart.products.splice(productIndex, 1);

    await cart.save();
    await wishlist.save();
    res.status(200).json({ message: "Product moved to the Wishlist.", wishlist, cart});

  }catch (error){
    res.status(500).json({ error: "Internal server error", error: error.message});
    }
  });

// Whislist
app.get("/whishlist/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const whisList = await Whislist.findOne({ userId }).populate({ path: 'products.productId', model: 'Product' });
    if (!whisList) {
      return res.status(404).json({ error: "Wishlist not found" });
    }
    res.status(200).json(whisList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/whishlist/:userId/products", async (req, res) => {
  const { userId}  = req.params;
  const { productId } = req.body;
  try {
    let whisList = await Whislist.findOne({ userId });

    if (!whisList) {
      whisList = new Whislist({ userId, products: [{ productId }] });
    } else {
      const existingProduct = whisList.products.find(item => item.productId.toString() === productId);
      if (!existingProduct) {
        whisList.products.push({ productId });
      }
    }

    const savedWhisList = await whisList.save();
    res.status(201).json({ message: "Product added to wishlist successfully.", whisList: savedWhisList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add product to wishlist." });
  }
});

app.delete("/whishlist/:userId/products/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  console.log(`Removing product ${productId} from user ${userId}`)
  try {
    const whisList = await Whislist.findOne({ userId });

    if (!whisList) {
      return res.status(404).json({ error: "Wishlist not found" });
    }
    whisList.products = whisList.products.filter(item => item.productId.toString() !== productId);
    const deletedItem = await whisList.save();
    //console.log("Updated wishlist after removal:", whisList);
    res.status(200).json({ message: "Product removed from wishlist successfully.", deletedItem });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/whishlist/:userId/products/:productId/addToCart", async(req, res) => {

  const  { userId, productId } = req.params;
  try {
    const whishList = await Whislist.findOne({ userId });
    if(!whishList){
      return res.status(404).json({ error: "Wishlist not found..."});

    }

    const productIndex = whishList.products.findIndex(
      (item) => item.productId.toString() === productId);
    if(productIndex === -1){
      return res.status(404).json({ error: "Product not found in the wishlist." });
    }
    // const product = whishList.products[productIndex];

    let cart = await Cart.findOne({ userId });
    if(!cart){
      cart = new Cart({ userId, products:[]});
    }

    const existingProductInCart = cart.products.find(item => item.productId.toString() === productId);
    if(existingProductInCart){
       existingProductInCart.quantity += 1 ;
    }else {
      cart.products.push({ productId, quantity: 1 });
    }

    const savedCart = await cart.save();
    whishList.products = whishList.products.filter((item) => item.productId.toString() !== productId);
    await whishList.save();

    res.status(201).json({ message: "Product added to cart successfully.", cart: savedCart });
  }catch(error){
    res.status(500).json({ error: "Internal server error", error: error.message});

  }
})

// Address
app.post("/users/:userId/address", async (req, res) => {
  const { userId } = req.params;
  const { pinCode, fullAddress, locality, city, state, country } = req.body;
  try {
    const address = new Address({ userId, pinCode, fullAddress, locality, city, state, country });

    const savedAddress = await address.save();
    await User.findByIdAndUpdate(userId, { $push: { addresses: savedAddress._id } });
    res.status(201).json({ message: "Address added successfully.", address: savedAddress });
    
  }catch(error) {
    res.status(500).json({ error: "Failed to add address.", error: error.message });
  }    
});

app.get("/users/:userId/address", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('addresses')
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.addresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", eror: error.message });
  }  
});

app.put("/address/:addressId", async (req, res) => {
  const { addressId } = req.params;
  const { pinCode, fullAddress, locality, city, state, country } = req.body;
  try {
    const updatedAddress = await Address.findByIdAndUpdate(addressId, { pinCode, fullAddress, locality, city, state, country }, { new: true });
    if (!updatedAddress) {
      return res.status(404).json({ error: "Address not found" });
    }
    res.status(200).json(updatedAddress);
  }catch (error) {
    res.status(500).json({ error: "Failed to update address.", error: error.message });
  }
});

app.delete("/address/:addressId", async (req, res) => {
  const { addressId } = req.params;
  try {
    const deletedAddress = await Address.findByIdAndDelete(addressId);
    if (!deletedAddress) {
      return res.status(404).json({ error: "Address not found" });
    }
    await User.findByIdAndUpdate( deletedAddress.userId, { $pull: { address: deletedAddress }});
      
    res.status(200).json({ message: "Address deleted successfully", address: deletedAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", error: error.message });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}.`)
});
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Bid from '../models/Bid.js';
import Campaign from '../models/Campaign.js';
import { stripe } from '../config/stripe.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';

// FE-1: Product Management
// controllers/MarketPlaceController.js
const createProduct = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const farmer = await User.findById(farmerId); // Get farmer details
    
    const { name, description, price, category, grade, farmingPractices, stock } = req.body;
    
    const product = await Product.create({
      farmerId,
      vendorName: `${farmer.firstName} ${farmer.lastName}`,
      vendorLocation: farmer.location,
      vendorRating: farmer.rating || 0,
      name,
      description,
      price,
      category,
      grade,
      farmingPractices,
      stock,
      images: req.files?.map(file => file.path) || []
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to list product", details: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      grade, 
      minPrice, 
      maxPrice,
      vendorId,      // New: filter by specific vendor
      vendorName,    // New: filter by vendor name
      location,      // New: filter by vendor location
      minRating,     // New: minimum vendor rating
      sortBy         // Enhanced sorting options
    } = req.query;
    
    const filter = {};
    
    // Product filters
    if (category) filter.category = category;
    if (grade) filter.grade = grade;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Vendor filters
    if (vendorId) filter.farmerId = vendorId;
    if (vendorName) filter.vendorName = new RegExp(vendorName, 'i');
    if (location) filter.vendorLocation = new RegExp(location, 'i');
    if (minRating) filter.vendorRating = { $gte: Number(minRating) };
    
    let query = Product.find(filter);
    
    // Enhanced sorting
    if (sortBy === 'vendor_rating') query = query.sort({ vendorRating: -1 });
    else if (sortBy === 'distance') {
      // Would require geospatial index and user location
      // For now, sort by location text similarity
      if (location) query = query.sort({ vendorLocation: 1 });
    }
    else if (sortBy === 'price_asc') query = query.sort({ price: 1 });
    else if (sortBy === 'price_desc') query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 }); // Default
    
    const products = await query;
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

const getFarmerProducts = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const products = await Product.find({ farmerId })
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch farmer products" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    const updates = req.body;
    
    // Check if product belongs to farmer
    const product = await Product.findOne({ _id: id, farmerId });
    if (!product) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    // Handle image updates
    const newImages = req.files?.map(file => file.path) || [];
    const images = [...product.images, ...newImages];

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updates, images },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const product = await Product.findOneAndDelete({ _id: id, farmerId });
    if (!product) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    await Order.deleteMany({ productId: id });
    await Bid.deleteMany({ productId: id });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error('Backend delete error:', error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};


// FE-5: Order Management
const createOrder = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const order = await Order.create({
      productId,
      farmerId,
      quantity,
      totalPrice: product.price * quantity,
      status: 'pending'
    });

    // Update stock
    product.stock -= quantity;
    await product.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Order failed", details: error.message });
  }
};

const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id;
    
    // Find orders for products belonging to this farmer
    const orders = await Order.find()
      .populate({
        path: 'productId',
        match: { farmerId },
        select: 'name price images category' // Include all needed product fields
      })
      .populate('farmerId', 'firstName email')
      .populate('customerId', 'firstName lastName email') // Add this line to populate buyer info
      .sort({ createdAt: -1 });

    // Filter out null products (orders for other farmers)
    const farmerOrders = orders.filter(order => order.productId);

    res.json(farmerOrders);
  } catch (error) {
    console.error("Error in getFarmerOrders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('productId');

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// FE-6: Bidding System
const placeBid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, amount } = req.body;
    
    const product = await Product.findById(productId);
    if (!product.isBidding) {
      return res.status(400).json({ error: "Product not available for bidding" });
    }

    if (amount <= product.price) {
      return res.status(400).json({ error: "Bid must be higher than current price" });
    }

    const bid = await Bid.create({
      productId,
      userId,
      amount,
      isWinning: true
    });

    // Mark other bids as non-winning
    await Bid.updateMany(
      { productId, _id: { $ne: bid._id } },
      { isWinning: false }
    );

    // Update product price
    product.price = amount;
    await product.save();

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ error: "Bid placement failed" });
  }
};

// FE-8: Payment Integration
const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('productId');
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Convert PKR to USD (if needed) - adjust rate as necessary
    const exchangeRate = 280; // Example: 1 USD = 280 PKR
    const amountUSD = Math.round((order.totalPrice / exchangeRate) * 100); // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountUSD,
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        productName: order.productId.name,
        originalAmountPKR: order.totalPrice // Store original amount for reference
      },
      description: `AgroTech Purchase: ${order.productId.name}`
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      displayAmount: order.totalPrice, // Send original PKR amount for display
      currency: 'PKR' // Indicate display currency
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Payment initialization failed",
      details: error.message 
    });
  }
};

const processPaymentConfirmation = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    // Validate input
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields" 
      });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Check if payment belongs to this order
    if (paymentIntent.metadata.orderId !== orderId) {
      return res.status(400).json({
        success: false,
        error: "Payment intent does not match this order"
      });
    }

    // Handle successful payment
    if (paymentIntent.status === 'succeeded') {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { 
          status: 'paid', 
          paymentIntentId,
          paidAt: new Date(),
          paymentAmount: paymentIntent.amount / 100, // Store in USD
          originalAmountPKR: paymentIntent.metadata.originalAmountPKR // Store original PKR amount
        },
        { new: true }
      ).populate('productId');
      
      return res.json({ 
        success: true,
        order: updatedOrder
      });
    }

    // Handle other statuses
    return res.status(400).json({ 
      success: false,
      error: `Payment not completed. Current status: ${paymentIntent.status}`,
      paymentIntent
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false,
      error: "Payment confirmation failed",
      details: error.message
    });
  }
};



// FE-7: Inventory Management
const updateInventory = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { productId, stock } = req.body;
    
    const product = await Product.findOneAndUpdate(
      { _id: productId, farmerId },
      { stock },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Inventory update failed" });
  }
};

// FE-3: Marketing Campaigns
const createCampaign = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { name, targetProductId, budget } = req.body;
    
    // Verify product belongs to farmer
    const product = await Product.findOne({ _id: targetProductId, farmerId });
    if (!product) {
      return res.status(404).json({ error: "Product not found or not authorized" });
    }

    const campaign = await Campaign.create({
      name,
      targetProduct: targetProductId,
      budget,
      farmerId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days later
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Campaign creation failed" });
  }
};

// FE-5: Order Management - Get Buyer's Orders
const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    
    const orders = await Order.find({ customerId })
      .populate('productId', 'name price images unit farmerId')
      .populate('customerId', 'firstName lastName email')
      .populate({
        path: 'productId',
        populate: {
          path: 'farmerId',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: "Failed to fetch buyer orders", details: error.message });
  }
};

const getAllCustomerOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate('productId', 'firstName price images farmerId')
      .populate({
        path: 'productId',
        populate: {
          path: 'farmerId',
          select: 'firstName'
        }
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all customer orders', details: error.message });
  }
};

// FE-6: Bidding System - Get Buyer's Bids
const getCustomerBids = async (req, res) => {
  try {
    const userId = req.user.id;

    const bids = await Bid.find({ userId })
      .populate({
        path: 'productId',
        select: 'name price images unit category farmerId',
        populate: {
          path: 'farmerId',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .sort({ createdAt: -1 });

    console.log('Found bids:', bids.length);
    res.json({ bids });
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ error: "Failed to fetch bids", details: error.message });
  }
};


// FE-8: Payment Integration - Confirm Payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    // Validate input
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields" 
      });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Check if payment belongs to this order
    if (paymentIntent.metadata.orderId !== orderId) {
      return res.status(400).json({
        success: false,
        error: "Payment intent does not match this order"
      });
    }

    // Handle successful payment
    if (paymentIntent.status === 'succeeded') {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { 
          status: 'paid', 
          paymentIntentId,
          paidAt: new Date(),
          paymentAmount: paymentIntent.amount / 100, // Store in USD
          originalAmountPKR: paymentIntent.metadata.originalAmountPKR // Store original PKR amount
        },
        { new: true }
      ).populate('productId');
      
      return res.json({ 
        success: true,
        order: updatedOrder
      });
    }

    // Handle other statuses
    return res.status(400).json({ 
      success: false,
      error: `Payment not completed. Current status: ${paymentIntent.status}`,
      paymentIntent
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false,
      error: "Payment confirmation failed",
      details: error.message
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid product or quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if product is already in cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      
      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart", details: error.message });
  }
};


// ✅ Get bids for a specific product
const getProductBids = async (req, res) => {
  try {
    const { id } = req.params;
    const bids = await Bid.find({ productId: id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bids for product", details: error.message });
  }
};

// ✅ Accept a bid
const acceptBid = async (req, res) => {
  try {
    const { id } = req.params;

    const acceptedBid = await Bid.findById(id).populate('productId');
    if (!acceptedBid) return res.status(404).json({ error: "Bid not found" });

    // Update this bid to accepted
    acceptedBid.status = 'accepted';
    acceptedBid.isWinning = true;
    await acceptedBid.save();

    // Mark other bids as rejected
    await Bid.updateMany(
      { productId: acceptedBid.productId._id, _id: { $ne: id } },
      { status: 'rejected', isWinning: false }
    );

    // Update product price to accepted bid amount
    const product = await Product.findByIdAndUpdate(
      acceptedBid.productId._id,
      { price: acceptedBid.amount },
      { new: true }
    );

    res.json({ message: "Bid accepted", bid: acceptedBid, updatedProduct: product });
  } catch (error) {
    res.status(500).json({ error: "Failed to accept bid", details: error.message });
  }
};

// ✅ Reject a bid
const rejectBid = async (req, res) => {
  try {
    const { id } = req.params;

    const bid = await Bid.findById(id);
    if (!bid) return res.status(404).json({ error: "Bid not found" });

    bid.status = 'rejected';
    bid.isWinning = false;
    await bid.save();

    res.json({ message: "Bid rejected", bid });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject bid", details: error.message });
  }
};
//delete bid
const deleteBidById = async (req, res) => {
  try {
    const { bidId } = req.params;

    // Optional: validate ObjectId format
    if (!bidId || !bidId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid bid ID' });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    await Bid.findByIdAndDelete(bidId);

    res.json({ success: true, message: 'Bid deleted successfully' });
  } catch (error) {
    console.error('Delete bid error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete bid', error: error.message });
  }
};
// ✅ Checkout cart
const checkoutCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingDetails, paymentMethod } = req.body; // Add items to destructuring

    // Validate payload
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in cart" });
    }

    let totalPrice = 0;
    const orders = [];

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const order = await Order.create({
        customerId: userId,
        productId: product._id,
        farmerId: product.farmerId, // Include farmerId
        quantity: item.quantity,
        totalPrice: product.price * item.quantity,
        shippingDetails,
        status: paymentMethod === 'stripe' ? 'pending' : 'confirmed', // Use consistent status
        paymentMethod,
        paymentStatus: paymentMethod === 'stripe' ? 'pending' : 'paid'
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();

      totalPrice += order.totalPrice;
      orders.push(order);
    }

    res.status(201).json({
      success: true,
      orders,
      totalPrice,
      paymentMethod
    });

  } catch (error) {
    res.status(500).json({ 
      error: "Cart checkout failed", 
      details: error.message 
    });
  }
};

// ✅ Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart item ID
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.id(id);
    if (!item) return res.status(404).json({ error: "Cart item not found" });

    item.quantity = quantity;
    await cart.save();

    res.json({ message: "Cart item updated", cart });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart item", details: error.message });
  }
};

// ✅ Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart item ID

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(item => item._id.toString() !== id);
    await cart.save();

    res.json({ message: "Cart item removed", cart });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove cart item", details: error.message });
  }
};
const fetchCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.status(200).json({ items: [] }); // Empty cart
    }

    res.status(200).json({ items: cart.items });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Failed to fetch cart items' });
  }
};
const AdminUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Admin update product error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};
const AdminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Order.deleteMany({ productId: id });
    await Bid.deleteMany({ productId: id });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Admin delete product error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// Get products by specific vendor
const getVendorProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, minPrice, maxPrice, sortBy } = req.query;
    
    const filter = { farmerId: id };
    
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    let query = Product.find(filter);
    
    // Sorting options
    if (sortBy === 'price_asc') query = query.sort({ price: 1 });
    else if (sortBy === 'price_desc') query = query.sort({ price: -1 });
    else if (sortBy === 'rating') query = query.sort({ vendorRating: -1 });
    else query = query.sort({ createdAt: -1 });
    
    const products = await query;
    
    if (products.length === 0) {
      return res.status(404).json({ 
        error: "No products found for this vendor",
        suggestion: "Try adjusting your filters"
      });
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vendor products" });
  }
};

// Search vendors by name/location
const searchVendors = async (req, res) => {
  try {
    const { q, location, minRating } = req.query;
    
    const userFilter = {};
    if (q) userFilter.$or = [
      { firstName: new RegExp(q, 'i') },
      { lastName: new RegExp(q, 'i') },
      { farmName: new RegExp(q, 'i') }
    ];
    if (location) userFilter.location = new RegExp(location, 'i');
    if (minRating) userFilter.rating = { $gte: Number(minRating) };
    
    const vendors = await User.find(userFilter)
      .where('role').equals('Farmer')
      .select('firstName lastName location rating farmName')
      .limit(20);
    
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: "Vendor search failed" });
  }
};

// Get vendor details
const getVendorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await User.findById(id)
      .where('role').equals('Farmer')
      .select('firstName lastName location rating farmName joinDate description certifications');
    
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    
    // Get vendor stats
    const [productCount, averageProductRating] = await Promise.all([
      Product.countDocuments({ farmerId: id }),
      Product.aggregate([
        { $match: { farmerId: mongoose.Types.ObjectId(id) } },
        { $group: { _id: null, avgRating: { $avg: "$vendorRating" } } }
      ])
    ]);
    
    res.json({
      vendor,
      stats: {
        productCount,
        averageProductRating: averageProductRating[0]?.avgRating || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vendor details" });
  }
};
const submitReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const { rating, comment, breakdown, images } = req.body;

    // Validate input
    if (!rating || !breakdown) {
      return res.status(400).json({ error: "Rating and breakdown are required" });
    }

    // Get order details
    const order = await Order.findById(orderId)
      .populate('productId')
      .populate('farmerId');
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user is the buyer
    if (order.customerId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to review this order" });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ error: "Review already submitted for this order" });
    }

    // Create review
    const review = await Review.create({
      orderId,
      productId: order.productId._id,
      farmerId: order.farmerId._id,
      customerId: userId,
      rating,
      breakdown,
      comment,
      images
    });

    // Update farmer's rating
    await updateFarmerRating(order.farmerId._id);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit review", details: error.message });
  }
};

const getFarmerReviews = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ farmerId })
      .populate('customerId', 'firstName lastName avatar')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments({ farmerId });

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Helper function to update farmer's overall rating
const updateFarmerRating = async (farmerId) => {
  const stats = await Review.aggregate([
    { $match: { farmerId: mongoose.Types.ObjectId(farmerId) } },
    { 
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        productQuality: { $avg: "$breakdown.productQuality" },
        shippingSpeed: { $avg: "$breakdown.shippingSpeed" },
        communication: { $avg: "$breakdown.communication" },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(farmerId, {
      rating: {
        average: stats[0].averageRating,
        count: stats[0].count,
        breakdown: {
          productQuality: stats[0].productQuality,
          shippingSpeed: stats[0].shippingSpeed,
          communication: stats[0].communication
        }
      }
    });
  }
};
// ✅ Export All Controllers
export {
  createProduct,
  getProducts,
  getFarmerProducts,
  updateProduct,
  deleteProduct,
  createOrder,
  getCustomerOrders,
  getFarmerOrders,
  updateOrderStatus,
  placeBid,
  getCustomerBids,
  initiatePayment,
  confirmPayment,
  updateInventory,
  createCampaign,
  addToCart,
  getProductBids,
  acceptBid,
  rejectBid,
  checkoutCart,
  updateCartItem,
  removeFromCart,
  fetchCartItems,
  AdminDeleteProduct,
  AdminUpdateProduct,
  getAllCustomerOrders,
  deleteBidById,
  processPaymentConfirmation,
  getVendorDetails,
  searchVendors,
  getVendorProducts,
  updateFarmerRating,
  getFarmerReviews,
  submitReview
};
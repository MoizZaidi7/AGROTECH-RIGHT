import Report from "../models/Reports.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Helper function to calculate time range
const getDateRange = (range) => {
  const now = new Date();
  switch (range) {
    case '7days':
      return new Date(now.setDate(now.getDate() - 7));
    case '30days':
      return new Date(now.setDate(now.getDate() - 30));
    case '90days':
      return new Date(now.setDate(now.getDate() - 90));
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setDate(now.getDate() - 7));
  }
};

// Enhanced User Engagement Report
const getUserEngagementReport = async (req, res) => {
  try {
    const { range = '7days' } = req.query;
    const startDate = getDateRange(range);
    
    // Total users
    const totalUsers = await User.countDocuments();
    
    // Active users (logged in within the selected time range OR currently logged in)
    let activeUsers = await User.countDocuments({ 
      lastActivity: { $gte: startDate } 
    });
    
    // If no users have lastActivity in range, use currently logged in users as active
    if (activeUsers === 0) {
      activeUsers = await User.countDocuments({ isLoggedIn: true });
    }
    
    // Currently logged in users
    const loggedInUsers = await User.countDocuments({ isLoggedIn: true });
    
    // New users in selected time range
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: startDate } 
    });
    
    // User segments
    const userSegments = {
      'Active': activeUsers,
      'New': newUsers,
      'Returning': Math.max(0, activeUsers - newUsers),
      'Inactive': Math.max(0, totalUsers - activeUsers)
    };
    
    // Engagement rate (active users / total users)
    const engagementRate = totalUsers > 0 ? 
      Math.round((activeUsers / totalUsers) * 100) : 0;
    
    // Retention rate (users who logged in more than once)
    // Use a safer approach - check for users with lastActivity who also have previous logins
    const retainedUsers = await User.countDocuments({
      lastActivity: { $gte: startDate },
      createdAt: { $lt: startDate }
    });
    const retentionRate = totalUsers > 0 ?
      Math.round((retainedUsers / totalUsers) * 100) : 0;
    
    // User growth rate (growth within selected period)
    const previousPeriodStart = new Date(startDate);
    const periodDuration = Date.now() - startDate.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);
    
    const previousPeriodNewUsers = await User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    });
    
    const userGrowthRate = previousPeriodNewUsers > 0 ?
      Math.round(((newUsers - previousPeriodNewUsers) / previousPeriodNewUsers) * 100) : 
      (newUsers > 0 ? 100 : 0);
    
    // Activity trend (last 7 days)
    const activityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(Date.now() - (i - 1) * 24 * 60 * 60 * 1000);
      
      const dayActiveUsers = await User.countDocuments({
        lastActivity: { $gte: dayStart, $lt: dayEnd }
      });
      activityTrend.push(dayActiveUsers);
    }
    
    res.status(200).json({
      totalUsers,
      activeUsers,
      loggedInUsers,
      newUsers,
      engagementRate,
      retentionRate,
      userGrowthRate,
      activityTrend,
      userSegments
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error generating engagement report", 
      error: error.message 
    });
  }
};

// Enhanced Web Analytics Report
const getWebAnalyticsReport = async (req, res) => {
  try {
    const { range = '7days' } = req.query;
    const startDate = getDateRange(range);
    
    // Get analytics data from middleware
    const rawAnalytics = req.app.get('webAnalyticsData') || {
      totalVisits: 0,
      maxVisitedPage: "/",
      averageSessionDuration: "0m 0s",
      visitTrends: [],
      pageVisits: {},
      uniqueVisitors: new Set(),
      bounceRate: 0,
      conversionRate: 0,
      deviceBreakdown: {},
      trafficSources: {}
    };
    
    // Calculate conversion rate (orders / visits)
    const totalOrders = await Order.countDocuments({ 
      status: { $in: ['delivered', 'shipped', 'processing'] },
      createdAt: { $gte: startDate } 
    });
    const conversionRate = rawAnalytics.totalVisits > 0 ?
      Math.round((totalOrders / rawAnalytics.totalVisits) * 100) : 0;
    
    // Calculate bounce rate (mock implementation - in production, track single-page sessions)
    const bounceRate = rawAnalytics.totalVisits > 0 ? 
      Math.min(Math.round((Math.random() * 30) + 20), 100) : 0; // Mock: 20-50%
    
    // Device breakdown (mock data - in production, parse user-agent)
    const deviceBreakdown = rawAnalytics.totalVisits > 0 ? {
      Desktop: Math.round(rawAnalytics.totalVisits * 0.6),
      Mobile: Math.round(rawAnalytics.totalVisits * 0.3),
      Tablet: Math.round(rawAnalytics.totalVisits * 0.1)
    } : {};
    
    // Traffic sources (mock data - in production, track referrers)
    const trafficSources = rawAnalytics.totalVisits > 0 ? {
      Direct: Math.round(rawAnalytics.totalVisits * 0.5),
      Search: Math.round(rawAnalytics.totalVisits * 0.3),
      Social: Math.round(rawAnalytics.totalVisits * 0.15),
      Referral: Math.round(rawAnalytics.totalVisits * 0.05)
    } : {};
    
    // Build response with proper serialization (convert Set to count)
    const analytics = {
      totalVisits: rawAnalytics.totalVisits,
      uniqueVisitors: rawAnalytics.uniqueVisitors.size,
      maxVisitedPage: rawAnalytics.maxVisitedPage,
      averageSessionDuration: rawAnalytics.averageSessionDuration,
      visitTrends: rawAnalytics.visitTrends,
      pageVisits: rawAnalytics.pageVisits,
      bounceRate,
      conversionRate,
      deviceBreakdown,
      trafficSources
    };
    
    // Emit real-time updates
    const io = req.app.get('socketio');
    if (io) {
      io.emit('webAnalyticsUpdate', analytics);
    }
    
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ 
      message: "Error generating web analytics", 
      error: error.message 
    });
  }
};

// Enhanced Sales Report
// Enhanced Sales Report Controller
const getSalesReport = async (req, res) => {
  try {
    const { range = '7days' } = req.query;
    const startDate = getDateRange(range);
    
    console.log('Sales Report - Fetching orders with status: delivered, from:', startDate);
    
    // Check what orders exist
    const allOrders = await Order.find().select('status createdAt totalPrice').lean();
    console.log('Total orders in DB:', allOrders.length);
    console.log('Order statuses:', [...new Set(allOrders.map(o => o.status))]);
    
    // Count successful orders (delivered, shipped, or processing are considered revenue-generating)
    const successStatuses = ['delivered', 'shipped', 'processing'];
    
    // Main sales aggregation with better defaults
    const result = await Order.aggregate([
      { 
        $match: { 
          status: { $in: successStatuses },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalPrice" },
          minOrderValue: { $min: "$totalPrice" },
          maxOrderValue: { $max: "$totalPrice" }
        }
      }
    ]);

    // Get recent orders with proper population
    const recentOrders = await Order.find({ 
      status: { $in: successStatuses },
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('productId', 'name price images')
      .populate('customerId', 'firstName lastName email')
      .lean();

    // Enhanced product performance aggregation
    // Order schema has single productId, not products array
    const productPerformance = await Order.aggregate([
      { 
        $match: { 
          status: { $in: successStatuses },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$productId",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$product.name', 'Unknown Product'] },
          sales: '$totalQuantity',
          revenue: '$totalRevenue',
          orders: '$orderCount'
        }
      }
    ]);

    // Payment method breakdown with better formatting
    const paymentMethods = await Order.aggregate([
      { 
        $match: { 
          status: { $in: successStatuses },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$totalPrice" }
        }
      }
    ]);

    // Format payment methods for frontend with proper capitalization
    const formattedPaymentMethods = paymentMethods.reduce((acc, method) => {
      const methodName = method._id === 'cod' ? 'Cash on Delivery' : 
                        method._id === 'stripe' ? 'Stripe' : 
                        method._id || 'Unknown';
      acc[methodName] = method.count;
      return acc;
    }, {});

    // Enhanced revenue trend calculation
    const revenueTrend = [];
    const trendLabels = [];
    const days = range === 'year' ? 12 : range === '90days' ? 12 : range === '30days' ? 15 : 7;
    
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(Date.now() - (i - 1) * 24 * 60 * 60 * 1000);
      
      const dayData = await Order.aggregate([
        { 
          $match: { 
            status: { $in: successStatuses },
            createdAt: { $gte: dayStart, $lt: dayEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
            count: { $sum: 1 }
          }
        }
      ]);
      
      revenueTrend.push(dayData[0]?.total || 0);
      trendLabels.push(dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Final response with all data and proper defaults
    const responseData = {
      totalRevenue: result[0]?.totalRevenue || 0,
      totalOrders: result[0]?.totalOrders || 0,
      averageOrderValue: result[0]?.averageOrderValue || 0,
      minOrderValue: result[0]?.minOrderValue || 0,
      maxOrderValue: result[0]?.maxOrderValue || 0,
      recentOrders: recentOrders || [],
      productPerformance: productPerformance || [],
      paymentMethods: formattedPaymentMethods || {},
      revenueTrend: revenueTrend || [],
      trendLabels: trendLabels || []
    };

    console.log('Sales Report Response:', {
      totalRevenue: responseData.totalRevenue,
      totalOrders: responseData.totalOrders,
      recentOrdersCount: responseData.recentOrders.length,
      productPerformanceCount: responseData.productPerformance.length,
      paymentMethods: Object.keys(responseData.paymentMethods)
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ 
      error: "Failed to generate sales report",
      details: error.message 
    });
  }
};

// Track page view from frontend
const trackPageView = async (req, res) => {
  try {
    const { page, referrer } = req.body;
    
    if (!page) {
      return res.status(400).json({ message: 'Page path is required' });
    }
    
    const webAnalyticsData = req.app.get('webAnalyticsData');
    
    if (!webAnalyticsData) {
      return res.status(500).json({ message: 'Analytics not initialized' });
    }
    
    // Track page visit
    webAnalyticsData.pageVisits[page] = (webAnalyticsData.pageVisits[page] || 0) + 1;
    
    // Update max visited page
    let maxVisits = 0;
    let maxPage = '/';
    for (const [pagePath, visits] of Object.entries(webAnalyticsData.pageVisits)) {
      if (visits > maxVisits) {
        maxVisits = visits;
        maxPage = pagePath;
      }
    }
    webAnalyticsData.maxVisitedPage = maxPage;
    
    // Update visit trends
    const today = new Date().toISOString().split('T')[0];
    const existingDay = webAnalyticsData.visitTrends.find(day => day.date === today);
    
    if (existingDay) {
      existingDay.visits++;
    } else {
      webAnalyticsData.visitTrends.push({ date: today, visits: 1 });
      if (webAnalyticsData.visitTrends.length > 7) {
        webAnalyticsData.visitTrends.shift();
      }
    }
    
    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.emit('webAnalyticsUpdate', {
        totalVisits: webAnalyticsData.totalVisits,
        uniqueVisitors: webAnalyticsData.uniqueVisitors.size,
        maxVisitedPage: webAnalyticsData.maxVisitedPage,
        visitTrends: webAnalyticsData.visitTrends,
        pageVisits: webAnalyticsData.pageVisits
      });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ message: 'Error tracking page view' });
  }
};

export {
  getUserEngagementReport,
  getWebAnalyticsReport,
  getSalesReport,
  trackPageView
};
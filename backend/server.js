import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import userRouter from "./routes/UserRoutes.js";
import adminRouter from "./routes/AdminRoutes.js";
import reportRouter from "./routes/ReportRoutes.js";
import connectDB from "./config/db.js";
import { Server } from 'socket.io';
import http from "http";
import { v4 as uuidv4 } from 'uuid';
import cookieParser from "cookie-parser";
import MarketRouter from "./routes/MarketRoutes.js";
import FarmerRouter from "./routes/FarmerRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app and server
const app = express();
const server = http.createServer(app);

// Middleware setup - ORDER MATTERS!
app.use(cookieParser()); // Parse cookies
app.use(express.json()); // Parse JSON bodies
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true // Enable cross-origin cookies
}));
app.use(helmet()); // Add security headers

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Attach socket.io instance to app
app.set('socketio', io);

// Connect to MongoDB
connectDB();

// Web Analytics Data - Initialize with empty data
const webAnalyticsData = {
  totalVisits: 0,
  maxVisitedPage: '/',
  visitTrends: [],
  pageVisits: {},
  uniqueVisitors: new Set(),
  averageSessionDuration: "0m 0s"
};

// Attach analytics data to app for access in routes
app.set('webAnalyticsData', webAnalyticsData);

// Analytics middleware - tracks visits and page views
app.use((req, res, next) => {
  try {
    // Skip tracking for API routes and static assets
    const currentPage = req.path;
    const isApiRoute = currentPage.startsWith('/api/');
    const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(currentPage);
    
    if (isApiRoute || isStaticAsset) {
      return next();
    }

    // Get or set visitor ID
    let visitorId = req.cookies.visitorId;
    if (!visitorId) {
      visitorId = uuidv4();
      res.cookie('visitorId', visitorId, { 
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    // Track unique visitors
    if (!webAnalyticsData.uniqueVisitors.has(visitorId)) {
      webAnalyticsData.totalVisits++;
      webAnalyticsData.uniqueVisitors.add(visitorId);
    }

    // Track page visits (only for non-API routes)
    webAnalyticsData.pageVisits[currentPage] = (webAnalyticsData.pageVisits[currentPage] || 0) + 1;

    // Update max visited page
    let maxVisits = 0;
    let maxPage = '/';
    for (const [page, visits] of Object.entries(webAnalyticsData.pageVisits)) {
      if (visits > maxVisits) {
        maxVisits = visits;
        maxPage = page;
      }
    }
    webAnalyticsData.maxVisitedPage = maxPage;

    // Update visit trends (last 7 days)
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

    // Calculate average session duration (simplified example)
    const avgMinutes = Math.floor(Math.random() * 5) + 1;
    const avgSeconds = Math.floor(Math.random() * 60);
    webAnalyticsData.averageSessionDuration = `${avgMinutes}m ${avgSeconds}s`;

    // Emit updates to all connected clients (convert Set to size for proper serialization)
    io.emit('webAnalyticsUpdate', {
      totalVisits: webAnalyticsData.totalVisits,
      uniqueVisitors: webAnalyticsData.uniqueVisitors.size,
      maxVisitedPage: webAnalyticsData.maxVisitedPage,
      averageSessionDuration: webAnalyticsData.averageSessionDuration,
      visitTrends: webAnalyticsData.visitTrends,
      pageVisits: webAnalyticsData.pageVisits
    });
    
    next();
  } catch (err) {
    console.error('Analytics middleware error:', err);
    next(err);
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send initial data on connection
  socket.emit('webAnalyticsUpdate', webAnalyticsData);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/farmer', FarmerRouter);
app.use('/api/reports', reportRouter);
app.use('/api/marketplace', MarketRouter);

// Default Route
app.get('/', (req, res) => {
  res.send("Welcome to AgroTech Application Farmers!!!");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

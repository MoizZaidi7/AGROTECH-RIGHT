import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaChartLine, 
  FaShoppingCart, 
  FaInfoCircle, 
  FaClock, 
  FaSearch,
  FaUserCheck,
  FaUserPlus,
  FaMoneyBillWave,
  FaBoxOpen,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft
} from 'react-icons/fa';
import { FiActivity } from 'react-icons/fi';

Chart.register(...registerables);

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

const ReportsPage = () => {
  const navigate = useNavigate();
  const [selectedReportType, setSelectedReportType] = useState('User Engagement');
  const [timeRange, setTimeRange] = useState('7days');
  const [userEngagement, setUserEngagement] = useState(null);
  const [webAnalytics, setWebAnalytics] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [webAnalyticsData, setWebAnalyticsData] = useState({
    totalVisits: 0,
    maxVisitedPage: '',
    averageSessionDuration: '',
    visitTrends: [],
    bounceRate: 0,
    conversionRate: 0,
    deviceBreakdown: {},
    userSegments: {},
    trafficSources: {},
    paymentMethods: {}
  });

  // Socket.io - Real-time web analytics updates
  useEffect(() => {
    socket.on('webAnalyticsUpdate', (data) => {
      setWebAnalyticsData(data);
    });

    return () => socket.off('webAnalyticsUpdate');
  }, []);

  // Fetch data when report type or time range changes
  useEffect(() => {
    fetchReport(selectedReportType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReportType, timeRange]);

  const fetchReport = async (type) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let response;

      switch (type) {
        case 'User Engagement':
          response = await axiosInstance.get(`/reports/user-engagement?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('User Engagement Report:', response.data);
          setUserEngagement(response.data);
          break;

        case 'Web Analytics':
          response = await axiosInstance.get(`/reports/web-analytics?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Web Analytics Report:', response.data);
          setWebAnalytics(response.data);
          break;

        case 'Sales and Revenue':
          response = await axiosInstance.get(`/reports/sales-report?range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Sales Report:', response.data);
          setSalesReport(response.data);
          break;

        default:
          console.warn('Invalid report type selected');
      }
    } catch (error) {
      console.error(`Error fetching ${type} report:`, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTrendIndicator = (value, threshold = 0) => {
    if (value > threshold) {
      return <FaArrowUp className="text-green-500 ml-1" />;
    } else if (value < threshold) {
      return <FaArrowDown className="text-red-500 ml-1" />;
    }
    return null;
  };

  const renderCharts = () => {
    switch (selectedReportType) {
      case 'User Engagement': {
        if (!userEngagement) return <p className="text-center py-8">No user engagement data available.</p>;

        const { 
          totalUsers = 0, 
          activeUsers = 0, 
          loggedInUsers = 0, 
          newUsers = 0,
          engagementRate = 0,
          retentionRate = 0,
          userGrowthRate = 0,
          activityTrend = [],
          userSegments = {}
        } = userEngagement;

        return (
          <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-blue-500 flex justify-center mb-2">
                  <FaUsers className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Total Users</h4>
                <p className="text-2xl font-bold text-gray-800">{totalUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {userGrowthRate > 0 ? `↑ ${userGrowthRate}%` : `↓ ${Math.abs(userGrowthRate)}%`} from last period
                </p>
              </motion.div>
              
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-green-500 flex justify-center mb-2">
                  <FaUserCheck className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Active Users</h4>
                <p className="text-2xl font-bold text-gray-800">{activeUsers.toLocaleString()}</p>
                <div className="flex justify-center items-center text-xs text-gray-500 mt-1">
                  {engagementRate}% engagement {renderTrendIndicator(engagementRate, 50)}
                </div>
              </motion.div>
              
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-purple-500 flex justify-center mb-2">
                  <FiActivity className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Retention Rate</h4>
                <p className="text-2xl font-bold text-gray-800">{retentionRate}%</p>
                <div className="flex justify-center items-center text-xs text-gray-500 mt-1">
                  {retentionRate > 60 ? 'Strong' : 'Needs improvement'}
                </div>
              </motion.div>
              
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-yellow-500 flex justify-center mb-2">
                  <FaUserPlus className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">New Users</h4>
                <p className="text-2xl font-bold text-gray-800">{newUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {newUsers > 0 ? `${Math.round((newUsers/totalUsers)*100)}% of total` : 'No new users'}
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-4">User Activity Trend</h3>
                <Line
                  data={{
                    labels: activityTrend.map((_, i) => `Day ${i+1}`),
                    datasets: [
                      {
                        label: 'Active Users',
                        data: activityTrend,
                        borderColor: '#4BC0C0',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.3,
                        fill: true
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `${ctx.parsed.y} active users`
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-4">User Segments</h3>
                <Doughnut
                  data={{
                    labels: Object.keys(userSegments),
                    datasets: [{
                      data: Object.values(userSegments),
                      backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((ctx.raw / total) * 100);
                            return `${ctx.label}: ${ctx.raw} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Engagement Metrics</h3>
              <Bar
                data={{
                  labels: ['Engagement Rate', 'Retention Rate', 'Growth Rate'],
                  datasets: [{
                    label: 'Percentage',
                    data: [engagementRate, retentionRate, userGrowthRate],
                    backgroundColor: [
                      'rgba(75, 192, 192, 0.7)',
                      'rgba(54, 162, 235, 0.7)',
                      'rgba(255, 206, 86, 0.7)'
                    ],
                    borderWidth: 1
                  }]
                }}
                options={{
                  scales: {
                    y: {
                      min: 0,
                      max: 100,
                      ticks: {
                        callback: (value) => `${value}%`
                      }
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        );
      }

      case 'Web Analytics': {
        // Use webAnalytics from API call or fall back to real-time webAnalyticsData
        const analyticsData = webAnalytics || webAnalyticsData;
        
        if (!analyticsData || !analyticsData.totalVisits) {
          return <p className="text-center py-8">No web analytics data available.</p>;
        }

        const { 
          totalVisits = 0, 
          uniqueVisitors = 0,
          maxVisitedPage = '', 
          averageSessionDuration = '', 
          visitTrends = [],
          bounceRate = 0,
          conversionRate = 0,
          deviceBreakdown = {},
          trafficSources = {}
        } = analyticsData;
        
        // Extract visit counts from visitTrends (array of {date, visits} objects)
        const visitCounts = visitTrends.map(trend => trend.visits || 0);
        const visitLabels = visitTrends.map(trend => {
          const date = new Date(trend.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        return (
          <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-blue-500 flex justify-center mb-2">
                  <FaChartLine className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Total Visits</h4>
                <p className="text-2xl font-bold text-gray-800">{totalVisits.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {visitCounts.length > 1 ? 
                    `${Math.abs(Math.round(((visitCounts[visitCounts.length-1] - visitCounts[0])/(visitCounts[0] || 1))*100))}% trend` : 
                    'No trend data'}
                </p>
              </motion.div>
              
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-purple-500 flex justify-center mb-2">
                  <FaUsers className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Unique Visitors</h4>
                <p className="text-2xl font-bold text-gray-800">{uniqueVisitors.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalVisits > 0 ? `${Math.round((uniqueVisitors/totalVisits)*100)}% of visits` : 'N/A'}
                </p>
              </motion.div>

              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-red-500 flex justify-center mb-2">
                  <FaPercentage className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Bounce Rate</h4>
                <p className="text-2xl font-bold text-gray-800">{bounceRate}%</p>
                <div className="flex justify-center items-center text-xs text-gray-500 mt-1">
                  {bounceRate < 40 ? 'Excellent' : bounceRate < 60 ? 'Average' : 'Needs improvement'}
                </div>
              </motion.div>

              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-green-500 flex justify-center mb-2">
                  <FaPercentage className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Conversion Rate</h4>
                <p className="text-2xl font-bold text-gray-800">{conversionRate}%</p>
                <div className="flex justify-center items-center text-xs text-gray-500 mt-1">
                  {conversionRate > 5 ? 'High' : conversionRate > 2 ? 'Average' : 'Low'}
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-4">Visit Trends</h3>
                <Line
                  data={{
                    labels: visitLabels,
                    datasets: [{
                      label: 'Visits',
                      data: visitCounts,
                      borderColor: '#4BC0C0',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      tension: 0.3,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `${ctx.parsed.y} visits`
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-4">Device Breakdown</h3>
                <Pie
                  data={{
                    labels: Object.keys(deviceBreakdown),
                    datasets: [{
                      data: Object.values(deviceBreakdown),
                      backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56'
                      ]
                    }]
                  }}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((ctx.raw / total) * 100);
                            return `${ctx.label}: ${ctx.raw} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Traffic Sources</h3>
              <Bar
                data={{
                  labels: Object.keys(trafficSources),
                  datasets: [{
                    label: 'Visits',
                    data: Object.values(trafficSources),
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.7)',
                      'rgba(54, 162, 235, 0.7)',
                      'rgba(255, 206, 86, 0.7)',
                      'rgba(75, 192, 192, 0.7)'
                    ],
                    borderWidth: 1
                  }]
                }}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((ctx.parsed.y / total) * 100);
                          return `${ctx.parsed.y} visits (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        );
      }

      case 'Sales and Revenue': {
        if (!salesReport) return <p className="text-center py-8">No sales report data available.</p>;

        const { 
          totalRevenue = 0, 
          totalOrders = 0, 
          averageOrderValue = 0, 
          recentOrders = [],
          revenueTrend = [],
          trendLabels = [],
          productPerformance = [],
          paymentMethods = {},
          totalVisits = 0
        } = salesReport;
        
        // Use trend labels from backend or generate defaults
        const chartLabels = trendLabels.length > 0 ? trendLabels : 
          revenueTrend.map((_, i) => `Day ${i+1}`);

        return (
          <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-green-500 flex justify-center mb-2">
                  <FaMoneyBillWave className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Total Revenue</h4>
                <p className="text-2xl font-bold text-gray-800">PKR {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {revenueTrend.length > 1 && revenueTrend[0] > 0 ? 
                    `${Math.abs(Math.round(((revenueTrend[revenueTrend.length-1] - revenueTrend[0])/revenueTrend[0])*100))}% trend` : 
                    revenueTrend.length > 0 ? 'New sales period' : 'No trend data'}
                </p>
              </motion.div>
              
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-blue-500 flex justify-center mb-2">
                  <FaShoppingCart className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Total Orders</h4>
                <p className="text-2xl font-bold text-gray-800">{totalOrders.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {averageOrderValue > 0 ? `Avg: PKR ${averageOrderValue.toFixed(2)}` : 'No orders'}
                </p>
              </motion.div>
              
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-purple-500 flex justify-center mb-2">
                  <FaBoxOpen className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Top Product</h4>
                <p className="text-lg font-bold text-gray-800">
                  {productPerformance[0]?.name || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {productPerformance[0]?.sales ? `${productPerformance[0].sales} sold` : ''}
                </p>
              </motion.div>
              
              <motion.div className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-yellow-500 flex justify-center mb-2">
                  <FaPercentage className="text-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">Conversion Rate</h4>
                <p className="text-2xl font-bold text-gray-800">
                  {totalVisits > 0 ? Math.round((totalOrders/totalVisits)*100) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalVisits > 0 ? `${totalOrders} orders / ${totalVisits} visits` : 'No visit data'}
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-4">Revenue Trend</h3>
                <Line
                  data={{
                    labels: chartLabels,
                    datasets: [{
                      label: 'Revenue (PKR)',
                      data: revenueTrend,
                      borderColor: '#4BC0C0',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      tension: 0.3,
                      fill: true
                    }]
                  }}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `PKR ${ctx.parsed.y.toLocaleString()}`
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-4">Product Performance</h3>
                {productPerformance.length > 0 ? (
                  <Bar
                    data={{
                      labels: productPerformance.map(p => p.name || 'Unknown'),
                      datasets: [{
                        label: 'Units Sold',
                        data: productPerformance.map(p => p.sales || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderWidth: 1
                      }]
                    }}
                  />
                ) : (
                  <p className="text-center text-gray-500 py-8">No product data available</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-4">Payment Methods</h3>
                {Object.keys(paymentMethods).length > 0 ? (
                  <Doughnut
                    data={{
                      labels: Object.keys(paymentMethods),
                      datasets: [{
                        data: Object.values(paymentMethods),
                        backgroundColor: [
                          '#FF6384',
                          '#36A2EB',
                          '#FFCE56',
                          '#4BC0C0'
                        ]
                      }]
                    }}
                    options={{
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (ctx) => {
                              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((ctx.raw / total) * 100);
                              return `${ctx.label}: ${ctx.raw} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="text-center text-gray-500 py-8">No payment data available</p>
                )}
              </div>

              {recentOrders.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-green-700 mb-4">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentOrders.map(order => (
                          <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order._id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              PKR {order.totalPrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      }

      default:
        return (
          <div className="text-center py-8">
            <p className="text-red-500">No data available for the selected report.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dashboardadmin')}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-green-50 text-green-700 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-green-200"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex-1"></div>
        </div>
        <h1 className="text-3xl font-bold text-center text-green-700 mb-2">Analytics Dashboard</h1>
        <p className="text-center text-gray-600">Comprehensive insights and performance metrics</p>
      </motion.div>

      <motion.div
        className="flex flex-col md:flex-row justify-center items-center md:items-start gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-auto">
          <label className="block text-green-700 font-medium mb-2 flex items-center">
            <FaInfoCircle className="mr-2" />
            Report Type:
          </label>
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="User Engagement">User Engagement</option>
            <option value="Web Analytics">Web Analytics</option>
            <option value="Sales and Revenue">Sales and Revenue</option>
          </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-auto">
          <label className="block text-green-700 font-medium mb-2 flex items-center">
            <FaClock className="mr-2" />
            Time Range:
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </motion.div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-700">Loading analytics data...</span>
        </div>
      )}

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {renderCharts()}
        </motion.div>
      )}
    </div>
  );
};

export default ReportsPage;
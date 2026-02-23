import React, { useState, lazy, Suspense, useCallback, useMemo } from 'react';
import { 
  FaLeaf, 
  FaChartLine, 
  FaCamera, 
  FaBox, 
  FaShoppingCart, 
  FaTractor, 
  FaHandHolding, 
  FaRegCalendar, 
  FaStore, 
  FaTruck, 
  FaSeedling,
  FaBell,
  FaSearch,
  FaCog,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';

// Lazy load components for better performance
const CropRecommendation = lazy(() => import('./CropRecommendation'));
const CropYieldPrediction = lazy(() => import('./CropYieldPrediction'));
const CropHealthMonitoring = lazy(() => import('./CropHealthMonitoring'));
const ProductManagement = lazy(() => import('./ProductManagement'));
const OrderManagement = lazy(() => import('./OrderManagement'));
const HarvestEquipment = lazy(() => import('../harvest/HarvestEquipment'));
const HarvestHandlingGuide = lazy(() => import('../harvest/HarvestHandlingGuide'));
const HarvestRecommendations = lazy(() => import('../harvest/HarvestRecommendations'));
const HarvestSchedule = lazy(() => import('../harvest/HarvestSchedule'));
const StorageAssist = lazy(() => import('../storageassist/storageAssist'));
const TransportAssist = lazy(() => import('../transportassist/transportAssist'));
const CropMaturityAssessment = lazy(() => import('../CropMaturity/CropMaturityAssessment'));

// Loading component
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center h-96">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
    </div>
  </div>
));

const DashFarmer = () => {
  const [activeSection, setActiveSection] = useState('Crop Recommendation');

  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  const sidebarItems = useMemo(() => [
    { title: 'Crop Recommendation', icon: FaLeaf, category: 'Crop Management' },
    { title: 'Crop Yield Prediction', icon: FaChartLine, category: 'Crop Management' },
    { title: 'Crop Health Monitoring', icon: FaCamera, category: 'Crop Management' },
    { title: 'Crop Maturity Assessment', icon: FaSeedling, category: 'Crop Management' },
    { title: 'My Products', icon: FaBox, category: 'Sales & Orders' },
    { title: 'Orders', icon: FaShoppingCart, category: 'Sales & Orders' },
    { title: 'Harvest Equipment', icon: FaTractor, category: 'Harvest' },
    { title: 'Harvest Handling', icon: FaHandHolding, category: 'Harvest' },
    { title: 'Harvest Recommendation', icon: FaLeaf, category: 'Harvest' },
    { title: 'Harvest Schedule', icon: FaRegCalendar, category: 'Harvest' },
    { title: 'Storage Assist', icon: FaStore, category: 'Logistics' },
    { title: 'Transport Assist', icon: FaTruck, category: 'Logistics' }
  ], []);

  const groupedItems = useMemo(() => {
    return sidebarItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [sidebarItems]);

  const renderContent = useCallback(() => {
    switch (activeSection) {
      case 'Crop Recommendation':
        return <CropRecommendation />;
      case 'Crop Yield Prediction':
        return <CropYieldPrediction />;
      case 'Crop Health Monitoring':
        return <CropHealthMonitoring />;
      case 'My Products':
        return <ProductManagement />;
      case 'Orders':
        return <OrderManagement />;
      case 'Harvest Equipment':
        return <HarvestEquipment />;
      case 'Harvest Handling':
        return <HarvestHandlingGuide />;
      case 'Harvest Recommendation':
        return <HarvestRecommendations />;
      case 'Harvest Schedule':
        return <HarvestSchedule />;
      case 'Storage Assist':
        return <StorageAssist />;
      case 'Transport Assist':
        return <TransportAssist/>;
      case 'Crop Maturity Assessment':
        return <CropMaturityAssessment/>
      default:
        return null;
    }
  }, [activeSection]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      {/* Modern Sidebar */}
      <div className="w-72 bg-gradient-to-b from-green-800 via-green-700 to-green-900 shadow-2xl fixed top-0 left-0 h-full overflow-y-auto z-40">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-green-600/30">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <FaLeaf className="text-2xl text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AgroTech</h2>
              <p className="text-xs text-green-200">Farmer Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 pb-24">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              <p className="text-xs font-semibold text-green-300 uppercase tracking-wider mb-3 px-3">
                {category}
              </p>
              <ul className="space-y-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.title}
                      className={`cursor-pointer flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 hover:translate-x-1 active:scale-95
                        ${activeSection === item.title 
                          ? 'bg-white text-green-700 shadow-lg' 
                          : 'text-white hover:bg-green-600/30'
                        }`}
                      onClick={() => handleSectionChange(item.title)}
                    >
                      <Icon className="text-lg" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-600/30 bg-green-900/50">
          <div className="flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white cursor-pointer rounded-lg hover:bg-green-600/30 transition-all">
            <FaSignOutAlt className="text-lg" />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-72">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-md sticky top-0 z-30 px-8 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">{activeSection}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                />
              </div>
              
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaBell className="text-xl text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaCog className="text-xl text-gray-600" />
              </button>

              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow">
                <FaUser />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <Suspense fallback={<LoadingSpinner />}>
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DashFarmer);

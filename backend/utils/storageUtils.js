import StorageFacility from "../models/StorageFacility.js";

// utils/storageUtils.js
const getAvailableDates = async (facilityId, requiredCapacity) => {
  const facility = await StorageFacility.findById(facilityId);
  
  if (!facility) {
    throw new Error('Facility not found');
  }

  // Group reservations by date and calculate daily reserved capacity
  const dateMap = {};
  
  facility.reservations.forEach(reservation => {
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = (dateMap[dateStr] || 0) + reservation.capacity;
    }
  });

  // Find available dates where required capacity is available
  const availableDates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check next 30 days for availability
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const reservedOnDate = dateMap[dateStr] || 0;
    const availableOnDate = facility.totalCapacity - reservedOnDate;
    
    if (availableOnDate >= requiredCapacity) {
      availableDates.push(dateStr);
    }
  }

  return availableDates;
};

export {getAvailableDates}
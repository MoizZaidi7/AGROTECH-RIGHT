import mongoose from "mongoose";
import dotenv from "dotenv";
import StorageFacility from "../models/StorageFacility.js";
import User from "../models/User.js";

dotenv.config();

const seedStorageFacilities = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Database connected");

    const users = await User.find(); // Assuming User model exists
    if (!users.length) {
      console.log("No users found. Please seed users first.");
      return;
    }

    const sampleFacilities = [
      {
        name: "Cool Storage A",
        description: "Climate controlled storage for fruits and vegetables.",
        location: "Lahore",
        capacity: 1000,
        price: 5000,
        climateControlled: true,
        image: "https://example.com/image1.jpg",
        createdBy: users[0]._id,
        reservations: [
          {
            farmer: users[1]._id,
            totalCapacity: 500,
            reservedCapacity: 300,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: "approved",
          },
          {
            farmer: users[2]._id,
            totalCapacity: 300,
            reservedCapacity: 150,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
            status: "pending",
          },
        ],
      },
      {
        name: "Dry Storage B",
        description: "Large storage for grains and pulses.",
        location: "Karachi",
        capacity: 2000,
        price: 3000,
        climateControlled: false,
        image: "https://example.com/image2.jpg",
        createdBy: users[1]._id,
        reservations: [
          {
            farmer: users[3]._id,
            totalCapacity: 700,
            reservedCapacity: 500,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
            status: "completed",
          },
        ],
      },
      {
        name: "Cold Storage C",
        description: "Refrigerated storage for perishable items.",
        location: "Faisalabad",
        capacity: 1500,
        price: 6000,
        climateControlled: true,
        image: "https://example.com/image3.jpg",
        createdBy: users[2]._id,
        reservations: [],
      },
    ];

    await StorageFacility.deleteMany({});
    console.log("Existing storage facilities removed");

    await StorageFacility.insertMany(sampleFacilities);
    console.log("Sample storage facilities seeded successfully");

    process.exit();
  } catch (err) {
    console.error("Error seeding data:", err.message);
    process.exit(1);
  }
};

export default seedStorageFacilities;

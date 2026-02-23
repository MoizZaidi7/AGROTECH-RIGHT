import mongoose from "mongoose";
import dotenv from "dotenv";
import StorageGuideline from "./models/StorageGuideline.js";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/agrotech";

const seedData = [
  {
    cropType: "Tomato",
    grade: "A",
    storageRequirements: [
      {
        temperature: "12–15°C",
        humidity: "85–90%",
        duration: "7–10 days"
      }
    ],
    handlingProcedures: [
      "Handle tomatoes gently to avoid bruising.",
      "Do not store in extremely cold environments.",
      "Wash thoroughly before packing."
    ],
    notes: "Best stored in breathable containers.",
    createdBy: "admin"
  },
  {
    cropType: "Potato",
    grade: "B",
    storageRequirements: [
      {
        temperature: "4–10°C",
        humidity: "90–95%",
        duration: "2–3 months"
      }
    ],
    handlingProcedures: [
      "Cure freshly harvested potatoes for 10 days before storage.",
      "Keep in a dark, well-ventilated room.",
      "Avoid washing before storage."
    ],
    notes: "Prevent exposure to sunlight to avoid greening.",
    createdBy: "admin"
  },
{
  cropType: "Tomato",
  grade: "A",
  storageRequirements: [
    {
      temperature: "12–15°C",
      humidity: "85–90%",
      duration: "7–10 days"
    }
  ],
  handlingProcedures: [
    "Handle tomatoes gently to avoid bruising.",
    "Do not store in extremely cold environments.",
    "Wash thoroughly before packing."
  ],
  notes: "Best stored in breathable containers.",
  createdBy: new mongoose.Types.ObjectId("6659b5143cc5a3d52089caa7") // replace with actual user ID
}
];

const seedStorageGuidelines = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await StorageGuideline.deleteMany();
    console.log("Old guidelines removed.");

    const result = await StorageGuideline.insertMany(seedData);
    console.log(`${result.length} guidelines seeded successfully.`);

    process.exit(0);
  } catch (err) {
    console.error("Error seeding guidelines:", err);
    process.exit(1);
  }
};

seedStorageGuidelines();

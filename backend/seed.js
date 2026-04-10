import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import Client from "./models/Client.js";
import Project from "./models/Project.js";
import Invoice from "./models/Invoice.js";
import Contract from "./models/Contract.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ekssesorg";

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URL);
    console.log("Connected.");

    // Wipe existing
    await User.deleteMany();
    await Client.deleteMany();
    await Project.deleteMany();
    await Invoice.deleteMany();
    await Contract.deleteMany();
    console.log("Wiped existing database collections.");

    // Insert Default Auth User
    const hashedPassword = await bcrypt.hash("samir", 10);
    await User.create({
      name: "Samir Admin",
      email: "samir",
      password: hashedPassword,
      role: "admin"
    });
    console.log("Seeded user 'samir:samir' successfully.");

    // Insert Dummy Client
    const client1 = await Client.create({ name: "Rahim K.", email: "rahim@globex.com", company: "Globex" });
    const client2 = await Client.create({ name: "Ayesha T.", email: "ayesha@initech.net", company: "Initech" });

    // Insert Dummy Projects
    const p1 = await Project.create({ clientId: client1._id, title: "Stripe Integration", status: "In progress", amount: 45000 });
    const p2 = await Project.create({ clientId: client2._id, title: "Marketing Site Vue", status: "Completed", amount: 30000 });
    const p3 = await Project.create({ clientId: client1._id, title: "Mobile API backend", status: "Pending", amount: 85000 });
    
    // Insert Dummy Invoices (amounts in BDT)
    await Invoice.create({ projectId: p1._id, invoiceNumber: "EKS-001", amount: 20000, status: "paid" }); // part of stripe paid
    await Invoice.create({ projectId: p1._id, invoiceNumber: "EKS-002", amount: 25000, status: "unpaid" }); // part of stripe unpaid
    await Invoice.create({ projectId: p2._id, invoiceNumber: "EKS-003", amount: 30000, status: "paid" }); // marketing site paid
    await Invoice.create({ projectId: p3._id, invoiceNumber: "EKS-004", amount: 85000, status: "unpaid" }); // mobile api unpaid

    console.log("Dummy data successfully seeded!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seedDatabase();

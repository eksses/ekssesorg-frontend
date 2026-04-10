import mongoose from 'mongoose';
import Project from './backend/models/Project.js';
import Invoice from './backend/models/Invoice.js';
import dotenv from 'dotenv';
dotenv.config();

const testSync = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  // 1. Create a dummy project with a milestone
  const p = await Project.create({
    title: "Sync Test Project",
    clientId: new mongoose.Types.ObjectId(),
    milestones: [
      { title: "Test Phase", percentage: 50, amount: 500, dueDate: new Date(), status: "Pending" }
    ]
  });
  const mId = p.milestones[0]._id;
  console.log("Created Project with Milestone:", mId);

  // 2. Create an invoice linked to this milestone
  const inv = await Invoice.create({
    projectId: p._id,
    milestoneId: mId,
    invoiceNumber: `TEST-${Date.now()}`,
    amount: 500,
    status: "unpaid"
  });
  console.log("Created Unpaid Invoice:", inv._id);

  // 3. Simulate the PATCH update logic
  const updatedInv = await Invoice.findByIdAndUpdate(inv._id, { status: "paid" }, { new: true });
  
  if (updatedInv.status === "paid" && updatedInv.milestoneId) {
    const project = await Project.findById(updatedInv.projectId);
    const milestone = project.milestones.id(updatedInv.milestoneId);
    if (milestone) {
      milestone.status = "Paid";
      milestone.paidAmount = updatedInv.amount;
      milestone.paidDate = new Date();
      await project.save();
      console.log("SUCCESS: Milestone updated to Paid!");
    }
  }

  // Cleanup
  await Project.findByIdAndDelete(p._id);
  await Invoice.findByIdAndDelete(inv._id);
  await mongoose.disconnect();
};

testSync().catch(console.error);

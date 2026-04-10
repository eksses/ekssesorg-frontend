import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  milestoneId: { type: mongoose.Schema.Types.ObjectId }, // Links to a specific milestone in the project
  invoiceNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["paid", "unpaid", "partial"], default: "unpaid" },
  paymentMethod: { 
    type: String, 
    enum: ["Bank Transfer", "Credit Card", "bKash/Nagad", "Cash", "Other"],
    default: "Bank Transfer"
  },
  description: { type: String, default: "Services rendered" },
  notes: { type: String, default: "" },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Invoice", invoiceSchema);

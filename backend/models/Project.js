import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., Advance, Mid Work, Final
  percentage: { type: Number, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidAmount: { type: Number, default: 0 },
  paidDate: { type: Date },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  status: {
    type: String,
    enum: ["Pending", "Billed", "Partial", "Paid", "Overdue"],
    default: "Pending"
  }
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: false, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "In progress", "Completed"],
      default: "Pending"
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },
    scopeDescription: {
      type: String,
      default: "Standard project delivery without predefined external scope rules."
    },
    internalDeadline: { type: Date },
    teamNotes: { type: String, default: "" },
    techStack: { type: String, default: "" },
    milestones: [milestoneSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);

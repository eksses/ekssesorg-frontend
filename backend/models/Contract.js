import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Signed", "Suspended", "Terminated"],
      default: "Draft"
    },
    terms: { type: String, required: true },
    signed: { type: Boolean, default: false },
    revisionLimit: { type: Number, default: 2 },
    effectiveDate: { type: Date },
    expirationDate: { type: Date },
    timelinePhases: { type: String, default: "Standard phases mapping to payment milestones." },
    latePaymentRule: { type: String, default: "Work will pause immediately if payment is not completed by due date." },
    specialClauses: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Contract", contractSchema);

import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  company: { type: String, default: "" },
  referralSource: { type: String, default: "" },
  businessContext: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Client", clientSchema);

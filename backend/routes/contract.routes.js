import express from "express";
import Contract from "../models/Contract.js";
import { requireAuth } from "../middleware/auth.js";
import { generatePDF } from "../utils/pdfGenerator.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate("clientId", "name company email phone referralSource")
      .populate({ path: "projectId", select: "title amount status scopeDescription techStack milestones internalDeadline" })
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    console.error("Fetch Contracts Error:", err);
    res.status(500).json({ message: "Error fetching contracts" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const newContract = await Contract.create(req.body);
    res.status(201).json(newContract);
  } catch (err) {
    console.error("Create Contract Error:", err);
    res.status(500).json({ message: "Error creating contract" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    res.json(contract);
  } catch (err) {
    console.error("Update Contract Error:", err);
    res.status(500).json({ message: "Update failed." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ message: "Contract purged." });
  } catch (err) {
    console.error("Delete Contract Error:", err);
    res.status(500).json({ message: "Deletion failed." });
  }
});

// Full deep-populate for PDF — all client details + full project with milestones
router.get("/:id/pdf", requireAuth, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("clientId", "name company email phone referralSource businessContext")
      .populate({
        path: "projectId",
        select: "title amount status scopeDescription techStack teamNotes milestones internalDeadline clientId",
        populate: { path: "clientId", select: "name company email phone" }
      });

    if (!contract) return res.status(404).json({ message: "Contract not found" });

    const lang = req.query.lang === "bn" ? "bn" : "en";
    generatePDF("contract", lang, contract, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Generating PDF failed." });
  }
});

export default router;

import express from "express";
import Project from "../models/Project.js";
import Invoice from "../models/Invoice.js";
import { requireAuth } from "../middleware/auth.js";
import { generatePDF } from "../utils/pdfGenerator.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("clientId", "name company")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("Fetch Projects Error:", err);
    res.status(500).json({ message: "Error fetching projects" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const newProject = await Project.create(req.body);
    res.status(201).json(newProject);
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ message: "Error creating project" });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "In progress", "Completed"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const project = await Project.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(project);
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Error updating status" });
  }
});

router.post("/:id/milestones", requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.milestones.push(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("Add Milestone Error:", err);
    res.status(500).json({ message: "Error adding milestone" });
  }
});

router.put("/:id/update-core", requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { amount, scopeDescription, teamNotes, techStack, internalDeadline } = req.body;
    if (amount !== undefined) project.amount = Number(amount);
    if (scopeDescription !== undefined) project.scopeDescription = scopeDescription;
    if (teamNotes !== undefined) project.teamNotes = teamNotes;
    if (techStack !== undefined) project.techStack = techStack;
    if (internalDeadline !== undefined) project.internalDeadline = internalDeadline;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error("Update Core Error:", err);
    res.status(500).json({ message: "Error updating core definitions" });
  }
});

router.put("/:id/milestones/:mId/pay", requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const milestone = project.milestones.id(req.params.mId);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });

    milestone.status = "Paid";
    milestone.paidAmount = milestone.amount;
    milestone.paidDate = new Date();
    await project.save();

    // Sync: If this milestone had a linked invoice, mark that invoice as paid too
    if (milestone.invoiceId) {
      await Invoice.findByIdAndUpdate(milestone.invoiceId, { status: "paid" });
    }

    res.json(project);
  } catch (err) {
    console.error("Process Payment Error:", err);
    res.status(500).json({ message: "Error processing payment" });
  }
});

router.get("/:id/pdf/:type", requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("clientId");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const lang = req.query.lang === 'bn' ? 'bn' : 'en';
    const type = req.params.type; // 'receipt', 'summary', or 'internal'
    
    generatePDF(type, lang, project, res);
  } catch (err) {
    console.error("CRITICAL PDF ROUTE ERROR:", err);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ message: "Generating PDF failed.", details: err.message });
    }
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    // Cascade-delete all invoices linked to this project
    const deletedInvoices = await Invoice.deleteMany({ projectId: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: `Project purged. ${deletedInvoices.deletedCount} linked invoice(s) also removed.` });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ message: "System locked. Deletion failed." });
  }
});

export default router;

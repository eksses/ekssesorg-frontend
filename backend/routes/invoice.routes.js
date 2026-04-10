import express from "express";
import Invoice from "../models/Invoice.js";
import Project from "../models/Project.js";
import { requireAuth } from "../middleware/auth.js";
import { generatePDF } from "../utils/pdfGenerator.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate({
        path: "projectId",
        select: "title milestones clientId",
        populate: { path: "clientId", select: "name company" }
      })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("Fetch Invoices Error:", err);
    res.status(500).json({ message: "Error fetching invoices" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const newInvoice = await Invoice.create(req.body);

    // Sync: If linked to a milestone, mark that milestone as BILLED or PAID
    if (newInvoice.milestoneId && newInvoice.projectId) {
      const project = await Project.findById(newInvoice.projectId);
      if (project) {
        const milestone = project.milestones.id(newInvoice.milestoneId);
        if (milestone) {
          milestone.status = newInvoice.status === "paid" ? "Paid" : "Billed";
          milestone.invoiceId = newInvoice._id;
          if (newInvoice.status === "paid") {
            milestone.paidAmount = newInvoice.amount;
            milestone.paidDate = new Date();
          }
          await project.save();
        }
      }
    }

    res.status(201).json(newInvoice);
  } catch (err) {
    console.error("Create Invoice Error:", err);
    res.status(500).json({ message: "Error creating invoice" });
  }
});

router.get("/:id/pdf", requireAuth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({
      path: "projectId",
      select: "title milestones clientId",
      populate: { path: "clientId", select: "name company" }
    });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const lang = req.query.lang === 'bn' ? 'bn' : 'en';
    generatePDF('invoice', lang, invoice, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Generating PDF failed." });
  }
});

// Update invoice status and sync with milestone
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { status, paymentMethod, notes, milestoneId } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Sync logic: If paid, update the associated project milestone
    if (status === "paid" && invoice.milestoneId && invoice.projectId) {
      const project = await Project.findById(invoice.projectId);
      if (project) {
        const milestone = project.milestones.id(invoice.milestoneId);
        if (milestone) {
          milestone.status = "Paid";
          milestone.paidAmount = invoice.amount;
          milestone.paidDate = new Date();
          await project.save();
          console.log(`Synced Milestone ${milestone.title} to PAID for project ${project.title}`);
        }
      }
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (invoice && invoice.milestoneId && invoice.projectId) {
      const project = await Project.findById(invoice.projectId);
      if (project) {
        const milestone = project.milestones.id(invoice.milestoneId);
        if (milestone) {
          milestone.status = "Pending";
          milestone.invoiceId = undefined;
          milestone.paidAmount = 0;
          await project.save();
        }
      }
    }
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: "Invoice purged." });
  } catch (err) {
    console.error("Delete Invoice Error:", err);
    res.status(500).json({ message: "Deletion failed." });
  }
});

export default router;

import express from "express";
import Project from "../models/Project.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const projects = await Project.find().populate("clientId", "name company");

    let totalEarnings = 0;
    let pendingPayments = 0;
    let overduePayments = 0;
    let activeProjectsCount = 0;

    const now = new Date();

    projects.forEach(p => {
      if (p.status !== "Completed") activeProjectsCount++;
      
      let pTotal = p.amount || 0;
      let pPaid = 0;

      if (p.milestones && p.milestones.length > 0) {
        p.milestones.forEach(m => {
          totalEarnings += m.paidAmount || 0;
          pPaid += m.paidAmount || 0;

          if (m.status !== "Paid" && new Date(m.dueDate) < now) {
            overduePayments += (m.amount - (m.paidAmount || 0));
          } else if (m.status !== "Paid") {
            pendingPayments += (m.amount - (m.paidAmount || 0));
          }
        });
      } else {
        // Fallback for simple projects without milestones
        pendingPayments += pTotal;
      }
    });

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("clientId", "name company");

    res.json({
      totalEarnings,
      activeProjectsCount,
      pendingPayments,
      overduePayments,
      recentProjects
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

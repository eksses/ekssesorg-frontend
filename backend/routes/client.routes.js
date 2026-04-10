import express from "express";
import Client from "../models/Client.js";
import Project from "../models/Project.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching clients" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ message: "Error creating client" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating client" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const activeProjects = await Project.countDocuments({ clientId: req.params.id });
    if (activeProjects > 0) {
      return res.status(400).json({ message: `Cannot delete: ${activeProjects} active project(s) are linked. Delete those first.` });
    }
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Client securely purged." });
  } catch (err) {
    res.status(500).json({ message: "System locked. Deletion failed." });
  }
});

export default router;

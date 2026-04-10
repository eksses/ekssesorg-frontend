/** INTERNAL TEAM BRIEF — NOT FOR CLIENT DISTRIBUTION **/
const RED = "#EF4444";
const DARK = "#111111";
const GRAY = "#555555";
const LIGHT_GRAY = "#F4F4F4";

export const generateInternal = (doc, data) => {
  const project = data.projectId || data;
  const client = project.clientId || data.clientId || {};
  const W = doc.page.width;
  const MARGIN = 50;
  const CONTENT_W = W - MARGIN * 2;

  // Header
  doc.rect(0, 0, W, 60).fill(DARK);
  doc.fill("white").font("Helvetica-Bold").fontSize(16).text("ekssesORG INTERNAL BRIEF", MARGIN, 15);
  doc.fill(RED).font("Helvetica").fontSize(9).text("CONFIDENTIAL AGENCY RESOURCE — DO NOT SHARE WITH CLIENT", MARGIN, 38);
  doc.fill("white").font("Helvetica").fontSize(8).text(`GENERATED: ${new Date().toLocaleDateString("en-GB")}`, MARGIN + CONTENT_W - 100, 25, { align: "right", width: 100 });

  doc.y = 80;
  doc.x = MARGIN;

  const drawSection = (label) => {
    doc.moveDown(0.5);
    const y = doc.y;
    doc.rect(MARGIN, y, CONTENT_W, 18).fill(LIGHT_GRAY);
    doc.fill(DARK).font("Helvetica-Bold").fontSize(8.5).text(label.toUpperCase(), MARGIN + 10, y + 5);
    doc.y = y + 24;
  };

  // Client Intelligence  
  drawSection("Client & Business Context");
  const col1 = MARGIN, col2 = MARGIN + CONTENT_W / 2 + 10, colW = CONTENT_W / 2 - 10;
  const startY = doc.y;
  doc.fill(GRAY).font("Helvetica").fontSize(8).text("ENTITY:", col1, startY);
  doc.fill(DARK).font("Helvetica-Bold").fontSize(9).text(client.company || "Direct Individual", col1 + 50, startY);
  doc.fill(GRAY).font("Helvetica").fontSize(8).text("CONTACT:", col1, startY + 14);
  doc.fill(DARK).font("Helvetica-Bold").fontSize(9).text(`${client.name || "Unknown"} (${client.email || "No Email"})`, col1 + 50, startY + 14);
  
  doc.y = startY;
  doc.fill(GRAY).font("Helvetica").fontSize(8).text("SOURCE:", col2, startY);
  doc.fill(DARK).font("Helvetica-Bold").fontSize(9).text(client.referralSource || "Direct / Organic", col2 + 50, startY);
  doc.fill(GRAY).font("Helvetica").fontSize(8).text("CONTEXT:", col2, startY + 14);
  doc.fill(DARK).font("Helvetica-Bold").fontSize(9).text(client.businessContext || "No briefing provided", col2 + 50, startY + 14, { width: colW - 50 });
  
  doc.y = startY + 40;

  // Execution Details
  drawSection("Execution & Tech Brief");
  doc.fill(GRAY).font("Helvetica").fontSize(8).text("TECH STACK:", MARGIN, doc.y);
  doc.fill(DARK).font("Helvetica-Bold").fontSize(9).text(project.techStack || data.techStack || "Standard (to be decided)", MARGIN + 70, doc.y - 1);
  doc.moveDown(0.4);
  doc.fill(GRAY).font("Helvetica").fontSize(8).text("SCOPE:", MARGIN, doc.y);
  doc.fill(DARK).font("Helvetica").fontSize(8.5).text(project.scopeDescription || data.scopeDescription || "No scope defined.", MARGIN + 70, doc.y - 1, { width: CONTENT_W - 70, lineGap: 2 });
  doc.moveDown(0.4);
  doc.fill(GRAY).font("Helvetica").fontSize(8).text("TEAM NOTES:", MARGIN, doc.y);
  doc.fill("#1D4ED8").font("Helvetica").fontSize(8.5).text(project.teamNotes || data.teamNotes || "None provided.", MARGIN + 70, doc.y - 1, { width: CONTENT_W - 70 });

  // Timeline
  drawSection("Internal Deadlines");
  const dY = doc.y;
  const clientDeadline = project.deadline || data.deadline;
  const internalDeadline = project.internalDeadline || data.internalDeadline;
  doc.rect(MARGIN, dY, CONTENT_W / 2 - 5, 30).fill("#FEF2F2");
  doc.fill(RED).font("Helvetica-Bold").fontSize(8).text("CLIENT DELIVERY", MARGIN + 10, dY + 5);
  doc.fill(DARK).fontSize(10).text(clientDeadline ? new Date(clientDeadline).toLocaleDateString("en-GB") : "TBD", MARGIN + 10, dY + 16);
  
  doc.rect(MARGIN + CONTENT_W / 2 + 5, dY, CONTENT_W / 2 - 5, 30).fill("#F0F9FF");
  doc.fill("#0369A1").font("Helvetica-Bold").fontSize(8).text("INTERNAL TARGET", MARGIN + CONTENT_W / 2 + 15, dY + 5);
  doc.fill(DARK).fontSize(10).text(internalDeadline ? new Date(internalDeadline).toLocaleDateString("en-GB") : "Same as Client", MARGIN + CONTENT_W / 2 + 15, dY + 16);
  doc.y = dY + 40;

  // Financials
  const milestones = project.milestones || [];
  if (milestones.length > 0) {
    drawSection("Internal Revenue Tracking");
    milestones.forEach((m, i) => {
      const isPaid = m.status === "Paid";
      const ry = doc.y;
      doc.fill(GRAY).font("Helvetica").fontSize(8).text(`${i+1}. ${m.title}`, MARGIN + 10, ry);
      doc.fill(DARK).font("Helvetica-Bold").fontSize(8.5).text(`BDT ${Number(m.amount).toLocaleString()}`, MARGIN + 180, ry);
      doc.fill(isPaid ? "#15803D" : RED).fontSize(8).text(isPaid ? "[SECURED]" : "[PENDING]", MARGIN + 300, ry);
      doc.y = ry + 14;
    });
    
    const totalPaid = milestones.reduce((s, m) => s + (m.paidAmount || 0), 0);
    const budget = project.amount || data.amount || 0;
    doc.moveDown(0.5);
    doc.rect(MARGIN, doc.y, CONTENT_W, 20).fill("#F8FAFC");
    doc.fill(DARK).font("Helvetica-Bold").fontSize(9).text(`REVENUE HEALTH: ${Math.round((totalPaid/budget)*100)}% SECURED (${totalPaid} / ${budget})`, MARGIN + 10, doc.y + 6);
  }

  // Footer
  const fY = doc.page.height - 40;
  doc.fill("#AAAAAA").font("Helvetica").fontSize(7).text("This briefing is for internal engineering and management team use only. Distribution to unauthorized parties is a violation of agency policy.", MARGIN, fY, { width: CONTENT_W, align: "center" });
};

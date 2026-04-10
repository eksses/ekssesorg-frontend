import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as enTemplates from "./pdfTemplates/en.js";
import * as bnTemplates from "./pdfTemplates/bn.js";
import * as internalTemplates from "./pdfTemplates/internal.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BENGALI_FONT_PATH = path.join(__dirname, "../fonts/NotoSansBengali.ttf");

export const generatePDF = (type, lang, data, res) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=EKS-${type.toUpperCase()}-${data._id}-${lang.toUpperCase()}.pdf`
  );

  // Register Bengali font BEFORE piping
  if (fs.existsSync(BENGALI_FONT_PATH)) {
    doc.registerFont("Bengali", BENGALI_FONT_PATH);
  }

  // Error handling for the document stream
  doc.on("error", (err) => {
    console.error("PDFKit Stream Error:", err);
    if (!res.headersSent) {
      res.status(500).send("PDF Document Error");
    }
  });

  doc.pipe(res);

  try {
    // Forced fallback to English as Bengali engine is temporarily deactivated for stability
    const activeLang = "en"; 

    if (type === "internal") {
      internalTemplates.generateInternal(doc, data);
    } else {
      // All other types use English templates
      if (type === "contract") enTemplates.generateContract(doc, data);
      else if (type === "invoice") enTemplates.generateInvoice(doc, data);
      else if (type === "receipt") enTemplates.generateReceipt(doc, data);
      else if (type === "summary") enTemplates.generateSummary(doc, data);
    }

    // Successfully reached the end of the template
    doc.end();
  } catch (err) {
    console.error("PDF Engine Trace:", err);
    // Unpipe to stop further writes to res
    doc.unpipe(res);
    // Try to finalize doc but ignore further errors
    try { doc.end(); } catch (e) {}
    
    if (!res.headersSent && !res.writableEnded) {
      res.status(500).json({ 
        message: "PDF Engine Failure", 
        details: err.message,
        type: type,
        id: data._id
      });
    }
  }
};

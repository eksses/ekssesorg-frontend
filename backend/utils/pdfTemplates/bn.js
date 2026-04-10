// ─── BANGLA TEMPLATE ENGINE ──────────────────────────────────────────────────
// All text is rendered using the registered Bengali font.
// Font MUST be registered in pdfGenerator.js as "Bengali" before calling these.

const RED = "#EF4444";
const DARK = "#111111";
const GRAY = "#555555";
const LIGHT_GRAY = "#F4F4F4";
const W = 595.28;
const MARGIN = 50;
const CONTENT_W = W - MARGIN * 2;

const useBn = (doc) => doc.font("Bengali");
const useEn = (doc) => doc.font("Helvetica");

const bnOpt = { kerning: false, features: [] };

const drawHeaderBN = (doc, title, subtitle) => {
  doc.rect(0, 0, W, 60).fill(DARK);
  // Use Latin for brand name (renders fine), Bangla for tagline
  useEn(doc).fill("white").font("Helvetica-Bold").fontSize(18).text("ekssesORG", MARGIN, 15);
  useEn(doc).fill(RED).font("Helvetica").fontSize(10).text("AGENCY MANAGEMENT SYSTEM", MARGIN + 105, 23);
  useEn(doc).fill("white").fontSize(8).text(new Date().toLocaleDateString("en-GB"), MARGIN, 42);
  useEn(doc).fill("#999999").fontSize(8).text("CONFIDENTIAL", MARGIN + CONTENT_W - 80, 42, { align: "right", width: 80 });

  doc.rect(0, 60, W, 40).fill(RED);
  useBn(doc).fill("white").fontSize(15).text((title || "").replace(/[^\u0980-\u09FF\s]/g, ""), MARGIN, 73, { ...bnOpt, width: CONTENT_W * 0.7 });
  if (subtitle) useEn(doc).fill("white").font("Helvetica").fontSize(8.5).text(subtitle, MARGIN + CONTENT_W * 0.7, 76, { width: CONTENT_W * 0.3, align: "right" });

  doc.y = 115;
  doc.x = MARGIN;
};

const drawSectionHeaderBN = (doc, label) => {
  doc.moveDown(0.3);
  const y = doc.y;
  doc.rect(MARGIN, y, CONTENT_W, 20).fill(LIGHT_GRAY);
  useBn(doc).fill(DARK).fontSize(8.5).text(label, MARGIN + 10, y + 5, { ...bnOpt, width: CONTENT_W - 20 });
  doc.y = y + 26;
  doc.x = MARGIN;
};

const drawInfoRowBN = (doc, label, value, x = MARGIN, w = CONTENT_W) => {
  const y = doc.y;
  useBn(doc).fill(GRAY).fontSize(8).text(label, x, y, { ...bnOpt, width: w / 2 });
  // Values may be English (names, emails, numbers) — use Helvetica for correct rendering
  useEn(doc).fill(DARK).font("Helvetica-Bold").fontSize(8.5).text(value || "-", x + w / 2, y, { width: w / 2 });
  doc.y = y + 15;
  doc.x = MARGIN;
};

const drawDividerBN = (doc) => {
  doc.moveDown(0.5);
  doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).strokeColor("#DDDDDD").lineWidth(0.5).stroke();
  doc.moveDown(0.5);
};

const drawMilestoneTableBN = (doc, milestones) => {
  if (!milestones || milestones.length === 0) {
    useBn(doc).fill(GRAY).fontSize(8.5).text("কোনো পেমেন্ট মাইলস্টোন নির্ধারণ করা হয়নি।", MARGIN, doc.y, { features: [] });
    doc.moveDown(0.3);
    return;
  }
  const cols = { idx: 30, title: 140, pct: 50, amount: 90, due: 90, status: 95 };
  const y = doc.y;
  doc.rect(MARGIN, y, CONTENT_W, 20).fill(DARK);
  let cx = MARGIN + 6;
  useEn(doc).fill("white").font("Helvetica-Bold").fontSize(8);
  doc.text("#", cx, y + 6, { width: cols.idx }); cx += cols.idx;
  useBn(doc).text("পেমেন্ট পর্যায়", cx, y + 6, { width: cols.title, features: [] }); cx += cols.title;
  useEn(doc).text("%", cx, y + 6, { width: cols.pct }); cx += cols.pct;
  useBn(doc).text("পরিমাণ", cx, y + 6, { width: cols.amount, features: [] }); cx += cols.amount;
  useEn(doc).text("শেষ তারিখ", cx, y + 6, { width: cols.due }); cx += cols.due;
  useEn(doc).text("অবস্থা", cx, y + 6, { width: cols.status });

  doc.y = y + 20;
  milestones.forEach((m, i) => {
    const ry = doc.y;
    if (i % 2 === 0) doc.rect(MARGIN, ry, CONTENT_W, 18).fill("#F9F9F9");
    let rx = MARGIN + 6;
    const isPaid = m.status === "Paid";
    useEn(doc).fill(DARK).font("Helvetica").fontSize(8).text(`${i + 1}`, rx, ry + 5, { width: cols.idx }); rx += cols.idx;
    useBn(doc).fill(DARK).fontSize(8).text(m.title || "-", rx, ry + 5, { ...bnOpt, width: cols.title }); rx += cols.idx;
    useEn(doc).fill(DARK).font("Helvetica").fontSize(8).text(`${m.percentage || 0}%`, rx, ry + 5, { width: cols.pct }); rx += cols.pct;
    useEn(doc).fill(DARK).font("Helvetica").fontSize(8).text(`BDT ${Number(m.amount || 0).toLocaleString()}`, rx, ry + 5, { width: cols.amount }); rx += cols.amount;
    useEn(doc).fill(DARK).font("Helvetica").fontSize(8).text(m.dueDate ? new Date(m.dueDate).toLocaleDateString("en-GB") : "-", rx, ry + 5, { width: cols.due }); rx += cols.due;
    useBn(doc).fill(isPaid ? "#22C55E" : RED).fontSize(8).text(isPaid ? "পরিশোধিত" : "বাকি", rx, ry + 5, { ...bnOpt, width: cols.status });
    doc.y = ry + 18;
    doc.x = MARGIN;
  });
  doc.moveDown(0.3);
};

const drawClauseBN = (doc, number, title, body) => {
  doc.moveDown(0.3);
  useBn(doc).fill(DARK).fontSize(9).text(`${number}. ${title}`, MARGIN, doc.y, { features: [] });
  useBn(doc).fill(GRAY).fontSize(8.5).text(body, MARGIN, doc.y + 2, { width: CONTENT_W, lineGap: 3, features: [] });
  doc.moveDown(0.4);
};

const drawFooterBN = (doc) => {
  const y = doc.page.height - 45;
  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor("#DDDDDD").lineWidth(0.5).stroke();
  useBn(doc).fill("#AAAAAA").fontSize(7.5)
    .text("এই নথিটি ekssesORG এজেন্সি ম্যানেজমেন্ট সিস্টেম দ্বারা তৈরি করা হয়েছে। সমস্ত তথ্য গোপনীয়।", MARGIN, y + 8, { width: CONTENT_W, align: "center", features: [] });
};

// ─── CONTRACT (BN) ────────────────────────────────────────────────────────────
export const generateContract = (doc, data) => {
  const client = data.clientId || {};
  const project = data.projectId || {};
  const ref = `EKS-C-${Date.now().toString().slice(-6)}`;
  drawHeaderBN(doc, "সেবা চুক্তিপত্র", `Ref: ${ref}`);

  drawSectionHeaderBN(doc, "চুক্তির পক্ষসমূহ");
  const col1 = MARGIN, col2 = MARGIN + CONTENT_W / 2 + 10, colW = CONTENT_W / 2 - 10;
  const startY = doc.y;
  useBn(doc).fill(GRAY).fontSize(8).text("ক্লায়েন্ট", col1, startY);
  doc.y = startY + 16;
  drawInfoRowBN(doc, "পূর্ণ নাম", client.name, col1, colW);
  drawInfoRowBN(doc, "কোম্পানি", client.company, col1, colW);
  drawInfoRowBN(doc, "ইমেল", client.email, col1, colW);
  drawInfoRowBN(doc, "ফোন", client.phone, col1, colW);

  doc.y = startY;
  useBn(doc).fill(GRAY).fontSize(8).text("সেবা প্রদানকারী", col2, startY, { features: [] });
  doc.y = startY + 16;
  drawInfoRowBN(doc, "এজেন্সি", "ekssesORG", col2, colW);
  drawInfoRowBN(doc, "প্রজেক্টের নাম", project.title, col2, colW);
  drawInfoRowBN(doc, "চুক্তির তারিখ", new Date().toLocaleDateString("en-GB"), col2, colW);
  drawInfoRowBN(doc, "সর্বোচ্চ রিভিশন", `${data.revisionLimit || 2}`, col2, colW);

  doc.moveDown();
  drawDividerBN(doc);

  drawSectionHeaderBN(doc, "১. প্রজেক্টের কাজের পরিধি (Scope)");
  useBn(doc).fill(DARK).fontSize(9).text(
    data.terms || project.scopeDescription || "স্ট্যান্ডার্ড সফটওয়্যার ডেভেলপমেন্ট স্কোপ প্রযোজ্য। সমস্ত ডেলিভারেবল মৌখিক চুক্তি অনুযায়ী।",
    MARGIN, doc.y, { width: CONTENT_W, lineGap: 3 }
  );
  doc.moveDown(0.8);

  drawSectionHeaderBN(doc, "২. পেমেন্ট সময়সূচি");
  drawMilestoneTableBN(doc, project.milestones);

  drawSectionHeaderBN(doc, "৩. আইনি সুরক্ষা শর্তাবলী");
  drawClauseBN(doc, "৩.১", "বিলম্বিত পেমেন্ট নীতি", "নির্ধারিত তারিখের মধ্যে পেমেন্ট না করলে কাজ তাৎক্ষণিকভাবে স্থগিত থাকবে। কোনো ব্যতিক্রম নেই।");
  drawClauseBN(doc, "৩.২", "স্কোপ সুরক্ষা", "চুক্তির ১ নং ধারায় উল্লেখিত কাজের বাইরে অতিরিক্ত কোনো ফিচার, পেজ বা কার্যকারিতা নতুন অনুরোধ হিসেবে গণ্য হবে এবং আলাদাভাবে মূল্য নির্ধারণ করা হবে।");
  drawClauseBN(doc, "৩.৩", "রিফান্ড নীতি", "কাজ শুরু হওয়ার পর অগ্রিম পেমেন্ট সম্পূর্ণ অফেরতযোগ্য, যে কোনো পরিস্থিতিতে।");
  drawClauseBN(doc, "৩.৪", "রিভিশন সীমা", `এই চুক্তিতে সর্বোচ্চ ${data.revisionLimit || 2}টি রিভিশন রাউন্ড অন্তর্ভুক্ত। অতিরিক্ত রিভিশনের জন্য আলাদা চার্জ প্রযোজ্য।`);

  const sigY = doc.y + 10;
  doc.moveTo(MARGIN, sigY + 35).lineTo(MARGIN + 160, sigY + 35).strokeColor(DARK).lineWidth(0.5).stroke();
  doc.moveTo(MARGIN + CONTENT_W - 160, sigY + 35).lineTo(MARGIN + CONTENT_W, sigY + 35).strokeColor(DARK).lineWidth(0.5).stroke();
  useBn(doc).fill(DARK).fontSize(8.5).text("ক্লায়েন্টের স্বাক্ষর", MARGIN, sigY + 40, { features: [] });
  useBn(doc).text("ekssesORG অনুমোদিত", MARGIN + CONTENT_W - 160, sigY + 40, { features: [] });
  useBn(doc).fill(GRAY).fontSize(8).text(client.name || "Client Name", MARGIN, sigY + 54, { features: [] });
  useBn(doc).text("ekssesORG প্রতিনিধি", MARGIN + CONTENT_W - 160, sigY + 54, { features: [] });

  drawFooterBN(doc);
};

// ─── INVOICE (BN) ─────────────────────────────────────────────────────────────
export const generateInvoice = (doc, data) => {
  const client = data.projectId?.clientId || data.clientId || {};
  const project = data.projectId || {};
  const isPaid = data.status === "paid";
  const ref = data.invoiceNumber || `EKS-INV-${Date.now().toString().slice(-5)}`;

  drawHeaderBN(doc, "চালান (Invoice)", `Invoice: ${ref}`);
  drawSectionHeaderBN(doc, "বিলিং তথ্য");

  const col1 = MARGIN, col2 = MARGIN + CONTENT_W / 2 + 10, colW = CONTENT_W / 2 - 10;
  const startY = doc.y;
  useBn(doc).fill(GRAY).fontSize(8).text("যাকে বিল করা হচ্ছে", col1, startY, { features: [] });
  doc.y = startY + 16;
  drawInfoRowBN(doc, "ক্লায়েন্টের নাম", client.name, col1, colW);
  drawInfoRowBN(doc, "কোম্পানি", client.company, col1, colW);
  drawInfoRowBN(doc, "ইমেল", client.email, col1, colW);

  doc.y = startY;
  useBn(doc).fill(GRAY).fontSize(8).text("চালানের বিবরণ", col2, startY, { features: [] });
  doc.y = startY + 16;
  drawInfoRowBN(doc, "চালান নং", ref, col2, colW);
  drawInfoRowBN(doc, "প্রজেক্ট", project.title, col2, colW);
  drawInfoRowBN(doc, "ইস্যু তারিখ", new Date().toLocaleDateString("en-GB"), col2, colW);
  useEn(doc).fill(DARK).font("Helvetica-Bold").fontSize(8.5).text(isPaid ? "[PAID]" : "DUE", col2 + colW / 2, doc.y - 15, { width: colW / 2 });
  doc.y += 0; // maintain y 

  drawDividerBN(doc);

  drawSectionHeaderBN(doc, "পরিশোধযোগ্য পরিমাণ");
  const amtY = doc.y;
  doc.rect(MARGIN, amtY, CONTENT_W, 60).fill(isPaid ? "#F0FDF4" : "#FFF5F5");
  doc.rect(MARGIN, amtY, 4, 60).fill(isPaid ? "#22C55E" : RED);
  useEn(doc).fill(isPaid ? "#22C55E" : RED).font("Helvetica-Bold").fontSize(28)
    .text(`BDT ${Number(data.amount || 0).toLocaleString()}`, MARGIN + 20, amtY + 12, { width: CONTENT_W - 40 });
  useBn(doc).fill(GRAY).fontSize(9)
    .text(`অবস্থা: ${isPaid ? "পরিশোধিত হয়েছে" : "পেমেন্ট বাকি — নির্ধারিত তারিখের মধ্যে পরিশোধ করুন"}`,
      MARGIN + 20, amtY + 44, { features: [] });
  doc.y = amtY + 72;

  drawSectionHeaderBN(doc, "পেমেন্ট সংক্রান্ত নির্দেশনা");
  drawClauseBN(doc, ">", "বিলম্বিত পেমেন্ট", "নির্ধারিত তারিখের মধ্যে পূর্ণ পেমেন্ট করতে হবে। পেমেন্ট বিলম্ব হলে কাজ স্থগিত হতে পারে।");
  drawClauseBN(doc, ">", "ট্রান্সফার নির্দেশনা", "পেমেন্টের সময় চালান নম্বর উল্লেখ করুন। পেমেন্ট নিশ্চিত করতে আমাদের সাথে যোগাযোগ করুন।");

  drawFooterBN(doc);
};

// ─── RECEIPT (BN) ─────────────────────────────────────────────────────────────
export const generateReceipt = (doc, project) => {
  const client = project.clientId || {};
  const milestones = project.milestones || [];
  const paid = milestones.filter(m => m.status === "Paid");
  const totalPaid = paid.reduce((s, m) => s + (m.paidAmount || 0), 0);
  const balance = (project.amount || 0) - totalPaid;

  drawHeaderBN(doc, "পেমেন্ট রসিদ", `Ref: EKS-R-${Date.now().toString().slice(-5)}`);
  drawSectionHeaderBN(doc, "লেনদেনের বিবরণ");

  const col1 = MARGIN, col2 = MARGIN + CONTENT_W / 2 + 10, colW = CONTENT_W / 2 - 10;
  const startY = doc.y;
  useBn(doc).fill(GRAY).fontSize(8).text("ক্লায়েন্ট", col1, startY);
  doc.y = startY + 16;
  drawInfoRowBN(doc, "নাম", client.name, col1, colW);
  drawInfoRowBN(doc, "কোম্পানি", client.company, col1, colW);

  doc.y = startY;
  useBn(doc).fill(GRAY).fontSize(8).text("প্রজেক্ট", col2, startY, { features: [] });
  doc.y = startY + 16;
  drawInfoRowBN(doc, "শিরোনাম", project.title, col2, colW);
  drawInfoRowBN(doc, "রসিদের তারিখ", new Date().toLocaleDateString("en-GB"), col2, colW);

  drawDividerBN(doc);

  if (paid.length > 0) {
    const latest = paid[paid.length - 1];
    drawSectionHeaderBN(doc, "সর্বশেষ পেমেন্ট নিশ্চিত হয়েছে");
    const bY = doc.y;
    doc.rect(MARGIN, bY, CONTENT_W, 64).fill("#F0FDF4");
    doc.rect(MARGIN, bY, 4, 64).fill("#22C55E");
    useEn(doc).fill("#22C55E").font("Helvetica-Bold").fontSize(26).text(`BDT ${Number(latest.paidAmount || 0).toLocaleString()}`, MARGIN + 20, bY + 10);
    useBn(doc).fill(GRAY).fontSize(9)
      .text(`পর্যায়: `, MARGIN + 20, bY + 46, { ...bnOpt, continued: true });
    useEn(doc).text(`${latest.title} | ${latest.paidDate ? new Date(latest.paidDate).toLocaleDateString("en-GB") : "-"}`);
    doc.y = bY + 76;
  }

  drawSectionHeaderBN(doc, "সম্পূর্ণ পেমেন্ট ইতিহাস");
  drawMilestoneTableBN(doc, milestones);

  const sumY = doc.y + 4;
  doc.rect(MARGIN, sumY, CONTENT_W, 36).fill(DARK);
  useEn(doc).fill("white").font("Helvetica").fontSize(9)
    .text(`Total Budget: BDT ${Number(project.amount || 0).toLocaleString()}`, MARGIN + 10, sumY + 5)
    .text(`Total Paid: BDT ${Number(totalPaid).toLocaleString()}`, MARGIN + 10, sumY + 18);
  useEn(doc).fill(balance <= 0 ? "#22C55E" : RED).font("Helvetica-Bold").fontSize(9)
    .text(`Balance: BDT ${Number(balance > 0 ? balance : 0).toLocaleString()}  ${balance <= 0 ? "[SETTLED]" : ""}`,
      MARGIN + CONTENT_W / 2, sumY + 12, { width: CONTENT_W / 2 - 10, align: "right" });
  doc.y = sumY + 46;

  drawFooterBN(doc);
};

// ─── SUMMARY (BN) ─────────────────────────────────────────────────────────────
export const generateSummary = (doc, project) => {
  const client = project.clientId || {};
  const milestones = project.milestones || [];
  const totalPaid = milestones.reduce((s, m) => s + (m.paidAmount || 0), 0);
  const balance = (project.amount || 0) - totalPaid;
  const isClosed = balance <= 0;

  drawHeaderBN(doc, "প্রজেক্ট সমাপ্তি রিপোর্ট", isClosed ? "BALANCE ZERO" : "DUE");
  drawSectionHeaderBN(doc, "প্রজেক্টের সংক্ষিপ্ত বিবরণ");
  drawInfoRowBN(doc, "প্রজেক্টের শিরোনাম", project.title);
  drawInfoRowBN(doc, "ক্লায়েন্টের নাম", client.name);
  drawInfoRowBN(doc, "কোম্পানি", client.company);
  drawInfoRowBN(doc, "রিপোর্ট তৈরির তারিখ", new Date().toLocaleDateString("en-GB"));
  drawInfoRowBN(doc, "প্রজেক্টের অবস্থা", project.status === "Completed" ? "সম্পন্ন" : "চলমান");

  drawDividerBN(doc);

  drawSectionHeaderBN(doc, "আর্থিক সারসংক্ষেপ");
  const fY = doc.y;
  const boxW = CONTENT_W / 3 - 6;
  [
    { label: "মোট বাজেট", val: `BDT ${Number(project.amount || 0).toLocaleString()}`, color: DARK },
    { label: "মোট প্রাপ্ত", val: `BDT ${Number(totalPaid).toLocaleString()}`, color: "#22C55E" },
    { label: "বাকি পরিমাণ", val: `BDT ${Number(balance > 0 ? balance : 0).toLocaleString()}`, color: isClosed ? "#22C55E" : RED },
  ].forEach((item, i) => {
    const bx = MARGIN + i * (boxW + 9);
    doc.rect(bx, fY, boxW, 54).fill("#F9F9F9");
    doc.rect(bx, fY, boxW, 4).fill(item.color);
    useEn(doc).fill(GRAY).font("Helvetica").fontSize(8).text(item.label, bx + 8, fY + 12);
    useEn(doc).fill(item.color).font("Helvetica-Bold").fontSize(15).text(item.val, bx + 8, fY + 26, { width: boxW - 16 });
  });
  doc.y = fY + 66;

  drawSectionHeaderBN(doc, "পেমেন্ট মাইলস্টোন লগ");
  drawMilestoneTableBN(doc, milestones);

  const certY = doc.y + 10;
  doc.rect(MARGIN, certY, CONTENT_W, 56).fill(isClosed ? "#F0FDF4" : "#FFF5F5");
  doc.rect(MARGIN, certY, 4, 56).fill(isClosed ? "#22C55E" : RED);
  useBn(doc).fill(isClosed ? "#22C55E" : RED).fontSize(12)
    .text(isClosed ? "প্রজেক্ট সম্পন্ন - হিসাব পরিষ্কার" : "সতর্কতা: বকেয়া পরিমাণ বিদ্যমান", MARGIN + 16, certY + 10, { features: [] });
  useBn(doc).fill(GRAY).fontSize(9)
    .text(isClosed
      ? "সমস্ত পেমেন্ট সম্পূর্ণরূপে গ্রহণ করা হয়েছে। এই নথিটি প্রজেক্ট সম্পন্নের চূড়ান্ত প্রমাণ হিসেবে কাজ করে।"
      : "এই প্রজেক্টে এখনো বকেয়া পরিমাণ রয়েছে। সম্পূর্ণ পেমেন্ট না পাওয়া পর্যন্ত চূড়ান্ত ক্লোজার দেওয়া সম্ভব নয়।",
      MARGIN + 16, certY + 30, { width: CONTENT_W - 30, features: [] }
    );
  doc.y = certY + 66;

  drawFooterBN(doc);
};

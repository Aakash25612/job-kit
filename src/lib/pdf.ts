import { jsPDF } from "jspdf";
import type { CvDocument } from "./cv";

const MARGIN = 48;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapText(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
}

export function downloadCvPdf(cv: CvDocument, filename?: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const drawRule = (
    color: [number, number, number],
    width: number,
    gapAfter: number,
  ) => {
    ensureSpace(8);
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += gapAfter;
  };

  /** Darker rule under name / contact header */
  const headerRule = () => drawRule([120, 120, 120], 1.1, 14);

  /** Thin rule under section titles */
  const sectionRule = () => drawRule([180, 180, 180], 0.7, 12);

  /** Light hairline between experience jobs */
  const jobRule = () => drawRule([210, 210, 210], 0.5, 12);

  const sectionTitle = (title: string) => {
    ensureSpace(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(title, MARGIN, y);
    y += 6;
    sectionRule();
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text(cv.name, MARGIN, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(55, 55, 55);
  const titleLines = wrapText(doc, cv.title, CONTENT_WIDTH, 11);
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 14 + 4;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const contactLines = wrapText(doc, cv.contact, CONTENT_WIDTH, 9);
  doc.text(contactLines, MARGIN, y);
  y += contactLines.length * 12 + 8;
  headerRule();

  // Summary
  sectionTitle("SUMMARY");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  const summaryLines = wrapText(doc, cv.summary, CONTENT_WIDTH, 9.5);
  ensureSpace(summaryLines.length * 12);
  doc.text(summaryLines, MARGIN, y);
  y += summaryLines.length * 12 + 14;

  // Skills
  sectionTitle("TECHNICAL SKILLS");
  for (const skill of cv.skills || []) {
    const lines = wrapText(
      doc,
      `${skill.label}: ${skill.value}`,
      CONTENT_WIDTH,
      9.5,
    );
    ensureSpace(lines.length * 12 + 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    const label = `${skill.label}: `;
    doc.text(label, MARGIN, y);
    const labelWidth = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    const valueLines = wrapText(
      doc,
      skill.value,
      CONTENT_WIDTH - labelWidth,
      9.5,
    );
    doc.text(valueLines[0] || "", MARGIN + labelWidth, y);
    y += 12;
    for (let i = 1; i < valueLines.length; i++) {
      ensureSpace(12);
      doc.text(valueLines[i], MARGIN, y);
      y += 12;
    }
    y += 2;
  }
  y += 10;

  // Experience
  sectionTitle("EXPERIENCE");
  const jobs = cv.experience || [];
  jobs.forEach((job, index) => {
    ensureSpace(48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    const heading = `${job.role} - ${job.company}`;
    const headingLines = wrapText(doc, heading, CONTENT_WIDTH, 10);
    doc.text(headingLines, MARGIN, y);
    y += headingLines.length * 13;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    const meta = [job.location, job.dates].filter(Boolean).join(" · ");
    doc.text(meta, MARGIN, y);
    y += 12;

    if (job.summary) {
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(9.5);
      const sLines = wrapText(doc, job.summary, CONTENT_WIDTH, 9.5);
      ensureSpace(sLines.length * 12);
      doc.text(sLines, MARGIN, y);
      y += sLines.length * 12 + 4;
    }

    for (const bullet of job.bullets || []) {
      const bulletLines = wrapText(doc, `• ${bullet}`, CONTENT_WIDTH - 8, 9.5);
      ensureSpace(bulletLines.length * 12 + 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(40, 40, 40);
      doc.text(bulletLines, MARGIN + 4, y);
      y += bulletLines.length * 12 + 2;
    }

    y += 8;
    if (index < jobs.length - 1) {
      jobRule();
    }
  });

  const safeName = (filename || `${cv.name.replace(/\s+/g, "_")}_CV`).replace(
    /[^\w.-]+/g,
    "_",
  );
  doc.save(`${safeName}.pdf`);
}

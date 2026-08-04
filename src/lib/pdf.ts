import { jsPDF } from "jspdf";
import type { CvDocument } from "./cv";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

type Density = {
  margin: number;
  nameSize: number;
  titleSize: number;
  contactSize: number;
  sectionSize: number;
  bodySize: number;
  jobTitleSize: number;
  metaSize: number;
  lineGap: number;
  sectionGap: number;
  jobGap: number;
  bulletGap: number;
  headerAfter: number;
  sectionRuleGap: number;
  jobRuleGap: number;
  nameGap: number;
  titleGap: number;
  contactGap: number;
  afterSectionTitle: number;
};

const NORMAL: Density = {
  margin: 40,
  nameSize: 16,
  titleSize: 10,
  contactSize: 8.5,
  sectionSize: 10,
  bodySize: 9,
  jobTitleSize: 9.5,
  metaSize: 8,
  lineGap: 11,
  sectionGap: 10,
  jobGap: 6,
  bulletGap: 1.5,
  headerAfter: 10,
  sectionRuleGap: 8,
  jobRuleGap: 8,
  nameGap: 18,
  titleGap: 12,
  contactGap: 10,
  afterSectionTitle: 4,
};

const COMPACT: Density = {
  margin: 32,
  nameSize: 14.5,
  titleSize: 9.5,
  contactSize: 8,
  sectionSize: 9.5,
  bodySize: 8.2,
  jobTitleSize: 9,
  metaSize: 7.5,
  lineGap: 10,
  sectionGap: 7,
  jobGap: 4,
  bulletGap: 1,
  headerAfter: 8,
  sectionRuleGap: 6,
  jobRuleGap: 6,
  nameGap: 15,
  titleGap: 11,
  contactGap: 8,
  afterSectionTitle: 3,
};

const DENSE: Density = {
  margin: 28,
  nameSize: 13.5,
  titleSize: 9,
  contactSize: 7.5,
  sectionSize: 9,
  bodySize: 7.6,
  jobTitleSize: 8.5,
  metaSize: 7,
  lineGap: 9.2,
  sectionGap: 5,
  jobGap: 3,
  bulletGap: 0.5,
  headerAfter: 6,
  sectionRuleGap: 5,
  jobRuleGap: 5,
  nameGap: 14,
  titleGap: 10,
  contactGap: 6,
  afterSectionTitle: 2,
};

function wrapText(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
}

function estimateHeight(doc: jsPDF, cv: CvDocument, d: Density): number {
  const contentWidth = PAGE_WIDTH - d.margin * 2;
  let h = d.margin;

  h += d.nameGap;
  h += wrapText(doc, cv.title, contentWidth, d.titleSize).length * d.titleGap;
  h += 3;
  h +=
    wrapText(doc, cv.contact, contentWidth, d.contactSize).length *
      (d.contactSize + 2) +
    d.contactGap;
  h += d.headerAfter;

  // SUMMARY
  h += d.sectionSize + d.afterSectionTitle + d.sectionRuleGap;
  h +=
    wrapText(doc, cv.summary, contentWidth, d.bodySize).length * d.lineGap +
    d.sectionGap;

  // SKILLS
  h += d.sectionSize + d.afterSectionTitle + d.sectionRuleGap;
  for (const skill of cv.skills || []) {
    const label = `${skill.label}: `;
    doc.setFontSize(d.bodySize);
    const labelWidth = doc.getTextWidth(label);
    const valueLines = wrapText(
      doc,
      skill.value,
      Math.max(40, contentWidth - labelWidth),
      d.bodySize,
    );
    h += Math.max(1, valueLines.length) * d.lineGap + 1;
  }
  h += d.sectionGap;

  // EXPERIENCE
  h += d.sectionSize + d.afterSectionTitle + d.sectionRuleGap;
  const jobs = cv.experience || [];
  jobs.forEach((job, index) => {
    const heading = `${job.role} - ${job.company}`;
    h += wrapText(doc, heading, contentWidth, d.jobTitleSize).length * 11;
    h += d.metaSize + 3;
    if (job.summary) {
      h += wrapText(doc, job.summary, contentWidth, d.bodySize).length * d.lineGap + 2;
    }
    for (const bullet of job.bullets || []) {
      h +=
        wrapText(doc, `• ${bullet}`, contentWidth - 6, d.bodySize).length *
          d.lineGap +
        d.bulletGap;
    }
    h += d.jobGap;
    if (index < jobs.length - 1) h += d.jobRuleGap;
  });

  return h + d.margin;
}

function pickDensity(doc: jsPDF, cv: CvDocument): Density {
  const maxY = PAGE_HEIGHT;
  if (estimateHeight(doc, cv, NORMAL) <= maxY) return NORMAL;
  if (estimateHeight(doc, cv, COMPACT) <= maxY) return COMPACT;
  return DENSE;
}

/** Keep content to one page: trim trailing bullets if still too tall. */
function fitCv(cv: CvDocument): CvDocument {
  return {
    ...cv,
    summary: cv.summary,
    skills: (cv.skills || []).slice(0, 6),
    experience: (cv.experience || []).slice(0, 3).map((job) => ({
      ...job,
      bullets: (job.bullets || []).slice(0, 4),
    })),
  };
}

export function downloadCvPdf(cv: CvDocument, filename?: string) {
  const fitted = fitCv(cv);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const d = pickDensity(doc, fitted);
  const contentWidth = PAGE_WIDTH - d.margin * 2;
  let y = d.margin;

  // Never spill to page 2: clamp drawing within the first page.
  const bottom = PAGE_HEIGHT - d.margin;

  const drawRule = (
    color: [number, number, number],
    width: number,
    gapAfter: number,
  ) => {
    if (y + 4 > bottom) return;
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(d.margin, y, PAGE_WIDTH - d.margin, y);
    y += gapAfter;
  };

  const headerRule = () => drawRule([120, 120, 120], 1.0, d.headerAfter);
  const sectionRule = () => drawRule([180, 180, 180], 0.65, d.sectionRuleGap);
  const jobRule = () => drawRule([210, 210, 210], 0.45, d.jobRuleGap);

  const sectionTitle = (title: string) => {
    if (y + 20 > bottom) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(d.sectionSize);
    doc.setTextColor(20, 20, 20);
    doc.text(title, d.margin, y);
    y += d.afterSectionTitle;
    sectionRule();
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(d.nameSize);
  doc.setTextColor(20, 20, 20);
  doc.text(fitted.name, d.margin, y);
  y += d.nameGap;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(d.titleSize);
  doc.setTextColor(55, 55, 55);
  const titleLines = wrapText(doc, fitted.title, contentWidth, d.titleSize);
  doc.text(titleLines, d.margin, y);
  y += titleLines.length * d.titleGap + 2;

  doc.setFontSize(d.contactSize);
  doc.setTextColor(80, 80, 80);
  const contactLines = wrapText(doc, fitted.contact, contentWidth, d.contactSize);
  doc.text(contactLines, d.margin, y);
  y += contactLines.length * (d.contactSize + 2) + 4;
  headerRule();

  // Summary
  sectionTitle("SUMMARY");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(d.bodySize);
  doc.setTextColor(40, 40, 40);
  const summaryLines = wrapText(doc, fitted.summary, contentWidth, d.bodySize);
  if (y + summaryLines.length * d.lineGap <= bottom) {
    doc.text(summaryLines, d.margin, y);
    y += summaryLines.length * d.lineGap + d.sectionGap;
  }

  // Skills
  sectionTitle("TECHNICAL SKILLS");
  for (const skill of fitted.skills || []) {
    if (y + d.lineGap > bottom) break;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(d.bodySize);
    doc.setTextColor(40, 40, 40);
    const label = `${skill.label}: `;
    doc.text(label, d.margin, y);
    const labelWidth = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    const valueLines = wrapText(
      doc,
      skill.value,
      Math.max(40, contentWidth - labelWidth),
      d.bodySize,
    );
    doc.text(valueLines[0] || "", d.margin + labelWidth, y);
    y += d.lineGap;
    for (let i = 1; i < valueLines.length; i++) {
      if (y + d.lineGap > bottom) break;
      doc.text(valueLines[i], d.margin, y);
      y += d.lineGap;
    }
    y += 1;
  }
  y += d.sectionGap - 2;

  // Experience
  sectionTitle("EXPERIENCE");
  const jobs = fitted.experience || [];
  jobs.forEach((job, index) => {
    if (y + 28 > bottom) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(d.jobTitleSize);
    doc.setTextColor(20, 20, 20);
    const heading = `${job.role} - ${job.company}`;
    const headingLines = wrapText(doc, heading, contentWidth, d.jobTitleSize);
    doc.text(headingLines, d.margin, y);
    y += headingLines.length * (d.jobTitleSize + 2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(d.metaSize);
    doc.setTextColor(90, 90, 90);
    const meta = [job.location, job.dates].filter(Boolean).join(" · ");
    doc.text(meta, d.margin, y);
    y += d.metaSize + 3;

    if (job.summary) {
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(d.bodySize);
      const sLines = wrapText(doc, job.summary, contentWidth, d.bodySize);
      if (y + sLines.length * d.lineGap <= bottom) {
        doc.text(sLines, d.margin, y);
        y += sLines.length * d.lineGap + 2;
      }
    }

    for (const bullet of job.bullets || []) {
      const bulletLines = wrapText(
        doc,
        `• ${bullet}`,
        contentWidth - 6,
        d.bodySize,
      );
      if (y + bulletLines.length * d.lineGap > bottom) break;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(d.bodySize);
      doc.setTextColor(40, 40, 40);
      doc.text(bulletLines, d.margin + 3, y);
      y += bulletLines.length * d.lineGap + d.bulletGap;
    }

    y += d.jobGap;
    if (index < jobs.length - 1 && y + 8 <= bottom) {
      jobRule();
    }
  });

  const safeName = (
    filename || `${fitted.name.replace(/\s+/g, "_")}_CV`
  ).replace(/[^\w.-]+/g, "_");
  doc.save(`${safeName}.pdf`);
}

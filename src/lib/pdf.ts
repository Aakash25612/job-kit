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
  titleLine: number;
  contactLine: number;
  afterSectionTitle: number;
  jobTitleLine: number;
};

/** Slightly compact base so 4 roles + projects fit one page. */
const BASE: Density = {
  margin: 36,
  nameSize: 15.5,
  titleSize: 9.5,
  contactSize: 8,
  sectionSize: 9.5,
  bodySize: 8.5,
  jobTitleSize: 9,
  metaSize: 7.5,
  lineGap: 10.5,
  sectionGap: 8,
  jobGap: 5,
  bulletGap: 1.2,
  headerAfter: 9,
  sectionRuleGap: 7,
  jobRuleGap: 7,
  nameGap: 17,
  titleLine: 11.5,
  contactLine: 10,
  afterSectionTitle: 3.5,
  jobTitleLine: 11,
};

const MIN_SCALE = 0.9;
const MAX_SCALE = 1.06; // prefer packing content over enlarging sparse text
const TARGET_FILL = 0.97;
const MIN_BODY = 7.6; // floor: small but readable

function wrapText(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
}

function scaleDensity(d: Density, scale: number): Density {
  const s = (n: number) => Math.max(6, n * scale);
  return {
    margin: Math.max(28, d.margin * Math.min(1, 0.6 + scale * 0.4)),
    nameSize: s(d.nameSize),
    titleSize: s(d.titleSize),
    contactSize: s(d.contactSize),
    sectionSize: s(d.sectionSize),
    bodySize: s(d.bodySize),
    jobTitleSize: s(d.jobTitleSize),
    metaSize: s(d.metaSize),
    lineGap: s(d.lineGap),
    sectionGap: s(d.sectionGap),
    jobGap: s(d.jobGap),
    bulletGap: Math.max(0.4, d.bulletGap * scale),
    headerAfter: s(d.headerAfter),
    sectionRuleGap: s(d.sectionRuleGap),
    jobRuleGap: s(d.jobRuleGap),
    nameGap: s(d.nameGap),
    titleLine: s(d.titleLine),
    contactLine: s(d.contactLine),
    afterSectionTitle: s(d.afterSectionTitle),
    jobTitleLine: s(d.jobTitleLine),
  };
}

function measureHeight(doc: jsPDF, cv: CvDocument, dens: Density): number {
  const w = PAGE_WIDTH - dens.margin * 2;
  let h = dens.margin;

  h += dens.nameGap;
  h += wrapText(doc, cv.title, w, dens.titleSize).length * dens.titleLine + 2;
  h +=
    wrapText(doc, cv.contact, w, dens.contactSize).length * dens.contactLine + 4;
  h += dens.headerAfter;

  h += dens.sectionSize + dens.afterSectionTitle + dens.sectionRuleGap;
  h +=
    wrapText(doc, cv.summary, w, dens.bodySize).length * dens.lineGap +
    dens.sectionGap;

  h += dens.sectionSize + dens.afterSectionTitle + dens.sectionRuleGap;
  for (const skill of cv.skills || []) {
    doc.setFontSize(dens.bodySize);
    const labelWidth = doc.getTextWidth(`${skill.label}: `);
    const lines = wrapText(
      doc,
      skill.value,
      Math.max(40, w - labelWidth),
      dens.bodySize,
    );
    h += Math.max(1, lines.length) * dens.lineGap + 1;
  }
  h += dens.sectionGap;

  h += dens.sectionSize + dens.afterSectionTitle + dens.sectionRuleGap;
  const jobs = cv.experience || [];
  jobs.forEach((job, index) => {
    h +=
      wrapText(doc, `${job.role} - ${job.company}`, w, dens.jobTitleSize)
        .length * dens.jobTitleLine;
    h += dens.metaSize + 3;
    if (job.summary) {
      h +=
        wrapText(doc, job.summary, w, dens.bodySize).length * dens.lineGap + 2;
    }
    for (const bullet of job.bullets || []) {
      h +=
        wrapText(doc, `• ${bullet}`, w - 6, dens.bodySize).length *
          dens.lineGap +
        dens.bulletGap;
    }
    h += dens.jobGap;
    if (index < jobs.length - 1) h += dens.jobRuleGap;
  });

  const projects = cv.projects || [];
  if (projects.length) {
    h += dens.sectionGap;
    h += dens.sectionSize + dens.afterSectionTitle + dens.sectionRuleGap;
    for (const project of projects) {
      const text = `${project.name}: ${project.description}`;
      h += wrapText(doc, text, w, dens.bodySize).length * dens.lineGap + 1.5;
    }
  }

  return h + dens.margin;
}

function densityForPage(doc: jsPDF, cv: CvDocument): Density {
  const available = PAGE_HEIGHT * TARGET_FILL;
  const baseHeight = measureHeight(doc, cv, BASE);
  let scale = available / Math.max(1, baseHeight);
  scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

  let dens = scaleDensity(BASE, scale);
  let height = measureHeight(doc, cv, dens);
  let guard = 0;
  while (height > PAGE_HEIGHT - 8 && dens.bodySize > MIN_BODY && guard < 10) {
    dens = scaleDensity(dens, 0.97);
    height = measureHeight(doc, cv, dens);
    guard += 1;
  }
  return dens;
}

export function downloadCvPdf(cv: CvDocument, filename?: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const d = densityForPage(doc, cv);
  const contentWidth = PAGE_WIDTH - d.margin * 2;
  let y = d.margin;
  const bottom = PAGE_HEIGHT - Math.min(d.margin, 26);

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
  doc.text(cv.name, d.margin, y);
  y += d.nameGap;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(d.titleSize);
  doc.setTextColor(55, 55, 55);
  const titleLines = wrapText(doc, cv.title, contentWidth, d.titleSize);
  doc.text(titleLines, d.margin, y);
  y += titleLines.length * d.titleLine + 2;

  doc.setFontSize(d.contactSize);
  doc.setTextColor(80, 80, 80);
  const contactLines = wrapText(doc, cv.contact, contentWidth, d.contactSize);
  doc.text(contactLines, d.margin, y);
  y += contactLines.length * d.contactLine + 4;
  headerRule();

  // Summary
  sectionTitle("SUMMARY");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(d.bodySize);
  doc.setTextColor(40, 40, 40);
  const summaryLines = wrapText(doc, cv.summary, contentWidth, d.bodySize);
  doc.text(summaryLines, d.margin, y);
  y += summaryLines.length * d.lineGap + d.sectionGap;

  // Skills
  sectionTitle("TECHNICAL SKILLS");
  for (const skill of cv.skills || []) {
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
    y += 0.8;
  }
  y += d.sectionGap;

  // Experience
  sectionTitle("EXPERIENCE");
  const jobs = cv.experience || [];
  jobs.forEach((job, index) => {
    if (y + 28 > bottom) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(d.jobTitleSize);
    doc.setTextColor(20, 20, 20);
    const heading = `${job.role} - ${job.company}`;
    const headingLines = wrapText(doc, heading, contentWidth, d.jobTitleSize);
    doc.text(headingLines, d.margin, y);
    y += headingLines.length * d.jobTitleLine;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(d.metaSize);
    doc.setTextColor(90, 90, 90);
    const meta = [job.location, job.dates].filter(Boolean).join(" · ");
    doc.text(meta, d.margin, y);
    y += d.metaSize + 2.5;

    if (job.summary) {
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(d.bodySize);
      const sLines = wrapText(doc, job.summary, contentWidth, d.bodySize);
      if (y + sLines.length * d.lineGap <= bottom) {
        doc.text(sLines, d.margin, y);
        y += sLines.length * d.lineGap + 1.5;
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

  // Projects
  const projects = cv.projects || [];
  if (projects.length && y + 28 <= bottom) {
    y += Math.min(d.sectionGap, 6);
    sectionTitle("PROJECTS & PROFILE");
    for (const project of projects) {
      if (y + d.lineGap > bottom) break;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(d.bodySize);
      doc.setTextColor(40, 40, 40);
      const label = `${project.name}: `;
      doc.text(label, d.margin, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont("helvetica", "normal");
      const descLines = wrapText(
        doc,
        project.description,
        Math.max(40, contentWidth - labelWidth),
        d.bodySize,
      );
      doc.text(descLines[0] || "", d.margin + labelWidth, y);
      y += d.lineGap;
      for (let i = 1; i < descLines.length; i++) {
        if (y + d.lineGap > bottom) break;
        doc.text(descLines[i], d.margin, y);
        y += d.lineGap;
      }
      y += 1.2;
    }
  }

  const safeName = (filename || `${cv.name.replace(/\s+/g, "_")}_CV`).replace(
    /[^\w.-]+/g,
    "_",
  );
  doc.save(`${safeName}.pdf`);
}

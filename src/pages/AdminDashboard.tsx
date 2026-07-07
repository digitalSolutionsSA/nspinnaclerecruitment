import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import { PDFDocument, StandardFonts, rgb, PDFName, PDFString, type PDFFont } from 'pdf-lib';
import './AdminDashboard.css';

interface Candidate {
  id: string;
  created_at: string;
  first_name: string; last_name: string; email: string; contact_number: string;
  id_number: string; age: string; date_of_birth: string; physical_address: string;
  driver_license_code: string; social_security_number: string;
  smoking: string; alcohol: string; english_proficient: string;
  health_issues: string; criminal_record: string;
  marital_status: string; spouse_name: string; spouse_contact: string;
  spouse_email: string; spouse_dob: string; date_of_marriage: string; usa_relatives: string;
  nok_name: string; nok_relationship: string; nok_contact: string;
  nok_email: string; nok_address: string;
  passport_number: string; passport_issued: string; passport_expiry: string;
  previous_visa_application: string; visa_outcome: string;
  highest_education: string; tertiary_education: string;
  current_employer: string; current_start_date: string;
  current_contact_person: string; current_job_duties: string;
  previous_employer: string; previous_start_date: string;
  previous_end_date: string; previous_contact_person: string; previous_job_duties: string;
  tractors: string; combines: string; tillage_cultivation: string; silage_haymaking: string;
  sprayers: string; other_farm_equipment: string; earthmoving: string; trucks: string;
  other_skills: string; mechanical_skills: string; livestock_farming: string;
  crop_farming: string; irrigation_farming: string;
  doc_photo: string; doc_passport: string; doc_id: string;
  doc_drivers_licence: string; doc_h2a_visas: string; doc_criminal_record: string;
  other_qualifications: Qualification[] | null;
  is_complete: boolean;
}

interface Qualification {
  title: string;
  url: string;
}

function parseQualifications(raw: Qualification[] | null | undefined): Qualification[] {
  return Array.isArray(raw) ? raw.filter(q => q && q.title && q.url) : [];
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="detail-field">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string | undefined }) {
  if (!url) return null;
  return (
    <div className="detail-field">
      <span className="detail-label">{label}</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="doc-link">View document ↗</a>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="detail-section">
      <h3 className="detail-section-title">{title}</h3>
      <div className="detail-fields">{children}</div>
    </div>
  );
}

async function exportToPdf(c: Candidate) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 18;
  const colW = (pageW - margin * 2) / 2;
  let y = 0;

  // NS Pinnacle brand colours
  const GREEN_DARK = '#1b5e20';
  const GREEN      = '#2e7d32';
  const GOLD       = '#c8a84b';
  const GREY       = '#888888';
  const LINE       = '#d4e8d4';

  function hexToRgb(hex: string): [number, number, number] {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  }

  // Fetch logo and convert to base64 data URL
  let logoDataUrl: string | null = null;
  try {
    const res = await fetch('/images/ns-logo.png');
    const blob = await res.blob();
    logoDataUrl = await new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch { /* logo unavailable — skip it */ }

  function checkPage(needed = 10) {
    if (y + needed > 275) {
      doc.addPage();
      y = margin;
    }
  }

  function drawHeader() {
    // Green banner
    doc.setFillColor(...hexToRgb(GREEN_DARK));
    doc.rect(0, 0, pageW, 28, 'F');

    // Gold accent stripe
    doc.setFillColor(...hexToRgb(GOLD));
    doc.rect(0, 28, pageW, 1.5, 'F');

    // Logo (square, top-left of banner)
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', margin, 2, 24, 24);
    }

    // Title text to the right of the logo
    const textX = logoDataUrl ? margin + 28 : margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('NS Pinnacle Recruit', textX, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...hexToRgb(GOLD));
    doc.text('Candidate Profile', textX, 21);

    y = 38;
  }

  function drawCandidateHeader() {
    doc.setFillColor(240, 248, 240);
    doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, 'F');
    doc.setDrawColor(...hexToRgb(GREEN));
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...hexToRgb(GREEN_DARK));
    doc.text(`${c.first_name} ${c.last_name}`, margin + 4, y + 9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...hexToRgb(GREY));
    doc.text(`${c.email}   ·   Registered ${new Date(c.created_at).toLocaleDateString('en-ZA')}`, margin + 4, y + 17);
    y += 28;
  }

  function drawSectionTitle(title: string) {
    checkPage(14);
    doc.setFillColor(...hexToRgb(GREEN));
    doc.rect(margin, y, pageW - margin * 2, 7.5, 'F');
    // Gold left accent bar
    doc.setFillColor(...hexToRgb(GOLD));
    doc.rect(margin, y, 3, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 6, y + 5.2);
    y += 11;
  }

  function drawFields(fields: { label: string; value: string | undefined }[]) {
    const filled = fields.filter(f => f.value);
    let rowY = y;

    for (let i = 0; i < filled.length; i += 2) {
      // Set the value rendering font BEFORE splitTextToSize so the line-wrap
      // calculation matches what jsPDF will actually render (9pt normal).
      // Without this the split runs at whatever font was last set (7.5pt bold
      // from the previous label), producing too few lines and an underestimated
      // rowHeight — causing the value to overflow into the footer.
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const row = filled.slice(i, i + 2).map(f => ({
        field: f,
        lines: doc.splitTextToSize(f.value!, colW - 4) as string[],
      }));
      const maxLines = Math.max(...row.map(r => r.lines.length), 1);
      const rowHeight = 13 + (maxLines > 1 ? (maxLines - 1) * 5 : 0);

      // Page-break check against the row's actual running position — not
      // the section's stale starting y — so tall/wrapped rows near the
      // bottom of a page move to a new page instead of overflowing it.
      // Threshold is 265 (not 275) to keep a safe gap above the footer bar.
      if (rowY + rowHeight > 265) {
        doc.addPage();
        rowY = margin;
      }

      row.forEach(({ field, lines }, col) => {
        const x = margin + col * colW;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...hexToRgb(GREY));
        doc.text(field.label.toUpperCase(), x, rowY + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(34, 34, 34);
        doc.text(lines, x, rowY + 9);
      });

      rowY += rowHeight;
    }
    y = rowY + 4;

    doc.setDrawColor(...hexToRgb(LINE));
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  }

  function documentList(): { label: string; url: string | undefined }[] {
    // Fixed document slots always appear — even when not yet uploaded — so
    // legally-sensitive items like the SAPS check and visa copies are never
    // silently absent from the export.
    const docs: { label: string; url: string | undefined }[] = [
      { label: 'Head & Shoulder Photo', url: c.doc_photo },
      { label: 'Passport Copy', url: c.doc_passport },
      { label: 'ID Document', url: c.doc_id },
      { label: "Driver's Licence", url: c.doc_drivers_licence },
      { label: 'SAPS Criminal Record Check', url: c.doc_criminal_record },
    ];

    if (c.doc_h2a_visas) {
      c.doc_h2a_visas.split(',').forEach((u, i) => {
        docs.push({ label: `H-2A Visa Copy ${i + 1}`, url: u.trim() });
      });
    } else {
      docs.push({ label: 'H-2A Visa Copy', url: undefined });
    }

    parseQualifications(c.other_qualifications).forEach(q => {
      docs.push({ label: q.title, url: q.url });
    });

    return docs;
  }

  function drawDocuments() {
    const docs = documentList();
    drawSectionTitle('Uploaded Documents');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...hexToRgb(GREY));
    doc.text('Full copies of the documents below are attached on the following pages.', margin, y + 3);
    y += 8;
    docs.forEach(d => {
      checkPage(8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      if (d.url) {
        doc.setTextColor(...hexToRgb(GREEN));
        doc.text(`•  ${d.label}`, margin, y + 4);
      } else {
        doc.setTextColor(...hexToRgb(GREY));
        doc.text(`•  ${d.label}  (not yet uploaded)`, margin, y + 4);
      }
      y += 7;
    });
    y += 4;
  }

  function drawFooter() {
    const totalPages = (doc as jsPDF & { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      // Footer bar
      doc.setFillColor(...hexToRgb(GREEN_DARK));
      doc.rect(0, 285, pageW, 12, 'F');
      doc.setFontSize(7.5);
      doc.setTextColor(...hexToRgb(GOLD));
      doc.text(`Generated ${new Date().toLocaleString('en-ZA')}`, margin, 292);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, 292, { align: 'right' });
    }
  }

  drawHeader();
  drawCandidateHeader();

  drawSectionTitle('Personal Information');
  drawFields([
    { label: 'First Name', value: c.first_name },
    { label: 'Last Name', value: c.last_name },
    { label: 'Email', value: c.email },
    { label: 'Contact Number', value: c.contact_number },
    { label: 'ID Number', value: c.id_number },
    { label: 'Age', value: c.age },
    { label: 'Date of Birth', value: c.date_of_birth },
    { label: 'Physical Address', value: c.physical_address },
    { label: "Driver's Licence Code", value: c.driver_license_code },
    { label: 'Social Security Number', value: c.social_security_number },
  ]);

  drawSectionTitle('Lifestyle & Health');
  drawFields([
    { label: 'Smoking', value: c.smoking },
    { label: 'Alcohol', value: c.alcohol },
    { label: 'English Proficient', value: c.english_proficient },
    { label: 'Health Issues', value: c.health_issues },
    { label: 'Criminal Record', value: c.criminal_record },
  ]);

  drawSectionTitle('Family Information');
  drawFields([
    { label: 'Marital Status', value: c.marital_status },
    { label: 'USA Relatives', value: c.usa_relatives },
    { label: 'Spouse Name', value: c.spouse_name },
    { label: 'Spouse Contact', value: c.spouse_contact },
    { label: 'Spouse Email', value: c.spouse_email },
    { label: 'Spouse DOB', value: c.spouse_dob },
    { label: 'Date of Marriage', value: c.date_of_marriage },
  ]);

  drawSectionTitle('Next of Kin');
  drawFields([
    { label: 'Full Name', value: c.nok_name },
    { label: 'Relationship', value: c.nok_relationship },
    { label: 'Contact Number', value: c.nok_contact },
    { label: 'Email', value: c.nok_email },
    { label: 'Physical Address', value: c.nok_address },
  ]);

  drawSectionTitle('Passport & Visa');
  drawFields([
    { label: 'Passport Number', value: c.passport_number },
    { label: 'Passport Issued', value: c.passport_issued },
    { label: 'Passport Expiry', value: c.passport_expiry },
    { label: 'Previous Visa Application', value: c.previous_visa_application },
    { label: 'Visa Outcome', value: c.visa_outcome },
  ]);

  drawSectionTitle('Education & Employment');
  drawFields([
    { label: 'Highest School Education', value: c.highest_education },
    { label: 'Tertiary Education', value: c.tertiary_education },
    { label: 'Current Employer', value: c.current_employer },
    { label: 'Current Start Date', value: c.current_start_date },
    { label: 'Current Contact Person', value: c.current_contact_person },
    { label: 'Current Job Duties', value: c.current_job_duties },
    { label: 'Previous Employer', value: c.previous_employer },
    { label: 'Previous Start Date', value: c.previous_start_date },
    { label: 'Previous End Date', value: c.previous_end_date },
    { label: 'Previous Contact Person', value: c.previous_contact_person },
    { label: 'Previous Job Duties', value: c.previous_job_duties },
  ]);

  drawSectionTitle('Equipment & Machinery Experience');
  drawFields([
    { label: 'Tractors', value: c.tractors },
    { label: 'Combines / Harvesters', value: c.combines },
    { label: 'Tillage / Cultivation', value: c.tillage_cultivation },
    { label: 'Silage / Haymaking', value: c.silage_haymaking },
    { label: 'Sprayers', value: c.sprayers },
    { label: 'Other Farm Equipment', value: c.other_farm_equipment },
    { label: 'Earthmoving Equipment', value: c.earthmoving },
    { label: 'Trucks', value: c.trucks },
  ]);

  drawSectionTitle('Additional Skills');
  drawFields([
    { label: 'Other Skills', value: c.other_skills },
    { label: 'Mechanical Skills', value: c.mechanical_skills },
    { label: 'Livestock Farming', value: c.livestock_farming },
    { label: 'Crop Farming', value: c.crop_farming },
    { label: 'Irrigation Farming', value: c.irrigation_farming },
  ]);

  const docs = documentList();
  drawDocuments();
  drawFooter();

  // Merge the actual uploaded documents (images/PDFs) in as full pages
  const finalPdf = await PDFDocument.load(doc.output('arraybuffer'));
  const labelFont = await finalPdf.embedFont(StandardFonts.HelveticaBold);
  const [GREEN_R, GREEN_G, GREEN_B] = hexToRgb(GREEN_DARK).map(v => v / 255);
  const [GOLD_R, GOLD_G, GOLD_B] = hexToRgb(GOLD).map(v => v / 255);

  for (const d of docs) {
    await appendDocumentPages(finalPdf, labelFont, d.label, d.url, {
      GREEN_R, GREEN_G, GREEN_B, GOLD_R, GOLD_G, GOLD_B,
    });
  }

  const mergedBytes = await finalPdf.save();
  const blob = new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `NS-Pinnacle-${c.first_name}-${c.last_name}.pdf`;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

async function appendDocumentPages(
  finalPdf: PDFDocument,
  labelFont: PDFFont,
  label: string,
  url: string | undefined,
  colors: { GREEN_R: number; GREEN_G: number; GREEN_B: number; GOLD_R: number; GOLD_G: number; GOLD_B: number },
) {
  const A4: [number, number] = [595.28, 841.89];

  function drawLabelBanner(page: ReturnType<PDFDocument['addPage']>, text: string) {
    const { width } = page.getSize();
    page.drawRectangle({ x: 0, y: page.getHeight() - 26, width, height: 26, color: rgb(colors.GREEN_R, colors.GREEN_G, colors.GREEN_B) });
    page.drawRectangle({ x: 0, y: page.getHeight() - 27.5, width, height: 1.5, color: rgb(colors.GOLD_R, colors.GOLD_G, colors.GOLD_B) });
    page.drawText(text.toUpperCase(), {
      x: 18,
      y: page.getHeight() - 17,
      size: 10,
      font: labelFont,
      color: rgb(1, 1, 1),
    });
  }

  if (!url) {
    const page = finalPdf.addPage(A4);
    drawLabelBanner(page, label);
    page.drawText('This document has not been uploaded yet.', { x: 30, y: A4[1] - 70, size: 11, font: labelFont });
    return;
  }

  try {
    // Fetch via a server-side proxy to avoid CORS restrictions on Supabase
    // storage URLs when the request comes from a browser on the Netlify domain.
    // Falls back to a direct fetch so local dev (vite dev, no proxy) still works.
    const token = sessionStorage.getItem('admin_token') ?? '';
    const proxyUrl = `/.netlify/functions/proxy-doc?url=${encodeURIComponent(url)}`;
    let res: Response | null = null;
    try {
      res = await fetch(proxyUrl, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // Proxy not available (local dev) — will try direct fetch below
    }
    if (!res || !res.ok) {
      res = await fetch(url);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') ?? '';
    const bytes = await res.arrayBuffer();
    const ext = (url.split('?')[0].split('.').pop() ?? '').toLowerCase();
    // Prefer the server-reported content type over the URL's file extension —
    // the extension comes from whatever name the uploader's device gave the
    // file and doesn't always match the actual bytes.
    const isPdf = contentType.includes('pdf') || (!contentType && ext === 'pdf');

    let embedded = false;

    if (isPdf) {
      try {
        const srcPdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const copiedPages = await finalPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach((p, i) => {
          finalPdf.addPage(p);
          if (i === 0) drawLabelBanner(p, label);
        });
        embedded = true;
      } catch {
        // PDF parse failed — bytes are probably an image with a wrong/missing
        // content-type header. Fall through and try image embedding below.
      }
    }

    if (!embedded) {
      // Try direct JPEG embed, then PNG, then canvas-convert (handles HEIC /
      // WebP / any other format the browser can decode natively).
      let image;

      try { image = await finalPdf.embedJpg(bytes); } catch { /* not JPEG */ }

      if (!image) {
        try { image = await finalPdf.embedPng(bytes); } catch { /* not PNG */ }
      }

      if (!image) {
        // Canvas path: let the browser decode the file (covers HEIC on
        // iOS/macOS, WebP, etc.) then re-encode to JPEG for pdf-lib.
        const blob = new Blob([bytes], { type: contentType || 'image/jpeg' });
        const blobUrl = URL.createObjectURL(blob);
        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error('Browser could not decode image'));
            el.src = blobUrl;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d')!.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const b64 = dataUrl.split(',')[1];
          const jpegBuf = Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
          image = await finalPdf.embedJpg(jpegBuf);
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      }

      const page = finalPdf.addPage(A4);
      const margin = 30;
      const topOffset = 40;
      const maxW = A4[0] - margin * 2;
      const maxH = A4[1] - margin - topOffset;
      const scale = Math.min(maxW / image!.width, maxH / image!.height, 1);
      const w = image!.width * scale;
      const h = image!.height * scale;
      page.drawImage(image!, { x: (A4[0] - w) / 2, y: (A4[1] - topOffset - h) / 2, width: w, height: h });
      drawLabelBanner(page, label);
    }
  } catch (err) {
    // Document couldn't be fetched/embedded (e.g. an unsupported image format
    // like HEIC/WEBP, or a network error) — add a fallback page noting the
    // issue and a direct link, instead of silently dropping it.
    console.error(`Failed to embed document "${label}":`, err);
    const page = finalPdf.addPage(A4);
    drawLabelBanner(page, label);
    page.drawText('This document could not be embedded automatically.', { x: 30, y: A4[1] - 70, size: 11, font: labelFont, color: rgb(0.1, 0.1, 0.1) });
    page.drawText('The file may be in HEIC format. Please re-upload as JPEG or PDF.', { x: 30, y: A4[1] - 86, size: 9, font: labelFont, color: rgb(0.5, 0.5, 0.5) });
    page.drawText('Tap / click to open the document directly:', { x: 30, y: A4[1] - 108, size: 10, font: labelFont, color: rgb(0.1, 0.1, 0.1) });
    // Truncate URL for display only — the annotation carries the full URL
    const displayUrl = url.length > 90 ? url.slice(0, 87) + '…' : url;
    page.drawText(displayUrl, { x: 30, y: A4[1] - 124, size: 8, font: labelFont, color: rgb(colors.GREEN_R, colors.GREEN_G, colors.GREEN_B) });
    // Clickable hyperlink annotation over the URL text
    const linkAnnot = finalPdf.context.obj({
      Type: 'Annot', Subtype: 'Link',
      Rect: [30, A4[1] - 132, A4[0] - 30, A4[1] - 114],
      Border: [0, 0, 0],
      A: finalPdf.context.obj({ Type: 'Action', S: 'URI', URI: PDFString.of(url) }),
    });
    page.node.set(PDFName.of('Annots'), finalPdf.context.obj([linkAnnot]));
  }
}

type DocField = 'doc_photo' | 'doc_passport' | 'doc_id' | 'doc_drivers_licence' | 'doc_criminal_record' | 'doc_h2a_visas';

// HEIC/HEIF excluded — pdf-lib cannot embed them and most Windows browsers
// lack the codec to canvas-convert them. Accepted: JPEG, PNG, PDF only.
const ACCEPTED_IMAGES = 'image/jpeg,image/png';
const ACCEPTED_DOCS = `application/pdf,${ACCEPTED_IMAGES}`;

const DOC_TYPES: { label: string; field: DocField; folder: string; accept: string }[] = [
  { label: 'Head & Shoulder Photo', field: 'doc_photo', folder: 'photo', accept: ACCEPTED_IMAGES },
  { label: 'Passport Copy', field: 'doc_passport', folder: 'passport', accept: ACCEPTED_DOCS },
  { label: 'ID Document', field: 'doc_id', folder: 'id', accept: ACCEPTED_DOCS },
  { label: "Driver's Licence", field: 'doc_drivers_licence', folder: 'drivers-licence', accept: ACCEPTED_DOCS },
  { label: 'SAPS Criminal Record Check', field: 'doc_criminal_record', folder: 'criminal-record', accept: ACCEPTED_DOCS },
];

async function uploadDocForCandidate(
  candidateId: string,
  folder: string,
  field: DocField,
  file: File,
  multi = false,
): Promise<string> {
  const token = sessionStorage.getItem('admin_token') ?? '';

  const signRes = await fetch('/.netlify/functions/admin-upload-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'sign', candidateId, folder, filename: file.name }),
  });
  if (!signRes.ok) throw new Error((await signRes.json().catch(() => null))?.error ?? 'Failed to get upload URL');
  const { path, token: uploadToken } = await signRes.json();

  const { error: uploadError } = await supabase.storage
    .from('candidate-documents')
    .uploadToSignedUrl(path, uploadToken, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('candidate-documents').getPublicUrl(path);

  const commitRes = await fetch('/.netlify/functions/admin-upload-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'commit', candidateId, field, url: data.publicUrl, multi }),
  });
  if (!commitRes.ok) throw new Error((await commitRes.json().catch(() => null))?.error ?? 'Failed to save document reference');
  const { value } = await commitRes.json();
  return value as string;
}

function CandidateDetail({ c, onBack, onUpdate }: { c: Candidate; onBack: () => void; onUpdate: (updated: Candidate) => void }) {
  const h2aUrls = c.doc_h2a_visas ? c.doc_h2a_visas.split(',') : [];
  const [exporting, setExporting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  async function handleExport() {
    setExporting(true);
    try { await exportToPdf(c); } finally { setExporting(false); }
  }

  async function handleUpload(folder: string, field: DocField, file: File, multi = false) {
    setUploadingField(field);
    setUploadError('');
    try {
      const newValue = await uploadDocForCandidate(c.id, folder, field, file, multi);
      onUpdate({ ...c, [field]: newValue });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingField(null);
    }
  }

  return (
    <div className="candidate-detail">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={onBack}>← Back to list</button>
        <button className="export-pdf-btn" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Generating…' : 'Export to PDF ↓'}
        </button>
      </div>

      <div className="detail-header">
        <div className="detail-avatar">{(c.first_name?.[0] ?? '?').toUpperCase()}</div>
        <div>
          <h2 className="detail-name">{c.first_name} {c.last_name}</h2>
          <p className="detail-meta">{c.email} · Registered {new Date(c.created_at).toLocaleDateString('en-ZA')}</p>
        </div>
      </div>

      <Section title="Personal Information">
        <Field label="First Name" value={c.first_name} />
        <Field label="Last Name" value={c.last_name} />
        <Field label="Email" value={c.email} />
        <Field label="Contact Number" value={c.contact_number} />
        <Field label="ID Number" value={c.id_number} />
        <Field label="Age" value={c.age} />
        <Field label="Date of Birth" value={c.date_of_birth} />
        <Field label="Physical Address" value={c.physical_address} />
        <Field label="Driver's Licence Code" value={c.driver_license_code} />
        <Field label="Social Security Number" value={c.social_security_number} />
      </Section>

      <Section title="Lifestyle & Health">
        <Field label="Smoking" value={c.smoking} />
        <Field label="Alcohol" value={c.alcohol} />
        <Field label="English Proficient" value={c.english_proficient} />
        <Field label="Health Issues" value={c.health_issues} />
        <Field label="Criminal Record" value={c.criminal_record} />
      </Section>

      <Section title="Family Information">
        <Field label="Marital Status" value={c.marital_status} />
        <Field label="USA Relatives" value={c.usa_relatives} />
        <Field label="Spouse Name" value={c.spouse_name} />
        <Field label="Spouse Contact" value={c.spouse_contact} />
        <Field label="Spouse Email" value={c.spouse_email} />
        <Field label="Spouse DOB" value={c.spouse_dob} />
        <Field label="Date of Marriage" value={c.date_of_marriage} />
      </Section>

      <Section title="Next of Kin">
        <Field label="Full Name" value={c.nok_name} />
        <Field label="Relationship" value={c.nok_relationship} />
        <Field label="Contact Number" value={c.nok_contact} />
        <Field label="Email" value={c.nok_email} />
        <Field label="Physical Address" value={c.nok_address} />
      </Section>

      <Section title="Passport & Visa">
        <Field label="Passport Number" value={c.passport_number} />
        <Field label="Passport Issued" value={c.passport_issued} />
        <Field label="Passport Expiry" value={c.passport_expiry} />
        <Field label="Previous Visa Application" value={c.previous_visa_application} />
        <Field label="Visa Outcome" value={c.visa_outcome} />
      </Section>

      <Section title="Education & Employment">
        <Field label="Highest School Education" value={c.highest_education} />
        <Field label="Tertiary Education" value={c.tertiary_education} />
        <Field label="Current Employer" value={c.current_employer} />
        <Field label="Current Start Date" value={c.current_start_date} />
        <Field label="Current Contact Person" value={c.current_contact_person} />
        <Field label="Current Job Duties" value={c.current_job_duties} />
        <Field label="Previous Employer" value={c.previous_employer} />
        <Field label="Previous Start Date" value={c.previous_start_date} />
        <Field label="Previous End Date" value={c.previous_end_date} />
        <Field label="Previous Contact Person" value={c.previous_contact_person} />
        <Field label="Previous Job Duties" value={c.previous_job_duties} />
      </Section>

      <Section title="Equipment & Machinery Experience">
        <Field label="Tractors" value={c.tractors} />
        <Field label="Combines / Harvesters" value={c.combines} />
        <Field label="Tillage / Cultivation" value={c.tillage_cultivation} />
        <Field label="Silage / Haymaking" value={c.silage_haymaking} />
        <Field label="Sprayers" value={c.sprayers} />
        <Field label="Other Farm Equipment" value={c.other_farm_equipment} />
        <Field label="Earthmoving Equipment" value={c.earthmoving} />
        <Field label="Trucks" value={c.trucks} />
      </Section>

      <Section title="Additional Skills">
        <Field label="Other Skills" value={c.other_skills} />
        <Field label="Mechanical Skills" value={c.mechanical_skills} />
        <Field label="Livestock Farming" value={c.livestock_farming} />
        <Field label="Crop Farming" value={c.crop_farming} />
        <Field label="Irrigation Farming" value={c.irrigation_farming} />
      </Section>

      <Section title="Uploaded Documents">
        <DocLink label="Head & Shoulder Photo" url={c.doc_photo} />
        <DocLink label="Passport Copy" url={c.doc_passport} />
        <DocLink label="ID Document" url={c.doc_id} />
        <DocLink label="Driver's Licence" url={c.doc_drivers_licence} />
        {h2aUrls.map((url, i) => (
          <DocLink key={i} label={`H-2A Visa ${i + 1}`} url={url.trim()} />
        ))}
        <DocLink label="SAPS Criminal Record Check" url={c.doc_criminal_record} />
      </Section>

      <Section title="Other Qualifications">
        {parseQualifications(c.other_qualifications).length === 0 ? (
          <span className="detail-value" style={{ color: 'var(--text-light)' }}>None uploaded.</span>
        ) : (
          parseQualifications(c.other_qualifications).map((q, i) => (
            <DocLink key={i} label={q.title} url={q.url} />
          ))
        )}
      </Section>

      <div className="detail-section">
        <h3 className="detail-section-title">Upload Documents (Admin)</h3>
        {uploadError && <div className="admin-upload-error">{uploadError}</div>}
        <div className="admin-upload-grid">
          {DOC_TYPES.map(({ label, field, folder, accept }) => (
            <div key={field} className="admin-upload-item">
              <div className="admin-upload-header">
                <span className="admin-upload-label">{label}</span>
                {c[field] && (
                  <a href={c[field] as string} target="_blank" rel="noopener noreferrer" className="admin-upload-view">
                    View current ↗
                  </a>
                )}
              </div>
              <div className={`admin-upload-status ${c[field] ? 'uploaded' : 'missing'}`}>
                {c[field] ? '✓ Uploaded' : '✗ Not uploaded'}
              </div>
              <label className="admin-upload-btn">
                {uploadingField === field ? 'Uploading…' : c[field] ? 'Replace file' : 'Upload file'}
                <input
                  type="file"
                  accept={accept}
                  style={{ display: 'none' }}
                  disabled={uploadingField !== null}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(folder, field, file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          ))}

          <div className="admin-upload-item">
            <div className="admin-upload-header">
              <span className="admin-upload-label">H-2A Visa Copies</span>
              {h2aUrls.length > 0 && <span className="admin-upload-count">{h2aUrls.length} file(s)</span>}
            </div>
            <div className={`admin-upload-status ${h2aUrls.length ? 'uploaded' : 'missing'}`}>
              {h2aUrls.length ? '✓ Uploaded' : '✗ Not uploaded'}
            </div>
            <label className="admin-upload-btn">
              {uploadingField === 'doc_h2a_visas' ? 'Uploading…' : 'Add visa file'}
              <input
                type="file"
                accept={ACCEPTED_DOCS}
                style={{ display: 'none' }}
                disabled={uploadingField !== null}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload('h2a-visas', 'doc_h2a_visas', file, true);
                  e.target.value = '';
                }}
              />
            </label>
            <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>JPEG, PNG or PDF only — no HEIC/iPhone photos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Candidate | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN ?? 'ns-admin-secret-2024';
    if (!token || token !== ADMIN_TOKEN) { navigate('/admin'); return; }

    supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { setError('Failed to load candidates: ' + error.message); }
        else setCandidates(data ?? []);
        setLoading(false);
      });
  }, [navigate]);

  const handleSignOut = () => {
    sessionStorage.removeItem('admin_token');
    window.location.href = '/';
  };

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.id_number?.toLowerCase().includes(q) ||
      c.contact_number?.includes(q)
    );
  });

  if (selected) {
    return (
      <div className="admin-layout">
        <header className="admin-header">
          <span className="admin-brand">NS Pinnacle Recruit — Admin</span>
          <button className="admin-signout" onClick={handleSignOut}>Sign Out</button>
        </header>
        <main className="admin-main">
          <CandidateDetail
            c={selected}
            onBack={() => setSelected(null)}
            onUpdate={updated => {
              setSelected(updated);
              setCandidates(prev => prev.map(x => (x.id === updated.id ? updated : x)));
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <span className="admin-brand">NS Pinnacle Recruit — Management Portal</span>
        <button className="admin-signout" onClick={handleSignOut}>Sign Out</button>
      </header>

      <main className="admin-main">
        <div className="admin-toolbar">
          <h1 className="admin-page-title">
            Registered Candidates
            {!loading && <span className="candidate-count">{candidates.length}</span>}
          </h1>
          <input
            className="admin-search"
            type="text"
            placeholder="Search by name, email, ID or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="admin-error">{error}</div>}

        {loading ? (
          <div className="admin-loading">Loading candidates…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">{search ? 'No candidates match your search.' : 'No candidates registered yet.'}</div>
        ) : (
          <div className="candidates-table-wrap">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>ID Number</th>
                  <th>Passport</th>
                  <th>Registered</th>
                  <th>Docs</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const docCount = [
                    c.doc_photo, c.doc_passport, c.doc_id,
                    c.doc_drivers_licence, c.doc_criminal_record,
                  ].filter(Boolean).length + (c.doc_h2a_visas ? c.doc_h2a_visas.split(',').length : 0);

                  return (
                    <tr key={c.id} onClick={() => setSelected(c)} className="candidate-row">
                      <td className="td-num">{i + 1}</td>
                      <td className="td-name">
                        <div className="row-avatar">{(c.first_name?.[0] ?? '?').toUpperCase()}</div>
                        <span>{c.first_name} {c.last_name}</span>
                        {!c.is_complete && (
                          <span className="incomplete-badge" title="This profile is incomplete and will not be considered">Incomplete</span>
                        )}
                      </td>
                      <td>{c.email}</td>
                      <td>{c.contact_number}</td>
                      <td>{c.id_number}</td>
                      <td>{c.passport_number}</td>
                      <td>{c.created_at ? new Date(c.created_at).toLocaleDateString('en-ZA') : '—'}</td>
                      <td>
                        <span className={`doc-badge ${docCount >= 3 ? 'doc-badge-ok' : 'doc-badge-warn'}`}>
                          {docCount} file{docCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td><button className="view-btn" onClick={e => { e.stopPropagation(); setSelected(c); }}>View →</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

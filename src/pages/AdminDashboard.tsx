import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
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
  is_complete: boolean;
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
    let col = 0;
    let rowY = y;

    for (const f of filled) {
      checkPage(12);
      const x = margin + col * colW;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...hexToRgb(GREY));
      doc.text(f.label.toUpperCase(), x, rowY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(34, 34, 34);
      const lines = doc.splitTextToSize(f.value!, colW - 4);
      doc.text(lines, x, rowY + 9);

      if (col === 1 || filled.indexOf(f) === filled.length - 1) {
        const lineH = Math.max(lines.length, 1) * 4.5;
        rowY += 13 + (lineH > 4.5 ? lineH - 4.5 : 0);
        col = 0;
      } else {
        col = 1;
      }
    }
    y = rowY + 4;

    doc.setDrawColor(...hexToRgb(LINE));
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  }

  function drawDocuments() {
    drawSectionTitle('Uploaded Documents');
    const docs: { label: string; url: string | undefined }[] = [
      { label: 'Head & Shoulder Photo', url: c.doc_photo },
      { label: 'Passport Copy', url: c.doc_passport },
      { label: 'ID Document', url: c.doc_id },
      { label: "Driver's Licence", url: c.doc_drivers_licence },
      { label: 'SAPS Criminal Record Check', url: c.doc_criminal_record },
    ];
    const h2a = c.doc_h2a_visas
      ? c.doc_h2a_visas.split(',').map((u, i) => ({ label: `H-2A Visa ${i + 1}`, url: u.trim() }))
      : [];
    [...docs, ...h2a].filter(d => d.url).forEach(d => {
      checkPage(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...hexToRgb(GREY));
      doc.text(d.label.toUpperCase(), margin, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...hexToRgb(GREEN));
      const urlLines = doc.splitTextToSize(d.url!, pageW - margin * 2 - 2);
      doc.text(urlLines, margin, y + 9);
      y += 14 + (urlLines.length - 1) * 4;
    });
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

  drawDocuments();
  drawFooter();

  doc.save(`NS-Pinnacle-${c.first_name}-${c.last_name}.pdf`);
}

function CandidateDetail({ c, onBack }: { c: Candidate; onBack: () => void }) {
  const h2aUrls = c.doc_h2a_visas ? c.doc_h2a_visas.split(',') : [];
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try { await exportToPdf(c); } finally { setExporting(false); }
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
          <CandidateDetail c={selected} onBack={() => setSelected(null)} />
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

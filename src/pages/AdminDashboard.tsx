import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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

function CandidateDetail({ c, onBack }: { c: Candidate; onBack: () => void }) {
  const h2aUrls = c.doc_h2a_visas ? c.doc_h2a_visas.split(',') : [];

  return (
    <div className="candidate-detail">
      <button className="back-btn" onClick={onBack}>← Back to list</button>

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
    navigate('/admin');
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
                      <td><button className="view-btn">View →</button></td>
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

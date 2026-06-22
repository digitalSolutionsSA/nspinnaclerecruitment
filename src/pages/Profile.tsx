import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

interface ProfileData {
  first_name: string; last_name: string; email: string; id_number: string;
  age: string; date_of_birth: string; physical_address: string; contact_number: string;
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
}

const empty: ProfileData = {
  first_name: '', last_name: '', email: '', id_number: '', age: '',
  date_of_birth: '', physical_address: '', contact_number: '',
  driver_license_code: '', social_security_number: '',
  smoking: '', alcohol: '', english_proficient: '',
  health_issues: '', criminal_record: '',
  marital_status: '', spouse_name: '', spouse_contact: '',
  spouse_email: '', spouse_dob: '', date_of_marriage: '', usa_relatives: '',
  nok_name: '', nok_relationship: '', nok_contact: '', nok_email: '', nok_address: '',
  passport_number: '', passport_issued: '', passport_expiry: '',
  previous_visa_application: '', visa_outcome: '',
  highest_education: '', tertiary_education: '',
  current_employer: '', current_start_date: '', current_contact_person: '', current_job_duties: '',
  previous_employer: '', previous_start_date: '', previous_end_date: '',
  previous_contact_person: '', previous_job_duties: '',
  tractors: '', combines: '', tillage_cultivation: '', silage_haymaking: '',
  sprayers: '', other_farm_equipment: '', earthmoving: '', trucks: '',
  other_skills: '', mechanical_skills: '', livestock_farming: '',
  crop_farming: '', irrigation_farming: '',
};

const TABS = ['Personal', 'Lifestyle', 'Family', 'Passport & Visa', 'Employment', 'Equipment', 'Skills', 'Documents'];

interface DocUrls {
  doc_photo: string; doc_passport: string; doc_id: string;
  doc_drivers_licence: string; doc_h2a_visas: string; doc_criminal_record: string;
}

const emptyDocs: DocUrls = {
  doc_photo: '', doc_passport: '', doc_id: '',
  doc_drivers_licence: '', doc_h2a_visas: '', doc_criminal_record: '',
};

async function uploadDoc(userId: string, folder: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('candidate-documents').upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from('candidate-documents').getPublicUrl(path);
  return data.publicUrl;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>(empty);
  const [docUrls, setDocUrls] = useState<DocUrls>(emptyDocs);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', user!.id)
      .single();

    if (data) {
      setProfile({ ...empty, ...data });
      setDocUrls({
        doc_photo: data.doc_photo || '',
        doc_passport: data.doc_passport || '',
        doc_id: data.doc_id || '',
        doc_drivers_licence: data.doc_drivers_licence || '',
        doc_h2a_visas: data.doc_h2a_visas || '',
        doc_criminal_record: data.doc_criminal_record || '',
      });
    }
    if (error && error.code !== 'PGRST116') setError('Failed to load profile.');
    setLoading(false);
  };

  const set = (field: keyof ProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setProfile(prev => ({ ...prev, [field]: e.target.value }));

  const radio = (field: keyof ProfileData, value: string) => ({
    type: 'radio' as const,
    name: field,
    value,
    checked: profile[field] === value,
    onChange: () => setProfile(prev => ({ ...prev, [field]: value })),
  });

  const handleDocUpload = async (
    folder: string,
    field: keyof DocUrls,
    file: File,
    multi = false
  ) => {
    setUploadingDoc(field);
    const url = await uploadDoc(user!.id, folder, file);
    if (!url) { setUploadingDoc(null); setError('Upload failed. Try again.'); return; }

    let newValue = url;
    if (multi && docUrls[field]) {
      newValue = docUrls[field] + ',' + url;
    }

    setDocUrls(prev => ({ ...prev, [field]: newValue }));
    await supabase.from('candidates').update({ [field]: newValue }).eq('id', user!.id);
    setUploadingDoc(null);
    setSaveMsg('Document uploaded!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaveMsg('');

    const { error } = await supabase
      .from('candidates')
      .upsert({ id: user!.id, ...profile }, { onConflict: 'id' });

    setSaving(false);
    if (error) {
      setError('Failed to save. Please try again.');
    } else {
      setSaveMsg('Profile saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
      // Notify management of profile update (fire-and-forget)
      fetch('/.netlify/functions/notify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _type: 'profile-update', ...profile, ...docUrls }),
      }).catch(() => {});
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Loading your profile...</div>
      </main>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || user?.email || 'Candidate';

  return (
    <main className="profile-page">
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>My Profile</h1>
          <p>View and update your application information</p>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-header-bar">
          <div className="profile-avatar-info">
            <div className="profile-avatar">{fullName.charAt(0).toUpperCase()}</div>
            <div>
              <div className="profile-name">{fullName}</div>
              <div className="profile-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn-signout" onClick={handleSignOut}>Sign Out</button>
        </div>

        {error && <div className="profile-error">{error}</div>}

        <div className="profile-tabs">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="profile-form">

          {/* TAB 0: Personal */}
          {activeTab === 0 && (
            <div className="form-section">
              <h3 className="form-section-title">Personal Information</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" value={profile.first_name} onChange={set('first_name')} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={profile.last_name} onChange={set('last_name')} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={profile.email} onChange={set('email')} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="tel" value={profile.contact_number} onChange={set('contact_number')} />
                </div>
                <div className="form-group">
                  <label>ID Number</label>
                  <input type="text" value={profile.id_number} onChange={set('id_number')} />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" value={profile.age} onChange={set('age')} min="18" max="65" />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={profile.date_of_birth} onChange={set('date_of_birth')} />
                </div>
                <div className="form-group">
                  <label>Driver's Licence Code</label>
                  <input type="text" value={profile.driver_license_code} onChange={set('driver_license_code')} />
                </div>
                <div className="form-group form-group-full">
                  <label>Physical Address</label>
                  <input type="text" value={profile.physical_address} onChange={set('physical_address')} />
                </div>
                <div className="form-group">
                  <label>Social Security Number (if applicable)</label>
                  <input type="text" value={profile.social_security_number} onChange={set('social_security_number')} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Lifestyle */}
          {activeTab === 1 && (
            <div className="form-section">
              <h3 className="form-section-title">Lifestyle &amp; Health</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Do you smoke?</label>
                  <div className="radio-group">
                    <label><input {...radio('smoking', 'yes')} /> Yes</label>
                    <label><input {...radio('smoking', 'no')} /> No</label>
                    <label><input {...radio('smoking', 'vape')} /> Vape</label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Do you consume alcohol?</label>
                  <div className="radio-group">
                    <label><input {...radio('alcohol', 'yes')} /> Yes</label>
                    <label><input {...radio('alcohol', 'no')} /> No</label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Are you proficient in English?</label>
                  <div className="radio-group">
                    <label><input {...radio('english_proficient', 'yes')} /> Yes</label>
                    <label><input {...radio('english_proficient', 'no')} /> No</label>
                  </div>
                </div>
              </div>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Health Issues (if any)</label>
                  <textarea value={profile.health_issues} onChange={set('health_issues')} rows={3} />
                </div>
                <div className="form-group">
                  <label>Criminal Record (if any)</label>
                  <textarea value={profile.criminal_record} onChange={set('criminal_record')} rows={3} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Family */}
          {activeTab === 2 && (
            <div className="form-section">
              <h3 className="form-section-title">Family Information</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Marital Status</label>
                  <div className="radio-group">
                    {['Single', 'Married', 'Divorced', 'Widowed'].map(s => (
                      <label key={s}><input {...radio('marital_status', s.toLowerCase())} /> {s}</label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Do you have relatives in the USA?</label>
                  <div className="radio-group">
                    <label><input {...radio('usa_relatives', 'yes')} /> Yes</label>
                    <label><input {...radio('usa_relatives', 'no')} /> No</label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Spouse Name &amp; Surname</label>
                  <input type="text" value={profile.spouse_name} onChange={set('spouse_name')} />
                </div>
                <div className="form-group">
                  <label>Spouse Contact Number</label>
                  <input type="tel" value={profile.spouse_contact} onChange={set('spouse_contact')} />
                </div>
                <div className="form-group">
                  <label>Spouse Email Address</label>
                  <input type="email" value={profile.spouse_email} onChange={set('spouse_email')} />
                </div>
                <div className="form-group">
                  <label>Spouse Date of Birth</label>
                  <input type="date" value={profile.spouse_dob} onChange={set('spouse_dob')} />
                </div>
                <div className="form-group">
                  <label>Date of Marriage</label>
                  <input type="date" value={profile.date_of_marriage} onChange={set('date_of_marriage')} />
                </div>
              </div>

              <h3 className="form-section-title" style={{ marginTop: '2rem' }}>Next of Kin</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={profile.nok_name} onChange={set('nok_name')} />
                </div>
                <div className="form-group">
                  <label>Relationship</label>
                  <input type="text" value={profile.nok_relationship} onChange={set('nok_relationship')} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="tel" value={profile.nok_contact} onChange={set('nok_contact')} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={profile.nok_email} onChange={set('nok_email')} />
                </div>
                <div className="form-group form-group-full">
                  <label>Physical Address</label>
                  <input type="text" value={profile.nok_address} onChange={set('nok_address')} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Passport & Visa */}
          {activeTab === 3 && (
            <div className="form-section">
              <h3 className="form-section-title">Passport &amp; Visa Information</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Passport Number</label>
                  <input type="text" value={profile.passport_number} onChange={set('passport_number')} />
                </div>
                <div className="form-group">
                  <label>Passport Date Issued</label>
                  <input type="date" value={profile.passport_issued} onChange={set('passport_issued')} />
                </div>
                <div className="form-group">
                  <label>Passport Expiry Date</label>
                  <input type="date" value={profile.passport_expiry} onChange={set('passport_expiry')} />
                </div>
              </div>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Previous USA Visa Application Details</label>
                  <textarea value={profile.previous_visa_application} onChange={set('previous_visa_application')} rows={3} />
                </div>
                <div className="form-group">
                  <label>Visa Application Outcome</label>
                  <div className="radio-group">
                    <label><input {...radio('visa_outcome', 'approved')} /> Approved</label>
                    <label><input {...radio('visa_outcome', 'denied')} /> Denied</label>
                    <label><input {...radio('visa_outcome', 'na')} /> N/A</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Employment */}
          {activeTab === 4 && (
            <div className="form-section">
              <h3 className="form-section-title">Education &amp; Employment History</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Highest School Education</label>
                  <input type="text" value={profile.highest_education} onChange={set('highest_education')} />
                </div>
                <div className="form-group">
                  <label>Tertiary / Further Education</label>
                  <input type="text" value={profile.tertiary_education} onChange={set('tertiary_education')} />
                </div>
              </div>

              <h4 className="form-sub-title">Current Employment</h4>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Current Employer</label>
                  <input type="text" value={profile.current_employer} onChange={set('current_employer')} />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={profile.current_start_date} onChange={set('current_start_date')} />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" value={profile.current_contact_person} onChange={set('current_contact_person')} />
                </div>
              </div>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Current Job Duties</label>
                  <textarea value={profile.current_job_duties} onChange={set('current_job_duties')} rows={3} />
                </div>
              </div>

              <h4 className="form-sub-title">Previous Employment</h4>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Previous Employer</label>
                  <input type="text" value={profile.previous_employer} onChange={set('previous_employer')} />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={profile.previous_start_date} onChange={set('previous_start_date')} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={profile.previous_end_date} onChange={set('previous_end_date')} />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" value={profile.previous_contact_person} onChange={set('previous_contact_person')} />
                </div>
              </div>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Previous Job Duties</label>
                  <textarea value={profile.previous_job_duties} onChange={set('previous_job_duties')} rows={3} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Equipment */}
          {activeTab === 5 && (
            <div className="form-section">
              <h3 className="form-section-title">Equipment &amp; Machinery Experience</h3>
              <p className="form-hint">List specific makes/models you have operated. Leave blank if not applicable.</p>
              <div className="form-grid form-grid-2">
                {([
                  ['tractors', 'Tractors Operated'],
                  ['combines', 'Combines / Harvesting Machines'],
                  ['tillage_cultivation', 'Tillage / Cultivation Equipment'],
                  ['silage_haymaking', 'Silage / Haymaking Equipment'],
                  ['sprayers', 'Sprayers'],
                  ['other_farm_equipment', 'Other Farm Equipment'],
                  ['earthmoving', 'Earthmoving Equipment'],
                  ['trucks', 'Trucks'],
                ] as [keyof ProfileData, string][]).map(([field, label]) => (
                  <div key={field} className="form-group">
                    <label>{label}</label>
                    <textarea value={profile[field]} onChange={set(field)} rows={2} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Skills */}
          {activeTab === 6 && (
            <div className="form-section">
              <h3 className="form-section-title">Additional Skills</h3>
              <div className="form-grid form-grid-2">
                {([
                  ['other_skills', 'Other Skills'],
                  ['mechanical_skills', 'Mechanical Skills'],
                  ['livestock_farming', 'Livestock Farming Experience'],
                  ['crop_farming', 'Crop Farming Experience'],
                  ['irrigation_farming', 'Irrigation Farming Experience'],
                ] as [keyof ProfileData, string][]).map(([field, label]) => (
                  <div key={field} className="form-group">
                    <label>{label}</label>
                    <textarea value={profile[field]} onChange={set(field)} rows={3} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Documents */}
          {activeTab === 7 && (
            <div className="form-section">
              <h3 className="form-section-title">Document Uploads</h3>
              <p className="form-hint">Upload or replace your documents below. Accepted formats: PDF, JPG, PNG.</p>
              <div className="doc-upload-grid">
                {([
                  { label: 'Head & Shoulder Photo', field: 'doc_photo' as keyof DocUrls, folder: 'photo', accept: 'image/*', required: true },
                  { label: 'Passport Copy', field: 'doc_passport' as keyof DocUrls, folder: 'passport', accept: '.pdf,image/*', required: true },
                  { label: 'ID Document', field: 'doc_id' as keyof DocUrls, folder: 'id', accept: '.pdf,image/*', required: true },
                  { label: "Commercial Driver's Licence", field: 'doc_drivers_licence' as keyof DocUrls, folder: 'drivers-licence', accept: '.pdf,image/*', required: false },
                  { label: 'SAPS Criminal Record Check', field: 'doc_criminal_record' as keyof DocUrls, folder: 'criminal-record', accept: '.pdf,image/*', required: true },
                ]).map(({ label, field, folder, accept, required }) => (
                  <div key={field} className="doc-upload-item">
                    <div className="doc-upload-header">
                      <span className="doc-label">{label}{required && ' *'}</span>
                      {docUrls[field] && (
                        <a href={docUrls[field]} target="_blank" rel="noopener noreferrer" className="doc-view-link">
                          View current ↗
                        </a>
                      )}
                    </div>
                    <div className={`doc-status ${docUrls[field] ? 'uploaded' : 'missing'}`}>
                      {docUrls[field] ? '✓ Uploaded' : '✗ Not uploaded'}
                    </div>
                    <label className="doc-upload-btn">
                      {uploadingDoc === field ? 'Uploading...' : docUrls[field] ? 'Replace file' : 'Upload file'}
                      <input
                        type="file"
                        accept={accept}
                        style={{ display: 'none' }}
                        disabled={uploadingDoc !== null}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleDocUpload(folder, field, file);
                        }}
                      />
                    </label>
                  </div>
                ))}

                {/* H-2A visas — multiple files */}
                <div className="doc-upload-item">
                  <div className="doc-upload-header">
                    <span className="doc-label">Previous H-2A Visa Copies</span>
                    {docUrls.doc_h2a_visas && (
                      <span className="doc-count">
                        {docUrls.doc_h2a_visas.split(',').length} file(s) uploaded
                      </span>
                    )}
                  </div>
                  <div className={`doc-status ${docUrls.doc_h2a_visas ? 'uploaded' : 'missing'}`}>
                    {docUrls.doc_h2a_visas ? '✓ Uploaded' : '✗ Not uploaded'}
                  </div>
                  {docUrls.doc_h2a_visas && (
                    <div className="doc-links">
                      {docUrls.doc_h2a_visas.split(',').map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="doc-view-link">
                          File {i + 1} ↗
                        </a>
                      ))}
                    </div>
                  )}
                  <label className="doc-upload-btn">
                    {uploadingDoc === 'doc_h2a_visas' ? 'Uploading...' : 'Add visa file'}
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      style={{ display: 'none' }}
                      disabled={uploadingDoc !== null}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleDocUpload('h2a-visas', 'doc_h2a_visas', file, true);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="profile-save-bar">
            {saveMsg && <span className="save-success">{saveMsg}</span>}
            {error && <span className="save-error">{error}</span>}
            <div className="save-nav">
              {activeTab > 0 && (
                <button type="button" className="btn-nav" onClick={() => setActiveTab(t => t - 1)}>
                  ← Previous
                </button>
              )}
              {activeTab < TABS.length - 1 && (
                <button type="button" className="btn-nav" onClick={() => setActiveTab(t => t + 1)}>
                  Next →
                </button>
              )}
              {activeTab !== 7 && (
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>

        </form>
      </section>
    </main>
  );
}

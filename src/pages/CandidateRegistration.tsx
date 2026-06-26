import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './CandidateRegistration.css';

interface FormData {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  idNumber: string;
  age: string;
  dateOfBirth: string;
  physicalAddress: string;
  contactNumber: string;
  driverLicenseCode: string;
  socialSecurityNumber: string;
  // Lifestyle
  smoking: string;
  alcohol: string;
  englishProficient: string;
  healthIssues: string;
  criminalRecord: string;
  // Family
  maritalStatus: string;
  spouseName: string;
  spouseContact: string;
  spouseEmail: string;
  spouseDob: string;
  dateOfMarriage: string;
  usaRelatives: string;
  // Next of Kin
  nokName: string;
  nokRelationship: string;
  nokContact: string;
  nokEmail: string;
  nokAddress: string;
  // Passport & Visa
  passportNumber: string;
  passportIssued: string;
  passportExpiry: string;
  previousVisaApplication: string;
  visaOutcome: string;
  // Employment
  highestEducation: string;
  tertiaryEducation: string;
  currentEmployer: string;
  currentStartDate: string;
  currentContactPerson: string;
  currentJobDuties: string;
  previousEmployer: string;
  previousStartDate: string;
  previousEndDate: string;
  previousContactPerson: string;
  previousJobDuties: string;
  // Equipment
  tractors: string;
  combines: string;
  tillageCultivation: string;
  silageHaymaking: string;
  sprayers: string;
  otherFarmEquipment: string;
  earthmoving: string;
  trucks: string;
  // Skills
  otherSkills: string;
  mechanicalSkills: string;
  livestockFarming: string;
  cropFarming: string;
  irrigationFarming: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormData = {
  firstName: '', lastName: '', email: '', idNumber: '', age: '',
  dateOfBirth: '', physicalAddress: '', contactNumber: '',
  driverLicenseCode: '', socialSecurityNumber: '',
  smoking: '', alcohol: '', englishProficient: '', healthIssues: '', criminalRecord: '',
  maritalStatus: '', spouseName: '', spouseContact: '', spouseEmail: '',
  spouseDob: '', dateOfMarriage: '', usaRelatives: '',
  nokName: '', nokRelationship: '', nokContact: '', nokEmail: '', nokAddress: '',
  passportNumber: '', passportIssued: '', passportExpiry: '',
  previousVisaApplication: '', visaOutcome: '',
  highestEducation: '', tertiaryEducation: '',
  currentEmployer: '', currentStartDate: '', currentContactPerson: '', currentJobDuties: '',
  previousEmployer: '', previousStartDate: '', previousEndDate: '',
  previousContactPerson: '', previousJobDuties: '',
  tractors: '', combines: '', tillageCultivation: '', silageHaymaking: '',
  sprayers: '', otherFarmEquipment: '', earthmoving: '', trucks: '',
  otherSkills: '', mechanicalSkills: '', livestockFarming: '', cropFarming: '', irrigationFarming: '',
  password: '', confirmPassword: '',
};

interface DocFiles {
  photo: File | null;
  passport: File | null;
  idDoc: File | null;
  driversLicence: File | null;
  h2aVisas: File[];
  criminalRecord: File | null;
}

const emptyDocs: DocFiles = {
  photo: null, passport: null, idDoc: null,
  driversLicence: null, h2aVisas: [], criminalRecord: null,
};

// Everything beyond the 3 hard-required fields that makes a profile "complete"
function checkCompleteness(form: FormData, docs: DocFiles): string[] {
  const missing: string[] = [];
  if (!form.idNumber) missing.push('ID Number');
  if (!form.dateOfBirth) missing.push('Date of Birth');
  if (!form.physicalAddress) missing.push('Physical Address');
  if (!form.smoking) missing.push('Smoking (Yes / No / Vape)');
  if (!form.alcohol) missing.push('Alcohol consumption (Yes / No)');
  if (!form.englishProficient) missing.push('English Proficiency');
  if (!form.maritalStatus) missing.push('Marital Status');
  if (!form.nokName) missing.push('Next of Kin – Full Name');
  if (!form.nokRelationship) missing.push('Next of Kin – Relationship');
  if (!form.nokContact) missing.push('Next of Kin – Contact Number');
  if (!form.passportNumber) missing.push('Passport Number');
  if (!form.passportIssued) missing.push('Passport Date Issued');
  if (!form.passportExpiry) missing.push('Passport Expiry Date');
  if (!docs.photo) missing.push('Head & Shoulder Photo');
  if (!docs.passport) missing.push('Passport Copy');
  if (!docs.idDoc) missing.push('ID Document');
  if (!docs.criminalRecord) missing.push('SAPS Criminal Record Check');
  return missing;
}

async function uploadFile(userId: string, folder: string, file: File): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('candidate-documents').upload(path, file);
  if (error) return { url: null, error: `${folder}: ${error.message}` };
  const { data } = supabase.storage.from('candidate-documents').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export default function CandidateRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(initialForm);
  const [docs, setDocs] = useState<DocFiles>(emptyDocs);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [incompleteModal, setIncompleteModal] = useState<string[]>([]);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const radio = (field: keyof FormData, value: string) => ({
    type: 'radio' as const,
    name: field,
    value,
    checked: form[field] === value,
    onChange: () => setForm(prev => ({ ...prev, [field]: value })),
  });

  const doSubmit = async (isComplete: boolean) => {
    setError('');
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is enabled, session is null after signUp.
    // Explicitly set it so storage uploads are authenticated.
    if (authData.session) {
      await supabase.auth.setSession(authData.session);
    }

    const userId = authData.user?.id;
    if (userId) {
      const { error: dbError } = await supabase.rpc('insert_candidate_profile', {
        p_id: userId,
        p_first_name: form.firstName, p_last_name: form.lastName,
        p_email: form.email, p_id_number: form.idNumber, p_age: form.age,
        p_date_of_birth: form.dateOfBirth || null, p_physical_address: form.physicalAddress,
        p_contact_number: form.contactNumber, p_driver_license_code: form.driverLicenseCode,
        p_social_security_number: form.socialSecurityNumber,
        p_smoking: form.smoking, p_alcohol: form.alcohol,
        p_english_proficient: form.englishProficient, p_health_issues: form.healthIssues,
        p_criminal_record: form.criminalRecord, p_marital_status: form.maritalStatus,
        p_spouse_name: form.spouseName, p_spouse_contact: form.spouseContact,
        p_spouse_email: form.spouseEmail, p_spouse_dob: form.spouseDob || null,
        p_date_of_marriage: form.dateOfMarriage || null, p_usa_relatives: form.usaRelatives,
        p_nok_name: form.nokName, p_nok_relationship: form.nokRelationship,
        p_nok_contact: form.nokContact, p_nok_email: form.nokEmail, p_nok_address: form.nokAddress,
        p_passport_number: form.passportNumber, p_passport_issued: form.passportIssued || null,
        p_passport_expiry: form.passportExpiry || null,
        p_previous_visa_application: form.previousVisaApplication, p_visa_outcome: form.visaOutcome,
        p_highest_education: form.highestEducation, p_tertiary_education: form.tertiaryEducation,
        p_current_employer: form.currentEmployer, p_current_start_date: form.currentStartDate || null,
        p_current_contact_person: form.currentContactPerson, p_current_job_duties: form.currentJobDuties,
        p_previous_employer: form.previousEmployer, p_previous_start_date: form.previousStartDate || null,
        p_previous_end_date: form.previousEndDate || null,
        p_previous_contact_person: form.previousContactPerson, p_previous_job_duties: form.previousJobDuties,
        p_tractors: form.tractors, p_combines: form.combines,
        p_tillage_cultivation: form.tillageCultivation, p_silage_haymaking: form.silageHaymaking,
        p_sprayers: form.sprayers, p_other_farm_equipment: form.otherFarmEquipment,
        p_earthmoving: form.earthmoving, p_trucks: form.trucks,
        p_other_skills: form.otherSkills, p_mechanical_skills: form.mechanicalSkills,
        p_livestock_farming: form.livestockFarming, p_crop_farming: form.cropFarming,
        p_irrigation_farming: form.irrigationFarming,
        p_is_complete: isComplete,
      });

      if (dbError) {
        setError('Account created but profile save failed: ' + dbError.message);
        setLoading(false);
        return;
      }

      // Upload documents and save URLs
      const docUrls: Record<string, string> = {};
      const uploadErrors: string[] = [];

      const tryUpload = async (key: string, folder: string, file: File) => {
        const result = await uploadFile(userId, folder, file);
        if (result.url) docUrls[key] = result.url;
        else if (result.error) uploadErrors.push(result.error);
      };

      if (docs.photo) await tryUpload('doc_photo', 'photo', docs.photo);
      if (docs.passport) await tryUpload('doc_passport', 'passport', docs.passport);
      if (docs.idDoc) await tryUpload('doc_id', 'id', docs.idDoc);
      if (docs.driversLicence) await tryUpload('doc_drivers_licence', 'drivers-licence', docs.driversLicence);
      if (docs.criminalRecord) await tryUpload('doc_criminal_record', 'criminal-record', docs.criminalRecord);
      if (docs.h2aVisas.length > 0) {
        const urls: string[] = [];
        for (const file of docs.h2aVisas) {
          const result = await uploadFile(userId, 'h2a-visas', file);
          if (result.url) urls.push(result.url);
          else if (result.error) uploadErrors.push(result.error);
        }
        if (urls.length > 0) docUrls.doc_h2a_visas = urls.join(',');
      }

      if (uploadErrors.length > 0) {
        setError('Some documents failed to upload: ' + uploadErrors.join('; ') + '. Please log in and update your profile to re-upload them.');
      }

      if (Object.keys(docUrls).length > 0) {
        const { error: updateError } = await supabase.from('candidates').update(docUrls).eq('id', userId);
        if (updateError) {
          setError(e => (e ? e + ' ' : '') + 'Document URLs could not be saved: ' + updateError.message);
        }
      }

      // Notify management + send welcome email to candidate (fire-and-forget)
      fetch('/.netlify/functions/notify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _type: 'new-registration', ...form, ...docUrls }),
      }).catch(() => {});
    }

    setLoading(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Hard-required: these 3 fields must be present before anything else
    if (!form.firstName || !form.lastName) {
      setError('Please enter your first and last name.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.contactNumber) {
      setError('Please enter your contact number.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const missing = checkCompleteness(form, docs);
    if (missing.length > 0) {
      setIncompleteModal(missing);
      return;
    }

    await doSubmit(true);
  };

  const handleIncompleteConfirm = async () => {
    setIncompleteModal([]);
    await doSubmit(false);
  };

  const handleIncompleteCancel = () => {
    setIncompleteModal([]);
  };

  if (submitted) {
    return (
      <main className="reg-page">
        <div className="reg-success">
          <div className="success-icon">✓</div>
          <h2>Application Submitted!</h2>
          <p>
            Thank you for registering with NS Pinnacle Recruitment. Your personal agent
            will be in contact with you shortly.
          </p>
          <p>
            You can <button className="link-btn-inline" onClick={() => navigate('/login')}>sign in to your profile</button> at any time to view or update your information.
          </p>
          <p>In the meantime, feel free to review our <a href="/faq">FAQ page</a>.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="reg-page">

      {/* Incomplete Profile Warning Modal */}
      {incompleteModal.length > 0 && (
        <div className="incomplete-modal-overlay">
          <div className="incomplete-modal">
            <div className="incomplete-modal-icon">⚠️</div>
            <h2>Your Profile is Incomplete</h2>
            <p>
              The following information and/or documents are still missing from your profile.
              <strong> Your application will not be considered by NS Pinnacle Recruit</strong> until
              every item below has been provided.
            </p>
            <ul className="incomplete-modal-list">
              {incompleteModal.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="incomplete-modal-question">
              You may save your profile now and log back in later to complete it — but please be
              aware that it will remain inactive until fully complete.
            </p>
            <div className="incomplete-modal-actions">
              <button className="btn-go-back" onClick={handleIncompleteCancel} disabled={loading}>
                Go Back &amp; Complete Now
              </button>
              <button className="btn-save-incomplete" onClick={handleIncompleteConfirm} disabled={loading}>
                {loading ? 'Saving…' : 'I Understand — Save Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Hero */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>Candidate Registration</h1>
          <p>Take a step towards your Future</p>
        </div>
      </section>

      <section className="reg-section section">
        <div className="container container-form">

          <div className="reg-notice">
            <h3>BEFORE YOU REGISTER, PLEASE MAKE SURE YOU HAVE THE FOLLOWING</h3>
            <p>
              Please complete the form with accurate details and upload the required documents.
              <strong> Incomplete applications will be automatically rejected.</strong>
            </p>
            <ul className="doc-list">
              <li>✓ Head and shoulder photograph</li>
              <li>✓ Passport copy</li>
              <li>✓ ID document copy</li>
              <li>✓ Commercial driver's licence copy (if applicable)</li>
              <li>✓ Previous H-2A visa copies (if applicable)</li>
              <li>✓ Criminal record check from SAPS (mandatory)</li>
            </ul>
          </div>

          {error && <div className="reg-error">{error}</div>}

          <form className="reg-form" onSubmit={handleSubmit}>

            {/* ── 1. Personal Information ── */}
            <div className="form-section">
              <h3 className="form-section-title">1. Personal Information</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" value={form.firstName} onChange={set('firstName')} />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" value={form.email} onChange={set('email')} required />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input type="tel" value={form.contactNumber} onChange={set('contactNumber')} />
                </div>
                <div className="form-group">
                  <label>ID Number</label>
                  <input type="text" value={form.idNumber} onChange={set('idNumber')} />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" value={form.age} onChange={set('age')} min="18" max="65" />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                </div>
                <div className="form-group">
                  <label>SA / USA Driver's Licence Code</label>
                  <input type="text" value={form.driverLicenseCode} onChange={set('driverLicenseCode')} placeholder="e.g. Code 8, Code 10" />
                </div>
                <div className="form-group form-group-full">
                  <label>Physical Address</label>
                  <input type="text" value={form.physicalAddress} onChange={set('physicalAddress')} />
                </div>
                <div className="form-group">
                  <label>Social Security Number (if applicable)</label>
                  <input type="text" value={form.socialSecurityNumber} onChange={set('socialSecurityNumber')} />
                </div>
              </div>
            </div>

            {/* ── 2. Lifestyle & Health ── */}
            <div className="form-section">
              <h3 className="form-section-title">2. Lifestyle &amp; Health</h3>
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
                    <label><input {...radio('englishProficient', 'yes')} /> Yes</label>
                    <label><input {...radio('englishProficient', 'no')} /> No</label>
                  </div>
                </div>
              </div>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Do you have any health issues? (describe)</label>
                  <textarea value={form.healthIssues} onChange={set('healthIssues')} rows={3} />
                </div>
                <div className="form-group">
                  <label>Do you have a criminal record? (describe)</label>
                  <textarea value={form.criminalRecord} onChange={set('criminalRecord')} rows={3} />
                </div>
              </div>
            </div>

            {/* ── 3. Family Information ── */}
            <div className="form-section">
              <h3 className="form-section-title">3. Family Information</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Marital Status</label>
                  <div className="radio-group">
                    {['Single', 'Married', 'Divorced', 'Widowed'].map(s => (
                      <label key={s}><input {...radio('maritalStatus', s.toLowerCase())} /> {s}</label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Do you have relatives in the USA?</label>
                  <div className="radio-group">
                    <label><input {...radio('usaRelatives', 'yes')} /> Yes</label>
                    <label><input {...radio('usaRelatives', 'no')} /> No</label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Spouse Name &amp; Surname</label>
                  <input type="text" value={form.spouseName} onChange={set('spouseName')} />
                </div>
                <div className="form-group">
                  <label>Spouse Contact Number</label>
                  <input type="tel" value={form.spouseContact} onChange={set('spouseContact')} />
                </div>
                <div className="form-group">
                  <label>Spouse Email Address</label>
                  <input type="email" value={form.spouseEmail} onChange={set('spouseEmail')} />
                </div>
                <div className="form-group">
                  <label>Spouse Date of Birth</label>
                  <input type="date" value={form.spouseDob} onChange={set('spouseDob')} />
                </div>
                <div className="form-group">
                  <label>Date of Marriage</label>
                  <input type="date" value={form.dateOfMarriage} onChange={set('dateOfMarriage')} />
                </div>
              </div>
            </div>

            {/* ── 3b. Next of Kin ── */}
            <div className="form-section">
              <h3 className="form-section-title">Next of Kin</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={form.nokName} onChange={set('nokName')} />
                </div>
                <div className="form-group">
                  <label>Relationship</label>
                  <input type="text" value={form.nokRelationship} onChange={set('nokRelationship')} placeholder="e.g. Mother, Brother" />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="tel" value={form.nokContact} onChange={set('nokContact')} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={form.nokEmail} onChange={set('nokEmail')} />
                </div>
                <div className="form-group form-group-full">
                  <label>Physical Address</label>
                  <input type="text" value={form.nokAddress} onChange={set('nokAddress')} />
                </div>
              </div>
            </div>

            {/* ── 4. Passport & Visa ── */}
            <div className="form-section">
              <h3 className="form-section-title">4. Passport &amp; Visa Information</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Passport Number</label>
                  <input type="text" value={form.passportNumber} onChange={set('passportNumber')} />
                </div>
                <div className="form-group">
                  <label>Passport Date Issued</label>
                  <input type="date" value={form.passportIssued} onChange={set('passportIssued')} />
                </div>
                <div className="form-group">
                  <label>Passport Expiry Date</label>
                  <input type="date" value={form.passportExpiry} onChange={set('passportExpiry')} />
                </div>
              </div>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Have you previously applied for a USA visa? (details)</label>
                  <textarea value={form.previousVisaApplication} onChange={set('previousVisaApplication')} rows={3} />
                </div>
                <div className="form-group">
                  <label>Visa application outcome</label>
                  <div className="radio-group">
                    <label><input {...radio('visaOutcome', 'approved')} /> Approved</label>
                    <label><input {...radio('visaOutcome', 'denied')} /> Denied</label>
                    <label><input {...radio('visaOutcome', 'na')} /> N/A</label>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5. Employment History ── */}
            <div className="form-section">
              <h3 className="form-section-title">5. Education &amp; Employment History</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Highest School Education</label>
                  <input type="text" value={form.highestEducation} onChange={set('highestEducation')} />
                </div>
                <div className="form-group">
                  <label>Tertiary / Further Education</label>
                  <input type="text" value={form.tertiaryEducation} onChange={set('tertiaryEducation')} />
                </div>
              </div>
              <h4 className="form-sub-title">Current Employment</h4>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Current Employer</label>
                  <input type="text" value={form.currentEmployer} onChange={set('currentEmployer')} />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.currentStartDate} onChange={set('currentStartDate')} />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" value={form.currentContactPerson} onChange={set('currentContactPerson')} />
                </div>
              </div>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Current Job Duties</label>
                  <textarea value={form.currentJobDuties} onChange={set('currentJobDuties')} rows={3} />
                </div>
              </div>
              <h4 className="form-sub-title">Previous Employment</h4>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Previous Employer</label>
                  <input type="text" value={form.previousEmployer} onChange={set('previousEmployer')} />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.previousStartDate} onChange={set('previousStartDate')} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.previousEndDate} onChange={set('previousEndDate')} />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" value={form.previousContactPerson} onChange={set('previousContactPerson')} />
                </div>
              </div>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label>Previous Job Duties</label>
                  <textarea value={form.previousJobDuties} onChange={set('previousJobDuties')} rows={3} />
                </div>
              </div>
            </div>

            {/* ── 6. Equipment Experience ── */}
            <div className="form-section">
              <h3 className="form-section-title">6. Equipment &amp; Machinery Experience</h3>
              <p className="form-hint">List specific makes/models you have operated. Leave blank if not applicable.</p>
              <div className="form-grid form-grid-2">
                {[
                  ['tractors', 'Tractors Operated'],
                  ['combines', 'Combines / Harvesting Machines'],
                  ['tillageCultivation', 'Tillage / Cultivation Equipment'],
                  ['silageHaymaking', 'Silage / Haymaking Equipment'],
                  ['sprayers', 'Sprayers'],
                  ['otherFarmEquipment', 'Other Farm Equipment'],
                  ['earthmoving', 'Earthmoving Equipment'],
                  ['trucks', 'Trucks'],
                ].map(([field, label]) => (
                  <div key={field} className="form-group">
                    <label>{label}</label>
                    <textarea value={form[field as keyof FormData]} onChange={set(field as keyof FormData)} rows={2} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── 7. Additional Skills ── */}
            <div className="form-section">
              <h3 className="form-section-title">7. Additional Skills</h3>
              <div className="form-grid form-grid-2">
                {[
                  ['otherSkills', 'Other Skills'],
                  ['mechanicalSkills', 'Mechanical Skills'],
                  ['livestockFarming', 'Livestock Farming Experience'],
                  ['cropFarming', 'Crop Farming Experience'],
                  ['irrigationFarming', 'Irrigation Farming Experience'],
                ].map(([field, label]) => (
                  <div key={field} className="form-group">
                    <label>{label}</label>
                    <textarea value={form[field as keyof FormData]} onChange={set(field as keyof FormData)} rows={3} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── 8. Document Uploads ── */}
            <div className="form-section">
              <h3 className="form-section-title">8. Document Uploads</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Head &amp; Shoulder Photo <span className="req-note">(required for complete profile)</span></label>
                  <input type="file" accept="image/*" onChange={e => setDocs(d => ({ ...d, photo: e.target.files?.[0] ?? null }))} />
                </div>
                <div className="form-group">
                  <label>Passport Copy <span className="req-note">(required for complete profile)</span></label>
                  <input type="file" accept=".pdf,image/*" onChange={e => setDocs(d => ({ ...d, passport: e.target.files?.[0] ?? null }))} />
                </div>
                <div className="form-group">
                  <label>ID Document <span className="req-note">(required for complete profile)</span></label>
                  <input type="file" accept=".pdf,image/*" onChange={e => setDocs(d => ({ ...d, idDoc: e.target.files?.[0] ?? null }))} />
                </div>
                <div className="form-group">
                  <label>Commercial Driver's Licence (if applicable)</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => setDocs(d => ({ ...d, driversLicence: e.target.files?.[0] ?? null }))} />
                </div>
                <div className="form-group">
                  <label>Previous H-2A Visa Copies (if applicable)</label>
                  <input type="file" accept=".pdf,image/*" multiple onChange={e => setDocs(d => ({ ...d, h2aVisas: Array.from(e.target.files ?? []) }))} />
                </div>
                <div className="form-group">
                  <label>SAPS Criminal Record Check <span className="req-note">(required for complete profile)</span></label>
                  <input type="file" accept=".pdf,image/*" onChange={e => setDocs(d => ({ ...d, criminalRecord: e.target.files?.[0] ?? null }))} />
                </div>
              </div>
            </div>

            {/* ── Account Password ── */}
            <div className="form-section">
              <h3 className="form-section-title">Create Your Account Password</h3>
              <p className="form-hint">You will use this password to log in and manage your profile after submitting.</p>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={form.password} onChange={set('password')} required minLength={6} placeholder="Min. 6 characters" />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required minLength={6} placeholder="Repeat password" />
                </div>
              </div>
            </div>

            <div className="form-submit">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Send Application'}
              </button>
            </div>

          </form>
        </div>
      </section>

    </main>
  );
}

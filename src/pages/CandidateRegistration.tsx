import { useState, type FormEvent } from 'react';
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
};

export default function CandidateRegistration() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <p>In the meantime, feel free to review our <a href="/faq">FAQ page</a>.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="reg-page">

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

          <form className="reg-form" onSubmit={handleSubmit}>

            {/* ── 1. Personal Information ── */}
            <div className="form-section">
              <h3 className="form-section-title">1. Personal Information</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" value={form.firstName} onChange={set('firstName')} required />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" value={form.email} onChange={set('email')} required />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input type="tel" value={form.contactNumber} onChange={set('contactNumber')} required />
                </div>
                <div className="form-group">
                  <label>ID Number *</label>
                  <input type="text" value={form.idNumber} onChange={set('idNumber')} required />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" value={form.age} onChange={set('age')} min="18" max="65" />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
                </div>
                <div className="form-group">
                  <label>SA / USA Driver's Licence Code</label>
                  <input type="text" value={form.driverLicenseCode} onChange={set('driverLicenseCode')} placeholder="e.g. Code 8, Code 10" />
                </div>
                <div className="form-group form-group-full">
                  <label>Physical Address *</label>
                  <input type="text" value={form.physicalAddress} onChange={set('physicalAddress')} required />
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
                  <label>Full Name *</label>
                  <input type="text" value={form.nokName} onChange={set('nokName')} required />
                </div>
                <div className="form-group">
                  <label>Relationship *</label>
                  <input type="text" value={form.nokRelationship} onChange={set('nokRelationship')} placeholder="e.g. Mother, Brother" required />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input type="tel" value={form.nokContact} onChange={set('nokContact')} required />
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
                  <label>Passport Number *</label>
                  <input type="text" value={form.passportNumber} onChange={set('passportNumber')} required />
                </div>
                <div className="form-group">
                  <label>Passport Date Issued *</label>
                  <input type="date" value={form.passportIssued} onChange={set('passportIssued')} required />
                </div>
                <div className="form-group">
                  <label>Passport Expiry Date *</label>
                  <input type="date" value={form.passportExpiry} onChange={set('passportExpiry')} required />
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
                  <label>Head &amp; Shoulder Photo *</label>
                  <input type="file" accept="image/*" required />
                </div>
                <div className="form-group">
                  <label>Passport Copy *</label>
                  <input type="file" accept=".pdf,image/*" required />
                </div>
                <div className="form-group">
                  <label>ID Document *</label>
                  <input type="file" accept=".pdf,image/*" required />
                </div>
                <div className="form-group">
                  <label>Commercial Driver's Licence (if applicable)</label>
                  <input type="file" accept=".pdf,image/*" />
                </div>
                <div className="form-group">
                  <label>Previous H-2A Visa Copies (if applicable)</label>
                  <input type="file" accept=".pdf,image/*" multiple />
                </div>
                <div className="form-group">
                  <label>SAPS Criminal Record Check *</label>
                  <input type="file" accept=".pdf,image/*" required />
                </div>
              </div>
            </div>

            <div className="form-submit">
              <button type="submit" className="btn-submit">Send Application</button>
            </div>

          </form>
        </div>
      </section>

    </main>
  );
}

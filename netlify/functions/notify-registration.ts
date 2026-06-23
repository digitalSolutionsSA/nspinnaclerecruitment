import type { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO = process.env.MANAGEMENT_EMAIL ?? 'info@nspinnacle.co.za';
const FROM = process.env.FROM_EMAIL ?? 'NS Pinnacle Recruit <noreply@nspinnacle.co.za>';

function row(label: string, value: string | undefined) {
  if (!value) return '';
  return `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap;vertical-align:top;width:220px">${label}</td><td style="padding:6px 12px;color:#222">${value}</td></tr>`;
}

function section(title: string, rows: string) {
  if (!rows) return '';
  return `
    <tr><td colspan="2" style="padding:14px 12px 4px;background:#f0f4f8;font-size:13px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#1a4b8c">${title}</td></tr>
    ${rows}`;
}

function docLink(label: string, url: string | undefined) {
  if (!url) return '';
  return `<tr><td style="padding:6px 12px;font-weight:600;color:#555;vertical-align:top;width:220px">${label}</td><td style="padding:6px 12px"><a href="${url}" style="color:#1a4b8c">${url}</a></td></tr>`;
}

function docLinks(label: string, csv: string | undefined) {
  if (!csv) return '';
  return csv.split(',').map((url, i) =>
    docLink(`${label} ${i + 1}`, url.trim())
  ).join('');
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body: Record<string, string>;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const isUpdate = body._type === 'profile-update';
  // _type is now always set; 'new-registration' or 'profile-update'
  const subject = isUpdate
    ? `Profile Updated — ${body.first_name ?? ''} ${body.last_name ?? ''}`.trim()
    : `New Registration — ${body.firstName ?? body.first_name ?? ''} ${body.lastName ?? body.last_name ?? ''}`.trim();

  // Normalise field names (registration uses camelCase, profile uses snake_case)
  const f = (camel: string, snake: string) => body[camel] ?? body[snake] ?? '';

  const personalRows = [
    row('First Name', f('firstName', 'first_name')),
    row('Last Name', f('lastName', 'last_name')),
    row('Email', f('email', 'email')),
    row('Contact Number', f('contactNumber', 'contact_number')),
    row('ID Number', f('idNumber', 'id_number')),
    row('Age', f('age', 'age')),
    row('Date of Birth', f('dateOfBirth', 'date_of_birth')),
    row('Physical Address', f('physicalAddress', 'physical_address')),
    row('Driver\'s Licence Code', f('driverLicenseCode', 'driver_license_code')),
    row('Social Security Number', f('socialSecurityNumber', 'social_security_number')),
  ].join('');

  const lifestyleRows = [
    row('Smoking', f('smoking', 'smoking')),
    row('Alcohol', f('alcohol', 'alcohol')),
    row('English Proficient', f('englishProficient', 'english_proficient')),
    row('Health Issues', f('healthIssues', 'health_issues')),
    row('Criminal Record', f('criminalRecord', 'criminal_record')),
  ].join('');

  const familyRows = [
    row('Marital Status', f('maritalStatus', 'marital_status')),
    row('USA Relatives', f('usaRelatives', 'usa_relatives')),
    row('Spouse Name', f('spouseName', 'spouse_name')),
    row('Spouse Contact', f('spouseContact', 'spouse_contact')),
    row('Spouse Email', f('spouseEmail', 'spouse_email')),
    row('Spouse DOB', f('spouseDob', 'spouse_dob')),
    row('Date of Marriage', f('dateOfMarriage', 'date_of_marriage')),
    row('Next of Kin Name', f('nokName', 'nok_name')),
    row('Next of Kin Relationship', f('nokRelationship', 'nok_relationship')),
    row('Next of Kin Contact', f('nokContact', 'nok_contact')),
    row('Next of Kin Email', f('nokEmail', 'nok_email')),
    row('Next of Kin Address', f('nokAddress', 'nok_address')),
  ].join('');

  const passportRows = [
    row('Passport Number', f('passportNumber', 'passport_number')),
    row('Passport Issued', f('passportIssued', 'passport_issued')),
    row('Passport Expiry', f('passportExpiry', 'passport_expiry')),
    row('Previous Visa Application', f('previousVisaApplication', 'previous_visa_application')),
    row('Visa Outcome', f('visaOutcome', 'visa_outcome')),
  ].join('');

  const employmentRows = [
    row('Highest Education', f('highestEducation', 'highest_education')),
    row('Tertiary Education', f('tertiaryEducation', 'tertiary_education')),
    row('Current Employer', f('currentEmployer', 'current_employer')),
    row('Current Start Date', f('currentStartDate', 'current_start_date')),
    row('Current Contact Person', f('currentContactPerson', 'current_contact_person')),
    row('Current Job Duties', f('currentJobDuties', 'current_job_duties')),
    row('Previous Employer', f('previousEmployer', 'previous_employer')),
    row('Previous Start Date', f('previousStartDate', 'previous_start_date')),
    row('Previous End Date', f('previousEndDate', 'previous_end_date')),
    row('Previous Contact Person', f('previousContactPerson', 'previous_contact_person')),
    row('Previous Job Duties', f('previousJobDuties', 'previous_job_duties')),
  ].join('');

  const equipmentRows = [
    row('Tractors', f('tractors', 'tractors')),
    row('Combines / Harvesters', f('combines', 'combines')),
    row('Tillage / Cultivation', f('tillageCultivation', 'tillage_cultivation')),
    row('Silage / Haymaking', f('silageHaymaking', 'silage_haymaking')),
    row('Sprayers', f('sprayers', 'sprayers')),
    row('Other Farm Equipment', f('otherFarmEquipment', 'other_farm_equipment')),
    row('Earthmoving Equipment', f('earthmoving', 'earthmoving')),
    row('Trucks', f('trucks', 'trucks')),
  ].join('');

  const skillsRows = [
    row('Other Skills', f('otherSkills', 'other_skills')),
    row('Mechanical Skills', f('mechanicalSkills', 'mechanical_skills')),
    row('Livestock Farming', f('livestockFarming', 'livestock_farming')),
    row('Crop Farming', f('cropFarming', 'crop_farming')),
    row('Irrigation Farming', f('irrigationFarming', 'irrigation_farming')),
  ].join('');

  const docRows = [
    docLink('Photo', f('doc_photo', 'doc_photo')),
    docLink('Passport Copy', f('doc_passport', 'doc_passport')),
    docLink('ID Document', f('doc_id', 'doc_id')),
    docLink('Driver\'s Licence', f('doc_drivers_licence', 'doc_drivers_licence')),
    docLinks('H-2A Visa', f('doc_h2a_visas', 'doc_h2a_visas')),
    docLink('Criminal Record Check', f('doc_criminal_record', 'doc_criminal_record')),
  ].join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif">
  <div style="max-width:680px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">

    <div style="background:#1a4b8c;padding:28px 32px">
      <h1 style="margin:0;color:#fff;font-size:22px">NS Pinnacle Recruit</h1>
      <p style="margin:6px 0 0;color:#c8d8f0;font-size:14px">${isUpdate ? 'Candidate Profile Updated' : 'New Candidate Registration'}</p>
    </div>

    <div style="padding:24px 32px 8px">
      <p style="margin:0;color:#333;font-size:15px">
        ${isUpdate
          ? `<strong>${f('first_name', 'firstName')} ${f('last_name', 'lastName')}</strong> has updated their profile.`
          : `A new candidate has completed their registration.`}
      </p>
    </div>

    <div style="padding:8px 32px 32px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${section('Personal Information', personalRows)}
        ${section('Lifestyle & Health', lifestyleRows)}
        ${section('Family & Next of Kin', familyRows)}
        ${section('Passport & Visa', passportRows)}
        ${section('Education & Employment', employmentRows)}
        ${section('Equipment & Machinery', equipmentRows)}
        ${section('Additional Skills', skillsRows)}
        ${docRows ? section('Uploaded Documents', docRows) : ''}
      </table>
    </div>

    <div style="background:#f0f4f8;padding:16px 32px;font-size:12px;color:#888;text-align:center">
      This notification was sent automatically by NS Pinnacle Recruit · ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>`;

  // 1 — Email to management with full candidate details
  const { error: mgmtError } = await resend.emails.send({
    from: FROM,
    to: TO,
    subject,
    html,
  });

  if (mgmtError) {
    console.error('Resend management email error:', mgmtError);
    return { statusCode: 500, body: JSON.stringify({ error: mgmtError.message }) };
  }

  // 2 — Confirmation email to the candidate
  const candidateEmail = body.email ?? '';
  if (candidateEmail) {
    const candidateSubject = isUpdate
      ? 'Your NS Pinnacle Recruit profile has been updated'
      : 'Welcome to NS Pinnacle Recruit — Profile Created';

    const firstName = f('firstName', 'first_name') || 'Candidate';

    const candidateHtml = isUpdate ? `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
    <div style="background:#1b5e20;padding:28px 32px">
      <h1 style="margin:0;color:#fff;font-size:22px">NS Pinnacle Recruit</h1>
      <p style="margin:6px 0 0;color:#c8e6c9;font-size:14px">Profile Update Confirmation</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:16px;color:#333;margin:0 0 16px">Hi <strong>${firstName}</strong>,</p>
      <p style="font-size:15px;color:#333;margin:0 0 16px">
        Your NS Pinnacle Recruit profile has been successfully updated.
      </p>
      <p style="font-size:14px;color:#555;margin:0 0 24px">
        Our team has been notified and will review your updated information. If you have any questions or did not make these changes, please contact us immediately.
      </p>
      <div style="background:#f0f8f0;border-left:4px solid #2e7d32;padding:16px 20px;border-radius:4px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#1b5e20;font-weight:600">What happens next?</p>
        <p style="margin:8px 0 0;font-size:14px;color:#333">Your personal agent at NS Pinnacle Recruit will review your profile and be in contact with you regarding your application status.</p>
      </div>
      <p style="font-size:13px;color:#888;margin:0">You can log in at any time to update your information further.</p>
    </div>
    <div style="background:#f0f4f8;padding:16px 32px;font-size:12px;color:#888;text-align:center">
      NS Pinnacle Recruit · <a href="mailto:gauteng@nspinnaclerecruit.com" style="color:#2e7d32">gauteng@nspinnaclerecruit.com</a>
    </div>
  </div>
</body>
</html>` : `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
    <div style="background:#1b5e20;padding:28px 32px">
      <h1 style="margin:0;color:#fff;font-size:22px">NS Pinnacle Recruit</h1>
      <p style="margin:6px 0 0;color:#c8e6c9;font-size:14px">Welcome — Profile Successfully Created</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:16px;color:#333;margin:0 0 16px">Hi <strong>${firstName}</strong>,</p>
      <p style="font-size:15px;color:#333;margin:0 0 16px">
        Congratulations! Your NS Pinnacle Recruit profile has been successfully created.
      </p>
      <p style="font-size:14px;color:#555;margin:0 0 24px">
        Thank you for taking the first step towards an exciting opportunity in the USA. Our team will review your application and your personal agent will be in contact with you shortly.
      </p>
      <div style="background:#f0f8f0;border-left:4px solid #2e7d32;padding:16px 20px;border-radius:4px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#1b5e20;font-weight:600">What happens next?</p>
        <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;color:#333">
          <li style="margin-bottom:6px">Our team will review your submitted documents and profile.</li>
          <li style="margin-bottom:6px">Your personal NS Pinnacle agent will contact you directly.</li>
          <li>You can log in at any time to update your profile or upload additional documents.</li>
        </ul>
      </div>
      <p style="font-size:13px;color:#888;margin:0">If you have any questions in the meantime, feel free to reach out to us at <a href="mailto:gauteng@nspinnaclerecruit.com" style="color:#2e7d32">gauteng@nspinnaclerecruit.com</a>.</p>
    </div>
    <div style="background:#f0f4f8;padding:16px 32px;font-size:12px;color:#888;text-align:center">
      NS Pinnacle Recruit · <a href="mailto:gauteng@nspinnaclerecruit.com" style="color:#2e7d32">gauteng@nspinnaclerecruit.com</a>
    </div>
  </div>
</body>
</html>`;

    const { error: candidateError } = await resend.emails.send({
      from: FROM,
      to: candidateEmail,
      subject: candidateSubject,
      html: candidateHtml,
    });

    if (candidateError) {
      // Log but don't fail the request — management email already sent
      console.error('Resend candidate email error:', candidateError);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

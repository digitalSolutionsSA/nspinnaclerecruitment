import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FAQ.css';

const faqs = [
  {
    q: 'What do I need to apply?',
    a: `To apply you will need to complete our online application form and have the following ready:
• A valid passport and driver's licence (Code 8 or Code 10)
• Proven farming experience
• Sufficient funds to cover your visa fee, airline ticket and travel insurance
• 3 references from previous employers including their contact numbers`,
  },
  {
    q: "What is NS Pinnacle Recruitment's fee?",
    a: 'THERE ARE NO FEES – WE DO NOT CHARGE APPLICANTS ANY FEES TO ASSIST WITH YOUR SECURING A JOB IN THE US.',
  },
  {
    q: 'What is it going to cost me initially?',
    a: `There are three initial costs to consider:

1. Airline Ticket – approximately R18,000 – R26,000. Half is reimbursed upon your arrival in the USA, and the balance is reimbursed after you complete your contract.
2. Visa Fee – approximately $190 (±R3,500). This is fully reimbursed by your US employer.
3. Travel & Medical Insurance – cost varies depending on your age and the length of your stay. This cost is NOT reimbursed.`,
  },
  {
    q: 'How does the process work from start to finish?',
    a: `The process follows these steps:
1. Complete our online application form
2. You are assigned a personal agent
3. We conduct interviews and select suitable candidates
4. You receive an employment offer from a US farm
5. Paperwork is submitted for work permit approval (approximately 3–4 months)
6. Apply for your H-2A visa (approximately 1–4 weeks)
7. Book your flights and arrange travel insurance
8. Receive your pre-departure information pack
9. Travel to the USA and start work`,
  },
  {
    q: 'What is a H-2A visa and what do I need to apply?',
    a: `The H-2A is a temporary agricultural visa (non-immigrant visa) that allows foreigners to enter the USA and perform agricultural labour on a seasonal basis.

To apply you will need:
• An approved work permit
• A valid passport with at least 6 months validity remaining
• Passport-sized photos (5cm × 5cm)`,
  },
  {
    q: 'Who books my flight and how do I get Travel Insurance?',
    a: 'Your airline ticket is booked through our trusted travel partner, Ritz Travel. Payment for the ticket is due within 24 hours of booking. Travel and medical insurance is arranged through our broker at your own cost — this expense is not reimbursed by your employer.',
  },
  {
    q: 'How much will I be paid by my US employer?',
    a: 'Under the H-2A programme, your employer must pay you at least the minimum wage per hour of the state in which you work. Actual wages vary by farm and state.',
  },
  {
    q: 'Will I be paid Overtime?',
    a: 'No, because you are remunerated on an hourly wage basis. Overtime is not applicable under the H-2A programme structure.',
  },
  {
    q: 'Will I be provided with Accommodation, Meals and Transport?',
    a: `Your US employer is required to provide:
• Housing that meets the standards set by the Department of Labor
• Transport to and from the farm

Meals are your personal responsibility and are NOT provided by your employer.`,
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className="faq-chevron">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="faq-answer">
          {a.split('\n').map((line, i) => (
            <p key={i} className={line.startsWith('•') || /^\d+\./.test(line) ? 'faq-list-item' : ''}>
              {line || <br />}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <main className="faq-page">

      {/* Page Hero */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know before applying for a farm position in the USA.</p>
        </div>
      </section>

      <section className="faq-section section">
        <div className="container container-narrow">
          <div className="faq-list">
            {faqs.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>

          <div className="faq-cta">
            <h3>Still have questions?</h3>
            <p>
              Get in touch with us at{' '}
              <a href="mailto:gauteng@nspinnaclerecruit.com">gauteng@nspinnaclerecruit.com</a>
              {' '}or register as a candidate and your personal agent will assist you.
            </p>
            <Link to="/candidate-registration" className="btn-primary">
              Register as a Candidate
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const steps = [
  { icon: '📝', title: 'Submit Complaint', desc: 'Easily submit complaints online with or without an account. Describe your issue clearly.' },
  { icon: '🕵️', title: 'Anonymous Option', desc: 'Submit complaints anonymously while maintaining full confidentiality.' },
  { icon: '🔍', title: 'Track Progress', desc: 'Monitor your complaint status in real-time using your unique tracking number.' },
  { icon: '✅', title: 'Get Resolution', desc: 'Receive timely responses and solutions from the relevant county departments.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#8b6616', padding: '3rem 1.5rem', textAlign: 'center', color: 'white' }}>
        <div className="hero-content">
          <div className="hero-badge">
            <span></span> NATIONAL LAND COMMISSION COMPLAINT PORTAL.
          </div>
          <h1 className="hero-title" style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: '5000' }}>Submit, track, and resolve complaints efficiently.</h1>
          <p></p>
          <div className="hero-actions">
            <br></br>
  {user && (
    <Link to="/submit" className="btn btn-hero-primary btn-lg">
      Submit a Complaint
    </Link>
  )}

  <Link to="/anonymous" className="btn btn-hero-outline btn-lg">
    Submit Anonymously
  </Link>

  <Link to="/track" className="btn btn-hero-outline btn-lg">
    Track Complaint
  </Link>
</div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple, transparent, and effective complaint resolution in 4 steps</p>
        </div>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-num">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section style={{ background: '#8b6616', padding: '3rem 1.5rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Ready to Submit a Complaint?</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.85 }}></p>
        <div className="hero-actions">
          {user ? (
            <Link to="/submit" className="btn btn-hero-primary btn-lg">Submit Now</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-hero-primary btn-lg">Create Account</Link>
              <Link to="/anonymous" className="btn btn-hero-outline btn-lg">Submit Anonymously</Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.6)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <p>© {new Date().getFullYear()} NLC Complaint Management System. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem' }}>Contact: info@landcommission.go.ke | Tel: +254-111-042-800</p>
      </footer>
    </div>
  );
}

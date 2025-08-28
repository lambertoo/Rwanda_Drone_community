export default function TestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 50%, #dbeafe 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '0 0 1rem 0'
        }}>
          ✅ Test Page Working!
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#6b7280',
          margin: '0 0 2rem 0'
        }}>
          Basic routing and rendering is functioning correctly.
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <a href="/" style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            Go Home
          </a>
          <a href="/simple-profile" style={{
            background: '#10b981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            Simple Profile
          </a>
        </div>
      </div>
    </div>
  )
} 
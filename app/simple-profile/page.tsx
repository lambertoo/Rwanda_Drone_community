export default function SimpleProfilePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #ecfdf5 100%)',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '64rem',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            margin: '0 0 0.5rem 0',
            color: '#1f2937'
          }}>
            Welcome to Your Profile
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>
            This is a simple profile page for debugging authentication
          </p>
        </div>

        {/* Status */}
        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: '0 0 1rem 0',
            color: '#1f2937'
          }}>
            Profile Status
          </h2>
          <div style={{
            background: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: '0.375rem',
            padding: '1rem',
            color: '#065f46'
          }}>
            ✅ This page is working! You can now test the authentication flow.
          </div>
        </div>

        {/* Actions */}
        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: '0 0 1rem 0',
            color: '#1f2937'
          }}>
            Available Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <a href="/complete-profile" style={{
              display: 'block',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              Go to Profile Completion
            </a>
            <a href="/debug-profile" style={{
              display: 'block',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              Debug Profile
            </a>
            <a href="/" style={{
              display: 'block',
              background: '#3b82f6',
              border: '1px solid #3b82f6',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
              textAlign: 'center',
              textDecoration: 'none',
              color: 'white',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              Go to Dashboard
            </a>
            <a href="/register" style={{
              display: 'block',
              background: '#6b7280',
              border: '1px solid #6b7280',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
              textAlign: 'center',
              textDecoration: 'none',
              color: 'white',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              Register New User
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: '0 0 1rem 0',
            color: '#1f2937'
          }}>
            Testing Instructions
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0
            }}>
              1. <strong>Register a new user</strong> - Go to the registration page and create a new account
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0
            }}>
              2. <strong>Check authentication</strong> - After registration, you should be redirected here
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0
            }}>
              3. <strong>Complete profile</strong> - Use the profile completion form to add role and other details
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0
            }}>
              4. <strong>Test access</strong> - Try accessing protected pages after completing your profile
            </p>
          </div>
        </div>

      </div>
    </div>
  )
} 
export default function StatCard({ title, value, icon: Icon, color = 'var(--text)' }) {
  return (
    <div 
      style={{
        backgroundColor: 'var(--surface)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        borderBottom: `3px solid var(--accent)`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text)' }}>
          {value}
        </h3>
      </div>
      <div 
        style={{
          padding: '0.75rem',
          backgroundColor: 'var(--surface2)',
          borderRadius: '8px',
          color: color,
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
}

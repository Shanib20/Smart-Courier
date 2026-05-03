import { CheckCircle2, Clock, Truck, XCircle, AlertTriangle, Package } from 'lucide-react';

const statusConfig = {
  BOOKED: { color: 'var(--info)', bg: 'rgba(59, 130, 246, 0.1)', icon: Package },
  IN_TRANSIT: { color: 'var(--accent)', bg: 'rgba(245, 158, 11, 0.1)', icon: Truck },
  DELIVERED: { color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle2 },
  FAILED: { color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle },
  DELAYED: { color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)', icon: AlertTriangle },
  RETURNED: { color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { 
    color: 'var(--text-muted)', 
    bg: 'var(--surface2)', 
    icon: Clock 
  };
  
  const Icon = config.icon;

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.color,
        fontSize: '0.75rem',
        fontWeight: '700',
        letterSpacing: '0.05em',
        border: `1px solid ${config.color}40`,
      }}
    >
      <Icon size={12} strokeWidth={3} />
      {status}
    </span>
  );
}

interface SessionMetricsCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

const SessionMetricsCard = ({ label, value, icon }: SessionMetricsCardProps) => {
  return (
    <div
      className="rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md"
      style={{
        backgroundColor: '#FAF8F3',
        borderColor: '#E5E0D6'
      }}
    >
      {icon && (
        <div className="mb-3 text-2xl">{icon}</div>
      )}
      <p className="text-sm font-medium mb-2" style={{ color: '#6B5D52' }}>
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ color: '#4A3F35' }}>
        {value}
      </p>
    </div>
  );
};

export default SessionMetricsCard;


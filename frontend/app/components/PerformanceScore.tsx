interface PerformanceScoreProps {
  label: string;
  score: number;
  icon: string;
  color: string;
  backgroundColor: string;
}

const PerformanceScore = ({ label, score, icon, color, backgroundColor }: PerformanceScoreProps) => {
  return (
    <div
      className="rounded-xl p-6 shadow-sm"
      style={{ backgroundColor }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold" style={{ color }}>
          {label}
        </h3>
      </div>
      <div className="mb-2">
        <div className="text-4xl font-bold mb-2" style={{ color: '#4A3F35' }}>
          {score}
          <span className="text-2xl text-gray-500">/100</span>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
        <div
          className="h-full transition-all duration-1000 ease-out rounded-full"
          style={{
            width: `${score}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

export default PerformanceScore;


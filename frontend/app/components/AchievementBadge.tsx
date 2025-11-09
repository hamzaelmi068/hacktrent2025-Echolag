interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: { current: number; target: number };
}

const AchievementBadge = ({ title, description, icon, unlocked, progress }: AchievementBadgeProps) => {
  return (
    <div
      className={`rounded-xl p-4 transition-all duration-300 ${
        unlocked ? 'shadow-md' : 'opacity-50'
      }`}
      style={{
        backgroundColor: unlocked ? '#FFF8E8' : '#F5F1E8',
        border: `2px solid ${unlocked ? '#D4A574' : '#E5E0D6'}`
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold" style={{ color: '#4A3F35' }}>
              {title}
            </h4>
            {unlocked && (
              <span className="text-green-600 text-lg">✓</span>
            )}
          </div>
          <p className="text-sm mb-2" style={{ color: '#6B5D52' }}>
            {description}
          </p>
          {progress && (
            <div className="text-xs font-medium" style={{ color: '#8B7355' }}>
              {progress.current}/{progress.target}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;


export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, onClick }) {
  const colorMap = {
    blue: { bg: 'bg-[#2E86AB]/10', icon: 'bg-[#2E86AB]/20 text-[#2E86AB]', border: 'border-[#2E86AB]/20' },
    cyan: { bg: 'bg-[#4ECDC4]/10', icon: 'bg-[#4ECDC4]/20 text-[#0A1628]', border: 'border-[#4ECDC4]/20' },
    navy: { bg: 'bg-[#0A1628]/5', icon: 'bg-[#1B3A5C]/20 text-[#1B3A5C]', border: 'border-[#1B3A5C]/20' },
    red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', border: 'border-red-100' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', border: 'border-orange-100' },
    green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-100' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all duration-200 ${c.border} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#1B3A5C]/60 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{value}</p>
          {subtitle && <p className="text-xs text-[#1B3A5C]/40 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.icon}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

interface ContributorCardProps {
  name: string;
  wordCount: number;
  sessionCount: number;
  colorClass: string;
  onClick?: () => void;
  isHighlighted?: boolean;
}

export function ContributorCard({
  name,
  wordCount,
  sessionCount,
  colorClass,
  onClick,
  isHighlighted,
}: ContributorCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${colorClass} flex flex-col items-start px-3 py-2.5 rounded-xl w-[140px] text-left transition-all duration-200 shadow-sm hover:shadow-md ${
        isHighlighted ? 'ring-2 ring-offset-2 ring-purple-400 shadow-md' : ''
      } ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-full bg-white/60 flex items-center justify-center text-sm font-bold text-gray-700 shadow-inner">
          {name.charAt(0).toUpperCase()}
        </div>
        <p className="font-semibold text-base leading-tight text-gray-900">{name}</p>
      </div>
      <div className="flex flex-col w-full text-sm font-medium bg-white/40 rounded-lg px-2 py-1.5">
        <div className="flex items-center justify-between w-full">
          <span className="text-gray-600">Words</span>
          <span className="text-gray-900 font-semibold">{wordCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between w-full">
          <span className="text-gray-600">Sessions</span>
          <span className="text-gray-900 font-semibold">{sessionCount}</span>
        </div>
      </div>
    </button>
  );
}

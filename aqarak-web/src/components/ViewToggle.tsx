import { Grid3x3, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
      <button
        onClick={() => onViewChange('grid')}
        className={`
          p-2 rounded-full transition-all
          ${view === 'grid' 
            ? 'bg-secondary text-white' 
            : 'text-[#0B1B34]/60 hover:text-[#0B1B34]'
          }
        `}
        aria-label="Grid view"
      >
        <Grid3x3 className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`
          p-2 rounded-full transition-all
          ${view === 'list' 
            ? 'bg-secondary text-white' 
            : 'text-[#0B1B34]/60 hover:text-[#0B1B34]'
          }
        `}
        aria-label="List view"
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
}

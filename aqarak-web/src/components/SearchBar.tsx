import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search by location, property type...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B1B34]/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-5 py-3.5 rounded-full
            bg-white/90 backdrop-blur-sm
            border-2 border-transparent
            text-[#0B1B34] placeholder-[#0B1B34]/40
            text-base font-medium
            shadow-lg shadow-black/5
            focus:outline-none focus:border-secondary focus:bg-white
            transition-all
          "
        />
      </div>
    </form>
  );
}

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
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#0B1B34]/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-16 pr-6 py-5 rounded-full
            bg-white/90 backdrop-blur-sm
            border-2 border-transparent
            text-[#0B1B34] placeholder-[#0B1B34]/40
            text-lg
            shadow-lg shadow-black/5
            focus:outline-none focus:border-secondary focus:bg-white
            transition-all
          "
        />
      </div>
    </form>
  );
}

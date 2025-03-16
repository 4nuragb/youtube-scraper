import React, { useState } from 'react';

interface SearchBarProps {
    initialValue?: string;
    initialPartial?: boolean;
    onSearch: (query: string, isPartial: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
        initialValue = '',
        initialPartial = false,
        onSearch
}) => {
    const [query, setQuery] = useState(initialValue);
    const [isPartial, setIsPartial] = useState(initialPartial);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query, isPartial);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-grow relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search videos..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/4 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </button>
                </div>
                <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isPartial}
                            onChange={() => setIsPartial(!isPartial)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Flexible Matching</span>
                    </label>
                    <div className="ml-1 tooltip-trigger relative inline-block">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help"
                             viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"/>
                        </svg>
                        <div
                            className="tooltip z-50 w-64 p-2 bg-white rounded-md shadow-lg text-xs text-gray-700 top-full left-0"
                            style={{
                                maxWidth: '16rem', // Limit maximum width
                                position: 'absolute',
                                left: '50%',
                                transform: 'translateX(-50%)',
                            }}
                        >
                            When enabled, finds videos even when search terms appear in different order or are separated
                            by other words.
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default SearchBar;

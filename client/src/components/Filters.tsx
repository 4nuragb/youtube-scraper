import React, { useState } from "react";

interface FilterProps {
    onApplyFilters: (filters: {
        tags?: string;
        channelId?: string;
        startDate?: string;
        endDate?: string;
        sort?: string;
        order?: string;
    }) => void;

    initialFilters?: {
        tags?: string;
        channelId?: string;
        startDate?: string;
        endDate?: string;
        sort?: string;
        order?: string;
    };
}

const Filters: React.FC<FilterProps> = ({ onApplyFilters, initialFilters = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState(initialFilters.tags || '');
    const [channelId, setChannelId] = useState(initialFilters.channelId || '');
    const [startDate, setStartDate] = useState(initialFilters.startDate || '');
    const [endDate, setEndDate] = useState(initialFilters.endDate || '');
    const [sort, setSort] = useState(initialFilters.sort || 'publishedAt');
    const [order, setOrder] = useState(initialFilters.order || 'desc');

    const handleApply = () => {
        onApplyFilters({
            tags: tags || undefined,
            channelId: channelId || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            sort,
            order
        });
        setIsOpen(false);
    };

    const handleReset = () => {
        setTags('');
        setChannelId('');
        setStartDate('');
        setEndDate('');
        setSort('publishedAt');
        setOrder('desc');

        onApplyFilters({
            sort: 'publishedAt',
            order: 'desc'
        });
        // setIsOpen(false);
    };

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters & Sorting
            </button>
            {isOpen && (
                <div className="mt-2 p-4 bg-white rounded-md shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma
                                separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="cricket,highlights,2025"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Channel ID</label>
                        <input
                            type="text"
                            value={channelId}
                            onChange={(e) => setChannelId(e.target.value)}
                            placeholder="UC..."
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="publishedAt">Publish Date</option>
                            <option value="title">Title</option>
                            <option value="channelTitle">Channel</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                        <select
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
          )}
        </div>
    );
};

export default Filters;

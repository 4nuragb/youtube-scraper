import React from 'react';
import { PaginationInfo } from '../services/api';

interface PaginationProps {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

    if( totalPages <= 1) return null;

    const getPageNumbers = () => {
        const result = [];

        result.push(1);

        for( let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i ++) {
            if( !result.includes(i)) {
                result.push(i);
            }
        }

        if( totalPages > 1 && !result.includes(totalPages)) {
            result.push(totalPages);
        }

        const formatted = [];
        let prev = 0;

        for( const page of result) {
            if( page - prev > 1) {
                formatted.push('...');
            }
            formatted.push(page);
            prev = page;
        }

        return formatted;
    }

    return (
        <div className="flex items-center justify-center mt-6 space-x-1">
            <button
                onClick={() => hasPrevPage && onPageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className={`px-3 py-1 rounded ${
                    hasPrevPage
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
                Previous
            </button>

            {getPageNumbers().map((page, i) => (
                page === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-3 py-1">...</span>
                ) : (
                    <button
                        key={`page-${page}`}
                        onClick={() => onPageChange(Number(page))}
                        className={`px-3 py-1 rounded ${
                            currentPage === page
                            ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    >
                        {page}
                    </button>
                )
            ))}

            <button
                onClick={() => hasNextPage && onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className={`px-3 py-1 rounded ${
                    hasNextPage
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;

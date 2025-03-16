import React, {useEffect, useState} from 'react';
import { useVideoSearch } from '../hooks/useVideoSearch';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import VideoCard from '../components/VideoCard';
import Pagination from '../components/Pagination';
import {VideoGrid} from "../components/VideoGrid";
import {useLocation, useNavigate} from "react-router-dom";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialPage = parseInt(queryParams.get('page') || '1', 10);
    const initialLimit = parseInt(queryParams.get('limit') || '10', 10);
    const initialSearch = queryParams.get('search') || '';
    const initialPartial = queryParams.get('partial') === 'true';
    const initialTags = queryParams.get('tage') || '';
    const initialChannelId = queryParams.get('channelId') || '';
    const initialSort = queryParams.get('sort') || 'publishedAt';
    const initialOrder = queryParams.get('order') || 'desc';

    const [searchQuery, setSearchQuery] = useState('');
    const [isPartial, setIsPartial] = useState(false);

    const {
        videos,
        pagination,
        loading,
        error,
        updateSearch,
        setPage
    } = useVideoSearch({
        page: initialPage,
        limit: initialLimit,
        search: initialSearch || undefined,
        partial: initialSearch ? initialPartial : undefined,
        tags: initialTags || undefined,
        channelId: initialChannelId || undefined,
        sort: initialSort,
        order: initialOrder || undefined,
    });

    useEffect(() => {
        if( location?.search && location?.search !== '') {
            const searchParams = new URLSearchParams(location.search);
            const page = parseInt(searchParams.get('page') || '1', 10);
            const limit = parseInt(searchParams.get('limit') || '10', 10);
            const search = searchParams.get('search') || '';
            const partial = searchParams.get('partial') === 'true';
            const tags = searchParams.get('tags') || '';
            const channelId = searchParams.get('channelId') || '';
            const sort = searchParams.get('sort') || 'publishedAt';
            const order = searchParams.get('order') || 'desc';

            if( searchQuery !== search || isPartial !== partial) {
                setSearchQuery(search);
                setIsPartial(partial);

                updateSearch({
                    page,
                    limit,
                    search: search || undefined,
                    partial: search ? partial : undefined,
                    tags: tags || undefined,
                    channelId: channelId || undefined,
                    sort,
                    order
                });
            }
        }
    }, [location.search, updateSearch]);

    const updateUrlParams = (params: any) => {
        const searchParams = new URLSearchParams(location.search);
        Object.entries(params).forEach(([key, value]) => {
            if( value === undefined || value === '') {
                searchParams.delete(key);
            } else {
                searchParams.set(key, String(value));
            }
        });

        navigate({ search: searchParams.toString() }, { replace: true});
    }

    const handleSearch = (query: string, partial: boolean) => {
        setSearchQuery(query);
        setIsPartial(partial);
        const newParams = {
            search: query || undefined,
            partial: query ? partial : undefined,
            page: 1
        };
        updateSearch(newParams);
        updateUrlParams(newParams);
    };

    const handleFilterApply = (filters: any) => {
        const newParams = {
            ...filters,
            search: searchQuery || undefined,
            partial: searchQuery ? isPartial : undefined,
            page: 1
        }
        updateSearch(newParams);
        updateUrlParams(newParams);
    };


    const handlePageChange = (page: number) => {
        setPage(page);
        updateUrlParams({ page });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">YouTube Video Fetcher</h1>

            <div className="mb-6">
                <SearchBar
                    initialValue={searchQuery}
                    onSearch={handleSearch}
                />
            </div>

            <Filters
                onApplyFilters={handleFilterApply}
                initialFilters={{
                    tags: initialTags,
                    channelId: initialChannelId,
                    sort: initialSort,
                    order: initialOrder
                }}
            />

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(initialLimit)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-300 h-48 rounded-lg mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {videos.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-600">No videos found. Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <>
                            <p className="mb-4 text-gray-600">Found {pagination?.totalItems || 0} videos</p>

                            <VideoGrid videos={videos} loading={loading}/>

                            {pagination && (
                                <Pagination
                                    pagination={pagination}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;

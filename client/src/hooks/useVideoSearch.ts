import {useState, useEffect, useCallback, useRef} from 'react';
import { searchVideos, SearchParams, ApiResponse } from '../services/api';

export const useVideoSearch = (initialParams: SearchParams = {}) => {
    const [params, setParams] = useState<SearchParams>(initialParams);
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const paramsString = JSON.stringify(params);

            setLoading(true);
            try {
                const result = await searchVideos(params);
                setData(result);
                setError(null);
            } catch( err) {
                console.log('Error fetching videos:', err);
                setError('Failed to fetch videos. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params]);

    const updateSearch = useCallback(
        (newParams: SearchParams) => {
            setParams(prev => ({
                ...prev,
                ...newParams,
                page: newParams.page !== undefined ? newParams.page : 1
            }));
        },
        []
    );

    const nextPage = () => {
        if( data?.pagination.hasNextPage) {
            setParams(prev => ({
                ...prev,
                page: (prev.page || 1) + 1
            }));
        };
    };

    const prevPage = () => {
        if( data?.pagination?.hasPrevPage) {
            setParams(prev => ({
                ...prev,
                page: (prev.page || 2) - 1
            }));
        }
    };

    const setPage = useCallback((page: number) => {
        setParams(prev => ({
            ...prev,
            page
        }));
    }, [])


    return {
        videos: data?.data || [],
        pagination: data?.pagination,
        loading,
        error,
        updateSearch,
        nextPage,
        prevPage,
        setPage
    };
};

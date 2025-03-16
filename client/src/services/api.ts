import axios from 'axios';

const API_BASE_URL = '/api';

export interface Video {
    _id: string;
    videoId: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    channelId: string;
    tags?: string[];
}

export interface SearchParams {
    search?: string;
    partial?: boolean;
    tags?: string;
    channelId?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ApiResponse {
    success: boolean;
    count: number;
    total: number;
    pagination: PaginationInfo;
    data: Video[];
}

export const searchVideos = async (params: SearchParams): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();

    if( params.search) queryParams.append('search', params.search);
    if( params.partial !== undefined) queryParams.append('partial', params.partial.toString());
    if (params.tags) queryParams.append('tags', params.tags);
    if (params.channelId) queryParams.append('channelId', params.channelId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await axios.get(`${API_BASE_URL}/search/advanced?${queryParams.toString()}`);
    return response.data;
};

export const getVideoById = async (videoId: string): Promise<Video> => {
    const response = await axios.get(`${API_BASE_URL}/videos/${videoId}`);
    return response.data.data;
}

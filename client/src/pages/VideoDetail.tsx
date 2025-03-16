import React, { useEffect, useState } from 'react';
import {useParams, Link, useLocation} from 'react-router-dom';
import { getVideoById, Video } from '../services/api';

export const VideoDetail: React.FC = () => {
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [returnUrl] = useState(`/${location.search}`);

    useEffect(() => {
        const fetchVideo = async () => {
            if( !id) return;

            try {
                setLoading(true);
                const data = await getVideoById(id);
                setVideo(data);
                setError(null);
            } catch( err) {
                console.error('Error fetching video:', err);
                setError('Failed to load video details');
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    const formatDate = (dateString: string) => {
        if( !dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if( loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-96 bg-gray-300 rounded-lg mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
                    <div className="h-32 bg-gray-300 rounded mb-4"></div>
                </div>
            </div>
        );
    }

    if( error || !video) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{error || 'Video not found'}</p>
                </div>
                <Link to={returnUrl} className="text-blue-600 hover:underline">
                    ← Back to videos
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to={returnUrl} className="flex items-center text-blue-600 hover:underline mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to videos
            </Link>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                    <iframe
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-[480px]"
                    ></iframe>
                </div>

                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2">{video.title}</h1>

                    <div className="flex flex-wrap items-center text-gray-600 mb-4">
                        <span className="mr-4">{formatDate(video.publishedAt)}</span>

                        <a
                            href={`https://www.youtube.com/channel/${video.channelId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                        >
                            {video.channelTitle}
                        </a>
                    </div>

                    {video.tags && video.tags.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            {video.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {tag}
                    </span>
                            ))}
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <h2 className="text-lg font-semibold mb-2">Description</h2>
                        <p className="text-gray-700 whitespace-pre-line">{video.description}</p>
                    </div>

                    <div className="mt-6">
                        <a
                            href={`https://www.youtube.com/watch?v=${video.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            Watch on YouTube
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

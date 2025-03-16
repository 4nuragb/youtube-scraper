import React from 'react';
import { Video } from '../services/api';
import VideoCard from './VideoCard';

interface VideoGridProps {
    videos: Video[];
    loading: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, loading }) => {
    if( loading) {
        return (
            <div className="w-full space-y-4">
                {
                    [...Array(8)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-gray-200 rounded-lg h-64 w-full animate-pules"
                        />
                    ))
                }
            </div>
        );
    }

    if( videos.length === 0) {
        return (
            <div className="text-center py-10 w-full">
                <h3 className="text-xl font-semibold text-gray-700">No videos found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your seearch or filters</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {
                videos.map(video =>(
                    <VideoCard key={video.videoId} video={video}/>
                ))
            }
        </div>
    )
}

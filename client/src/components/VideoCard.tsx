import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Video} from '../services/api';

interface VideoCardProps {
    video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({video}) => {
    const location = useLocation();
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getThumbnailUrl = () => {
        const placeholderUrl = 'https://via.placeholder.com/320x180?text=No+Thumbnail';

        if( !video.thumbnails) return placeholderUrl;
        if( video.thumbnails.medium?.url) return video.thumbnails.medium.url;
        if( video.thumbnails.high?.url) return video.thumbnails.high.url;
        if( video.thumbnails.default?.url) return video.thumbnails.default.url;
        return placeholderUrl;
    };

    const secureUrl = (url: string) => {
        return url.replace('http://', 'https://');
    };

    const truncateDescription = (description: string) => {
        if( !description) return '';
        const words = description.split(/\s+/);
        if( words.length <= 200) return description;
        return words.slice(0,200).join(' ') + '...';
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
                <Link
                    to={`/video/${video.videoId}${location.search}`}
                    className="md:w-1/3 lg:w-1/4"
                >
                    <img
                        src={secureUrl(getThumbnailUrl())}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                </Link>

                <div className="p-4 md:w-2/3 lg:w-3/4">
                    <Link to={`/video/${video.videoId}${location.search}`}>
                        <h3 className="text-lg font-semibold mb-1 hover:text-blue-600">{video.title}</h3>
                    </Link>

                    <p className="text-sm text-gray-600 mb-2">{video.channelTitle}</p>
                    <p className="text-xs text-gray-500">{formatDate(video.publishedAt)}</p>

                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{truncateDescription(video.description)}</p>

                    {video.tags && video.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {
                                video.tags.slice(0, 3).map(tag => (
                                    <span key={tag}
                                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {tag}
                                    </span>
                                ))
                            }
                            {video.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                    +{video.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCard;

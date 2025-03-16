import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
    videoId: string;
    title: string;
    description: string;
    publishedAt: Date;
    thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
        standard?: { url: string; width: number; height: number };
        maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    channelId: string;
    tags?: string[];
    viewCount: number;
    likeCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const VideoSchema: Schema = new Schema({
    videoId: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, index: true, trim: true },
    description: { type: String, required: true},
    publishedAt: { type: Date, required: true, index: true },
    thumbnails: {
        default: {
            url: String,
            width: Number,
            height: Number
        },
        medium: {
            url: String,
            width: Number,
            height: Number
        },
        high: {
            url: String,
            width: Number,
            height: Number
        },
        standard: {
            url: String,
            width: Number,
            height: Number
        },
        maxres: {
            url: String,
            width: Number,
            height: Number
        }
    },
    channelTitle: { type: String, required: true, trim: true, index: true },
    channelId: { type: String, required: true, trim: true, index: true },
    tags: [String],
    viewCount: Number,
    likeCount: Number
}, { timestamps: true });

VideoSchema.index({tags: 1});

VideoSchema.index({
    title: 'text',
    description: 'text'
}, {
    weights: {
        title: 10,
        description: 5
    },
    name: "title_description_text_index"
});

VideoSchema.index({ channelId: 1, publishedAt: -1});

VideoSchema.pre('save', function(next) {
    if( this.description === '') this.description = 'No description available';
    next();
});

VideoSchema.statics = {
    // To find videos by partial match in title or description
    findByPartialMatch: function(searchTerm: string) {
        const regex = new RegExp(searchTerm.split(' ').join('|'), 'i');
        return this.find({
            $or: [
                { title: regex },
                { description: regex }
            ]
        }).sort({ publishedAt: -1});
    }
};

export default mongoose.model<IVideo>('Video', VideoSchema);

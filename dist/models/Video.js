"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const VideoSchema = new mongoose_1.Schema({
    videoId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, index: true, trim: true },
    description: { type: String, required: true, index: true },
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
    channelTitle: { type: String, required: true, trim: true },
    channelId: { type: String, required: true, trim: true, index: true },
    tags: [String],
    viewCount: Number
}, { timestamps: true });
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
VideoSchema.pre('save', function (next) {
    if (this.description === '')
        this.description = 'No description available';
    next();
});
VideoSchema.statics = {
    // To find videos by partial match in title or description
    findByPartialMatch: function (searchTerm) {
        const regex = new RegExp(searchTerm.split(' ').join('|'), 'i');
        return this.find({
            $or: [
                { title: regex },
                { description: regex }
            ]
        }).sort({ publishedAt: -1 });
    }
};
exports.default = mongoose_1.default.model('Video', VideoSchema);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyManager = void 0;
// src/utils/apiKeyManager.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class ApiKeyManager {
    constructor() {
        const keys = process.env.YOUTUBE_API_KEYS || '';
        this.apiKeys = keys.split(',').map(key => key.trim()).filter(key => key.length > 0);
        if (this.apiKeys.length === 0) {
            throw new Error('No YouTube API keys provided. Please set YOUTUBE_API_KEYS in your .env file.');
        }
        this.currentKeyIndex = 0;
        this.quotaExhaustedKeys = new Set();
        this.keyUsageCounts = new Map();
        this.lastKeyRotation = new Date();
        this.apiKeys.forEach((_, index) => {
            this.keyUsageCounts.set(index, 0);
        });
        console.log(`Initialized API Key Manager with ${this.apiKeys.length} keys`);
    }
    getCurrentKey() {
        return this.apiKeys[this.currentKeyIndex];
    }
    getNextAvailableKey() {
        if (this.quotaExhaustedKeys.size === this.apiKeys.length) {
            console.log('All API keys are exhausted. Resetting exhausted keys list.');
            this.quotaExhaustedKeys.clear();
            this.resetUsageCounts();
        }
        let attempts = 0;
        while (attempts < this.apiKeys.length) {
            this.rotateKey();
            if (!this.quotaExhaustedKeys.has(this.currentKeyIndex)) {
                return this.getCurrentKey();
            }
            attempts++;
        }
        throw new Error('No No available Youtube API Keys. All keys have reached their quota limits.');
    }
    markKeyAsExhausted() {
        console.log(`Marking API key #${this.currentKeyIndex + 1} as exhausted`);
        this.quotaExhaustedKeys.add(this.currentKeyIndex);
        return this.getNextAvailableKey();
    }
    incrementUsageCount() {
        const currentCount = this.keyUsageCounts.get(this.currentKeyIndex) || 0;
        this.keyUsageCounts.set(this.currentKeyIndex, currentCount + 1);
        if (currentCount >= 50) {
            console.log(`Key #${this.currentKeyIndex + 1} has been used ${currentCount} times. Rotating.`);
            this.rotateKey();
        }
    }
    resetUsageCounts() {
        this.apiKeys.forEach((_, index) => {
            this.keyUsageCounts.set(index, 0);
        });
        console.log('Reset usage counts for all API keys');
    }
    rotateKey() {
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        this.lastKeyRotation = new Date();
        console.log(`Rotated to API key #${this.currentKeyIndex + 1}`);
    }
    getAvailableKeyCount() {
        return this.apiKeys.length - this.quotaExhaustedKeys.size;
    }
    getKeyStats() {
        const usageCounts = {};
        this.keyUsageCounts.forEach((count, index) => {
            usageCounts[index] = count;
        });
        return {
            totalKeys: this.apiKeys.length,
            availableKeys: this.getAvailableKeyCount(),
            exhaustedKeys: this.quotaExhaustedKeys.size,
            currentKeyIndex: this.currentKeyIndex,
            usageCounts,
            lastRotation: this.lastKeyRotation
        };
    }
}
exports.apiKeyManager = new ApiKeyManager();

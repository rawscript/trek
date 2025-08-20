import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from "../types";
import { config, logger, features } from "../config/env";

let ai: GoogleGenAI | null = null;

// Initialize AI only if API key is available
if (features.isAIAvailable()) {
    try {
        ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
        logger.info("Gemini AI initialized successfully");
    } catch (error) {
        logger.error("Failed to initialize Gemini AI:", error);
        ai = null;
    }
} else {
    logger.warn("Gemini AI not available - API key missing");
}

let chatInstance: Chat | null = null;

const getChatInstance = (): Chat | null => {
    if (!ai) return null;
    
    if (!chatInstance) {
        try {
            chatInstance = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are Trekly AI, a friendly and motivational assistant for cyclists and runners. 
                    You help users plan routes, set goals, and provide affirmations. Keep your responses concise, positive, and encouraging. 
                    Use emojis to make the conversation lively. You are talking to a user of the Trekly app.`,
                },
            });
        } catch (error) {
            logger.error("Failed to create chat instance:", error);
            return null;
        }
    }
    return chatInstance;
}

export const streamChatMessage = (history: ChatMessage[], newMessage: string) => {
    if (!features.isAIAvailable() || !ai) {
        throw new Error("AI chat is not available. Please check your API configuration.");
    }
    
    const chat = getChatInstance();
    if (!chat) {
        throw new Error("Failed to initialize chat. Please try again.");
    }
    
    return chat.sendMessageStream({ message: newMessage });
};

export const getMotivationMessage = async (activityType: 'Cycle' | 'Run', goal: number, distanceCovered: number): Promise<string> => {
    const distanceRemaining = (goal - distanceCovered).toFixed(1);
    
    // Fallback messages for when AI is not available
    const fallbackMessages = [
        `You're doing amazing! Just ${distanceRemaining} km to go! 🚴‍♂️💪`,
        `Keep that momentum going! ${distanceRemaining} km left - you've got this! 🏃‍♂️⚡`,
        `Almost there! Push through these last ${distanceRemaining} km! 🔥💯`,
        `You're stronger than you think! ${distanceRemaining} km to victory! 🏆✨`,
        `Don't stop now! ${distanceRemaining} km between you and success! 🎯🚀`
    ];
    
    if (!features.isAIAvailable() || !ai) {
        const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
        return fallbackMessages[randomIndex];
    }

    const prompt = `I'm currently on a ${activityType.toLowerCase()}. My goal is ${goal} km. I've covered ${distanceCovered.toFixed(1)} km so far, with ${distanceRemaining} km left. Give me a short, punchy, and encouraging message (max 2 sentences) to keep me motivated. Be upbeat and include a relevant emoji!`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || fallbackMessages[0];
    } catch (error) {
        logger.error("Error fetching motivation message:", error);
        const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
        return fallbackMessages[randomIndex];
    }
};

export const getAIInsight = async (heartRateData: number[]): Promise<string> => {
    if (heartRateData.length < 5) {
        return "Not enough data for an insight yet. Keep recording data during an activity!";
    }

    const avgHeartRate = Math.round(heartRateData.reduce((a, b) => a + b, 0) / heartRateData.length);
    const maxHeartRate = Math.max(...heartRateData);
    const minHeartRate = Math.min(...heartRateData);

    // Generate fallback insights based on heart rate data
    const generateFallbackInsight = () => {
        const insights = [];
        
        if (avgHeartRate < 120) {
            insights.push("Great steady-state workout! Your controlled heart rate shows excellent endurance training. 💚");
        } else if (avgHeartRate < 150) {
            insights.push("Nice aerobic zone training! This heart rate range is perfect for building cardiovascular fitness. 🏃‍♂️");
        } else {
            insights.push("Intense session! That high heart rate shows you really pushed your limits today. 🔥");
        }
        
        if (maxHeartRate - minHeartRate > 50) {
            insights.push("Good heart rate variability during your workout - shows you mixed intensities well! 📈");
        }
        
        return insights[Math.floor(Math.random() * insights.length)];
    };

    if (!features.isAIAvailable() || !ai) {
        return generateFallbackInsight();
    }

    const prompt = `I just completed a workout. Here is my heart rate data (in bpm):
- Average: ${avgHeartRate}
- Max: ${maxHeartRate}
- Min: ${minHeartRate}

Based on this, give me one short, positive, and actionable insight (2-3 sentences) about my performance or recovery. Frame it as a friendly AI coach. Include an emoji.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        if (!response.text) {
            return generateFallbackInsight();
        }
        return response.text;
    } catch (error) {
        logger.error("Error fetching AI insight:", error);
        return generateFallbackInsight();
    }
};

export const getIncompleteActivityMessage = async (activityType: 'Cycle' | 'Run', goal: number, distanceCovered: number): Promise<string> => {
    const distanceRemaining = (goal - distanceCovered).toFixed(1);
    
    const fallbackMessages = [
        `You're so close! Just ${distanceRemaining} km to go. You've got this! 💪`,
        `Don't give up now! ${distanceRemaining} km is nothing compared to what you've already achieved! 🏆`,
        `Think about how great you'll feel finishing strong! Only ${distanceRemaining} km left! 🌟`,
        `You've come this far - ${distanceRemaining} km more and you'll have conquered your goal! 🚀`
    ];
    
    if (!features.isAIAvailable() || !ai) {
        const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
        return fallbackMessages[randomIndex];
    }

    const prompt = `I'm trying to finish my ${activityType.toLowerCase()} early. My goal was ${goal} km, but I've only done ${distanceCovered.toFixed(1)} km. I have ${distanceRemaining} km left. Give me a short, friendly, but professional and encouraging message (2-3 sentences) that nudges me to finish the last bit. Frame it from the perspective of a supportive AI coach.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || fallbackMessages[0];
    } catch (error) {
        logger.error("Error fetching incomplete activity message:", error);
        const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
        return fallbackMessages[randomIndex];
    }
};

// Fallback image generation using placeholder services
const generateFallbackActivityImage = async (prompt: string): Promise<string> => {
    const keywords = prompt.toLowerCase();
    let category = 'nature';
    
    if (keywords.includes('cycle') || keywords.includes('bike')) {
        category = 'sports';
    } else if (keywords.includes('run') || keywords.includes('jog')) {
        category = 'sports';
    } else if (keywords.includes('mountain') || keywords.includes('trail')) {
        category = 'nature';
    }
    
    // Use Unsplash or similar service for fallback images
    const fallbackUrls = [
        `https://picsum.photos/400/600?random=${Date.now()}`,
        `https://source.unsplash.com/400x600/?${category},fitness`,
        `https://source.unsplash.com/400x600/?workout,${category}`,
        `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop`
    ];
    
    // Try each fallback URL
    for (const url of fallbackUrls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
            }
        } catch (error) {
            logger.warn("Fallback image URL failed:", url);
        }
    }
    
    // Final fallback - return a data URL for a simple colored rectangle
    return 'data:image/svg+xml;base64,' + btoa(`
        <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#34D399;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#60A5FA;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="400" height="600" fill="url(#grad1)" />
            <text x="200" y="300" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
                🏃‍♂️ Activity Complete! 🏃‍♂️
            </text>
        </svg>
    `);
};

const generateFallbackCampaignImage = async (prompt: string): Promise<string> => {
    const keywords = prompt.toLowerCase();
    let category = 'charity';
    
    if (keywords.includes('cycle') || keywords.includes('bike')) {
        category = 'cycling,charity';
    } else if (keywords.includes('run') || keywords.includes('marathon')) {
        category = 'running,charity';
    } else if (keywords.includes('health') || keywords.includes('medical')) {
        category = 'healthcare,charity';
    }
    
    const fallbackUrls = [
        `https://source.unsplash.com/800x450/?${category}`,
        `https://source.unsplash.com/800x450/?fundraising,community`,
        `https://picsum.photos/800/450?random=${Date.now()}`
    ];
    
    for (const url of fallbackUrls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
            }
        } catch (error) {
            logger.warn("Fallback campaign image URL failed:", url);
        }
    }
    
    // Final fallback
    return 'data:image/svg+xml;base64,' + btoa(`
        <svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#EF4444;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="800" height="450" fill="url(#grad2)" />
            <text x="400" y="225" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle">
                🎯 Fundraising Campaign 🎯
            </text>
        </svg>
    `);
};

export const generateActivityImage = async (prompt: string): Promise<string> => {
    if (!features.isImageGenerationAvailable() || !ai) {
        logger.info("Using fallback activity image generation");
        return generateFallbackActivityImage(prompt);
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '3:4',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated by the API.");
        }
    } catch (error) {
        logger.error("Error generating activity image:", error);
        return generateFallbackActivityImage(prompt);
    }
};

export const generateCampaignImage = async (prompt: string): Promise<string> => {
    if (!features.isImageGenerationAvailable() || !ai) {
        logger.info("Using fallback campaign image generation");
        return generateFallbackCampaignImage(prompt);
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `A high-quality, vibrant, and inspiring photograph for a fundraising campaign. The theme is: "${prompt}". Photorealistic style.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated by the API.");
        }
    } catch (error) {
        logger.error("Error generating campaign image:", error);
        return generateFallbackCampaignImage(prompt);
    }
};

export const generateAvatarImages = async (prompt: string): Promise<string[]> => {
    // Generate fallback avatars using external services
    const generateFallbackAvatars = async (): Promise<string[]> => {
        const fallbackAvatars = [];
        const basePrompt = encodeURIComponent(prompt);
        
        for (let i = 1; i <= 4; i++) {
            // Using different avatar services as fallback
            const services = [
                `https://api.dicebear.com/7.x/adventurer/svg?seed=${basePrompt}-${i}`,
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${basePrompt}-${i}`,
                `https://api.dicebear.com/7.x/big-smile/svg?seed=${basePrompt}-${i}`,
                `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${basePrompt}-${i}`
            ];
            
            // Convert SVG to data URL for consistency
            try {
                const response = await fetch(services[(i-1) % services.length]);
                const svgText = await response.text();
                const base64 = btoa(svgText);
                fallbackAvatars.push(`data:image/svg+xml;base64,${base64}`);
            } catch (fetchError) {
                // If even the fallback fails, use a simple generated avatar
                fallbackAvatars.push(`https://i.pravatar.cc/150?u=${basePrompt}-${i}`);
            }
        }
        
        return fallbackAvatars;
    };

    if (!features.isImageGenerationAvailable() || !ai) {
        logger.info("Using fallback avatar generation");
        return generateFallbackAvatars();
    }

    try {
        // First, try to use Gemini's image generation
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `A vibrant, friendly, and clean avatar for a social fitness app. The style should be modern and slightly illustrated. Theme: "${prompt}".`,
            config: {
                numberOfImages: 4,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        } else {
            throw new Error("No images were generated by the API.");
        }
    } catch (error) {
        logger.error("Error generating avatar images with Gemini:", error);
        logger.info("Falling back to placeholder avatars based on prompt:", prompt);
        return generateFallbackAvatars();
    }
};
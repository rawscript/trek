import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

let chatInstance: Chat | null = null;

const getChatInstance = (): Chat => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are Trekly AI, a friendly and motivational assistant for cyclists and runners. 
                You help users plan routes, set goals, and provide affirmations. Keep your responses concise, positive, and encouraging. 
                Use emojis to make the conversation lively. You are talking to a user of the Trekly app.`,
            },
        });
    }
    return chatInstance;
}

export const streamChatMessage = (history: ChatMessage[], newMessage: string) => {
    const chat = getChatInstance();
    // The Gemini API currently doesn't support passing full history for `sendMessageStream` in the same way as `sendMessage`. 
    // We send the new message and manage history on the client.
    // For a more robust solution with history, you would rebuild the chat instance or use non-streaming `sendMessage`.
    // For this app, a stateless stream is sufficient.
    return chat.sendMessageStream({ message: newMessage });
};

export const getMotivationMessage = async (activityType: 'Cycle' | 'Run', goal: number, distanceCovered: number): Promise<string> => {
    const distanceRemaining = (goal - distanceCovered).toFixed(1);
    const prompt = `I'm currently on a ${activityType.toLowerCase()}. My goal is ${goal} km. I've covered ${distanceCovered.toFixed(1)} km so far, with ${distanceRemaining} km left. Give me a short, punchy, and encouraging message (max 2 sentences) to keep me motivated. Be upbeat and include a relevant emoji!`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching motivation message:", error);
        return "Keep pushing, you're doing great! 💪"; // Fallback message
    }
};

export const getAIInsight = async (heartRateData: number[]): Promise<string> => {
    if (heartRateData.length < 5) {
        return "Not enough data for an insight yet. Keep recording data during an activity!";
    }

    const avgHeartRate = Math.round(heartRateData.reduce((a, b) => a + b, 0) / heartRateData.length);
    const maxHeartRate = Math.max(...heartRateData);
    const minHeartRate = Math.min(...heartRateData);

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
          throw new Error("Received an empty response from the AI.");
        }
        return response.text;
    } catch (error) {
        console.error("Error fetching AI insight:", error);
        throw new Error("Failed to get an insight from the AI Coach.");
    }
};

export const getIncompleteActivityMessage = async (activityType: 'Cycle' | 'Run', goal: number, distanceCovered: number): Promise<string> => {
    const distanceRemaining = (goal - distanceCovered).toFixed(1);
    const prompt = `I'm trying to finish my ${activityType.toLowerCase()} early. My goal was ${goal} km, but I've only done ${distanceCovered.toFixed(1)} km. I have ${distanceRemaining} km left. Give me a short, friendly, but professional and encouraging message (2-3 sentences) that nudges me to finish the last bit. Frame it from the perspective of a supportive AI coach.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching incomplete activity message:", error);
        return `You're so close! Just ${distanceRemaining} km to go. You've got this! Are you sure you want to stop now?`;
    }
};

export const generateActivityImage = async (prompt: string): Promise<string> => {
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
        console.error("Error generating activity image:", error);
        throw new Error("Failed to generate a custom image for your activity.");
    }
};

export const generateCampaignImage = async (prompt: string): Promise<string> => {
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
        console.error("Error generating campaign image:", error);
        throw new Error("Failed to generate a custom image for the campaign.");
    }
};

export const generateAvatarImages = async (prompt: string): Promise<string[]> => {
    try {
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
        console.error("Error generating avatar images:", error);
        throw new Error("Failed to generate custom avatar images.");
    }
};
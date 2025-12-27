
import { GoogleGenAI, Type } from "@google/genai";
import { TextOverlayConfig } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts visual features from an image using Gemini.
 */
export const generateVisualPrompt = async (
  image: string,
  systemRole: string,
  userPrompt: string,
  lang: 'zh' | 'en'
): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const base64Data = image.split(',')[1];
  const mimeType = image.split(';')[0].split(':')[1];

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: `System Role: ${systemRole}\nUser Intent: ${userPrompt}\n\nTask: Analyze the visual features of this image and extract core descriptors for a high-quality storyboard reference. Output language: ${lang === 'zh' ? 'Chinese' : 'English'}. Be descriptive but concise.` }
      ]
    }
  });

  return response.text || "";
};

/**
 * Generates a storyboard sequence outline based on visual context.
 */
export const generateAutoStoryboard = async (
  context: string,
  shotCount: number,
  lang: 'zh' | 'en'
): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: `Based on this visual context:\n${context}\n\nGenerate a detailed ${shotCount}-shot storyboard outline. For each shot, specify: Action, Camera Movement, and Atmosphere. Language: ${lang === 'zh' ? 'Chinese' : 'English'}.`
  });

  return response.text || "";
};

/**
 * Generates an actual image using the Gemini image generation model.
 */
export const generateStoryboardImage = async (
  prompt: string,
  style: string,
  aspectRatio: string,
  textOverlay: TextOverlayConfig,
  modelName: string = 'gemini-2.5-flash-image'
): Promise<string | null> => {
  const ai = getAI();
  
  // Clean aspect ratio format
  const validAspectRatio = (aspectRatio.includes(':') ? aspectRatio : '1:1') as any;

  const fullPrompt = `Art Style: ${style}. Scene Description: ${prompt}. ${textOverlay.enabled ? `Overlay text: "${textOverlay.content}". Typography style: ${textOverlay.style.custom || textOverlay.style.selected}. Font color: ${textOverlay.color}.` : ''}`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: [{ text: fullPrompt }] },
    config: {
      imageConfig: {
        aspectRatio: validAspectRatio,
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Syncs audio suggestions based on visual action description.
 */
export const syncAudioVisual = async (
  action: string,
  duration: number,
  lang: 'zh' | 'en',
  bgm?: string,
  dialog?: string
): Promise<any> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model,
    contents: `Analyze this scene action: "${action}" (Duration: ${duration}s). 
    Suggest: 1. Ambient Audio description, 2. SFX, 3. BGM direction, 4. Dialog tweak.
    Current BGM ref: ${bgm || 'None'}. Current Dialog ref: ${dialog || 'None'}.
    Output in JSON format with keys: audio, sfx, bgm, dialog. Language: ${lang === 'zh' ? 'Chinese' : 'English'}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          audio: { type: Type.STRING },
          sfx: { type: Type.STRING },
          bgm: { type: Type.STRING },
          dialog: { type: Type.STRING }
        },
        required: ["audio", "sfx", "bgm", "dialog"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse audio sync JSON", e);
    return null;
  }
};

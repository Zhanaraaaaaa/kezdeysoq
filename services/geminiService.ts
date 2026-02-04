
import { GoogleGenAI, Type } from "@google/genai";
import { DetectedStudent } from "../types";

export const detectStudents = async (base64Image: string): Promise<DetectedStudent[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: "Суреттегі әрбір оқушының (немесе адамның) орнын анықта. Нәтижені JSON форматында қайтар. Әр оқушы үшін 'name' (мысалы, 'Оқушы 1') және 'box_2d' [ymin, xmin, ymax, xmax] түрінде (0-1000 аралығындағы нормаланған координаттар) болсын."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detected_students: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                box_2d: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER }
                }
              },
              required: ["name", "box_2d"]
            }
          }
        },
        required: ["detected_students"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{"detected_students": []}');
    return data.detected_students.map((s: any, index: number) => ({
      id: `student-${index}`,
      name: s.name,
      box: s.box_2d
    }));
  } catch (error) {
    console.error("Failed to parse detection response:", error);
    return [];
  }
};


import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const IQRA_CONTEXT = `
Radio Iqra TV émet sur 96.1 MHz au Burkina Faso. 
Nom : Radio Iqra TV – La Voix du Saint Coran.
Mission : Station islamique dédiée à la diffusion des enseignements authentiques de l'Islam (paix, fraternité, éducation spirituelle).
Signification : "Iqra" signifie "Lis", rappelant l'importance de la connaissance.
Programmes : 
1. Éducation religieuse : Tafsir du Coran, Hadiths, piliers de l’Islam.
2. Culture : Diversité culturelle musulmane du Burkina Faso.
3. Inspiration : Conférences, témoignages, valeurs islamiques.
4. Communauté : Infos locales, conseils sociaux, initiatives caritatives.
`;

export const getRadioFacts = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `En te basant sur ce contexte : "${IQRA_CONTEXT}", génère 3 faits courts, inspirants et éducatifs sur l'Islam ou la radio pour les auditeurs. Réponds en JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching facts from Gemini:", error);
    return [
      { title: "L'Impératif Iqra", content: "Le nom de notre station vient du premier mot révélé du Coran, signifiant 'Lis', soulignant l'importance du savoir." },
      { title: "La Voix de la Paix", content: "Radio Iqra TV s'engage à diffuser un message de fraternité et de paix à travers tout le Burkina Faso." },
      { title: "Éducation & Spiritualité", content: "Retrouvez quotidiennement nos programmes de Tafsir et d'enseignements sur les piliers de l'Islam." }
    ];
  }
};

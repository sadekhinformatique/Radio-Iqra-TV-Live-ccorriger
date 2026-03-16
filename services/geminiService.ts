
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BOURGADE_CONTEXT = `
Bourgade FM émet sur 94.3 à Ouahigouya (Burkina Faso). 
Logo : Un baobab symbolisant la protection, la nourriture et la guérison.
Slogan : "C'est l'auditoire qui décide !".
Promoteur : El Hadj Hamadé Nabalma (alias Ladji Hamed), journaliste avec 22 ans d'expérience, décoré Chevalier de l'Ordre de l'Etalon.
Particularités : Radio généraliste, rigueur professionnelle, impartialité totale, promotion de la culture locale (Yadga, Liptako).
Groupe : Curieux Médias SA.
`;

export const getRadioFacts = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `En te basant sur ce contexte : "${BOURGADE_CONTEXT}", génère 3 faits courts, percutants et élégants pour les auditeurs de l'application web. Réponds en JSON.`,
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

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching facts from Gemini:", error);
    return [
      { title: "Le Symbole du Baobab", content: "Notre logo représente la force et la bienveillance de cet arbre sacré qui nourrit et protège." },
      { title: "L'Expérience au Micro", content: "Sous la direction de Ladji Hamed Nabalma, Bourgade FM bénéficie de 22 ans d'expertise médiatique." },
      { title: "94.3 FM à Ouahigouya", content: "Au cœur du Yadga, nous portons la voix des bourgs et des faubourgs jusqu'à vos oreilles." }
    ];
  }
};

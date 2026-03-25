/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSchemaFromAI(
  prompt: string, 
  currentSchema?: { tables: any[]; relations: any[] }
) {
  const systemPrompt = `
    You are an expert database architect. 
    Convert the user's request into a JSON database schema.
    The JSON must strictly follow this structure:
    {
      "tables": [
        {
          "id": "string",
          "name": "string",
          "position": { "x": number, "y": number },
          "columns": [
            { "id": "string", "name": "string", "type": "UUID|VARCHAR|INT|TEXT|BOOLEAN|DATE|JSON", "isPrimary": boolean, "isUnique": boolean }
          ]
        }
      ],
      "relations": [
        { "id": "string", "sourceTableId": "string", "sourceColumnId": "string", "targetTableId": "string", "targetColumnId": "string", "type": "1:1|1:n|m:n" }
      ]
    }
    Rules:
    - Space tables out by 300px on the x-axis and 400px on the y-axis.
  `;

  // Provide the AI with the current context so it can iterate
  let finalPrompt = prompt;
  if (currentSchema && currentSchema.tables.length > 0) {
    finalPrompt = `
      CURRENT SCHEMA STATE:
      ${JSON.stringify(currentSchema)}

      USER REQUEST: "${prompt}"

      INSTRUCTIONS:
      Modify the CURRENT SCHEMA STATE based on the USER REQUEST. 
      If they say "make it simpler", remove unnecessary tables from the current state.
      If they say "add a billing table", keep the current state and just add the new table and relations.
      Keep existing table/column IDs exactly the same so the UI doesn't break.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate schema");
  }
}
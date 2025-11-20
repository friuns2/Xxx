import { GoogleGenAI, Type } from "@google/genai";
import { BoardState, Player, MoveResult } from "../types";

// Initialize the API client
// Note: In a real production build, this env var must be available at build time or runtime.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiMove = async (board: BoardState, aiPlayer: Player): Promise<MoveResult> => {
  try {
    const boardStr = board.map((cell, i) => (cell ? cell : i)).join(" | ");
    
    const systemInstruction = `
      You are playing Tic-Tac-Toe. You are player ${aiPlayer}.
      The board is a 3x3 grid represented by indices 0-8.
      The current board state is provided where numbers are empty spots and X/O are occupied.
      
      Your goal is to win, or draw if winning is impossible.
      Block the opponent if they are about to win.
      
      You must also provide a short, witty, slightly sassy comment (max 10 words) about your move.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Current board state: [ ${boardStr} ]. Pick the best available index number to place your '${aiPlayer}'.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: {
              type: Type.INTEGER,
              description: "The index (0-8) of the cell to place your mark.",
            },
            comment: {
              type: Type.STRING,
              description: "A short, witty comment about the move.",
            },
          },
          required: ["move", "comment"],
        },
      },
    });

    if (response.text) {
        const json = JSON.parse(response.text);
        return {
            index: json.move,
            comment: json.comment
        };
    }
    
    throw new Error("Empty response from Gemini");

  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Fallback to a random valid move if AI fails
    const availableIndices = board
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null) as number[];
    
    const randomMove = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    
    return {
      index: randomMove,
      comment: "I'm having trouble thinking... random move!"
    };
  }
};
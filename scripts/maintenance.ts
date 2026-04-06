import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function runMaintenance() {
  const task = process.argv.slice(2).join(" ") || "Summarize the current compliance categories and requirements.";
  
  console.log(`🤖 Maintenance Agent: Processing task: "${task}"...`);

  // Read project files for context
  const constantsPath = path.join(process.cwd(), 'src', 'constants.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf-8');

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash-latest",
    contents: [
      {
        parts: [
          { text: `You are a DevOps Compliance Agent. Your project context is: ${constantsContent}` },
          { text: `Your task is: ${task}` }
        ]
      }
    ]
  });

  console.log("\n--- AGENT RESPONSE ---");
  console.log(response.text);
  console.log("----------------------\n");
}

runMaintenance().catch(console.error);

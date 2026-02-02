import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FeedbackAnalysis, QuizItem } from "../types";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Course Gen (Streaming) ---
export const streamCourseOutline = async (
  topic: string,
  audience: string,
  duration: string,
  style: string,
  onChunk: (text: string) => void
) => {
  const ai = getClient();
  const prompt = `
    Role: Professional Corporate Training Specialist.
    Task: Create a structured training course outline in Simplified Chinese.
    Topic: ${topic}
    Target Audience: ${audience}
    Duration: ${duration}
    Style/Tone: ${style}

    Output Format: Markdown. 
    Requirements:
    - Use H2 (##) for main sections.
    - Use H3 (###) for subsections.
    - Use bullet points for details.
    - Structure:
      1. 课程标题 (Title)
      2. 课程背景与目标 (Context & Objectives)
      3. 详细大纲 (Detailed Agenda with time allocation)
      4. 教学方法 (Methodology)
      5. 总结 (Summary)
    
    Language: Simplified Chinese (简体中文).
    Do not include conversational filler. Start directly with the markdown content.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Course Gen Error:", error);
    throw error;
  }
};

// --- Quiz Gen (Structured JSON) with Multimodal Support ---
export const generateQuiz = async (
  inputData: { text?: string; base64?: string; mimeType?: string },
  count: number,
  difficulty: string
): Promise<QuizItem[]> => {
  const ai = getClient();
  
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: "Question text in Simplified Chinese" },
        type: { type: Type.STRING, enum: ['单选题', '判断题', '多选题'] },
        optionA: { type: Type.STRING },
        optionB: { type: Type.STRING },
        optionC: { type: Type.STRING },
        optionD: { type: Type.STRING },
        answer: { type: Type.STRING, description: "The correct option (e.g., A, B, C, or True/False translated)" },
        explanation: { type: Type.STRING, description: "Explanation in Simplified Chinese" },
      },
      required: ['question', 'type', 'answer', 'explanation'],
    },
  };

  const parts: any[] = [];
  
  if (inputData.base64 && inputData.mimeType) {
    parts.push({
      inlineData: {
        data: inputData.base64,
        mimeType: inputData.mimeType
      }
    });
    parts.push({ text: `Generate ${count} training quiz questions based on this document.` });
  } else if (inputData.text) {
    parts.push({ text: `Generate ${count} training quiz questions based on this content: ${inputData.text.substring(0, 15000)}` });
  }

  const prompt = `
    Role: Expert Exam Question Creator.
    Language: Simplified Chinese (简体中文).
    Difficulty: ${difficulty}.
    
    Requirements:
    - Mix of Single Choice (单选题) and True/False (判断题).
    - For True/False, Option A should be "正确", Option B should be "错误".
    - Provide clear explanations.
  `;
  
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizItem[];
    }
    return [];
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    throw error;
  }
};

// --- Feedback Analysis ---
export const analyzeFeedback = async (feedbackText: string): Promise<FeedbackAnalysis> => {
  const ai = getClient();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      sentiment: {
        type: Type.OBJECT,
        properties: {
          positive: { type: Type.INTEGER, description: "Percentage 0-100" },
          neutral: { type: Type.INTEGER, description: "Percentage 0-100" },
          negative: { type: Type.INTEGER, description: "Percentage 0-100" },
        },
        required: ["positive", "neutral", "negative"],
      },
      keywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Top 5 recurring keywords or phrases in Chinese",
      },
      suggestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Top 3 actionable improvements in Chinese",
      },
    },
    required: ["sentiment", "keywords", "suggestions"],
  };

  const prompt = `
    Role: HR Data Analyst.
    Task: Analyze the following training feedback comments.
    Language: Simplified Chinese (简体中文).
    Feedback Data: "${feedbackText.substring(0, 10000)}"
    
    Goal: Determine sentiment distribution, extract keywords, and provide 3 key improvement suggestions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as FeedbackAnalysis;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Feedback Analysis Error:", error);
    throw error;
  }
};

// --- Survey Generation (New) ---
export const generateSurvey = async (topic: string, type: string): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Role: Professional Survey Designer.
    Task: Design a training survey questionnaire for Tencent Questionnaire (腾讯问卷).
    Training Topic: ${topic}
    Survey Type: ${type}
    Language: Simplified Chinese (简体中文).

    Output Format: Markdown text that is easy to copy.
    Structure:
    1. Title & Introduction (Welcoming and explaining purpose)
    2. Questions (List 5-8 key questions).
       Format each question as: 
       [Question Type: Single Choice/Multiple Choice/Text/Rating]
       Q: [Question Text]
       Options: [Option 1, Option 2...]
    3. Closing (Thank you note).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "";
  } catch (error) {
    console.error("Survey Gen Error:", error);
    throw error;
  }
};

// --- Ops Writer ---
export const streamOpsCopy = async (
  type: string,
  context: string,
  tone: string,
  onChunk: (text: string) => void
) => {
  const ai = getClient();
  const prompt = `
    Role: Internal Comms Specialist.
    Task: Write a ${type} for a training program.
    Language: Simplified Chinese (简体中文).
    Context/Details: ${context}
    Tone: ${tone}

    Output: Professional, ready-to-send copy.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Ops Writer Error:", error);
    throw error;
  }
};

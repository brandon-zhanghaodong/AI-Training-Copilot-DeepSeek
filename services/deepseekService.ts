import OpenAI from "openai";
import { FeedbackAnalysis, QuizItem } from "../types";

// Initialize DeepSeek Client
const getClient = () => {
  // 支持多种环境变量命名方式，兼容不同部署平台
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || 
                 import.meta.env.DEEPSEEK_API_KEY ||
                 import.meta.env.API_KEY ||  // 兼容原始命名
                 process.env.DEEPSEEK_API_KEY ||
                 process.env.API_KEY;  // 兼容原始命名
  
  if (!apiKey) {
    console.error("Available env vars:", Object.keys(import.meta.env));
    console.error("Looking for: DEEPSEEK_API_KEY, API_KEY, VITE_DEEPSEEK_API_KEY");
    throw new Error("缺少 API Key\n\n请提供 API_KEY 环境变量以运行此应用。");
  }
  
  console.log("✅ API Key loaded successfully");
  
  return new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com/v1",
    dangerouslyAllowBrowser: true,
  });
};

// --- Course Gen (Streaming) ---
export const streamCourseOutline = async (
  topic: string,
  audience: string,
  duration: string,
  style: string,
  onChunk: (text: string) => void
) => {
  const client = getClient();
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
    const stream = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
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
  const client = getClient();
  
  const messages: any[] = [];
  
  if (inputData.base64 && inputData.mimeType) {
    messages.push({
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: `data:${inputData.mimeType};base64,${inputData.base64}`
          }
        },
        {
          type: "text",
          text: `Generate ${count} training quiz questions based on this document.`
        }
      ]
    });
  } else if (inputData.text) {
    messages.push({
      role: "user",
      content: `Generate ${count} training quiz questions based on this content: ${inputData.text.substring(0, 15000)}`
    });
  }

  const systemPrompt = `
    Role: Expert Exam Question Creator.
    Language: Simplified Chinese (简体中文).
    Difficulty: ${difficulty}.
    
    Requirements:
    - Mix of Single Choice (单选题) and True/False (判断题).
    - For True/False, Option A should be "正确", Option B should be "错误".
    - Provide clear explanations.
    
    Output Format: JSON array with the following structure:
    [
      {
        "question": "Question text in Simplified Chinese",
        "type": "单选题 or 判断题 or 多选题",
        "optionA": "Option A text",
        "optionB": "Option B text",
        "optionC": "Option C text (optional)",
        "optionD": "Option D text (optional)",
        "answer": "The correct option (e.g., A, B, C, D)",
        "explanation": "Explanation in Simplified Chinese"
      }
    ]
  `;
  
  messages.unshift({ role: "system", content: systemPrompt });

  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
    }
    return [];
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    throw error;
  }
};

// --- Feedback Analysis ---
export const analyzeFeedback = async (feedbackText: string): Promise<FeedbackAnalysis> => {
  const client = getClient();

  const prompt = `
    Role: HR Data Analyst.
    Task: Analyze the following training feedback comments.
    Language: Simplified Chinese (简体中文).
    Feedback Data: "${feedbackText.substring(0, 10000)}"
    
    Goal: Determine sentiment distribution, extract keywords, and provide 3 key improvement suggestions.
    
    Output Format: JSON object with the following structure:
    {
      "sentiment": {
        "positive": <integer 0-100>,
        "neutral": <integer 0-100>,
        "negative": <integer 0-100>
      },
      "keywords": ["keyword1", "keyword2", ...],
      "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
    }
  `;

  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content) as FeedbackAnalysis;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Feedback Analysis Error:", error);
    throw error;
  }
};

// --- Survey Generation ---
export const generateSurvey = async (topic: string, type: string): Promise<string> => {
  const client = getClient();
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
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || "";
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
  const client = getClient();
  const prompt = `
    Role: Internal Comms Specialist.
    Task: Write a ${type} for a training program.
    Language: Simplified Chinese (简体中文).
    Context/Details: ${context}
    Tone: ${tone}

    Output: Professional, ready-to-send copy.
  `;

  try {
    const stream = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error("Ops Writer Error:", error);
    throw error;
  }
};

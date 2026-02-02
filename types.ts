export enum ModuleType {
  COURSE_GEN = 'course_gen',
  QUIZ_GEN = 'quiz_gen',
  INSIGHT = 'insight',
  OPS = 'ops'
}

export interface QuizItem {
  question: string;
  type: 'Single Choice' | 'True/False' | 'Multiple Choice';
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  answer: string;
  explanation: string;
}

export interface FeedbackAnalysis {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keywords: string[];
  suggestions: string[];
}

export interface CourseParams {
  topic: string;
  audience: string;
  duration: string;
  style: string;
}

export interface QuizParams {
  content: string;
  count: number;
  difficulty: string;
}

export interface OpsParams {
  type: string;
  context: string;
  tone: string;
}

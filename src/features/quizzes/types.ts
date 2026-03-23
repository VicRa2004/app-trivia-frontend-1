export interface QuestionOption {
  id?: string;
  content: string;
  imageUrl?: string;
  isCorrect: boolean;
  position: number;
}

export interface QuizQuestion {
  id?: string;
  questionText: string;
  imageUrl?: string;
  questionType: string;
  points: number;
  timeLimit: number;
  orderNumber: number;
  options: QuestionOption[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  categoryId?: string;
  creatorId: string;
  creator: {
    id: string;
    username: string;
  };
  category?: {
    id: string;
    name: string;
  };
  questions?: QuizQuestion[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface CreateQuizData {
  title: string;
  description: string;
  categoryId?: string;
  isPublic: boolean;
}

export interface CreateQuestionData {
  id?: string;
  questionText: string;
  imageUrl?: string;
  questionType: string;
  points: number;
  timeLimit: number;
  orderNumber: number;
  options: {
    content: string;
    imageUrl?: string;
    isCorrect: boolean;
    position: number;
  }[];
}

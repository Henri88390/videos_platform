export interface Video {
  id: string;
  title: string;
  description: string;
  filename: string;
  duration: number;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Value {
  title: string;
  description: string;
}

export interface AboutUsData {
  content: string;
  mission: string;
  vision: string;
  values: Value[];
  updatedAt?: Date;
}

export interface AboutUsResponse {
  success: boolean;
  data?: AboutUsData;
  error?: string;
} 
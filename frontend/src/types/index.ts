export interface ResumeTag {
    id: string;
    name: string;
    type: 'SKILL' | 'INTEREST' | 'POSITION' | 'FIELD' | 'MOTTO';
    confidence: number;
}

export interface PersonalInfo {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
}

export interface ResumeAnalysis {
    personalInfo: PersonalInfo;
    tags: ResumeTag[];
    rawContent?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

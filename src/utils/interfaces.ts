export interface EmployeeDetailsExtracted {
    name?: string,
    email?: string,
    phone?: string,
    skills?: string[],
    workExperiences?: WorkExperienceExtracted[],
    education?: EducationExtracted[],
    achievements?: string[]
}

export interface EmployeeDetails {
    name: string,
    email: string,
    phone: string,
    skills: string[],
    workExperiences: WorkExperience[],
    education: Education[],
    achievements: string[],
    department: string,
    position: string,
    dateJoined: string,
    aadharDocument: File | null,
    panDocument: File | null,
    resumeDocument: File | null,
    profileImg: File | null
}

interface WorkExperienceExtracted {
    company?: string,
    position?: string,
    startDate?: string,
    endDate?: string,
}

interface WorkExperience {
    company: string,
    position: string,
    startDate: string,
    endDate: string,
    experienceDocument: File | null
}

interface EducationExtracted {
    level?: string;
    institution?: string; 
    startYear?: number; 
    endYear?: number; 
    grade?: string; 
    specialization?: string; 
}

interface Education {
    level: string;
    institution: string;
    startYear: number;
    endYear?: number;
    grade: string;
    specialization?: string;
}
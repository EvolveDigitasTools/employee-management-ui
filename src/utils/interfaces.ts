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
    designation: string,
    dateJoined: string,
    aadhaarCard: File | null,
    panCard: File | null,
    resume: File | null,
    profileImg: File | null
}

interface WorkExperienceExtracted {
    companyName?: string,
    designation?: string,
    startDate?: string,
    endDate?: string,
}

export interface WorkExperience {
    companyName: string,
    designation: string,
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

export interface Education {
    level: string;
    institution: string;
    startYear: number;
    endYear?: number;
    grade: string;
    specialization?: string;
    educationDocument: File | null
}
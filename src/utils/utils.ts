export const onboardingLevels = [
    {
        title: 'Resume',
        description: 'Upload your resume for verification and processing.'
    },
    {
        title: 'Personal Information',
        description: 'Provide your basic personal details such as name, email, and phone.'
    },
    {
        title: 'Work Experience',
        description: 'Detail your professional experience, including past jobs and roles.'
    },
    {
        title: 'Education',
        description: 'Provide your educational background and institutions attended.'
    },
    {
        title: 'Skills & Achievements',
        description: 'List your key skills and notable achievements.'
    },
    {
        title: 'Identity Documents',
        description: 'Upload identity verification documents like Aadhaar and Pan card.'
    },
    {
        title: 'Joining Details',
        description: 'Enter the details regarding your department, position, and joining date.'
    }
];

export const isTokenVerified: (token: string) => Promise<boolean> = async (token: string) => {
    try {
        const apiUrl: string = import.meta.env.VITE_API_URL ?? '';
        const response = await fetch(`${apiUrl}/auth/verify-token`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error logging in:', error);
        return false;
    }
};

export const getSizeInWords: (sizeInBytes: number) => string = (sizeInBytes: number) => {
    const units = ['Bytes', 'kb', 'mb', 'gb', 'tb'];
    let i = 0;
    while (sizeInBytes >= 1024 && i < units.length - 1) {
        sizeInBytes /= 1024;
        i++;
    }
    return `${sizeInBytes.toFixed(2)} ${units[i]}`;
};

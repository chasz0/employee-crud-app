export interface Social { 
    platform: string; 
    url: string; 
}

export interface Employee {
    id: string; 
    name: string; 
    email: string; 
    status: string;
    role_id: number; 
    role_name: string; 
    department_id: number; 
    department_name: string;
    avatar_url: string; 
    bio: string; 
    socials: Social[];
}

export interface Role { 
    id: number; 
    name: string; 
}

export interface Department { 
    department_id: number; 
    department_name: string; 
    roles: Role[]; 
}
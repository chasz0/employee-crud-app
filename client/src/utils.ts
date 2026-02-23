import type { Social } from './types.tsx';

export const getInitials = (name: string) => {
  return name.charAt(0).toUpperCase();
};

export const getDefaultFormData = () => ({
    name: '', 
    email: '', 
    role_id: '', 
    status: 'Active', 
    avatar_url: '', 
    bio: '', 
    socials: [] as Social[]
});
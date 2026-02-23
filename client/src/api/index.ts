import type { Employee, Department } from '../types.tsx';

const API_URL = 'http://localhost:5000/api';

export const api = {
    getEmployees: async (): Promise<Employee[]> => {
        const res = await fetch(`${API_URL}/employees`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        return res.json();
    },

    getDepartments: async (): Promise<Department[]> => {
        const res = await fetch(`${API_URL}/departments`);
        if (!res.ok) throw new Error('Failed to fetch departments');
        return res.json();
    },

    createEmployee: async (data: any) => {
        const res = await fetch(`${API_URL}/employees`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to create employee');
        return result;
    },

    updateEmployee: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update employee');
        return result;
    },

    deleteEmployee: async (id: string) => {
        const res = await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete employee');
        return res.json();
    }
};
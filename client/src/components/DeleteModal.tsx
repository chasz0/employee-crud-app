import { useState } from 'react';
import type { Employee } from '../types.tsx';
import { api } from '../api/index.ts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
    onSuccess: () => void;
    onError: (msg: string) => void;
}

export default function DeleteModal({ isOpen, onClose, employee, onSuccess, onError }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || !employee) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.deleteEmployee(employee.id);
            onSuccess();
            onClose();
        } catch (error: any) {
            onError(error.message);
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !isDeleting && onClose()}></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-6 w-full max-w-sm z-10 text-center">
                <h2 className="text-xl font-bold mb-2 text-gray-900">Delete Employee</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    Remove <span className="font-bold text-gray-900">{employee.name}</span>? This permanently deletes their profile and social links.
                </p>
                <div className="flex justify-center space-x-3">
                    <button type="button" onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium w-1/2">Cancel</button>
                    <button type="button" onClick={handleDelete} disabled={isDeleting} className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium w-1/2 shadow-lg">
                        {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
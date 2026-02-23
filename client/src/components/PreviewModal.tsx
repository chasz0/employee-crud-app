import type { Employee } from '../types.tsx';
import { getInitials } from '../utils.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export default function PreviewModal({ isOpen, onClose, employee }: Props) {
    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-8 w-full max-w-md z-10 text-center">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-xl">✕</button>
                
                {employee.avatar_url ? (
                <img src={employee.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md" />
                ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-md">
                    {getInitials(employee.name)}
                </div>
                )}
                
                <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                <p className="text-indigo-600 font-medium">{employee.role_name}</p>
                <p className="text-sm text-gray-500 mb-4">{employee.department_name} • {employee.email}</p>
                
                {employee.bio && (
                <p className="text-gray-700 text-sm bg-white/50 p-3 rounded-lg border border-gray-100 mb-6 text-left">
                    "{employee.bio}"
                </p>
                )}

                {employee.socials && employee.socials.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                    {employee.socials.map((social, i) => (
                    <a key={i} href={social.url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-gray-900 text-white text-xs rounded-full hover:bg-gray-700 transition-colors">
                        {social.platform}
                    </a>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
}
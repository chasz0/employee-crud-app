import { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: Props) {
    const [showSchema, setShowSchema] = useState(false);
    if (!isOpen) return null;

    return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Project Information</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-xl">✕</button>
            </div>
                
            <div className="space-y-6">
                <div className="flex justify-between gap-6">
                    
                    <div className="bg-white/50 p-4 rounded-xl border border-gray-100 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs uppercase tracking-wider text-indigo-500 font-bold mb-2">Developer</h3>
                            <p className="font-bold text-gray-900 text-lg">Robert Conchas</p>
                            <p className="text-sm text-gray-600 mb-2">Full-Stack Developer</p>
                            <div className="text-xs text-gray-500 flex flex-col space-y-1">
                                <span>🎓 BS Computer Science (Magna Cum Laude)</span>
                                <span>🏫 Pamantasan ng Lungsod ng Maynila</span>
                            </div>
                        </div>
                        
                        <a href="https://chasportfolio.vercel.app/" target="_blank" rel="noreferrer" className="mt-4 block w-full text-center bg-indigo-50 text-indigo-600 border border-indigo-100 font-medium py-2 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors text-sm">
                            🌐 View My Portfolio
                        </a>
                    </div>
                    
                    <div className="bg-white/50 p-4 rounded-xl border border-gray-100 flex-1">
                    <h3 className="text-xs uppercase tracking-wider text-indigo-500 font-bold mb-2">Architecture</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span>React (Vite) + Tailwind CSS</span></li>
                        <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-green-500"></span><span>Node.js + Express (Raw SQL)</span></li>
                        <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span>PostgreSQL (Supabase)</span></li>
                    </ul>
                    </div>
                </div>

                <a href="https://github.com/chasz0/employee-crud-app" target="_blank" rel="noreferrer" className="block w-full text-center bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                    🔗 View GitHub Repository
                </a>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setShowSchema(!showSchema)} className="w-full bg-gray-50 px-4 py-3 flex justify-between items-center text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                    <span>🗄️ Database Schema Representation</span>
                    <span>{showSchema ? 'Hide' : 'Show'}</span>
                    </button>
                    {showSchema && (
                    <div className="bg-gray-900 text-green-400 p-4 font-mono text-xs overflow-x-auto">
                        <pre>{`Table: departments
- id (SERIAL PK)
- name (TEXT UNIQUE)

Table: roles
- id (SERIAL PK)
- department_id (FK -> departments.id)
- name (TEXT)

Table: employees
- id (UUID PK)
- role_id (FK -> roles.id)
- name (TEXT)
- email (TEXT UNIQUE)
- status (TEXT)
- created_at (TIMESTAMPTZ)

Table: employee_profiles (1:1)
- id (UUID PK)
- employee_id (FK ON DELETE CASCADE)
- avatar_url (TEXT)
- bio (TEXT)

Table: employee_socials (1:Many)
- id (SERIAL PK)
- employee_id (FK ON DELETE CASCADE)
- platform (TEXT)
- url (TEXT)`}
                        </pre>
                    </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
}
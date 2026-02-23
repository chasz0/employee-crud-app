import { useState, useEffect } from 'react';
import type { Employee, Department } from './types.tsx';
import { api } from './api/index.ts';
import { getInitials } from './utils.ts';

// Import Modals
import InfoModal from './components/InfoModal.tsx';
import PreviewModal from './components/PreviewModal.tsx';
import DeleteModal from './components/DeleteModal.tsx';
import FormModal from './components/FormModal.tsx';

export default function App() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

    const fetchAllData = async () => {
        setIsLoadingData(true);
        setGlobalError(null);
        try {
        const [empData, deptData] = await Promise.all([api.getEmployees(), api.getDepartments()]);
        setEmployees(empData);
        setDepartments(deptData);
        } catch (error: any) {
        setGlobalError(error.message || 'Database connection failed.');
        } finally {
        setIsLoadingData(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const openFormForAdd = () => {
        setActiveEmployee(null);
        setIsFormModalOpen(true);
    };

    const openFormForEdit = (emp: Employee) => {
        setActiveEmployee(emp);
        setIsFormModalOpen(true);
    };

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8 relative">
            <div className="max-w-6xl mx-auto">
                
                {globalError && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex justify-between items-center shadow-sm">
                        <button onClick={() => setGlobalError(null)} className="text-red-500 hover:text-red-800 font-bold">✕</button>
                        <p>{globalError}</p>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsInfoModalOpen(true)} className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-indigo-600 transition-colors" title="View Project Info">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                        <div>
                        <h1 className="text-3xl font-bold text-gray-900">Team Directory</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage team members, roles, and digital profiles.</p>
                        </div>
                    </div>
                    <button onClick={openFormForAdd} disabled={isLoadingData} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
                        + Add Employee
                    </button>
                </div>

                <div className="mb-6">
                    <input type="text" placeholder="Search by name, role, or department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {isLoadingData ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Connecting to database...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                            <th className="p-4 font-semibold">Employee</th>
                            <th className="p-4 font-semibold">Role & Dept</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredEmployees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 flex items-center space-x-3">
                                {emp.avatar_url ? (
                                    <img src={emp.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{getInitials(emp.name)}</div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{emp.name}</p>
                                    <p className="text-sm text-gray-500">{emp.email}</p>
                                </div>
                                </td>
                                <td className="p-4">
                                <p className="font-medium text-gray-900">{emp.role_name}</p>
                                <p className="text-sm text-gray-500">{emp.department_name}</p>
                                </td>
                                <td className="p-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{emp.status}</span>
                                </td>
                                <td className="p-4 text-right space-x-4">
                                <button onClick={() => { setActiveEmployee(emp); setIsPreviewModalOpen(true); }} className="text-gray-400 hover:text-gray-900 text-sm font-medium">View</button>
                                <button onClick={() => openFormForEdit(emp)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                                <button onClick={() => { setActiveEmployee(emp); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                                </td>
                            </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No matching records found.</td></tr>
                            )}
                        </tbody>
                        </table>
                    )}
                </div>

                {/* Modularized Components */}
                <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
                <PreviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} employee={activeEmployee} />
                <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} employee={activeEmployee} onSuccess={fetchAllData} onError={(msg) => setGlobalError(msg)} />
                <FormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} employeeToEdit={activeEmployee} departments={departments} onSuccess={fetchAllData} />

            </div>
        </div>
    );
}
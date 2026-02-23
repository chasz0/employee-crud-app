import { useState, useEffect, useMemo } from 'react';
import type { Employee, Department } from './types.tsx';
import { api } from './api/index.ts';
import { getInitials } from './utils';

// Import Modals
import InfoModal from './components/InfoModal';
import PreviewModal from './components/PreviewModal';
import DeleteModal from './components/DeleteModal';
import FormModal from './components/FormModal';

type SortConfig = { key: keyof Employee; direction: 'asc' | 'desc' } | null;

export default function App() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [globalError, setGlobalError] = useState<string | null>(null);
    
    // Data Pipeline State
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // UI Modal States
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

    // Reset to page 1 whenever the search term changes
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const openFormForAdd = () => { setActiveEmployee(null); setIsFormModalOpen(true); };
    const openFormForEdit = (emp: Employee) => { setActiveEmployee(emp); setIsFormModalOpen(true); };

    // ==========================================
    // DATA PIPELINE: Filter -> Sort -> Paginate
    // ==========================================
    
    // 1. Filter
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    // 2. Sort
    const sortedEmployees = useMemo(() => {
        if (!sortConfig) return filteredEmployees;
        return [...filteredEmployees].sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
        });
    }, [filteredEmployees, sortConfig]);

    // 3. Paginate
    const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
    const paginatedEmployees = sortedEmployees.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    // ==========================================
    // UTILITIES
    // ==========================================

    const handleSort = (key: keyof Employee) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Employee) => {
        if (sortConfig?.key !== key) return <span className="text-gray-300 ml-1">↕</span>;
        return sortConfig.direction === 'asc' ? <span className="text-indigo-600 ml-1">↑</span> : <span className="text-indigo-600 ml-1">↓</span>;
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Role', 'Department', 'Status'];
        const rows = sortedEmployees.map(emp => [
        `"${emp.name}"`, `"${emp.email}"`, `"${emp.role_name}"`, `"${emp.department_name}"`, `"${emp.status}"`
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'employee_directory.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="min-h-screen bg-gray-50 p-8 relative">
        <div className="max-w-6xl mx-auto">
            
            {globalError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex justify-between items-center shadow-sm">
                <span>⚠️ {globalError}</span>
                <button onClick={() => setGlobalError(null)} className="text-red-500 hover:text-red-800 font-bold">✕</button>
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

            {/* Toolbar: Search + Export */}
            <div className="flex gap-4 mb-6">
            <div className="flex-1">
                <input type="text" placeholder="Search by name, role, or department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
            </div>
            <button onClick={exportToCSV} disabled={isLoadingData || sortedEmployees.length === 0} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm disabled:opacity-50 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Export CSV
            </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoadingData ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Connecting to database...</p>
                </div>
            ) : (
                <>
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                        <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('name')}>
                        Employee {getSortIcon('name')}
                        </th>
                        <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('role_name')}>
                        Role & Dept {getSortIcon('role_name')}
                        </th>
                        <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('status')}>
                        Status {getSortIcon('status')}
                        </th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {paginatedEmployees.map((emp) => (
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
                    {paginatedEmployees.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">No matching records found.</td></tr>
                    )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, sortedEmployees.length)}</span> of <span className="font-semibold">{sortedEmployees.length}</span> results
                    </span>
                    <div className="flex space-x-2">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                        Previous
                        </button>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                        Next
                        </button>
                    </div>
                    </div>
                )}
                </>
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
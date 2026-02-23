import { useState, useEffect } from 'react';
import type { Employee, Department, Social } from '../types.tsx';
import { api } from '../api/index.ts';
import { getDefaultFormData } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit: Employee | null;
  departments: Department[];
  onSuccess: () => void;
}

export default function FormModal({ isOpen, onClose, employeeToEdit, departments, onSuccess }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');
    const [formData, setFormData] = useState(getDefaultFormData());

    useEffect(() => {
        if (isOpen) {
        if (employeeToEdit) {
            setFormData({
            name: employeeToEdit.name, email: employeeToEdit.email, role_id: String(employeeToEdit.role_id),
            status: employeeToEdit.status, avatar_url: employeeToEdit.avatar_url || '',
            bio: employeeToEdit.bio || '', socials: employeeToEdit.socials || []
            });
            setSelectedDeptId(String(employeeToEdit.department_id));
        } else {
            setFormData(getDefaultFormData());
            setSelectedDeptId('');
        }
        setFormError(null);
        }
    }, [isOpen, employeeToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            if (employeeToEdit) {
                await api.updateEmployee(employeeToEdit.id, formData);
            } else {
                await api.createEmployee(formData);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            setFormError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialChange = (index: number, field: keyof Social, value: string) => {
        const newSocials = [...formData.socials];
        newSocials[index][field] = value;
        setFormData({ ...formData, socials: newSocials });
    };

    const addSocialLink = () => setFormData({ ...formData, socials: [...formData.socials, { platform: 'GitHub', url: '' }] });
    const removeSocialLink = (index: number) => setFormData({ ...formData, socials: formData.socials.filter((_, i) => i !== index) });

    const availableRoles = departments.find(d => String(d.department_id) === selectedDeptId)?.roles || [];

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !isSubmitting && onClose()}></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-6 w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{employeeToEdit ? 'Edit Employee Profile' : 'Add New Employee'}</h2>
                    <span className="text-xs text-gray-500"><span className="text-red-500">*</span> Required</span>
                </div>
                
                {formError && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">{formError}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Core Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">Full Name <span className="text-red-500">*</span></label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/60 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" disabled={isSubmitting} placeholder="e.g. Jane Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">Email <span className="text-red-500">*</span></label>
                            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/60 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" disabled={isSubmitting} placeholder="jane@company.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">Department <span className="text-red-500">*</span></label>
                            <select required value={selectedDeptId} onChange={(e) => { setSelectedDeptId(e.target.value); setFormData({...formData, role_id: ''}); }} className="w-full bg-white/60 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" disabled={isSubmitting}>
                                <option value="" disabled>Select Department</option>
                                {departments.map(dept => <option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">Role <span className="text-red-500">*</span></label>
                            <select required value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})} className={`w-full bg-white/60 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none ${!selectedDeptId ? 'border-amber-300 bg-amber-50' : 'border-gray-300'}`} disabled={isSubmitting || !selectedDeptId}>
                                <option value="" disabled>Select Role</option>
                                {availableRoles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                            </select>
                            {!selectedDeptId && <p className="text-xs text-amber-600 mt-1">Please select a department first.</p>}
                        </div>
                    </div>

                    {/* Profile */}
                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Profile Details</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-1">Avatar Image URL <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                                    <input type="url" placeholder="https://..." value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} className="w-full bg-white/60 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" disabled={isSubmitting} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-1">Account Status <span className="text-red-500">*</span></label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white/60 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" disabled={isSubmitting}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Short Bio <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                                <textarea rows={2} placeholder="Brief background..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-white/60 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" disabled={isSubmitting} />
                            </div>
                        </div>
                    </div>

                    {/* Socials */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Social Links <span className="text-gray-400 font-normal text-xs">(Optional)</span></h3>
                        <button type="button" onClick={addSocialLink} disabled={isSubmitting} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 font-medium">+ Add Link</button>
                        </div>
                        <div className="space-y-2">
                            {formData.socials.map((social, index) => (
                                <div key={index} className="flex space-x-2 items-start">
                                    <select value={social.platform} onChange={e => handleSocialChange(index, 'platform', e.target.value)} className="w-1/3 bg-white/60 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" disabled={isSubmitting}>
                                        <option value="GitHub">GitHub</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Portfolio">Portfolio</option>
                                        <option value="Twitter">Twitter</option>
                                    </select>
                                    <input type="url" required placeholder="https://..." value={social.url} onChange={e => handleSocialChange(index, 'url', e.target.value)} className="w-full bg-white/60 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" disabled={isSubmitting} />
                                    <button type="button" onClick={() => removeSocialLink(index)} disabled={isSubmitting} className="p-2 text-red-500 hover:text-red-700 font-bold bg-red-50 rounded-lg">✕</button>
                                </div>
                            ))}
                            {formData.socials.length === 0 && <p className="text-xs text-gray-500 italic">No social links added.</p>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center justify-center px-4 py-2 bg-indigo-600/90 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 min-w-[140px] shadow-lg">
                            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Saving...</> : (employeeToEdit ? 'Save Changes' : 'Create Employee')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
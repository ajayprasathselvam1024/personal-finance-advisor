import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Power, Trash2, Key, Check, X } from 'lucide-react';
import type { UserProfile, PermissionKey } from '../types';
import { userService, ALL_PERMISSIONS } from '../services/userService';
import { formatDate } from '../utils/formatters';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  const [selectedPerms, setSelectedPerms] = useState<PermissionKey[]>([
    'view_dashboard',
    'view_expenses',
    'add_expenses',
    'view_income',
  ]);

  // Edit Permissions Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Status Notifications
  const [msg, setMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const data = await userService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('USER');
    setSelectedPerms(['view_dashboard', 'view_expenses', 'add_expenses', 'view_income']);
    setIsAddModalOpen(true);
  };

  const handleToggleSelectAllPerms = () => {
    if (selectedPerms.length === ALL_PERMISSIONS.length) {
      setSelectedPerms([]);
    } else {
      setSelectedPerms(ALL_PERMISSIONS.map((p) => p.key));
    }
  };

  const handleTogglePerm = (key: PermissionKey) => {
    if (selectedPerms.includes(key)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== key));
    } else {
      setSelectedPerms([...selectedPerms, key]);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;

    setIsSubmitting(true);
    const { user, error } = await userService.createUser({
      fullName,
      email,
      password: password || 'User@12345',
      role,
      permissions: role === 'ADMIN' ? ALL_PERMISSIONS.map((p) => p.key) : selectedPerms,
    });
    setIsSubmitting(false);

    if (error) {
      alert(`Error creating user: ${error.message}`);
    } else if (user) {
      setMsg(`User "${fullName}" created successfully.`);
      setIsAddModalOpen(false);
      await loadUsers();
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    await userService.toggleUserStatus(userId, !currentStatus);
    await loadUsers();
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete user "${name}"?`)) {
      await userService.deleteUser(userId);
      await loadUsers();
    }
  };

  const handleSaveEditPermissions = async () => {
    if (!editingUser) return;
    await userService.updateUserPermissions(editingUser.id, selectedPerms);
    setEditingUser(null);
    setMsg(`Permissions updated for ${editingUser.full_name}`);
    await loadUsers();
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>User Access & Role Management</span>
          </h1>
          <p className="text-xs text-slate-500">Create user accounts, assign ADMIN/USER roles, and configure granular permissions</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      {msg && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Granted Permissions</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading user accounts...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No user accounts found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.full_name || 'User'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{u.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        u.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        <span>{u.is_active ? 'Active' : 'Deactivated'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'ADMIN' ? (
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Full System Access (21 Modules)</span>
                      ) : (
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          {u.permissions?.length || 0} permissions granted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.created_at ? formatDate(u.created_at) : 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setSelectedPerms(u.permissions || []);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                            title="Edit Permissions"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            u.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={u.is_active ? 'Deactivate User' : 'Activate User'}
                        >
                          <Power className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.full_name || 'User')}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <span>Add User Account</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="USER">USER (Granular Permissions)</option>
                  <option value="ADMIN">ADMIN (Full Access)</option>
                </select>
              </div>

              {role === 'USER' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">Module Permissions Checklist</label>
                    <button
                      type="button"
                      onClick={handleToggleSelectAllPerms}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      {selectedPerms.length === ALL_PERMISSIONS.length ? 'Unselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedPerms.includes(perm.key)}
                          onChange={() => handleTogglePerm(perm.key)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  {isSubmitting ? 'Creating...' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Permissions: {editingUser.full_name}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Check or uncheck authorized module permissions:</p>
                <button
                  type="button"
                  onClick={handleToggleSelectAllPerms}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  {selectedPerms.length === ALL_PERMISSIONS.length ? 'Unselect All' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm.key} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedPerms.includes(perm.key)}
                      onChange={() => handleTogglePerm(perm.key)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{perm.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditPermissions}
                  className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

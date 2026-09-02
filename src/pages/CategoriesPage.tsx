import React, { useState } from 'react';
import { Tags, Plus, Trash2, Edit, X, FolderPlus } from 'lucide-react';
import type { Category, TransactionType } from '../types';
import { dataService } from '../services/dataService';

interface CategoriesPageProps {
  categories: Category[];
  onRefresh: () => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentCategories = categories.filter((c) => c.type === activeTab);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCatName('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      await dataService.updateCategory(editingCategory.id, catName.trim());
    } else {
      await dataService.addCategory({
        name: catName.trim(),
        type: activeTab,
      });
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = async (c: Category) => {
    const result = await dataService.deleteCategory(c.id, c.name, c.type);
    if (!result.success && result.message) {
      alert(result.message);
    } else {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Tags className="h-6 w-6 text-blue-600" />
            <span>Category Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure custom income and expense categories for personal budgeting.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-all min-h-[44px]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/80 w-full sm:w-80">
        <button
          onClick={() => setActiveTab('expense')}
          className={`w-1/2 rounded-xl py-2.5 text-xs font-extrabold transition-all min-h-[40px] ${
            activeTab === 'expense'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
          }`}
        >
          Expense Categories
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`w-1/2 rounded-xl py-2.5 text-xs font-extrabold transition-all min-h-[40px] ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
          }`}
        >
          Income Categories
        </button>
      </div>

      {/* Categories Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Category Origin</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {currentCategories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="px-6 py-4 uppercase font-bold text-[10px] text-slate-500">{c.type}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        c.is_custom
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {c.is_custom ? 'Custom' : 'System Default'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Edit Category"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-blue-600" />
                <span>{editingCategory ? 'Edit Category' : `Add ${activeTab.toUpperCase()} Category`}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Category Name"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {errorMsg && <p className="text-xs font-bold text-rose-600">{errorMsg}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

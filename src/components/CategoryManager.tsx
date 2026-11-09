// d:\Project\TVK Admin\src\components\CategoryManager.tsx
import React, { useState } from 'react';
import { Complaint, CategoryItem } from '../types';
import {
  Layers,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface CategoryManagerProps {
  complaints: Complaint[];
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', key: 'roads', name_en: 'Roads & Potholes', name_ta: 'சாலைகள் & பள்ளங்கள்', icon: '🛣️', is_active: true, total_count: 0 },
  { id: 'cat-2', key: 'streetLights', name_en: 'Streetlights & Poles', name_ta: 'தெருவிளக்குகள் & மின்கம்பங்கள்', icon: '💡', is_active: true, total_count: 0 },
  { id: 'cat-3', key: 'water', name_en: 'Drinking Water Supply', name_ta: 'குடிநீர் விநியோகம்', icon: '🚰', is_active: true, total_count: 0 },
  { id: 'cat-4', key: 'drainage', name_en: 'Drainage & Sewage Block', name_ta: 'சாக்கடை & கழிவுநீர் வடிகால்', icon: '🪠', is_active: true, total_count: 0 },
  { id: 'cat-5', key: 'garbage', name_en: 'Garbage & Solid Waste', name_ta: 'குப்பை மேலாண்மை & சுகாதாரம்', icon: '🗑️', is_active: true, total_count: 0 },
  { id: 'cat-6', key: 'transport', name_en: 'Public Transport & Stops', name_ta: 'பேருந்து & பொது போக்குவரத்து', icon: '🚌', is_active: true, total_count: 0 },
  { id: 'cat-7', key: 'electricity', name_en: 'Electricity & Transformer', name_ta: 'மின்சாரம் & மின்மாற்றி', icon: '⚡', is_active: true, total_count: 0 },
  { id: 'cat-8', key: 'infrastructure', name_en: 'Public Infrastructure', name_ta: 'பொது உள்கட்டமைப்பு', icon: '🏢', is_active: true, total_count: 0 },
  { id: 'cat-9', key: 'other', name_en: 'Other Civic Grievances', name_ta: 'இதர புகார்கள்', icon: '📋', is_active: true, total_count: 0 },
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({ complaints }) => {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);

  const toggleCategoryActive = (catId: string) => {
    setCategories(prev =>
      prev.map(c => (c.id === catId ? { ...c, is_active: !c.is_active } : c))
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Configurable Civic Grievance Categories
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure grievance issue types available to citizens on the TVK mobile application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = complaints.filter(
            c => c.category === cat.key || c.category_key === cat.key
          ).length;

          return (
            <div
              key={cat.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between space-x-4 hover:shadow-md transition"
            >
              <div className="flex items-center space-x-3.5">
                <span className="text-2xl p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  {cat.icon}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cat.name_en}</h3>
                  <p className="text-xs text-slate-500">{cat.name_ta}</p>
                  <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                    {count} complaints recorded
                  </p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => toggleCategoryActive(cat.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border transition ${
                    cat.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-300'
                  }`}
                >
                  {cat.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


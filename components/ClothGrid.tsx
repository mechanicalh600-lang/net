
import React, { useState } from 'react';
import { Grid3X3, Check } from 'lucide-react';

interface Props {
  title: string;
  selectedCloths: string[]; // Array of IDs like "D1-C5"
  onChange: (newSelection: string[]) => void;
}

export const ClothGrid: React.FC<Props> = ({ title, selectedCloths, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCloth = (disc: number, cloth: number) => {
    const id = `D${disc}-C${cloth}`;
    if (selectedCloths.includes(id)) {
      onChange(selectedCloths.filter(c => c !== id));
    } else {
      onChange([...selectedCloths, id]);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-sm flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-primary"/>
            تعویض پارچه: {title}
        </h4>
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition"
        >
          {isOpen ? 'بستن جدول' : 'مشاهده جدول (6 دیسک)'}
        </button>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
         <span>تعداد تعویض شده: <span className="font-bold text-red-500 text-lg">{selectedCloths.length}</span> عدد</span>
      </div>

      {isOpen && (
        <div className="space-y-4 animate-fadeIn mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
          {Array.from({ length: 6 }).map((_, dIdx) => {
            const discNum = dIdx + 1;
            return (
              <div key={discNum} className="flex flex-col gap-1 min-w-[600px]">
                <span className="text-xs font-bold text-gray-500">دیسک شماره {discNum}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 20 }).map((_, cIdx) => {
                    const clothNum = cIdx + 1;
                    const id = `D${discNum}-C${clothNum}`;
                    const isChecked = selectedCloths.includes(id);
                    return (
                      <div 
                        key={id}
                        onClick={() => toggleCloth(discNum, clothNum)}
                        className={`
                          w-8 h-8 flex items-center justify-center text-[10px] rounded cursor-pointer border transition-all
                          ${isChecked 
                            ? 'bg-red-500 text-white border-red-600 shadow-sm font-bold' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary'}
                        `}
                        title={`دیسک ${discNum} - پارچه ${clothNum}`}
                      >
                        {clothNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

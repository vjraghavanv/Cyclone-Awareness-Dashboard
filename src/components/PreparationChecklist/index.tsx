import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts';
import type { ChecklistItem, ChecklistCategory } from '../../types';
import { storageManager } from '../../services/storage';
import { CompactDataFreshnessIndicator } from '../DataFreshnessIndicator';

// Define checklist items
const checklistItems: ChecklistItem[] = [
  // Water storage
  {
    id: 'water-1',
    category: 'water',
    text: 'Store at least 3 days of drinking water (3-4 liters per person per day)',
    priority: 'essential',
  },
  {
    id: 'water-2',
    category: 'water',
    text: 'Fill bathtubs and large containers with water for cleaning',
    priority: 'recommended',
  },
  {
    id: 'water-3',
    category: 'water',
    text: 'Keep water purification tablets or bleach',
    priority: 'recommended',
  },

  // Power backup
  {
    id: 'power-1',
    category: 'power',
    text: 'Charge all mobile phones and power banks fully',
    priority: 'essential',
  },
  {
    id: 'power-2',
    category: 'power',
    text: 'Keep flashlights and extra batteries ready',
    priority: 'essential',
  },
  {
    id: 'power-3',
    category: 'power',
    text: 'Have backup power source (inverter/generator) if available',
    priority: 'recommended',
  },
  {
    id: 'power-4',
    category: 'power',
    text: 'Keep candles and matches in waterproof container',
    priority: 'recommended',
  },

  // Emergency contacts
  {
    id: 'emergency-1',
    category: 'emergency',
    text: 'Save emergency numbers: Police (100), Fire (101), Ambulance (108)',
    priority: 'essential',
  },
  {
    id: 'emergency-2',
    category: 'emergency',
    text: 'Keep list of family members\' contact numbers',
    priority: 'essential',
  },
  {
    id: 'emergency-3',
    category: 'emergency',
    text: 'Note down local disaster management helpline numbers',
    priority: 'recommended',
  },
  {
    id: 'emergency-4',
    category: 'emergency',
    text: 'Share your location with family members',
    priority: 'recommended',
  },

  // Essential supplies
  {
    id: 'supplies-1',
    category: 'supplies',
    text: 'Stock non-perishable food for 3-5 days',
    priority: 'essential',
  },
  {
    id: 'supplies-2',
    category: 'supplies',
    text: 'Keep first aid kit with essential medicines',
    priority: 'essential',
  },
  {
    id: 'supplies-3',
    category: 'supplies',
    text: 'Have important documents in waterproof bag',
    priority: 'essential',
  },
  {
    id: 'supplies-4',
    category: 'supplies',
    text: 'Keep cash in small denominations',
    priority: 'recommended',
  },
  {
    id: 'supplies-5',
    category: 'supplies',
    text: 'Prepare emergency bag with clothes and essentials',
    priority: 'recommended',
  },
  {
    id: 'supplies-6',
    category: 'supplies',
    text: 'Keep radio with batteries for updates',
    priority: 'optional',
  },
];

interface ChecklistItemComponentProps {
  item: ChecklistItem;
  checked: boolean;
  onToggle: (itemId: string) => void;
  language: 'en' | 'ta';
}

function ChecklistItemComponent({ item, checked, onToggle, language }: ChecklistItemComponentProps) {
  // Get priority styling
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'essential':
        return 'text-red-600 font-semibold';
      case 'recommended':
        return 'text-orange-600 font-medium';
      case 'optional':
        return 'text-gray-500';
      default:
        return 'text-gray-600';
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: string) => {
    if (language === 'ta') {
      switch (priority) {
        case 'essential':
          return 'அத்தியாவசியம்';
        case 'recommended':
          return 'பரிந்துரைக்கப்பட்டது';
        case 'optional':
          return 'விருப்பமானது';
        default:
          return priority;
      }
    }
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
        checked
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <input
        type="checkbox"
        id={item.id}
        checked={checked}
        onChange={() => onToggle(item.id)}
        className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
        aria-label={item.text}
      />
      <label htmlFor={item.id} className="flex-1 cursor-pointer">
        <div className={`text-sm ${checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {item.text}
        </div>
        <div className={`text-xs mt-1 ${getPriorityStyle(item.priority)}`}>
          {getPriorityLabel(item.priority)}
        </div>
      </label>
    </div>
  );
}

export function PreparationChecklist() {
  const { language, t } = useLanguage();
  
  // Load initial state from Local Storage
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const savedState = storageManager.getChecklistState();
    return savedState.items;
  });

  // Save to Local Storage whenever state changes
  useEffect(() => {
    storageManager.saveChecklistState({
      items: checkedItems,
      lastUpdated: new Date(),
    });
  }, [checkedItems]);

  // Handle checkbox toggle
  const handleToggle = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Group items by category
  const itemsByCategory = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<ChecklistCategory, ChecklistItem[]>);

  // Calculate completion percentage
  const totalItems = checklistItems.length;
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  // Get category title
  const getCategoryTitle = (category: ChecklistCategory) => {
    if (language === 'ta') {
      switch (category) {
        case 'water':
          return 'நீர் சேமிப்பு';
        case 'power':
          return 'மின் காப்பு';
        case 'emergency':
          return 'அவசர தொடர்புகள்';
        case 'supplies':
          return 'அத்தியாவசிய பொருட்கள்';
      }
    }
    return t.checklist[category];
  };

  // Get category icon
  const getCategoryIcon = (category: ChecklistCategory) => {
    switch (category) {
      case 'water':
        return '💧';
      case 'power':
        return '🔋';
      case 'emergency':
        return '📞';
      case 'supplies':
        return '🎒';
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    if (window.confirm(language === 'en' 
      ? 'Are you sure you want to clear all checked items?' 
      : 'அனைத்து சரிபார்க்கப்பட்ட உருப்படிகளையும் அழிக்க விரும்புகிறீர்களா?'
    )) {
      setCheckedItems({});
    }
  };

  return (
    <section
      className="bg-white rounded-lg shadow-md p-6"
      aria-label="Preparation checklist"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                {t.checklist.title}
              </h2>
              <CompactDataFreshnessIndicator
                cacheKey="checklist"
                fallbackTimestamp={storageManager.getChecklistState().lastUpdated}
              />
            </div>
            <p className="text-sm text-gray-600">
              {language === 'en'
                ? 'Essential items to prepare before the cyclone'
                : 'சூறாவளிக்கு முன் தயார் செய்ய வேண்டிய அத்தியாவசிய பொருட்கள்'}
            </p>
          </div>

          {/* Clear all button */}
          {completedItems > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={language === 'en' ? 'Clear all' : 'அனைத்தையும் அழி'}
            >
              {language === 'en' ? 'Clear All' : 'அனைத்தையும் அழி'}
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700 font-medium">
              {language === 'en' ? 'Progress' : 'முன்னேற்றம்'}
            </span>
            <span className="text-gray-900 font-bold">
              {completedItems} / {totalItems} ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${completionPercentage}%` }}
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Completion message */}
        {completionPercentage === 100 && (
          <div
            className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded"
            role="alert"
          >
            <p className="text-green-800 font-semibold">
              {language === 'en'
                ? '✓ All items completed! You are well prepared.'
                : '✓ அனைத்து உருப்படிகளும் முடிந்தன! நீங்கள் நன்கு தயாராக உள்ளீர்கள்.'}
            </p>
          </div>
        )}
      </div>

      {/* Checklist by category */}
      <div className="space-y-6">
        {(Object.keys(itemsByCategory) as ChecklistCategory[]).map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span aria-hidden="true">{getCategoryIcon(category)}</span>
              {getCategoryTitle(category)}
              <span className="text-sm font-normal text-gray-500">
                ({itemsByCategory[category].filter((item) => checkedItems[item.id]).length} /{' '}
                {itemsByCategory[category].length})
              </span>
            </h3>
            <div className="space-y-2">
              {itemsByCategory[category].map((item) => (
                <ChecklistItemComponent
                  key={item.id}
                  item={item}
                  checked={!!checkedItems[item.id]}
                  onToggle={handleToggle}
                  language={language}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {language === 'en'
            ? 'Your checklist progress is automatically saved and will be restored when you return'
            : 'உங்கள் சரிபார்ப்பு பட்டியல் முன்னேற்றம் தானாகவே சேமிக்கப்பட்டு நீங்கள் திரும்பும்போது மீட்டமைக்கப்படும்'}
        </p>
      </div>
    </section>
  );
}

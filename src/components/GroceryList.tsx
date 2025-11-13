import React, { useState } from 'react';
import { Ingredient } from '../types';
import { ListBulletIcon, PlusIcon, TrashIcon, XIcon } from './Icons';

interface GroceryListProps {
  items: Ingredient[];
  onAddItem: (name: string) => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClose: () => void;
}

export const GroceryList: React.FC<GroceryListProps> = ({ items, onAddItem, onToggleItem, onRemoveItem, onClose }) => {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-100 rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 bg-amber-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <ListBulletIcon className="w-6 h-6" />
          <h2 className="text-xl font-bold">Grocery List</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-amber-700 transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onToggleItem(item.id)}
                    className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className={`text-gray-800 ${item.checked ? 'line-through text-gray-400' : ''}`}>
                    {item.name}
                  </span>
                </div>
                <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Your grocery list is empty.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-stone-200 bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="Add an item..."
            className="flex-1 p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            onClick={handleAddItem}
            className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

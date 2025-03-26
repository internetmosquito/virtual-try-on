import React from 'react';
import './CategorySelector.css';

const CategorySelector = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 1, value: '1', name: 'Upper body' },
    { id: 2, value: '2', name: 'Lower body' },
    { id: 3, value: '3', name: 'Dresses' },
    { id: 4, value: '4', name: 'Full body' },
    { id: 5, value: '5', name: 'Hair' }
  ];

  const handleChange = (e) => {
    onCategoryChange(e.target.value);
  };

  return (
    <div className="category-selector">
      <label htmlFor="category">Category:</label>
      <select 
        id="category" 
        value={selectedCategory} 
        onChange={handleChange}
        className="category-select"
      >
        <option value="">Select a category</option>
        {categories.map(category => (
          <option key={category.id} value={category.value}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="category-help">
        <p>Select the category that best matches your garment type.</p>
      </div>
    </div>
  );
};

export default CategorySelector; 

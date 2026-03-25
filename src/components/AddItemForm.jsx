import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AddItemForm = ({ onItemAdded }) => {
    const [name, setName] = useState('');
    const [categoryName, setCategoryName] = useState(''); 
    const [quantity, setQuantity] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('items/', {
                name,
                category_name: categoryName, 
                quantity: parseInt(quantity)
            });
            setName('');
            setCategoryName('');
            setQuantity(0);
            if (onItemAdded) onItemAdded();
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item. Check console for details.");
        }
    };

    return (
        <div className="add-item-form">
            <h3>Add New Inventory Item</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Item Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Category (e.g., Wood)" 
                    value={categoryName} 
                    onChange={(e) => setCategoryName(e.target.value)} 
                    required 
                />
                <input 
                    type="number" 
                    placeholder="Quantity" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    required 
                />
                <button type="submit" style={{ backgroundColor: 'green', color: 'white', padding: '5px 15px' }}>
                    Add to Inventory
                </button>
            </form>
        </div>
    );
};

export default AddItemForm;
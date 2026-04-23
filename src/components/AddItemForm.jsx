import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

// Component for adding a new item to the inventory via a form
const AddItemForm = ({ onItemAdded }) => {
    // State hooks to manage form input values
    const [name, setName] = useState('');
    const [categoryName, setCategoryName] = useState(''); 
    const [quantity, setQuantity] = useState(0);

    // Handles form submission logic
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the default browser page reload
        try {
            // Sends a POST request to the backend with the form data
            await axiosInstance.post('items/', {
                name,
                category_name: categoryName, 
                quantity: parseInt(quantity) // Ensures quantity is sent as an integer
            });
            
            // Resets form fields to initial state after successful submission
            setName('');
            setCategoryName('');
            setQuantity(0);
            
            // Notifies parent component that a new item was added (e.g., to refresh a list)
            if (onItemAdded) onItemAdded();
        } catch (error) {
            // Logs error details and alerts the user if the request fails
            console.error("Error adding item:", error);
            alert("Failed to add item. Check console for details.");
        }
    };

    return (
        <div className="add-item-form">
            <h3>Add New Inventory Item</h3>
            {/* Inline styles used for simple layout; handleSubmit handles the data on click/enter */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {/* Controlled Input for Item Name */}
                <input 
                    type="text" 
                    placeholder="Item Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
                {/* Controlled Input for Category Name */}
                <input 
                    type="text" 
                    placeholder="Category (e.g., Wood)" 
                    value={categoryName} 
                    onChange={(e) => setCategoryName(e.target.value)} 
                    required 
                />
                {/* Controlled Input for Quantity */}
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
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AddItemForm = ({ onItemAdded }) => {
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sends a POST request to the Django backend
            await axiosInstance.post('items/', {
                name,
                sku,
                quantity: parseInt(quantity)
            });
            
            // Clear the form
            setName('');
            setSku('');
            setQuantity(0);
            
            // Tell the parent (InventoryList) to refresh the table
            onItemAdded();
            alert("Item added successfully!");
        } catch (error) {
            console.error("Error adding item:", error.response?.data);
            alert("Failed to add item. Check console for details.");
        }
    };

    return (
        <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4>Add New Inventory Item</h4>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="text" placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />
                <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>
                    Add to Inventory
                </button>
            </form>
        </div>
    );
};

export default AddItemForm;
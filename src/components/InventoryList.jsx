import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import AddItemForm from './AddItemForm';

const InventoryList = () => {
    const [items, setItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ name: '', sku: '', quantity: 0 });

    const fetchItems = async () => {
        try {
            const response = await axiosInstance.get('items/');
            setItems(response.data);
        } catch (error) {
            console.error("Error fetching inventory", error);
        }
    };

    // DELETE LOGIC
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axiosInstance.delete(`items/${id}/`);
                fetchItems(); // Refresh the list
            } catch (error) {
                alert("Failed to delete item.");
            }
        }
    };

    // EDIT LOGIC 
    const startEdit = (item) => {
        setEditingId(item.id);
        setEditData({ name: item.name, sku: item.sku, quantity: item.quantity });
    };

    const handleUpdate = async (id) => {
        try {
            await axiosInstance.put(`items/${id}/`, editData);
            setEditingId(null);
            fetchItems();
        } catch (error) {
            alert("Failed to update item.");
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return (
        <div className="inventory-list">
            <AddItemForm onItemAdded={fetchItems} />
            
            <h3>Current Inventory</h3>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#eee' }}>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            {editingId === item.id ? (
                                <>
                                    <td><input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /></td>
                                    <td><input value={editData.sku} onChange={e => setEditData({...editData, sku: e.target.value})} /></td>
                                    <td><input type="number" value={editData.quantity} onChange={e => setEditData({...editData, quantity: e.target.value})} /></td>
                                    <td>
                                        <button onClick={() => handleUpdate(item.id)} style={{ color: 'green' }}>Save</button>
                                        <button onClick={() => setEditingId(null)}>Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{item.name}</td>
                                    <td>{item.sku}</td>
                                    <td>{item.quantity}</td>
                                    <td>
                                        <button onClick={() => startEdit(item)} style={{ marginRight: '5px' }}>Edit</button>
                                        <button onClick={() => handleDelete(item.id)} style={{ color: 'red' }}>Delete</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryList;
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import AddItemForm from './AddItemForm';

const InventoryList = () => {

    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); 
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ name: '', category: '', quantity: 0 });

    const fetchItems = async () => {
        try {
            const response = await axiosInstance.get('items/');
            setItems(response.data);
        } catch (error) {
            console.error("Error fetching inventory", error);
        }
    };

    const filteredItems = items.filter(item => {
        const search = searchTerm.toLowerCase();
        if (!search) return true; // Show everything if search box is empty

        const matchesName = item.name?.toLowerCase().includes(search);
        const matchesCategory = item.category?.toLowerCase().includes(search);
        const matchesQuantity = item.quantity?.toString().includes(search);

        // This logic switches based on the dropdown selection
        if (filterType === 'category') return matchesCategory;
        if (filterType === 'quantity') return matchesQuantity;
        if (filterType === 'name') return matchesName;
        
        return matchesName || matchesCategory || matchesQuantity; // 'all' option
    });

    const handleDelete = async (id) => {
        if (window.confirm("Delete this item?")) {
            try {
                await axiosInstance.delete(`items/${id}/`);
                fetchItems();
            } catch (error) { alert("Delete failed"); }
        }
    };

    const handleUpdate = async (id) => {
        try {
            await axiosInstance.put(`items/${id}/`, editData);
            setEditingId(null);
            fetchItems();
        } catch (error) { alert("Update failed"); }
    };

    useEffect(() => { fetchItems(); }, []);

    return (
        <div className="inventory-list" style={{ padding: '20px' }}>
            <AddItemForm onItemAdded={fetchItems} />
            
            <hr />

            {/* SEARCH AND FILTER BAR */}
            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label><strong>Filter By:</strong></label>
                <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="all">Show All</option>
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="quantity">Quantity</option>
                </select>

                <input 
                    type="text" 
                    placeholder={`Search by ${filterType}...`} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </div>

            <h3>Current Inventory</h3>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#333', color: 'white' }}>
                        <th style={{ padding: '10px' }}>Name</th>
                        <th style={{ padding: '10px' }}>Category</th>
                        <th style={{ padding: '10px' }}>Quantity</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map(item => {
                        const isLowStock = item.quantity < 5;
                        return (
                            <tr key={item.id} style={{ backgroundColor: isLowStock ? '#fff1f1' : 'transparent' }}>
                                {editingId === item.id ? (
                                    <>
                                        <td><input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /></td>
                                        <td>{item.category}</td>
                                        <td><input type="number" value={editData.quantity} onChange={e => setEditData({...editData, quantity: e.target.value})} /></td>
                                        <td>
                                            <button onClick={() => handleUpdate(item.id)}>Save</button>
                                            <button onClick={() => setEditingId(null)}>Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ padding: '10px', fontWeight: isLowStock ? 'bold' : 'normal' }}>
                                            {item.name} {isLowStock && <span style={{ color: 'red', fontSize: '0.8em' }}><br/>(LOW STOCK)</span>}
                                        </td>
                                        <td style={{ padding: '10px' }}>{item.category}</td>
                                        <td style={{ padding: '10px', color: isLowStock ? 'red' : 'black' }}>{item.quantity}</td>
                                        <td style={{ padding: '10px' }}>
                                            <button onClick={() => { setEditingId(item.id); setEditData(item); }}>Edit</button>
                                            <button onClick={() => handleDelete(item.id)} style={{ color: 'red', marginLeft: '5px' }}>Delete</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryList;
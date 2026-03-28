import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import AddItemForm from './AddItemForm';

const InventoryList = () => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [minQty, setMinQty] = useState('');
    const [maxQty, setMaxQty] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ name: '', category: '', quantity: 0 });
    const userRole = localStorage.getItem('user_role') || 'user'; 
    const fetchItems = async () => {
        try {
            const response = await axiosInstance.get('items/');
            setItems(response.data);
        } catch (error) {
            console.error("Error fetching inventory", error);
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Combined Filter & Sort
    const processedItems = items
        .filter(item => {
            const matchesName = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            
            const qty = parseInt(item.quantity) || 0;
            const min = minQty === '' ? -Infinity : parseInt(minQty);
            const max = maxQty === '' ? Infinity : parseInt(maxQty);
            const matchesQuantity = qty >= min && qty <= max;
            // Low Stock Toggle (Threshold of 5)
            const matchesLowStock = lowStockOnly ? qty < 5 : true;

            return matchesName && matchesCategory && matchesQuantity && matchesLowStock;
        })
        .sort((a, b) => {
            // Numeric sort for quantity, string sort for others
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (sortConfig.key === 'quantity') {
                valA = parseInt(valA);
                valB = parseInt(valB);
            } else {
                valA = valA?.toString().toLowerCase();
                valB = valB?.toString().toLowerCase();
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

    const categories = ['all', ...new Set(items.map(item => item.category).filter(Boolean))];

    useEffect(() => { fetchItems(); }, []);

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const handleUpdate = async (id) => {
        const dataToSend = userRole === 'staff' ? { quantity: editData.quantity } : editData;
        try {
            await axiosInstance.patch(`items/${id}/`, dataToSend);
            setEditingId(null);
            fetchItems();
        } catch (error) {
            alert(error.response?.data?.detail || "Update failed");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this item?")) {
            try {
                await axiosInstance.delete(`items/${id}/`);
                fetchItems();
            } catch (error) { alert("Delete failed"); }
        }
    };

    return (
        <div className="inventory-list" style={{ padding: '20px' }}>
            {userRole === 'manager' && <><AddItemForm onItemAdded={fetchItems} /><hr /></>}
            
            <div style={{ 
                margin: '20px 0', display: 'flex', flexWrap: 'wrap', gap: '20px', 
                alignItems: 'center', backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '8px' 
            }}>
                {/* Filter Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label><strong>Search Name:</strong></label>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label><strong>Category:</strong></label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '8px' }}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label><strong>Qty Range:</strong></label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <input type="number" placeholder="Min" value={minQty} onChange={(e) => setMinQty(e.target.value)} style={{ width: '60px', padding: '8px' }} />
                        <input type="number" placeholder="Max" value={maxQty} onChange={(e) => setMaxQty(e.target.value)} style={{ width: '60px', padding: '8px' }} />
                    </div>
                </div>

                {/*LOW STOCK CHECKBOX */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                    <input 
                        type="checkbox" 
                        id="lowStock" 
                        checked={lowStockOnly} 
                        onChange={(e) => setLowStockOnly(e.target.checked)} 
                    />
                    <label htmlFor="lowStock" style={{ color: 'red', fontWeight: 'bold' }}>Low Stock Only</label>
                </div>

                <button onClick={() => {setSearchTerm(''); setSelectedCategory('all'); setMinQty(''); setMaxQty(''); setLowStockOnly(false);}} style={{ marginTop: '20px', padding: '8px 15px' }}>Reset</button>
            </div>

            <h3>Current Inventory ({processedItems.length} items found)</h3>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#333', color: 'white' }}>
                        {/* CLICKABLE SORT HEADERS*/}
                        <th onClick={() => requestSort('name')} style={{ padding: '10px', cursor: 'pointer' }}>
                            Name {getSortIndicator('name')}
                        </th>
                        <th onClick={() => requestSort('category')} style={{ padding: '10px', cursor: 'pointer' }}>
                            Category {getSortIndicator('category')}
                        </th>
                        <th onClick={() => requestSort('quantity')} style={{ padding: '10px', cursor: 'pointer' }}>
                            Quantity {getSortIndicator('quantity')}
                        </th>
                        <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {processedItems.map(item => {
                        const isLowStock = item.quantity < 5;
                        return (
                            <tr key={item.id} style={{ backgroundColor: isLowStock ? '#fff1f1' : 'transparent' }}>
                                {editingId === item.id ? (
                                    <>
                                        <td><input value={editData.name} disabled={userRole === 'staff'} onChange={e => setEditData({...editData, name: e.target.value})} /></td>
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
                                            {(userRole === 'manager' || userRole === 'staff') && (
                                                <button onClick={() => { setEditingId(item.id); setEditData(item); }}>Edit</button>
                                            )}
                                            {userRole === 'manager' && (
                                                <button onClick={() => handleDelete(item.id)} style={{ color: 'red', marginLeft: '5px' }}>Delete</button>
                                            )}
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
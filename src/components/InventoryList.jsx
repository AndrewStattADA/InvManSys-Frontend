import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import AddItemForm from './AddItemForm';

/**
 * InventoryList Component
 * The main dashboard for viewing, searching, sorting, and managing inventory.
 * Features: Multi-parameter filtering, dynamic sorting, and inline editing.
 */
const InventoryList = () => {
    // --- State Management ---
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [minQty, setMinQty] = useState('');
    const [maxQty, setMaxQty] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    
    // Sort state: defaults to sorting by name ascending
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    
    // UI state for inline editing
    const [editingId, setEditingId] = useState(null); // ID of the item currently being edited
    const [editData, setEditData] = useState({ name: '', category: '', quantity: 0 });

    // Authorization: Determine what actions the user can perform
    const userRole = localStorage.getItem('user_role') || 'user'; 

    /**
     * Fetches all inventory items from the API
     */
    const fetchItems = async () => {
        try {
            const response = await axiosInstance.get('items/');
            setItems(response.data);
        } catch (error) {
            console.error("Error fetching inventory", error);
        }
    };

    /**
     * Toggles sort direction or changes the sort key
     */
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    /**
     * Processed Items: Applies all filters and then sorts the result.
     * This runs on every render to ensure the UI stays in sync with filter inputs.
     */
    const processedItems = items
        .filter(item => {
            const matchesName = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            
            const qty = parseInt(item.quantity) || 0;
            const min = minQty === '' ? -Infinity : parseInt(minQty);
            const max = maxQty === '' ? Infinity : parseInt(maxQty);
            const matchesQuantity = qty >= min && qty <= max;
            
            // Logic for the Low Stock alert (Threshold set to 5)
            const matchesLowStock = lowStockOnly ? qty < 5 : true;

            return matchesName && matchesCategory && matchesQuantity && matchesLowStock;
        })
        .sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            // Handle numeric vs string sorting logic
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

    // Derive unique categories from the items list for the dropdown filter
    const categories = ['all', ...new Set(items.map(item => item.category).filter(Boolean))];

    useEffect(() => { fetchItems(); }, []);

    // Visual helper for table/grid headers to show current sort state
    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    /**
     * Submits the updated item data. 
     * Permission logic: Staff can only update quantity, Managers can update everything.
     */
    const handleUpdate = async (id) => {
        const dataToSend = userRole === 'staff' ? { quantity: editData.quantity } : editData;
        try {
            await axiosInstance.patch(`items/${id}/`, dataToSend);
            setEditingId(null);
            fetchItems(); // Refresh list after update
        } catch (error) {
            alert(error.response?.data?.detail || "Update failed");
        }
    };

    /**
     * Deletes an item from the database (Manager only)
     */
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
            {/* Show 'Add Item' form only to Managers */}
            {userRole === 'manager' && <><AddItemForm onItemAdded={fetchItems} /><hr /></>}
            
            {/* Filter Toolbar Section */}
            <div style={{ 
                margin: '20px 0', display: 'flex', flexWrap: 'wrap', gap: '20px', 
                alignItems: 'center', backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '8px' 
            }}>
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

            {/* Inventory Display Section */}
            <h3>Current Inventory ({processedItems.length} items found)</h3>
            <div className="inventory-grid-scroll-area">
                <div className="inventory-grid-container">
                    {processedItems.map(item => (
                        <div key={item.id} className={`grid-card ${item.quantity < 5 ? 'low-stock' : ''}`}>
                            
                            {/* --- Toggle between Edit Mode and View Mode --- */}
                            {editingId === item.id ? (
                                <>
                                    <div className="card-info">
                                        <div className="card-title">
                                            <input 
                                                className="edit-input"
                                                value={editData.name} 
                                                disabled={userRole === 'staff'} // Staff cannot change item names
                                                onChange={e => setEditData({...editData, name: e.target.value})} 
                                            />
                                        </div>
                                        <div className="card-detail">Category: {item.category || 'General'}</div>
                                        <div className="card-detail">
                                            Quantity: 
                                            <input 
                                                type="number" 
                                                className="edit-input qty-edit"
                                                value={editData.quantity} 
                                                onChange={e => setEditData({...editData, quantity: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                    <div className="card-actions">
                                        <button onClick={() => handleUpdate(item.id)}>Save</button>
                                        <button onClick={() => setEditingId(null)}>Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="card-info">
                                        <div className="card-title">
                                            <strong>{item.name}</strong>
                                            {item.quantity < 5 && <span className="low-stock-label">(LOW STOCK)</span>}
                                        </div>
                                        <div className="card-detail">Category: {item.category || 'General'}</div>
                                        <div className="card-detail">
                                            Quantity: <span className={item.quantity < 5 ? 'low-stock-text' : ''}>{item.quantity}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="card-actions">
                                        {/* Managers and Staff can edit, but their save logic differs (handled in handleUpdate) */}
                                        {(userRole === 'manager' || userRole === 'staff') && (
                                            <button onClick={() => { setEditingId(item.id); setEditData(item); }}>Edit</button>
                                        )}
                                        {userRole === 'manager' && (
                                            <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InventoryList;
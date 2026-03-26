import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import AddItemForm from './AddItemForm';

const InventoryList = () => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); 
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

    const filteredItems = items.filter(item => {
        const search = searchTerm.toLowerCase();
        if (!search) return true;

        const matchesName = item.name?.toLowerCase().includes(search);
        const matchesCategory = item.category?.toLowerCase().includes(search);
        const matchesQuantity = item.quantity?.toString().includes(search);

        if (filterType === 'category') return matchesCategory;
        if (filterType === 'quantity') return matchesQuantity;
        if (filterType === 'name') return matchesName;
        
        return matchesName || matchesCategory || matchesQuantity;
    });

    const handleDelete = async (id) => {
        if (window.confirm("Delete this item?")) {
            try {
                await axiosInstance.delete(`items/${id}/`);
                fetchItems();
            } catch (error) { alert("Delete failed: Only managers can delete items."); }
        }
    };

    const handleUpdate = async (id) => {
        const userRole = localStorage.getItem('user_role');
        // If user is staff, only send the quantity
        const dataToSend = userRole === 'staff' 
            ? { quantity: editData.quantity } 
            : editData;

        try {
            await axiosInstance.patch(`items/${id}/`, dataToSend);
            setEditingId(null);
            fetchItems();
        } catch (error) {
            alert(error.response?.data?.detail || "Update failed");
        }
    };

    useEffect(() => { fetchItems(); }, []);

    return (
        <div className="inventory-list" style={{ padding: '20px' }}>
            {/*ROLE CHECK: Only Managers can add items  */} 
            {userRole === 'manager' && (
                <>
                    <AddItemForm onItemAdded={fetchItems} />
                    <hr />
                </>
            )}
            
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
                                        <td>
                                            <input 
                                                value={editData.name} 
                                                disabled={userRole === 'staff'} // Staff cannot edit Name
                                                onChange={e => setEditData({...editData, name: e.target.value})} 
                                            />
                                        </td>
                                        <td>{item.category}</td>
                                        <td>
                                            <input 
                                                type="number" 
                                                value={editData.quantity} 
                                                onChange={e => setEditData({...editData, quantity: e.target.value})} 
                                            />
                                        </td>
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
                                            {/* ROLE CHECK: Staff/Managers can Edit, but Users cannot */}
                                            {(userRole === 'manager' || userRole === 'staff') && (
                                                <button onClick={() => { setEditingId(item.id); setEditData(item); }}>Edit</button>
                                            )}
                                            
                                            {/* ROLE CHECK: Only Managers can Delete */}
                                            {userRole === 'manager' && (
                                                <button onClick={() => handleDelete(item.id)} style={{ color: 'red', marginLeft: '5px' }}>Delete</button>
                                            )}
                                            
                                            {userRole === 'user' && <span>View Only</span>}
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
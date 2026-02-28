import React, { useState, useEffect } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const modalBackdropStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', subcategories: '' });
  const token = localStorage.getItem('token');

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/category/all', { headers: { token } });
      setCategories(res.data.categories || res.data || []);
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Handle form input
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add or update category
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        subcategories: form.subcategories
          ? form.subcategories.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };
      if (editingCategory) {
        await axios.put(`/api/category/${editingCategory._id}`, payload, { headers: { token } });
        toast.success('Category updated');
      } else {
        await axios.post('/api/category/', payload, { headers: { token } });
        toast.success('Category added');
      }
      setShowForm(false);
      setEditingCategory(null);
      setForm({ name: '', subcategories: '' });
      fetchCategories();
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  // Edit category
  const handleEdit = category => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      subcategories: (category.subcategories || []).join(', ')
    });
    setShowForm(true);
  };

  // Delete category
  const handleDelete = async category => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`/api/category/${category._id}`, { headers: { token } });
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="admin-categories-root" style={{ padding: 32, minHeight: '80vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Categories
          <button
            style={{ background: '#3C91E6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            onClick={() => { setEditingCategory(null); setForm({ name: '', subcategories: '' }); setShowForm(true); }}
          >
            Add Category
          </button>
        </div>
        <div className="admin-categories-table-container" style={{ borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 0, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 32 }}>Loading...</div> : (
            <table className="admin-categories-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Subcategories</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 12px' }}>{category.name}</td>
                    <td style={{ padding: '14px 12px' }}>
                      {(category.subcategories || []).join(', ')}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <button
                        style={{ background: '#3C91E6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', marginRight: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                        onMouseOut={e => e.currentTarget.style.background = '#3C91E6'}
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#c53030'}
                        onMouseOut={e => e.currentTarget.style.background = '#e53e3e'}
                        onClick={() => handleDelete(category)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showForm && (
        <div style={modalBackdropStyle} onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <form className="admin-category-modal" onSubmit={handleSubmit} style={{
            background: document.body.classList.contains('navy-dark') ? '#232e3c' : '#fff',
            borderRadius: 16,
            padding: 32,
            minWidth: 320,
            maxWidth: 400,
            boxShadow: '0 2px 16px #0003',
            position: 'relative',
            zIndex: 10000
          }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 16, right: 16, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Subcategories (comma separated)</label>
              <input name="subcategories" value={form.subcategories} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} placeholder="e.g. Smartphones, Laptops, Accessories" />
            </div>
            <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: '#3C91E6', color: '#fff', fontWeight: 'bold', fontSize: 16, border: 'none', cursor: 'pointer' }}>{editingCategory ? 'Update' : 'Add'}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminCategories; 
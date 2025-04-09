import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllArticles, deleteArticle } from '../../api/services/articlesService';
import { useAuth } from '../../context/AuthContext';

const ManageArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllArticles();
            setArticles(response.data || response || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch articles.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleDelete = async (articleId) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await deleteArticle(articleId);
                fetchArticles();
                alert('Article deleted successfully!');
            } catch (err) {
                alert(err.message || 'Failed to delete article.');
            }
        }
    };

    if (loading) return <div>Loading articles...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Manage Articles</h2>
            <Link to="/editor/add" style={{ marginBottom: '20px', display: 'inline-block' }}>
                Add New Article
            </Link>
            {articles.length === 0 ? (
                <p>No articles found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Title</th>
                            <th style={tableHeaderStyle}>Author</th>
                            <th style={tableHeaderStyle}>Created At</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article.id} style={tableRowStyle}>
                                <td style={tableCellStyle}>{article.title}</td>
                                <td style={tableCellStyle}>{article.author_name || 'N/A'}</td>
                                <td style={tableCellStyle}>{new Date(article.created_at).toLocaleDateString()}</td>
                                <td style={tableCellStyle}>
                                    <Link to={`/admin/articles/edit/${article.id}`} style={{ marginRight: '10px' }}>Edit</Link>
                                    <button onClick={() => handleDelete(article.id)} style={deleteButtonStyle}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const tableHeaderStyle = {
    borderBottom: '2px solid #ddd',
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
};

const tableRowStyle = {
    borderBottom: '1px solid #eee',
};

const tableCellStyle = {
    padding: '10px',
};

const deleteButtonStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
};

export default ManageArticles;

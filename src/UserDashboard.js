import React, { useState, useEffect } from 'react';

function UserDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Calls the new Spring Boot API endpoint we just added
        fetch('http://localhost:8080/api/auth/users')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch user accounts");
                }
                return response.json();
            })
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p style={{ padding: '20px' }}>Loading accounts list...</p>;

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#2c3e50' }}>Registered Accounts Directory</h2>
            <p>Viewing live entries pulled straight from the MySQL database:</p>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#4CAF50', color: 'white', textAlign: 'left' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Full Name</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Email Address</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Phone Number</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>System Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.fullName}</td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.phone}</td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                <span style={{
                                    backgroundColor: user.role === 'ADMIN' ? '#e74c3c' : '#3498db',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {user.role}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserDashboard;

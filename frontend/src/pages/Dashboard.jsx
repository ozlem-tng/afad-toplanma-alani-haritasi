import React from 'react';

const Dashboard = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f8f9fa'
        }}>
            <div className="text-center">
                <h1 className="display-4 text-dark fw-600">Giriş Başarılı</h1>
                <p className="text-muted fs-16">Uygulamaya hoş geldiniz. İleride harita ve takip ekranlarını buraya ekleyebilirsiniz.</p>
            </div>
        </div>
    );
};

export default Dashboard;
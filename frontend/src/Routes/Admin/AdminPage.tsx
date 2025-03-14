import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const AdminPage: React.FC = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Admin Dashboard
                </Typography>
                
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Welcome to Admin Panel
                    </Typography>
                    <Typography variant="body1">
                        This is a basic admin dashboard. You can add various administrative functions here such as:
                    </Typography>
                    <ul>
                        <li>User Management</li>
                        <li>Content Management</li>
                        <li>System Settings</li>
                        <li>Analytics</li>
                    </ul>
                </Paper>
            </Box>
        </Container>
    );
};

export default AdminPage;
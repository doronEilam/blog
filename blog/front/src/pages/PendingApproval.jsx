import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const PendingApproval = () => {
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    No Items Pending Approval
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Currently, there are no items that require admin approval. 
                    You can change the settings to enable approval for specific items, 
                    and they will appear here.
                </Typography>
            </Box>
        </Container>
    );
};

export default PendingApproval;
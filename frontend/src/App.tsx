import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Alert, Snackbar } from '@mui/material';
import ResumeUploader from './components/ResumeUploader';
import ResumeResult from './components/ResumeResult';
import { ResumeAnalysis, ApiResponse } from './types';
import axios from 'axios';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File | null, text: string | null) => {
    try {
      setLoading(true);
      setError(null);
      let response;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        response = await axios.post<ApiResponse<ResumeAnalysis>>(
          'http://localhost:8080/api/resume/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else if (text) {
        response = await axios.post<ApiResponse<ResumeAnalysis>>(
          'http://localhost:8080/api/resume/analyze',
          { content: text }
        );
      }

      if (response?.data?.success) {
        setAnalysis(response.data.data!);
      } else {
        setError(response?.data?.error || '分析失败，请重试');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError('分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        {!analysis && <ResumeUploader onUpload={handleUpload} isLoading={loading} />}
        {analysis && <ResumeResult analysis={analysis} onReset={handleReset} />}
        
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;

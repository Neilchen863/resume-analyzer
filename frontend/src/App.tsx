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
        console.log('Uploading file...');
        const formData = new FormData();
        formData.append('file', file);
        response = await axios.post<ApiResponse<ResumeAnalysis>>(
          'http://localhost:8081/api/resume/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else if (text) {
        console.log('Analyzing text...', { textLength: text.length });
        response = await axios.post<ApiResponse<ResumeAnalysis>>(
          'http://localhost:8081/api/resume/analyze',
          { content: text }
        );
      }

      console.log('Raw API Response:', response);
      console.log('Response data:', JSON.stringify(response?.data, null, 2));
      
      if (response?.data?.success) {
        console.log('Analysis successful:', response.data.data);
        if (!response.data.data) {
          console.error('Analysis data is null or undefined');
          setError('分析结果为空，请重试');
          return;
        }
        if (!response.data.data.personalInfo || !response.data.data.tags) {
          console.error('Invalid analysis data structure:', response.data.data);
          setError('分析结果格式不正确，请重试');
          return;
        }
        setAnalysis(response.data.data);
      } else {
        const errorMessage = response?.data?.error || '分析失败，请重试';
        console.error('Analysis failed:', errorMessage);
        console.error('Full error response:', response?.data);
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      setError(error.response?.data?.error || error.message || '分析失败，请重试');
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

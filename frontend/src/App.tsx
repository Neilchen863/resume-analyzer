import React, { useState } from 'react';
import { 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Alert, 
  Snackbar, 
  Box,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material';
import ResumeUploader from './components/ResumeUploader';
import ResumeResult from './components/ResumeResult';
import { ResumeAnalysis, ApiResponse } from './types';
import axios from 'axios';
import { API_ENDPOINTS } from './config/api';
import DescriptionIcon from '@mui/icons-material/Description';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleUpload = async (file: File | null, text: string | null) => {
    setLoading(true);
    setError(null);
    
    try {
      let response: ApiResponse<ResumeAnalysis>;
      
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        response = (await axios.post(API_ENDPOINTS.UPLOAD, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })).data;
      } else if (text) {
        response = (await axios.post(API_ENDPOINTS.ANALYZE, { content: text })).data;
      } else {
        throw new Error('No file or text provided');
      }
      
      if (!response.success || !response.data) {
        throw new Error(response.error || '分析失败');
      }
      
      const analysisData = response.data;
      if (!analysisData.personalInfo || !analysisData.tags) {
        throw new Error('分析结果数据不完整');
      }
      
      setAnalysis(analysisData);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : '分析过程中出现错误');
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
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 4
      }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            mb: 4
          }}
        >
          <Toolbar>
            <DescriptionIcon sx={{ mr: 2 }} />
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              component="h1"
              sx={{ 
                flexGrow: 1,
                fontWeight: 'bold'
              }}
            >
              AI简历分析助手
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg">
          {analysis ? (
            <ResumeResult analysis={analysis} onReset={handleReset} />
          ) : (
            <ResumeUploader onUpload={handleUpload} isLoading={loading} />
          )}
        </Container>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setError(null)} 
            severity="error" 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;

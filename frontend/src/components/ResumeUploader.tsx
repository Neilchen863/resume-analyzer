import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
    Box, 
    Paper, 
    TextField, 
    Typography, 
    Button, 
    CircularProgress,
    Grid,
    useTheme,
    Fade,
    Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface ResumeUploaderProps {
    onUpload: (file: File | null, text: string | null) => void;
    isLoading?: boolean;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUpload, isLoading = false }) => {
    const [text, setText] = useState('');
    const theme = useTheme();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0], null);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        disabled: isLoading
    });

    const handleTextSubmit = () => {
        if (text.trim()) {
            onUpload(null, text);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: { xs: 2, sm: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2
                    }}
                >
                    简历分析器
                </Typography>
                <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    sx={{ maxWidth: 600, mx: 'auto' }}
                >
                    上传您的简历，让 AI 为您提供专业的分析和建议，发现更多职业发展可能
                </Typography>
            </Box>
            
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper
                        {...getRootProps()}
                        elevation={3}
                        sx={{
                            p: 4,
                            height: '100%',
                            border: '2px dashed',
                            borderColor: isDragActive ? 'primary.main' : 'grey.300',
                            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                transform: isLoading ? 'none' : 'translateY(-4px)',
                                boxShadow: isLoading ? theme.shadows[3] : theme.shadows[6],
                            }
                        }}
                    >
                        <input {...getInputProps()} />
                        <Box sx={{ textAlign: 'center' }}>
                            <UploadFileIcon 
                                sx={{ 
                                    fontSize: 64, 
                                    color: 'primary.main', 
                                    mb: 2,
                                    transition: 'transform 0.3s ease',
                                    transform: isDragActive ? 'scale(1.1)' : 'none'
                                }} 
                            />
                            <Typography variant="h5" gutterBottom fontWeight="medium">
                                {isLoading ? '正在分析...' : '上传 PDF 简历'}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                {isLoading ? '请稍候' : '拖放文件到这里或点击选择'}
                            </Typography>
                            {isLoading && (
                                <Fade in={isLoading}>
                                    <CircularProgress 
                                        size={32} 
                                        sx={{ mt: 2 }}
                                    />
                                </Fade>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <TextSnippetIcon 
                                sx={{ 
                                    fontSize: 64, 
                                    color: 'secondary.main', 
                                    mb: 2 
                                }} 
                            />
                            <Typography variant="h5" gutterBottom fontWeight="medium">
                                粘贴简历文本
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                直接粘贴简历内容进行分析
                            </Typography>
                        </Box>
                        
                        <TextField
                            multiline
                            rows={6}
                            fullWidth
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="在此粘贴简历文本..."
                            variant="outlined"
                            disabled={isLoading}
                            sx={{
                                mb: 3,
                                flexGrow: 1,
                                '& .MuiOutlinedInput-root': {
                                    height: '100%',
                                    '& textarea': {
                                        height: '100% !important'
                                    }
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleTextSubmit}
                            disabled={!text.trim() || isLoading}
                            sx={{
                                height: 48,
                                background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.light} 90%)`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.shadows[4],
                                }
                            }}
                        >
                            {isLoading ? (
                                <>
                                    分析中...
                                    <CircularProgress 
                                        size={20} 
                                        sx={{ ml: 1, color: 'white' }}
                                    />
                                </>
                            ) : (
                                '开始分析'
                            )}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ResumeUploader;

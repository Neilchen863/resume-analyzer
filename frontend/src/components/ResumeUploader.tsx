import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Paper, TextField, Typography, Button, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ResumeUploaderProps {
    onUpload: (file: File | null, text: string | null) => void;
    isLoading?: boolean;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUpload, isLoading = false }) => {
    const [text, setText] = useState('');

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
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                简历分析器
            </Typography>
            
            <Paper
                {...getRootProps()}
                sx={{
                    p: 3,
                    mb: 3,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                }}
            >
                <input {...getInputProps()} />
                <Box sx={{ textAlign: 'center' }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        {isLoading ? '正在分析...' : '拖放简历文件到这里'}
                    </Typography>
                    <Typography color="textSecondary">
                        {isLoading ? '请稍候' : '或点击选择PDF文件'}
                    </Typography>
                    {isLoading && (
                        <CircularProgress 
                            size={24} 
                            sx={{ mt: 2 }}
                        />
                    )}
                </Box>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                或直接粘贴简历文本
            </Typography>
            <TextField
                multiline
                rows={6}
                fullWidth
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此粘贴简历文本..."
                variant="outlined"
                sx={{ mb: 2 }}
                disabled={isLoading}
            />
            <Button
                variant="contained"
                fullWidth
                onClick={handleTextSubmit}
                disabled={!text.trim() || isLoading}
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
                    '分析文本内容'
                )}
            </Button>
        </Box>
    );
};

export default ResumeUploader;

import React from 'react';
import { 
    Box, 
    Card, 
    Chip, 
    Typography, 
    Avatar, 
    Button, 
    Paper,
    Divider,
    Container,
    Grid,
    useTheme,
    Stack,
    Rating,
    Tooltip
} from '@mui/material';
import { ResumeAnalysis, ResumeTag } from '../types';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DownloadIcon from '@mui/icons-material/Download';
import { SvgIconComponent } from '@mui/icons-material';

interface ResumeResultProps {
    analysis: ResumeAnalysis;
    onReset: () => void;
}

const getTagIcon = (type: ResumeTag['type']): React.ReactElement => {
    const IconComponent: SvgIconComponent = (() => {
        switch (type) {
            case 'SKILL':
                return EmojiObjectsIcon;
            case 'POSITION':
                return WorkIcon;
            case 'FIELD':
                return SchoolIcon;
            case 'INTEREST':
                return LocalLibraryIcon;
            case 'MOTTO':
                return FormatQuoteIcon;
            default:
                return WorkIcon;
        }
    })();
    return <IconComponent />;
};

const getTagColor = (type: ResumeTag['type']): "primary" | "secondary" | "success" | "info" | "warning" => {
    switch (type) {
        case 'SKILL':
            return 'primary';
        case 'POSITION':
            return 'secondary';
        case 'FIELD':
            return 'success';
        case 'INTEREST':
            return 'info';
        case 'MOTTO':
            return 'warning';
        default:
            return 'primary';
    }
};

const getTagTypeName = (type: ResumeTag['type']): string => {
    switch (type) {
        case 'SKILL':
            return '技能特长';
        case 'POSITION':
            return '适合岗位';
        case 'FIELD':
            return '专业领域';
        case 'INTEREST':
            return '兴趣爱好';
        case 'MOTTO':
            return '个性标签';
        default:
            return type;
    }
};

const exportToJson = (analysis: ResumeAnalysis) => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysis.personalInfo.name || 'resume'}_analysis.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const exportToPdf = async (analysis: ResumeAnalysis) => {
    try {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Set font to support Chinese characters
        doc.setFont('helvetica');
        
        // Add title
        doc.setFontSize(20);
        doc.text('简历分析报告', 20, 20);
        
        // Add personal info
        doc.setFontSize(16);
        doc.text('个人信息', 20, 40);
        doc.setFontSize(12);
        doc.text(`姓名: ${analysis.personalInfo.name || '未知'}`, 30, 50);
        if (analysis.personalInfo.email) {
            doc.text(`邮箱: ${analysis.personalInfo.email}`, 30, 60);
        }
        if (analysis.personalInfo.phone) {
            doc.text(`电话: ${analysis.personalInfo.phone}`, 30, 70);
        }
        if (analysis.personalInfo.location) {
            doc.text(`地点: ${analysis.personalInfo.location}`, 30, 80);
        }
        
        // Add tags by type
        let yPos = 100;
        const tagTypes: ResumeTag['type'][] = ['MOTTO', 'POSITION', 'FIELD', 'SKILL', 'INTEREST'];
        
        for (const type of tagTypes) {
            const typeTags = analysis.tags.filter(tag => tag.type === type);
            if (typeTags.length === 0) continue;
            
            doc.setFontSize(16);
            doc.text(getTagTypeName(type), 20, yPos);
            yPos += 10;
            
            doc.setFontSize(12);
            typeTags.forEach(tag => {
                const tagText = tag.score ? `${tag.name} (${tag.score}/10)` : tag.name;
                doc.text(`• ${tagText}`, 30, yPos);
                yPos += 10;
                
                // Add new page if needed
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
            });
            
            yPos += 10;
        }
        
        // Save the PDF
        doc.save(`${analysis.personalInfo.name || 'resume'}_analysis.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('PDF生成失败，请尝试导出JSON格式');
    }
};

const ResumeResult: React.FC<ResumeResultProps> = ({ analysis, onReset }) => {
    console.log('ResumeResult rendering with analysis:', analysis);
    const theme = useTheme();
    
    const { personalInfo, tags } = analysis;
    
    if (!personalInfo || !tags) {
        console.error('Invalid analysis data:', analysis);
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: theme.palette.error.light,
                        color: theme.palette.error.contrastText
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        分析结果数据不完整，请重试
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<RestartAltIcon />}
                        onClick={onReset}
                        sx={{ 
                            mt: 2,
                            backgroundColor: theme.palette.error.dark,
                            '&:hover': {
                                backgroundColor: theme.palette.error.main,
                            }
                        }}
                    >
                        重新分析
                    </Button>
                </Paper>
            </Container>
        );
    }

    const tagTypes: ResumeTag['type'][] = ['MOTTO', 'POSITION', 'FIELD', 'SKILL', 'INTEREST'];
    console.log('Processing tags:', tags);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ overflow: 'hidden' }}>
                {/* Header Section with Gradient Background */}
                <Box
                    sx={{
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                        color: 'white',
                        p: 4,
                    }}
                >
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    fontSize: '2.5rem',
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    border: '4px solid rgba(255, 255, 255, 0.5)',
                                }}
                            >
                                {personalInfo.name?.[0] || '?'}
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {personalInfo.name || '未知姓名'}
                            </Typography>
                            <Grid container spacing={2}>
                                {personalInfo.email && (
                                    <Grid item>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon />
                                            <Typography>{personalInfo.email}</Typography>
                                        </Box>
                                    </Grid>
                                )}
                                {personalInfo.phone && (
                                    <Grid item>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneIcon />
                                            <Typography>{personalInfo.phone}</Typography>
                                        </Box>
                                    </Grid>
                                )}
                                {personalInfo.location && (
                                    <Grid item>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon />
                                            <Typography>{personalInfo.location}</Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>

                {/* Export Buttons */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => exportToJson(analysis)}
                    >
                        导出JSON
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => exportToPdf(analysis)}
                    >
                        导出PDF
                    </Button>
                </Box>

                {/* Tags Section */}
                <Box sx={{ p: 4 }}>
                    {tagTypes.map((type, index) => {
                        const typeTags = tags.filter((tag) => tag.type === type);
                        if (typeTags.length === 0) return null;

                        return (
                            <React.Fragment key={type}>
                                {index > 0 && <Divider sx={{ my: 3 }} />}
                                <Box sx={{ mb: 3 }}>
                                    <Typography 
                                        variant="h5" 
                                        gutterBottom 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            color: theme.palette[getTagColor(type)].main,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {getTagIcon(type)}
                                        {getTagTypeName(type)}
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap', 
                                            gap: 1,
                                            mt: 2 
                                        }}
                                    >
                                        {typeTags.map((tag) => (
                                            <Tooltip 
                                                key={tag.id}
                                                title={tag.score ? `评分: ${tag.score}/10` : ''}
                                                placement="top"
                                            >
                                                <Chip
                                                    label={
                                                        <Box sx={{ p: 0.5 }}>
                                                            <Typography component="span">
                                                                {tag.name}
                                                            </Typography>
                                                            {tag.score && (
                                                                <Typography 
                                                                    component="span" 
                                                                    sx={{ 
                                                                        ml: 1,
                                                                        opacity: 0.8,
                                                                        fontSize: '0.9em'
                                                                    }}
                                                                >
                                                                    {tag.score}/10
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                    color={getTagColor(tag.type)}
                                                    sx={{
                                                        borderRadius: '16px',
                                                        height: 'auto',
                                                        '& .MuiChip-label': {
                                                            display: 'block',
                                                        },
                                                        transition: 'all 0.2s ease-in-out',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: theme.shadows[3],
                                                        },
                                                    }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </Box>
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Paper>
        </Container>
    );
};

export default ResumeResult;
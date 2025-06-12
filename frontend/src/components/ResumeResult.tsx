import React from 'react';
import { Box, Card, Chip, Typography, Avatar, Button } from '@mui/material';
import { ResumeAnalysis, ResumeTag } from '../types';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
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
            return '个性签名';
        default:
            return type;
    }
};

const ResumeResult: React.FC<ResumeResultProps> = ({ analysis, onReset }) => {
    const { personalInfo, tags } = analysis;
    const tagTypes: ResumeTag['type'][] = ['MOTTO', 'POSITION', 'FIELD', 'SKILL', 'INTEREST'];

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
            <Card sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        sx={{ 
                            width: 80, 
                            height: 80, 
                            mr: 3, 
                            bgcolor: 'primary.main',
                            fontSize: '2rem'
                        }}
                    >
                        {personalInfo.name?.[0] || '?'}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {personalInfo.name || '未知姓名'}
                        </Typography>
                        {personalInfo.email && (
                            <Typography color="textSecondary" gutterBottom>
                                {personalInfo.email}
                            </Typography>
                        )}
                        {personalInfo.phone && (
                            <Typography color="textSecondary" gutterBottom>
                                {personalInfo.phone}
                            </Typography>
                        )}
                        {personalInfo.location && (
                            <Typography color="textSecondary">
                                {personalInfo.location}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {tagTypes.map((type) => {
                    const typeTags = tags.filter((tag) => tag.type === type);
                    if (typeTags.length === 0) return null;

                    return (
                        <Box key={type} sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {getTagTypeName(type)}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {typeTags.map((tag) => (
                                    <Chip
                                        key={tag.id}
                                        label={tag.name}
                                        icon={getTagIcon(tag.type)}
                                        color={getTagColor(tag.type)}
                                        sx={{
                                            m: 0.5,
                                            '& .MuiChip-icon': {
                                                color: 'inherit'
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    );
                })}
            </Card>

            <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={onReset}
                fullWidth
            >
                分析新简历
            </Button>
        </Box>
    );
};

export default ResumeResult;
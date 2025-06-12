package com.springboot.resumeanalyzer.model;

import lombok.Data;
import java.util.List;

@Data
public class ResumeAnalysis {
    private PersonalInfo personalInfo;
    private List<ResumeTag> tags;
    private String rawContent;
} 
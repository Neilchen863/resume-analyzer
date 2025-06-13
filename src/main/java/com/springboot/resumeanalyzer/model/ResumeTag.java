package com.springboot.resumeanalyzer.model;

import lombok.Data;

@Data
public class ResumeTag {
    private String id;
    private String name;
    private TagType type;
    private double confidence;
    private Integer score; // Score out of 10

    public enum TagType {
        SKILL,
        INTEREST,
        POSITION,
        FIELD,
        MOTTO
    }
} 
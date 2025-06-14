package com.springboot.resumeanalyzer.controller;

import com.springboot.resumeanalyzer.model.ApiResponse;
import com.springboot.resumeanalyzer.model.ResumeAnalysis;
import com.springboot.resumeanalyzer.model.ResumeTag;
import com.springboot.resumeanalyzer.model.PersonalInfo;
import com.springboot.resumeanalyzer.service.ResumeAnalyzerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {
    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    @Autowired
    private ResumeAnalyzerService analyzerService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ResumeAnalysis> uploadResume(@RequestParam("file") MultipartFile file) {
        logger.info("Received file upload request: filename={}, size={} bytes, contentType={}", 
                   file.getOriginalFilename(), file.getSize(), file.getContentType());
        
        if (file == null || file.isEmpty()) {
            logger.warn("Received empty file");
            return ApiResponse.error("Please select a file");
        }

        if (!file.getContentType().equals("application/pdf")) {
            logger.warn("Invalid file type: {}", file.getContentType());
            return ApiResponse.error("Only PDF files are supported");
        }
        
        try {
            ResumeAnalysis analysis = analyzerService.analyzePdfResume(file);
            logger.info("Successfully analyzed resume from file: {}", file.getOriginalFilename());
            return ApiResponse.success(analysis);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid file upload: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (IOException e) {
            logger.error("Failed to process PDF file: {}", e.getMessage(), e);
            return ApiResponse.error("Failed to process PDF file: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during file analysis", e);
            Throwable rootCause = getRootCause(e);
            String errorMessage = rootCause != null ? rootCause.getMessage() : e.getMessage();
            return ApiResponse.error("Error analyzing resume: " + errorMessage);
        }
    }

    private Throwable getRootCause(Throwable throwable) {
        Throwable rootCause = throwable;
        while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
            rootCause = rootCause.getCause();
        }
        return rootCause;
    }

    @PostMapping("/analyze")
    public ApiResponse<ResumeAnalysis> analyzeText(@RequestBody Map<String, String> request) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            logger.warn("Received empty content for analysis");
            return ApiResponse.error("Content cannot be empty");
        }
        
        logger.info("Received text analysis request with {} characters", content.length());
        
        try {
            ResumeAnalysis analysis = analyzerService.analyzeResume(content);
            logger.info("Successfully analyzed resume text");
            return ApiResponse.success(analysis);
        } catch (Exception e) {
            logger.error("Failed to analyze resume text: {}", e.getMessage(), e);
            return ApiResponse.error("Failed to analyze resume: " + e.getMessage());
        }
    }

    @GetMapping("/sample")
    public ApiResponse<ResumeAnalysis> getSampleAnalysis() {
        try {
            ResumeAnalysis analysis = new ResumeAnalysis();
            
            PersonalInfo personalInfo = new PersonalInfo();
            personalInfo.setName("张三");
            personalInfo.setEmail("zhangsan@example.com");
            personalInfo.setPhone("13800138000");
            personalInfo.setLocation("北京");
            analysis.setPersonalInfo(personalInfo);
            
            List<ResumeTag> tags = new ArrayList<>();
            
            ResumeTag skillTag = new ResumeTag();
            skillTag.setId(UUID.randomUUID().toString());
            skillTag.setName("Java开发");
            skillTag.setType(ResumeTag.TagType.SKILL);
            skillTag.setConfidence(0.95);
            tags.add(skillTag);
            
            ResumeTag interestTag = new ResumeTag();
            interestTag.setId(UUID.randomUUID().toString());
            interestTag.setName("阅读");
            interestTag.setType(ResumeTag.TagType.INTEREST);
            interestTag.setConfidence(0.9);
            tags.add(interestTag);
            
            ResumeTag positionTag = new ResumeTag();
            positionTag.setId(UUID.randomUUID().toString());
            positionTag.setName("后端工程师");
            positionTag.setType(ResumeTag.TagType.POSITION);
            positionTag.setConfidence(0.95);
            tags.add(positionTag);
            
            analysis.setTags(tags);
            
            return ApiResponse.success(analysis);
        } catch (Exception e) {
            logger.error("Failed to generate sample analysis: {}", e.getMessage(), e);
            return ApiResponse.error("Failed to generate sample analysis");
        }
    }

    @GetMapping("/test")
    public ApiResponse<String> test() {
        return ApiResponse.success("API is working!");
    }
} 
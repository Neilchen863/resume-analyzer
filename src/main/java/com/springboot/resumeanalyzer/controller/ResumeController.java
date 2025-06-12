package com.springboot.resumeanalyzer.controller;

import com.springboot.resumeanalyzer.model.ApiResponse;
import com.springboot.resumeanalyzer.model.ResumeAnalysis;
import com.springboot.resumeanalyzer.service.ResumeAnalyzerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "http://localhost:3000")
public class ResumeController {

    @Autowired
    private ResumeAnalyzerService analyzerService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ResumeAnalysis> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            ResumeAnalysis analysis = analyzerService.analyzePdfResume(file);
            return ApiResponse.success(analysis);
        } catch (IOException e) {
            return ApiResponse.error("Failed to process PDF file: " + e.getMessage());
        }
    }

    @PostMapping("/analyze")
    public ApiResponse<ResumeAnalysis> analyzeText(@RequestBody Map<String, String> request) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ApiResponse.error("Content cannot be empty");
        }
        
        ResumeAnalysis analysis = analyzerService.analyzeResume(content);
        return ApiResponse.success(analysis);
    }
} 
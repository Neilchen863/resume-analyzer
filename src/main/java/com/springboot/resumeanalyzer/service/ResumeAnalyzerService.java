package com.springboot.resumeanalyzer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.resumeanalyzer.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import io.github.cdimascio.dotenv.Dotenv;

import java.io.IOException;
import java.util.*;

@Service
public class ResumeAnalyzerService {

    @Autowired
    private ObjectMapper objectMapper;

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String apiUrl = "https://api.deepseek.com/v1/chat/completions";

    private static final String SYSTEM_PROMPT = """
        你是一个专业的简历分析助手。请分析提供的简历内容，并提取以下信息：
        1. 个人基本信息（姓名、邮箱、电话、所在地）
        2. 技能标签（专业技能和工具）
        3. 兴趣爱好
        4. 适合的职位
        5. 专业领域
        6. 个性标签或座右铭
        
        请以JSON格式返回，格式如下：
        {
          "personalInfo": {
            "name": "姓名",
            "email": "邮箱",
            "phone": "电话",
            "location": "所在地"
          },
          "tags": [
            {
              "id": "使用uuid",
              "name": "标签名称",
              "type": "SKILL/INTEREST/POSITION/FIELD/MOTTO",
              "confidence": 0.95
            }
          ]
        }
        
        注意：
        1. 所有字段必须返回，如果找不到信息则返回null
        2. confidence值范围为0-1
        3. 严格按照这个JSON格式返回，不要添加其他内容
        """;

    public ResumeAnalyzerService() {
        this.restTemplate = new RestTemplate();
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        this.apiKey = dotenv.get("DEEPSEEK_API_KEY");
    }

    public ResumeAnalysis analyzeResume(String content) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> message1 = new HashMap<>();
            message1.put("role", "system");
            message1.put("content", SYSTEM_PROMPT);

            Map<String, Object> message2 = new HashMap<>();
            message2.put("role", "user");
            message2.put("content", content);

            List<Map<String, Object>> messages = Arrays.asList(message1, message2);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "deepseek-chat");
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            String responseContent = jsonResponse.get("choices").get(0).get("message").get("content").asText();

            return objectMapper.readValue(responseContent, ResumeAnalysis.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze resume: " + e.getMessage(), e);
        }
    }

    public ResumeAnalysis analyzePdfResume(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            return analyzeResume(text);
        }
    }

    private ResumeTag createTag(String name, ResumeTag.TagType type, double confidence) {
        ResumeTag tag = new ResumeTag();
        tag.setId(UUID.randomUUID().toString());
        tag.setName(name);
        tag.setType(type);
        tag.setConfidence(confidence);
        return tag;
    }
} 
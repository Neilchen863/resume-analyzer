package com.springboot.resumeanalyzer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.resumeanalyzer.model.*;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ResumeAnalyzerService {

    @Autowired
    private OpenAiService openAiService;

    @Autowired
    private ObjectMapper objectMapper;

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
        """;

    public ResumeAnalysis analyzeResume(String content) {
        try {
            List<ChatMessage> messages = new ArrayList<>();
            messages.add(new ChatMessage("system", SYSTEM_PROMPT));
            messages.add(new ChatMessage("user", content));

            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model("gpt-4")
                    .messages(messages)
                    .temperature(0.7)
                    .build();

            String response = openAiService.createChatCompletion(request)
                    .getChoices().get(0).getMessage().getContent();

            return objectMapper.readValue(response, ResumeAnalysis.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse OpenAI response", e);
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
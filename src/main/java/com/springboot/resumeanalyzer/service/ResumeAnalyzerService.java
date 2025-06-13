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
import org.springframework.web.client.HttpClientErrorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;

@Service
public class ResumeAnalyzerService {
    private static final Logger logger = LoggerFactory.getLogger(ResumeAnalyzerService.class);

    @Autowired
    private ObjectMapper objectMapper;

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String apiUrl = "https://api.deepseek.com/v1/chat/completions";

    private static final String SYSTEM_PROMPT = """
        你是一个专业的简历分析助手，具有创新思维和深度洞察能力。请分析提供的简历内容，并提取以下信息：
        1. 个人基本信息（姓名、邮箱、电话、所在地）
        2. 技能标签：
           - 硬技能：专业技术能力、工具使用、编程语言等
           - 软技能：沟通能力、团队协作、项目管理、问题解决等
           - 潜在技能：从经历中推断出的隐含能力
           - 跨领域技能：可迁移到其他领域的能力
        3. 兴趣爱好：
           - 专业相关的兴趣
           - 个人发展方向
           - 潜在的职业发展机会
        4. 适合的职位：
           - 当前最适合的职位
           - 未来可发展的职位方向
           - 跨领域发展机会
           - 创新性职位建议
        5. 专业领域：
           - 主要专业领域
           - 相关延伸领域
           - 潜在发展领域
           - 跨学科机会
        6. 个性标签：
           - 性格特征
           - 工作风格
           - 领导潜质
           - 创新能力
           - 个人价值观
        
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
              "id": "使用uuid v4格式",
              "name": "标签名称",
              "type": "SKILL",
              "confidence": 0.95,
              "score": 8
            }
          ]
        }
        
        注意：
        1. 所有字段必须返回，如果找不到信息则返回null
        2. confidence值范围为0-1，根据信息的确定性程度评分
        3. type必须是以下值之一：SKILL, INTEREST, POSITION, FIELD, MOTTO
        4. 每个标签都必须包含id、name、type、confidence和score字段
        5. 严格按照这个JSON格式返回，不要添加其他内容
        6. 确保生成的是有效的JSON格式
        7. id必须是有效的UUID v4格式
        8. score字段是1-10的整数，表示对该项能力或特质的评分：
           - SKILL类型：根据技能熟练度、项目经验和实践深度评分
           - INTEREST类型：根据兴趣深度、持续时间和相关成果评分
           - POSITION类型：根据岗位匹配度和发展潜力评分
           - FIELD类型：根据领域专业度和研究深度评分
           - MOTTO类型：根据特质显著程度和价值观强度评分
        9. 标签类型说明：
           - SKILL: 技能和工具，包括硬技能、软技能、潜在技能和跨领域技能
           - INTEREST: 兴趣爱好，包括专业相关兴趣和个人发展方向
           - POSITION: 适合的职位，包括当前职位和未来发展方向
           - FIELD: 专业领域，包括主要领域和潜在发展领域
           - MOTTO: 个性标签，包括性格特征、工作风格和价值观
        10. 直接返回JSON，不要使用任何Markdown格式（如```json）
        11. 不要添加任何额外的说明或注释
        12. 在生成标签时，要充分发挥创造性思维：
            - 深入分析简历中的细节信息
            - 挖掘潜在的能力和特质
            - 考虑跨领域的发展可能
            - 关注未来发展趋势
            - 注意个人独特价值
        """;

    public ResumeAnalyzerService() {
        this.restTemplate = new RestTemplate();
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String rawApiKey = dotenv.get("DEEPSEEK_API_KEY");
        // Ensure API key starts with sk-
        this.apiKey = rawApiKey != null && !rawApiKey.startsWith("sk-") ? "sk-" + rawApiKey : rawApiKey;
    }

    public ResumeAnalysis analyzeResume(String content) {
        if (content == null || content.trim().isEmpty()) {
            logger.error("Content is null or empty");
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        try {
            logger.info("Starting resume analysis with content length: {}", content.length());
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
            
            logger.info("Sending request to DeepSeek API");
            try {
                ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
                );

                logger.info("Received response from DeepSeek API: {}", response.getStatusCode());
                
                if (response.getStatusCode() == HttpStatus.OK) {
                    String responseBody = response.getBody();
                    logger.debug("Raw API Response: {}", responseBody);
                    
                    if (responseBody == null || responseBody.trim().isEmpty()) {
                        logger.error("API returned empty response");
                        throw new RuntimeException("API returned empty response");
                    }
                    
                    JsonNode jsonResponse = objectMapper.readTree(responseBody);
                    logger.debug("Parsed JSON response: {}", jsonResponse);
                    
                    if (jsonResponse.has("error")) {
                        String errorMessage = jsonResponse.get("error").get("message").asText();
                        logger.error("API returned error: {}", errorMessage);
                        throw new RuntimeException("API Error: " + errorMessage);
                    }
                    
                    if (!jsonResponse.has("choices") || !jsonResponse.get("choices").isArray() || 
                        jsonResponse.get("choices").size() == 0 || 
                        !jsonResponse.get("choices").get(0).has("message") ||
                        !jsonResponse.get("choices").get(0).get("message").has("content")) {
                        logger.error("Invalid API response format: {}", jsonResponse);
                        throw new RuntimeException("Invalid API response format");
                    }
                    
                    String responseContent = jsonResponse.get("choices").get(0).get("message").get("content").asText();
                    logger.debug("Raw API Response content: {}", responseContent);
                    
                    // Clean up the response content by removing markdown code block markers
                    responseContent = cleanupJsonResponse(responseContent);
                    logger.debug("Cleaned API Response content: {}", responseContent);
                    
                    try {
                        ResumeAnalysis analysis = objectMapper.readValue(responseContent, ResumeAnalysis.class);
                        // Validate the analysis object
                        if (analysis == null) {
                            logger.error("Failed to parse response content as ResumeAnalysis: null result");
                            throw new RuntimeException("Failed to parse API response: null result");
                        }
                        if (analysis.getPersonalInfo() == null) {
                            logger.error("API response missing personalInfo");
                            throw new RuntimeException("API response missing personalInfo");
                        }
                        if (analysis.getTags() == null) {
                            logger.error("API response missing tags");
                            throw new RuntimeException("API response missing tags");
                        }
                        
                        logger.info("Successfully parsed resume analysis: {}", analysis);
                        return analysis;
                    } catch (JsonProcessingException e) {
                        logger.error("Failed to parse API response content as ResumeAnalysis: {}\nResponse content: {}", 
                                   e.getMessage(), responseContent, e);
                        throw new RuntimeException("Failed to parse API response: " + e.getMessage());
                    }
                } else {
                    logger.error("API returned non-OK status: {}", response.getStatusCode());
                    throw new RuntimeException("API returned non-OK status: " + response.getStatusCode());
                }
            } catch (HttpClientErrorException e) {
                String errorBody = e.getResponseBodyAsString();
                logger.error("HTTP Client error: {} - {}", e.getStatusCode(), errorBody);
                try {
                    JsonNode errorJson = objectMapper.readTree(errorBody);
                    if (errorJson.has("error") && errorJson.get("error").has("message")) {
                        String errorMessage = errorJson.get("error").get("message").asText();
                        logger.error("API Error message: {}", errorMessage);
                        throw new RuntimeException("API Error: " + errorMessage);
                    }
                } catch (JsonProcessingException ex) {
                    logger.error("Failed to parse error response: {}", errorBody, ex);
                }
                throw new RuntimeException("API Error: " + errorBody);
            }
        } catch (Exception e) {
            logger.error("Failed to analyze resume", e);
            throw new RuntimeException("Failed to analyze resume: " + e.getMessage(), e);
        }
    }

    public ResumeAnalysis analyzePdfResume(MultipartFile file) throws IOException {
        if (file == null) {
            logger.error("File is null");
            throw new IllegalArgumentException("File cannot be null");
        }

        if (file.isEmpty()) {
            logger.error("File is empty");
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (!file.getContentType().equals("application/pdf")) {
            logger.error("Invalid file type: {}", file.getContentType());
            throw new IllegalArgumentException("Only PDF files are supported");
        }

        logger.info("Starting PDF resume analysis for file: {}, size: {} bytes", 
                   file.getOriginalFilename(), file.getSize());
        
        PDDocument document = null;
        try {
            document = PDDocument.load(file.getInputStream());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            
            if (text == null || text.trim().isEmpty()) {
                logger.error("Extracted text is empty");
                throw new IllegalArgumentException("Could not extract text from PDF");
            }
            
            logger.info("Successfully extracted {} characters from PDF", text.length());
            logger.debug("Extracted text: {}", text);
            
            return analyzeResume(text);
        } catch (IOException e) {
            logger.error("Failed to process PDF file: {}", e.getMessage(), e);
            throw new IOException("Failed to process PDF file: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error processing PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Unexpected error processing PDF: " + e.getMessage(), e);
        } finally {
            if (document != null) {
                try {
                    document.close();
                } catch (IOException e) {
                    logger.warn("Failed to close PDF document", e);
                }
            }
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

    private String cleanupJsonResponse(String content) {
        if (content == null || content.trim().isEmpty()) {
            return content;
        }
        
        // Remove markdown code block markers and any language specifier
        content = content.replaceAll("```\\w*\\s*", "").replaceAll("```\\s*$", "");
        
        // Trim any leading/trailing whitespace
        content = content.trim();
        
        logger.debug("Cleaned content: {}", content);
        return content;
    }
} 
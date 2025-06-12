package com.springboot.resumeanalyzer.config;

import com.theokanning.openai.service.OpenAiService;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAIConfig {

    @Bean
    public OpenAiService openAiService() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String openaiApiKey = dotenv.get("OPENAI_API_KEY");
        return new OpenAiService(openaiApiKey);
    }
} 
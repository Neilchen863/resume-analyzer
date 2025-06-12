package com.springboot.resumeanalyzer.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.regex.Pattern;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {
    private static final Logger logger = LoggerFactory.getLogger(CorsFilter.class);
    private static final Pattern VERCEL_PATTERN = Pattern.compile("^https://resume-analyzer[-.a-zA-Z0-9]*.vercel.app$");
    private static final String LOCAL_ORIGIN = "http://localhost:5173";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;
        
        String origin = request.getHeader("Origin");
        logger.debug("Received request from origin: {}", origin);

        // Check if origin is allowed
        if (isAllowedOrigin(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
            response.setHeader("Access-Control-Max-Age", "3600");
            response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, remember-me");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            logger.debug("CORS headers set for allowed origin: {}", origin);
        } else {
            logger.warn("Rejected request from unauthorized origin: {}", origin);
        }

        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }

    private boolean isAllowedOrigin(String origin) {
        if (origin == null) {
            return false;
        }
        
        // Allow localhost for development
        if (LOCAL_ORIGIN.equals(origin)) {
            return true;
        }
        
        // Allow any Vercel deployment URL for your app
        return VERCEL_PATTERN.matcher(origin).matches();
    }

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
} 
# Resume Analyzer

A Spring Boot application that analyzes resumes using OpenAI's GPT-4 API. This application can extract key information from resumes including personal information, skills, interests, suitable positions, professional fields, and personality tags.

## Features

- PDF resume parsing
- Text resume analysis
- Structured JSON output
- Integration with OpenAI GPT-4
- RESTful API endpoints

## Tech Stack

- Java 17
- Spring Boot
- OpenAI API
- PDFBox for PDF processing
- Jackson for JSON processing

## Prerequisites

- Java 17 or higher
- Maven
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/resume-analyzer.git
cd resume-analyzer
```

2. Create `application.properties` in `src/main/resources/` and add your OpenAI API key:
```properties
openai.api.key=your-api-key-here
```

3. Build the project:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

## Usage

The application provides REST endpoints for analyzing resumes. You can send either PDF files or plain text content.

### API Endpoints

- `POST /api/analyze/text` - Analyze resume text
- `POST /api/analyze/pdf` - Analyze PDF resume

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
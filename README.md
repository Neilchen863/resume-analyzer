# Resume Analyzer

一个基于 AI 的简历分析工具，可以自动提取简历中的关键信息并进行智能分析。

## 功能特点

- 支持 PDF 文件上传和文本输入
- 自动提取个人信息（姓名、邮箱、电话、地址）
- 识别专业技能和工具
- 分析兴趣爱好
- 推荐适合的职位
- 识别专业领域
- 生成个性标签

## 技术栈

### 后端
- Spring Boot 3.2.3
- Java 17
- Apache PDFBox (PDF 文本提取)
- DeepSeek AI API (文本分析)

### 前端
- React
- TypeScript
- Material-UI (MUI)
- Axios

## 快速开始

### 环境要求
- Java 17 或更高版本
- Node.js 16 或更高版本
- Maven 3.6 或更高版本

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd resume-analyzer
```

2. 配置环境变量
```bash
# Linux/macOS
export DEEPSEEK_API_KEY=your-api-key

# Windows
set DEEPSEEK_API_KEY=your-api-key
```

3. 启动后端服务
```bash
./mvnw spring-boot:run
```

4. 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

5. 访问应用
打开浏览器访问 http://localhost:5173

## 项目结构

```
resume-analyzer/
├── frontend/                # 前端项目目录
│   ├── src/
│   │   ├── components/     # React 组件
│   │   │   ├── ResumeUploader.tsx    # 文件上传组件
│   │   │   └── ResumeResult.tsx      # 结果展示组件
│   │   ├── types/         # TypeScript 类型定义
│   │   └── App.tsx        # 主应用组件
│   ├── public/            # 静态资源
│   └── package.json       # 前端依赖配置
│
├── src/                    # 后端项目目录
│   └── main/
│       ├── java/          # Java 源代码
│       │   └── com/resumeanalyzer/
│       │       ├── controller/    # API 控制器
│       │       ├── service/       # 业务逻辑
│       │       ├── model/         # 数据模型
│       │       └── config/        # 配置类
│       └── resources/
│           └── application.properties  # 应用配置
│
├── pom.xml                 # Maven 项目配置
└── README.md              # 项目文档
```

### 主要功能模块

1. 文件处理模块
   - PDF 文件上传和解析
   - 文本内容提取
   - 文件格式验证

2. AI 分析模块
   - 个人信息提取
   - 技能标签识别
   - 职位匹配分析
   - 兴趣爱好识别

3. 结果展示模块
   - 个人信息卡片
   - 标签分类展示
   - 评分系统
   - 导出功能（JSON/PDF）

## 使用说明

1. 上传简历
   - 支持 PDF 格式
   - 文件大小限制：10MB

2. 或直接输入文本
   - 将简历文本复制粘贴到文本框中
   - 点击"分析文本内容"按钮

3. 查看分析结果
   - 个人基本信息
   - 技能标签
   - 兴趣爱好
   - 职位推荐
   - 专业领域
   - 个性标签

## API 文档

### 1. 上传 PDF 文件
```
POST /api/resume/upload
Content-Type: multipart/form-data

参数：
- file: PDF文件

返回：
{
  "success": true,
  "data": {
    "personalInfo": {
      "name": "姓名",
      "email": "邮箱",
      "phone": "电话",
      "location": "地址"
    },
    "tags": [
      {
        "id": "uuid",
        "name": "标签名称",
        "type": "SKILL|INTEREST|POSITION|FIELD|MOTTO",
        "confidence": 0.95
      }
    ]
  }
}
```

### 2. 分析文本内容
```
POST /api/resume/analyze
Content-Type: application/json

请求体：
{
  "content": "简历文本内容"
}

返回：
与上传 PDF 接口相同
```

## 错误处理

- 文件格式错误：仅支持 PDF 文件
- 文件大小超限：最大支持 10MB
- 文本为空：内容不能为空
- API 错误：包含具体的错误信息

## 配置说明

### 后端配置 (application.properties)
```properties
spring.application.name=resume-analyzer
server.port=8081
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### 前端配置
- API 地址：默认为 `http://localhost:8081`
- 开发服务器端口：5173

## 开发说明

### 后端开发
1. 代码结构
   - `controller`: API 接口控制器
   - `service`: 业务逻辑层
   - `model`: 数据模型
   - `config`: 配置类

2. 主要类说明
   - `ResumeController`: 处理文件上传和文本分析请求
   - `ResumeAnalyzerService`: 实现简历分析逻辑
   - `ResumeAnalysis`: 分析结果数据模型

### 前端开发
1. 代码结构
   - `src/components`: React 组件
   - `src/types`: TypeScript 类型定义
   - `src/App.tsx`: 主应用组件

2. 主要组件
   - `ResumeUploader`: 文件上传和文本输入组件
   - `ResumeResult`: 分析结果展示组件

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE) 
# AI Prompts Documentation

This document contains all AI prompts used in the AI Incident Copilot project, including system prompts, user prompt examples, and the reasoning behind prompt design choices.

## 🤖 System Prompt

### Primary System Prompt
```
You are an AI incident assistant that summarizes server issues and suggests fixes.
Format your response in the following structure:
CATEGORY: [Infrastructure/Application/Network/Security/Database]
SEVERITY: [High/Medium/Low]
SUMMARY: [Brief description]
ANALYSIS: [Detailed analysis]
SOLUTION: [Step-by-step fix]
```

**Purpose**: This prompt establishes the AI's role as an incident response specialist and enforces a structured output format that makes responses easily parseable and actionable for IT professionals.

**Key Design Decisions**:
- **Role Definition**: Clearly defines the AI as an "incident assistant" to focus responses on IT troubleshooting
- **Structured Output**: Enforces consistent formatting for easy parsing by the frontend
- **Category Classification**: Helps categorize incidents for better organization
- **Severity Assessment**: Enables prioritization of incidents
- **Step-by-step Solutions**: Ensures actionable, implementable fixes

## 📝 User Prompt Examples

### Example 1: Server Downtime
```
"Server is down, HTTP 500 errors, logs attached."
```

### Example 2: Database Issues
```
"Database connection timeouts occurring every 5 minutes. Application shows 'Connection pool exhausted' errors. MySQL server running on port 3306."
```

### Example 3: Network Problems
```
"Users reporting slow response times. Network latency increased from 50ms to 500ms. All services affected across multiple regions."
```

### Example 4: Security Incident
```
"Unauthorized access attempts detected. Multiple failed login attempts from IP 192.168.1.100. Security logs show brute force attack pattern."
```

### Example 5: Application Errors
```
"JavaScript errors in production. Console shows 'TypeError: Cannot read property of undefined'. Affecting user registration flow."
```

## 🎯 Prompt Engineering Strategies

### 1. Structured Response Format
**Strategy**: Enforce consistent output structure
**Implementation**: Use specific keywords (CATEGORY, SEVERITY, etc.) to ensure parseable responses
**Benefit**: Enables automated parsing and display formatting in the frontend

### 2. Context-Aware Categorization
**Strategy**: Guide AI to classify incidents into standard IT categories
**Implementation**: Provide predefined categories (Infrastructure, Application, Network, Security, Database)
**Benefit**: Helps IT teams quickly identify the type of issue and route to appropriate specialists

### 3. Severity Assessment
**Strategy**: Encourage consistent severity rating
**Implementation**: Use standard severity levels (High, Medium, Low)
**Benefit**: Enables proper incident prioritization and resource allocation

### 4. Actionable Solutions
**Strategy**: Request step-by-step, implementable solutions
**Implementation**: Explicitly ask for "step-by-step fix" in the prompt
**Benefit**: Provides clear, actionable guidance for incident resolution

## 🔧 Technical Implementation

### Model Configuration
- **Model**: Cloudflare Workers AI - Llama 3.3 8B Instruct
- **Max Tokens**: 1024 (optimized for structured responses)
- **Temperature**: Default (balanced creativity and consistency)

### Prompt Processing Flow
1. **User Input**: Raw incident description from user
2. **Context Building**: Previous conversation history added
3. **System Prompt**: Applied to establish role and format
4. **AI Processing**: Model generates structured response
5. **Response Parsing**: Frontend extracts structured components

### Error Handling Prompts
When AI processing fails, the system uses fallback responses:
```
"AI error: [error message]"
```

## 📊 Expected Output Format

### Successful Response Structure
```
CATEGORY: Application
SEVERITY: High
SUMMARY: Database connection pool exhaustion causing application failures
ANALYSIS: The application is experiencing intermittent failures due to database connection pool being exhausted. This typically occurs when connections are not properly released or when the pool size is insufficient for the current load.
SOLUTION: 
1. Check current connection pool configuration
2. Monitor active connections in database
3. Review application code for connection leaks
4. Consider increasing pool size if needed
5. Implement connection timeout settings
```

### Response Validation
The frontend validates responses by checking for:
- Presence of required sections (CATEGORY, SEVERITY, SUMMARY, ANALYSIS, SOLUTION)
- Valid severity levels (High, Medium, Low)
- Non-empty content in each section

## 🚀 Prompt Optimization

### Performance Considerations
- **Token Efficiency**: System prompt optimized for minimal token usage while maintaining clarity
- **Response Length**: 1024 token limit ensures concise but comprehensive responses
- **Parsing Speed**: Structured format enables fast frontend parsing

### Future Enhancements
- **Dynamic Prompts**: Context-aware prompts based on incident type
- **Multi-language Support**: Localized prompts for different regions
- **Custom Categories**: User-defined incident categories
- **Learning Prompts**: Prompts that adapt based on successful resolutions

## 📚 Prompt Testing

### Test Cases
1. **Simple Issues**: "Server down" → Should return structured response
2. **Complex Issues**: Multi-service failures → Should provide comprehensive analysis
3. **Ambiguous Issues**: Vague descriptions → Should ask for clarification
4. **Security Issues**: Should prioritize security implications
5. **Performance Issues**: Should focus on optimization strategies

### Quality Metrics
- **Response Completeness**: All required sections present
- **Actionability**: Solutions are implementable
- **Accuracy**: Severity assessment matches issue complexity
- **Clarity**: Analysis is understandable to IT professionals

## 🔍 Debugging Prompts

### Development Testing
```
"Test prompt: Verify system is working correctly"
```

### Error Simulation
```
"Simulate a database connection error for testing purposes"
```

### Performance Testing
```
"Generate a complex multi-service incident scenario for load testing"
```

---

**Note**: All prompts are designed to work with Cloudflare Workers AI and are optimized for the Llama 3.3 8B Instruct model. Prompts may need adjustment if using different AI models or platforms.

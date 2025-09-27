# AI Incident Copilot 🤖

A powerful AI-powered incident response assistant built with Cloudflare Workers, Durable Objects, and Workers AI. This application helps IT teams quickly diagnose and resolve server incidents through intelligent conversation and structured analysis.

## 🌐 Live Demo

**🔗 [https://incident-copilot.vercel.app/](https://incident-copilot.vercel.app/)**

## ✨ Features

- **AI-Powered Analysis**: Uses Cloudflare's Llama 3.3 8B model for intelligent incident analysis
- **Structured Responses**: Provides categorized, severity-rated incident reports with step-by-step solutions
- **Conversation Memory**: Persistent chat history using Cloudflare Durable Objects
- **Modern UI**: Clean, responsive interface with dark theme optimized for IT professionals
- **Real-time Processing**: Fast response times with Cloudflare's global edge network
- **CORS Support**: Ready for integration with other applications

## 🏗️ Architecture

### Backend (Cloudflare Workers)
- **Worker**: Main API endpoint handling HTTP requests
- **Durable Objects**: Persistent storage for conversation history
- **Workers AI**: Integration with Llama 3.3 8B model for incident analysis

### Frontend
- **Vanilla JavaScript**: No framework dependencies for maximum performance
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Dynamic conversation rendering with loading states

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Cloudflare account with Workers AI enabled
- Wrangler CLI installed globally

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cf_ai_incident_copilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Cloudflare**
   ```bash
   # Login to Cloudflare
   wrangler login
   
   # Deploy the worker
   wrangler deploy
   ```

4. **Update Frontend Configuration**
   - Edit `src/Frontend/index.js`
   - Update the `WORKER_URL` constant with your deployed worker URL

5. **Deploy Frontend**
   - Deploy the `src/Frontend/` directory to Vercel, Netlify, or any static hosting service

## 📁 Project Structure

```
cf_ai_incident_copilot/
├── src/
│   ├── worker/
│   │   └── index.js          # Main Cloudflare Worker
│   ├── durable/
│   │   └── chatMemory.js     # Durable Object for conversation storage
│   └── Frontend/
│       ├── index.html        # Main HTML file
│       ├── index.js          # Frontend JavaScript
│       └── style.css         # Styling
├── wrangler.toml             # Cloudflare Worker configuration
├── package.json              # Node.js dependencies
└── PROMPTS.md               # AI prompt templates
```

## 🔧 Configuration

### Cloudflare Worker Configuration (`wrangler.toml`)

```toml
name = "cf_ai_incident_copilot"
main = "src/worker/index.js"
compatibility_date = "2025-09-24"

[ai]
binding = "AI"
remote = true

[durable_objects]
bindings = [
  { name = "CHAT_MEMORY", class_name = "ChatMemory" }
]

[[migrations]]
tag = "init-chat-memory"
new_sqlite_classes = ["ChatMemory"]
```

### AI Model Configuration

The application uses Cloudflare's Llama 3.3 8B model with the following system prompt:

```
You are an AI incident assistant that summarizes server issues and suggests fixes.
Format your response in the following structure:
CATEGORY: [Infrastructure/Application/Network/Security/Database]
SEVERITY: [High/Medium/Low]
SUMMARY: [Brief description]
ANALYSIS: [Detailed analysis]
SOLUTION: [Step-by-step fix]
```

## 🎯 Usage

### For IT Professionals

1. **Describe the Incident**: Provide specific details about the issue
2. **Include Error Messages**: Share relevant logs or error codes
3. **Get Structured Analysis**: Receive categorized incident reports
4. **Follow Solutions**: Get step-by-step resolution instructions

### Example Incident Report

```
CATEGORY: Infrastructure
SEVERITY: High
SUMMARY: Database connection timeout causing application failures
ANALYSIS: The application is experiencing intermittent database connection timeouts...
SOLUTION: 
1. Check database server resources
2. Verify network connectivity
3. Review connection pool settings
4. Monitor for recurring patterns
```

## 🔌 API Reference

### POST `/`

Send a message to the AI incident copilot.

**Request Body:**
```json
{
  "message": "Server is down, HTTP 500 errors, logs attached."
}
```

**Response:**
```json
{
  "reply": "CATEGORY: Application\nSEVERITY: High\n...",
  "conversation": [
    {
      "sender": "user",
      "text": "Server is down, HTTP 500 errors, logs attached."
    },
    {
      "sender": "ai", 
      "text": "CATEGORY: Application\nSEVERITY: High\n..."
    }
  ]
}
```

## 🛠️ Development

### Local Development

1. **Start Wrangler Dev Server**
   ```bash
   wrangler dev
   ```

2. **Update Frontend URL**
   - Change `WORKER_URL` in `src/Frontend/index.js` to `http://localhost:8787`

3. **Test Locally**
   - Open `src/Frontend/index.html` in your browser
   - Test the incident analysis functionality

### Adding New Features

1. **Backend Changes**: Modify `src/worker/index.js`
2. **Storage Changes**: Update `src/durable/chatMemory.js`
3. **Frontend Changes**: Edit files in `src/Frontend/`
4. **Deploy**: Use `wrangler deploy` for backend, redeploy frontend

## 🚀 Deployment

### Cloudflare Workers
```bash
wrangler deploy
```

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd src/Frontend
vercel --prod
```

### Frontend (Netlify)
```bash
# Build and deploy
npm run build
# Upload dist/ folder to Netlify
```

## 🔒 Security Considerations

- **CORS Headers**: Configured for cross-origin requests
- **Input Sanitization**: HTML escaping implemented in frontend
- **Rate Limiting**: Consider implementing rate limiting for production use
- **Authentication**: Add authentication layer for sensitive environments

## 📊 Performance

- **Global Edge Network**: Leverages Cloudflare's 200+ data centers
- **Durable Objects**: Efficient state management with SQLite storage
- **Optimized AI**: Uses quantized Llama 3.3 8B for fast inference
- **Minimal Dependencies**: Lightweight frontend with no framework overhead

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cloudflare Workers**: Serverless compute platform
- **Workers AI**: AI inference at the edge
- **Llama 3.3**: Meta's open-source language model
- **Vercel**: Frontend hosting platform

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Built with ❤️ using Cloudflare Workers and Workers AI**

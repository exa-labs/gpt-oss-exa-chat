# 💬 Exa & GPT-OSS Chat App
### Powered by [Exa](https://exa.ai) - The Web Search API & OpenAI's GPT-OSS-120B

App Link: https://demo.exa.ai/gpt-oss-chat

![Screenshot](https://demo.exa.ai/gpt-oss-chat/opengraph-image.jpg)

<br>

## 🎯 What is Exa & GPT-OSS Chat App?

Exa & GPT-OSS Chat App is a free and open-source chat application that combines Exa's powerful web search API with **OpenAI's GPT-OSS-120B** - the open-source language model from OpenAI, hosted on Together AI.

This app provides a modern chat experience with real-time web search capabilities, featuring a clean UI with collapsible "thinking" sections that show the model's reasoning process before delivering the final answer.

<br>

## 💻 Tech Stack
- **Language Model**: [OpenAI GPT-OSS-120B](https://openai.com/index/introducing-gpt-oss/) - Open source model hosted on Together AI
- **Search Engine API**: [Exa API](https://exa.ai) - Web search API designed for LLMs
- **Frontend**: [Next.js 14](https://nextjs.org/docs) with App Router, [TailwindCSS](https://tailwindcss.com), TypeScript
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/docs/ai-sdk-core) with Together AI provider
- **Hosting**: [Vercel](https://vercel.com/)

<br>

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Together AI API key (for GPT-OSS-120B)
- Exa API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/gpt-oss-chat.git
cd gpt-oss-chat
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
TOGETHER_AI_API_KEY=your_together_ai_api_key_here
EXA_API_KEY=your_exa_api_key_here
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

<br>

## 🔑 API Keys & Environment Setup

### Required API Keys

#### Together AI API Key (for GPT-OSS-120B)
- **Get your key**: [Together AI API Keys](https://api.together.ai/settings/api-keys)
- **What it's for**: Access to OpenAI's GPT-OSS-120B model hosted on Together AI
- **Environment variable**: `TOGETHER_AI_API_KEY`

#### Exa API Key  
- **Get your key**: [Exa Dashboard](https://dashboard.exa.ai/api-keys)
- **What it's for**: Real-time web search capabilities
- **Environment variable**: `EXA_API_KEY`

### Environment Variables
```env
# Together AI - for GPT-OSS-120B model
TOGETHER_AI_API_KEY=your_together_ai_api_key_here

# Exa - for web search
EXA_API_KEY=your_exa_api_key_here
```

<br>

## ⭐ About [Exa](https://exa.ai)

This project is powered by [Exa.ai](https://exa.ai), a web search API designed specifically for AI applications. Exa provides:

- **AI-Optimized Search**: Search results relevant for language model consumption
- **Real-time Information**: Current web data to enhance AI responses
- **Easy Integration**: Simple API designed for AI workflows

[Try Exa API](https://dashboard.exa.ai)

<br>

## 🛠️ Project Structure

```
gpt-oss-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint with Exa integration
│   ├── components/
│   │   └── messages.tsx          # Markdown message rendering
│   ├── fonts/                    # Custom font files
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main chat interface
├── package.json
└── README.md
```

<br>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

<br>

---

Built with ❤️ by Exa

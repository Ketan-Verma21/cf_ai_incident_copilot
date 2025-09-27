import { ChatMemory } from "../durable/chatMemory.js";

export { ChatMemory };

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      // Handle CORS preflight
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return new Response("Send a POST request with { message }", {
        headers: { ...CORS_HEADERS, "Content-Type": "text/plain" },
      });
    }

    // Read the message from the request
    const { message } = await request.json();

    // Send message to Durable Object
    const id = env.CHAT_MEMORY.idFromName("global");
    const stub = env.CHAT_MEMORY.get(id);

    const doRequest = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({ message }),
    });

    const memoryResponse = await stub.fetch(doRequest);
    const memoryData = await memoryResponse.json(); // { pastMessages: [...] }

    // Construct conversation array
    const conversation = memoryData.pastMessages.map((msg, i) => ({
      sender: i % 2 === 0 ? "user" : "ai",
      text: msg,
    }));

    // Prepare messages for AI model (OpenAI/Anthropic style)
    const aiMessages = conversation.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));
    aiMessages.push({ role: "user", content: message });

    // Call Workers AI (Llama 3.3 or similar)
    let reply = "";
    try {
      const aiResult = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages: [
          {
            role: "system",
            content: `You are an AI incident assistant that summarizes server issues and suggests fixes.
            Format your response in the following structure:
            CATEGORY: [Infrastructure/Application/Network/Security/Database]
            SEVERITY: [High/Medium/Low]
            SUMMARY: [Brief description]
            ANALYSIS: [Detailed analysis]
            SOLUTION: [Step-by-step fix]`,
          },
          ...aiMessages,
        ],
        max_tokens: 1024,
      });
      reply = aiResult.response || aiResult.result || "AI did not return a response.";
    } catch (e) {
      reply = "AI error: " + e.message;
    }

    // Add AI reply to conversation for frontend
    const updatedConversation = [...conversation, { sender: "ai", text: reply }];

    return new Response(
      JSON.stringify({ reply, conversation: updatedConversation }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  },
};

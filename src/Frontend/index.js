const chatDiv = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const historyList = document.getElementById("history-list");
const chatPlaceholder = document.getElementById("chat-placeholder");

const WORKER_URL = "https://cf_ai_incident_copilot.try-vrmketan.workers.dev"; // Cloudflare deployed URL

let conversation = [];
let history = [];

// Simple Markdown renderer for bold, italics, lists, and line breaks
function renderMarkdown(text) {
  return text
    .replace(/(?:\r\n|\r|\n)/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
    .replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>');
}

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  sidebar.classList.toggle("expanded");
});

function updateHistory() {
  historyList.innerHTML = "";
  history.slice(-10).reverse().forEach((item, idx) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.title = "Click to reuse";
    li.onclick = () => {
      messageInput.value = item;
      messageInput.focus();
    };
    historyList.appendChild(li);
  });
}

function renderConversation(messages) {
  chatDiv.innerHTML = ""; // Clear chat
  if (messages.length === 0) {
    chatPlaceholder.style.display = "flex";
  } else {
    chatPlaceholder.style.display = "none";
  }
  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className = msg.sender === "user" ? "user" : "ai";
    const bubble = document.createElement("span");
    bubble.innerHTML =
      msg.sender === "user"
        ? `<strong>You:</strong> ${msg.text}`
        : `<strong>AI:</strong> ${renderMarkdown(msg.text)}`;
    // Timestamp
    if (msg.timestamp) {
      const ts = document.createElement("div");
      ts.className = "timestamp";
      ts.textContent = new Date(msg.timestamp).toLocaleTimeString();
      bubble.appendChild(ts);
    }
    div.appendChild(bubble);
    chatDiv.appendChild(div);
  });
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

function showLoading() {
  const div = document.createElement("div");
  div.className = "ai";
  const bubble = document.createElement("span");
  bubble.innerHTML = `<strong>AI:</strong>
    <span class="thinking-dots">
      <span></span><span></span><span></span>
    </span>`;
  div.appendChild(bubble);
  chatDiv.appendChild(div);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Optimistically add user message
  const userMsg = {
    sender: "user",
    text: message,
    timestamp: Date.now(),
  };
  conversation.push(userMsg);
  renderConversation(conversation);
  showLoading();

  // Add to history
  history.push(message);
  updateHistory();

  messageInput.value = "";
  messageInput.disabled = true;
  sendBtn.disabled = true;

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    // Update conversation with server response
    conversation = (data.conversation || []).map((msg) => ({
      ...msg,
      timestamp: msg.timestamp || Date.now(),
    }));
    renderConversation(conversation);
  } catch (err) {
    console.error(err);
    alert("Error communicating with AI Worker");
  } finally {
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Initial render
renderConversation(conversation);
updateHistory();

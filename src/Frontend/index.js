const chatDiv = document.getElementById("chat")
const messageInput = document.getElementById("message")
const sendBtn = document.getElementById("send")
const sidebar = document.getElementById("sidebar")
const sidebarToggle = document.getElementById("sidebar-toggle")
const historyList = document.getElementById("history-list")
const chatPlaceholder = document.getElementById("chat-placeholder")

const WORKER_URL = "https://cf_ai_incident_copilot.try-vrmketan.workers.dev" // Cloudflare deployed URL

let conversation = []
const history = []

// Safer HTML escape used by renderers
function escapeHtml(str) {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

// Upgrade Markdown: sanitize, wrap lists, and add paragraphs
function renderMarkdown(text) {
  const safe = escapeHtml(text || "")

  // Normalize newlines first
  let html = safe.replace(/(?:\r\n|\r|\n)/g, "\n")

  // Basic markdown
  html = html
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>")
    .replace(/^\s*\d+\.\s+(.*)$/gm, "<li>$1</li>")

  // Wrap consecutive <li> blocks with a <ul>
  html = html.replace(/(?:<li>[\s\S]*?<\/li>\s*)+/g, (m) => `<ul>${m}</ul>`)

  // Turn remaining blocks into paragraphs, preserve single line breaks
  html = html
    .split(/\n{2,}/)
    .map((block) => (block.trim().startsWith("<ul>") ? block : `<p>${block.replace(/\n/g, "<br>")}</p>`))
    .join("")

  return html
}

// Parse the AI's structured format into sections
function parseStructuredResponse(text) {
  if (!text) return null
  const normalized = text.replace(/\r\n|\r/g, "\n")

  // Helper to extract a section until the next known label or end
  const get = (label) => {
    const re = new RegExp(
      `${label}\\s*:\\s*([\\s\\S]*?)(?=\\n(?:CATEGORY|SEVERITY|SUMMARY|ANALYSIS|SOLUTION)\\s*:|$)`,
      "i",
    )
    const m = normalized.match(re)
    return m ? m[1].trim() : ""
  }

  const category = get("CATEGORY")
  const severity = get("SEVERITY")
  const summary = get("SUMMARY")
  const analysis = get("ANALYSIS")
  const solution = get("SOLUTION")

  // Consider it parsed if we have at least category or summary
  if (!category && !summary) return null

  return { category, severity, summary, analysis, solution }
}

// Map severity text to a style class
function severityClass(sevRaw) {
  const sev = (sevRaw || "").toLowerCase()
  if (sev.includes("high") || sev.includes("p1") || sev.includes("critical")) return "high"
  if (sev.includes("medium") || sev.includes("moderate") || sev.includes("p2")) return "medium"
  if (sev.includes("low") || sev.includes("minor") || sev.includes("p3")) return "low"
  return "" // default
}

// Render a nice card for the structured response
function renderStructured(structured) {
  const { category, severity, summary, analysis, solution } = structured
  const sevCls = severityClass(severity)

  return `
    <div class="ai-card" role="region" aria-label="AI Incident Analysis">
      <div class="ai-meta">
        ${category ? `<span class="badge" aria-label="Category">${escapeHtml(category)}</span>` : ""}
        ${severity ? `<span class="severity ${sevCls}" aria-label="Severity">${escapeHtml(severity)}</span>` : ""}
      </div>

      ${summary ? `<h3>Summary</h3>${renderMarkdown(summary)}` : ""}

      ${analysis ? `<h3>Analysis</h3>${renderMarkdown(analysis)}` : ""}

      ${solution ? `<h3>Solution</h3>${renderMarkdown(solution)}` : ""}
    </div>
  `
}

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed")
  sidebar.classList.toggle("expanded")
})

function updateHistory() {
  historyList.innerHTML = ""
  history
    .slice(-10)
    .reverse()
    .forEach((item, idx) => {
      const li = document.createElement("li")
      li.textContent = item
      li.title = "Click to reuse"
      li.onclick = () => {
        messageInput.value = item
        messageInput.focus()
      }
      historyList.appendChild(li)
    })
}

function renderConversation(messages) {
  chatDiv.innerHTML = "" // Clear chat
  if (messages.length === 0) {
    chatPlaceholder.style.display = "flex"
  } else {
    chatPlaceholder.style.display = "none"
  }
  messages.forEach((msg) => {
    const div = document.createElement("div")
    div.className = msg.sender === "user" ? "user" : "ai"
    const bubble = document.createElement("span")

    if (msg.sender === "user") {
      bubble.innerHTML = `<strong>You:</strong> ${escapeHtml(msg.text).replace(/\n/g, "<br>")}`
    } else {
      const structured = parseStructuredResponse(msg.text)
      bubble.innerHTML = structured
        ? `<strong>AI:</strong> ${renderStructured(structured)}`
        : `<strong>AI:</strong> ${renderMarkdown(msg.text)}`
    }

    // Timestamp
    if (msg.timestamp) {
      const ts = document.createElement("div")
      ts.className = "timestamp"
      ts.textContent = new Date(msg.timestamp).toLocaleTimeString()
      bubble.appendChild(ts)
    }
    div.appendChild(bubble)
    chatDiv.appendChild(div)
  })
  chatDiv.scrollTop = chatDiv.scrollHeight
}

function showLoading() {
  const div = document.createElement("div")
  div.className = "ai"
  const bubble = document.createElement("span")
  bubble.innerHTML = `<strong>AI:</strong>
    <span class="thinking-dots">
      <span></span><span></span><span></span>
    </span>`
  div.appendChild(bubble)
  chatDiv.appendChild(div)
  chatDiv.scrollTop = chatDiv.scrollHeight
}

async function sendMessage() {
  const message = messageInput.value.trim()
  if (!message) return

  // Optimistically add user message
  const userMsg = {
    sender: "user",
    text: message,
    timestamp: Date.now(),
  }
  conversation.push(userMsg)
  renderConversation(conversation)
  showLoading()

  // Add to history
  history.push(message)
  updateHistory()

  messageInput.value = ""
  messageInput.disabled = true
  sendBtn.disabled = true

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })

    const data = await res.json()

    // Update conversation with server response
    conversation = (data.conversation || []).map((msg) => ({
      ...msg,
      timestamp: msg.timestamp || Date.now(),
    }))
    renderConversation(conversation)
  } catch (err) {
    console.error(err)
    alert("Error communicating with AI Worker")
  } finally {
    messageInput.disabled = false
    sendBtn.disabled = false
    messageInput.focus()
  }
}

sendBtn.addEventListener("click", sendMessage)
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage()
})

// Initial render
renderConversation(conversation)
updateHistory()

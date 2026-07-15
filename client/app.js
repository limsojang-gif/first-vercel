const form = document.getElementById("chat-form");
const input = document.getElementById("q");
const submitButton = document.getElementById("btn");
const messages = document.getElementById("messages");

function createMessage(role, text, pending = false) {
  const article = document.createElement("article");
  article.className = `message message--${role}${pending ? " is-pending" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = "message__avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "YOU" : "G";

  const body = document.createElement("div");
  body.className = "message__body";

  const meta = document.createElement("div");
  meta.className = "message__meta";

  const author = document.createElement("strong");
  author.textContent = role === "user" ? "READER" : "GROQ DESK";

  const section = document.createElement("span");
  section.textContent = role === "user" ? "YOUR QUESTION" : "ASSISTANT";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  meta.append(author, section);
  body.append(meta, paragraph);
  article.append(avatar, body);
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;

  return { article, paragraph };
}

async function sendMessage() {
  const prompt = input.value.trim();
  if (!prompt || submitButton.disabled) return;

  createMessage("user", prompt);
  input.value = "";
  submitButton.disabled = true;
  messages.setAttribute("aria-busy", "true");

  const pendingMessage = createMessage(
    "assistant",
    "취재 데스크에서 답변을 정리하고 있습니다…",
    true
  );

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "답변을 불러오지 못했습니다.");

    pendingMessage.paragraph.textContent = data.reply || "답변이 없습니다.";
    pendingMessage.article.classList.remove("is-pending");
  } catch (error) {
    pendingMessage.paragraph.textContent =
      error.message || "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    pendingMessage.article.classList.remove("is-pending");
  } finally {
    submitButton.disabled = false;
    messages.setAttribute("aria-busy", "false");
    input.focus();
    messages.scrollTop = messages.scrollHeight;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

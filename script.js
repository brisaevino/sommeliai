const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const API_KEY = "ea10rdna1zeppkk4z914mn3e3711vztf";
const BOT_ID = "iVfilpJRo_G3SN6_EPXwz";

function addMessage(content, sender = "bot") {
  const message = document.createElement("div");
  message.className = `message ${sender}`;
  message.innerText = content;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (!input) return;

  addMessage(input, "user");
  userInput.value = "";

  addMessage("Digitando...", "bot");

  try {
    const response = await fetch("https://www.chatbase.co/api/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: input }],
        chatbotId: BOT_ID,
        stream: false
      })
    });

    const data = await response.json();
    const botMessage = data?.text || "Algo deu errado 😅";
    
    // Remove 'Digitando...'
    chatBox.lastChild.remove();
    addMessage(botMessage, "bot");

  } catch (err) {
    console.error(err);
    chatBox.lastChild.remove();
    addMessage("Erro ao conectar com o SommeliAI 🍷", "bot");
  }
});

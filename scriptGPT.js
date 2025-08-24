// Получаем необходимые элементы DOM
const queryInput = document.getElementById("query");
const chatHistory = document.getElementById("chatHistory");

// Функция для добавления сообщения в историю чата
function addMessage(text, type) {
  const message = document.createElement("div");
  message.classList.add("message", type);
  message.innerText = text;
  chatHistory.appendChild(message);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Основная функция отправки запроса
async function sendRequest() {
  try {
    // Получаем текст запроса
    const query = queryInput.value.trim();

    if (!query) {
      alert("Пожалуйста, введите запрос");
      return;
    }

    // Добавляем сообщение пользователя в историю
    addMessage(query, "user");

    // Очищаем поле ввода
    queryInput.value = "";

    // Формируем тело запроса
    const requestBody = {
      query: query,
    };

    // Отправляем POST-запрос
    const response = await fetch(
      "https://webhook.nodul.ru/12738/dev/30d1a881-9c65-4032-b4be-3b6018d2e667",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    // Проверяем статус ответа
    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.statusText}`);
    }

    // Получаем ответ в виде текста
    const responseText = await response.text();

    // Добавляем только основной текст ответа
    addMessage(responseText, "bot");
  } catch (error) {
    // Обрабатываем ошибки
    addMessage(`Ошибка: ${error.message}`, "error");
  }
}

// Добавляем обработчик события для отправки через Enter
queryInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendRequest();
  }
});

// Инициализация при загрузке страницы
window.addEventListener("load", () => {
  addMessage("Привет! Я готов помочь вам. Задайте свой вопрос.", "bot");
});

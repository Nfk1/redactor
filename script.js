document.addEventListener("DOMContentLoaded", () => {
  // Получение элементов
  const editor = document.getElementById("editor");
  if (!editor) return console.error("Редактор не найден");

  const toolbar = document.querySelector(".toolbar") || null;
  const charCount = document.getElementById("charCount") || null;
  const listCount = document.getElementById("listCount") || null;
  const saveBtn = document.getElementById("saveBtn") || null;
  const clearBtn = document.getElementById("clearBtn") || null;
  const insertStarsBtn = document.getElementById("insertStars") || null;

  const docTitleInput = document.getElementById("docTitle") || null;
  const increaseText = document.getElementById("increaseText") || null;
  const decreaseText = document.getElementById("decreaseText") || null;
  const style = window.getComputedStyle(editor);
  const fontSize = parseFloat(style.fontSize);

  // Обновление счётчика символов
  function updateCharCount() {
    try {
      const text = editor.innerText || "";
      if (charCount) {
        charCount.textContent = text.trim().length;
        const pages = Math.ceil(text.trim().length / 1800);
        listCount.textContent = pages;
      }
    } catch (error) {
      console.error("Ошибка обновления счётчика:", error);
    }
  }
  editor.addEventListener("input", updateCharCount);

  // Обработка панели инструментов
  if (toolbar) {
    toolbar.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !btn.dataset.cmd) return;

      try {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd, false, null);
        editor.focus();
        updateCharCount();
      } catch (error) {
        console.error("Ошибка выполнения команды:", error);
      }
    });
  }

  // Очистка редактора
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Очистить весь текст?")) {
        editor.innerHTML = "";
        updateCharCount();
        editor.focus();
      }
    });
  }

  // Сохранение текста
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      try {
        const content = editor.innerHTML;
        if (!content.trim()) {
          alert("Текст пустой, нечего сохранять.");
          return;
        }
        localStorage.setItem("savedText", content);
        alert("Текст сохранён!");
      } catch (error) {
        console.error("Ошибка сохранения:", error);
      }
    });
  }

  // Загрузка сохраненного текста
  try {
    const savedText = localStorage.getItem("savedText");
    if (savedText) {
      editor.innerHTML = savedText;
      updateCharCount();
    }
  } catch (error) {
    console.error("Ошибка загрузки сохраненного текста:", error);
  }

  editor.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const isSuccess = document.execCommand("insertText", false, "     ");

      if (!isSuccess) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const tabNode = document.createTextNode("     ");

        range.deleteContents();
        range.insertNode(tabNode);

        // Сместить курсор после вставленных пробелов
        range.setStartAfter(tabNode);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  });

  // Горячие клавиши
  editor.addEventListener("keydown", (e) => {
    if (e.ctrlKey) {
      let handled = false;
      try {
        switch (e.key.toLowerCase()) {
          case "b":
            document.execCommand("bold");
            handled = true;
            break;
          case "i":
            document.execCommand("italic");
            handled = true;
            break;
          case "s":
            document.execCommand("strikeThrough");
            handled = true;
            break;
          case "x":
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            const spacesNode = document.createTextNode("     "); // 4 пробела
            range.insertNode(spacesNode);
            // Перемещаем курсор сразу после вставленных пробелов
            range.setStartAfter(spacesNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            editor.focus();
            break;
        }
        if (handled) {
          e.preventDefault();
          updateCharCount();
        }
      } catch (error) {
        console.error("Ошибка обработки горячих клавиш:", error);
      }
    }
  });

  // Вставка звёздочек
  if (insertStarsBtn) {
    insertStarsBtn.addEventListener("click", () => {
      try {
        editor.focus();

        // Создаем HTML с переносом строки
        const starsHtml = '<p style="text-align:center;">***</p>';

        // Получаем текущую позицию курсора
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;

        // Проверяем, находимся ли мы в конце абзаца
        if (
          startContainer.nodeName === "#text" &&
          /\s$/.test(startContainer.nodeValue)
        ) {
          // Если да, просто вставляем HTML
          document.execCommand("insertHTML", false, starsHtml);
        } else {
          // Если нет - добавляем перенос строки перед вставкой
          document.execCommand("insertLineBreak");
          document.execCommand("insertHTML", false, starsHtml);
        }

        // Ставим курсор на новую строку после звёздочек
        const newParagraph = editor.querySelector("p:last-child");
        if (newParagraph) {
          range.setStartAfter(newParagraph);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {
        console.error("Ошибка вставки звёздочек:", error);
      }
    });
  } // Экспорт в Word

  // Автосохранение
  setInterval(() => {
    try {
      const content = editor.innerHTML;
      if (content.trim()) {
        localStorage.setItem("savedText", content);
        console.log("Текст автосохранён");
      }
    } catch (error) {
      console.error("Ошибка автосохранения:", error);
    }
  }, 5000);

  // Обработка ошибок при работе с localStorage
  window.addEventListener("error", (event) => {
    if (event.error.message.includes("QuotaExceededError")) {
      console.warn("Превышено допустимое количество данных в localStorage");
      alert("Не удалось сохранить документ из-за переполнения хранилища");
    }
  });

  // Дополнительная проверка доступности функций
  if (!document.execCommand) {
    console.warn("Метод execCommand не поддерживается в вашем браузере");
    alert("Некоторые функции форматирования могут быть недоступны");
  }
}); // Закрывающий скобка для DOMCont

const openBtn1 = document.getElementById("openModalBtn");
const modalOverlay1 = document.getElementById("modalOverlayLeft");
const closeBtn1 = document.getElementById("closeModalBtnLeft");
const iframe1 = modalOverlay1.querySelector("iframe");

openBtn1.addEventListener("click", () => {
  iframe1.src = "chat.html"; // сюда вставьте нужный URL
  modalOverlay1.style.display = "flex";
});

closeBtn1.addEventListener("click", () => {
  modalOverlay1.style.display = "none";
  iframe1.src = ""; // очищаем url iframe, чтоб остановить загрузку
});

// Закрыть модалку при клике вне окна
modalOverlay1.addEventListener("click", (e) => {
  if (e.target === modalOverlay1) {
    closeBtn1.click();
  }
});

const openBtn2 = document.getElementById("openModalChatBtn");
const modalOverlay2 = document.getElementById("modalOverlayRight");
const closeBtn2 = document.getElementById("closeModalBtnRight");
const iframe2 = modalOverlay2.querySelector("iframe");

openBtn2.addEventListener("click", () => {
  iframe2.src = "zametka.html"; // сюда вставьте нужный URL
  modalOverlay2.style.display = "flex";
});

closeBtn2.addEventListener("click", () => {
  modalOverlay2.style.display = "none";
  iframe2.src = ""; // очищаем url iframe, чтоб остановить загрузку
});

// Закрыть модалку при клике вне окна
modalOverlay2.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeBtn.click();
  }
});

increaseText.addEventListener("click", () => {
  const style = window.getComputedStyle(editor);
  const fontSize = parseFloat(style.fontSize);
  editor.style.fontSize = fontSize + 2 + "px";
});
decreaseText.addEventListener("click", () => {
  const style = window.getComputedStyle(editor);
  const fontSize = parseFloat(style.fontSize);
  editor.style.fontSize = fontSize - 2 + "px";
});

const Tab = document.getElementById("Tab");

Tab.addEventListener("click", () => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const spacesNode = document.createTextNode("     "); // 4 пробела
  range.insertNode(spacesNode);
  // Перемещаем курсор сразу после вставленных пробелов
  range.setStartAfter(spacesNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  editor.focus();
});

const button = document.getElementById("fileInput");
const hiddenInput = document.getElementById("hiddenFileInput");

button.addEventListener("click", () => {
  hiddenInput.click(); // открываем диалог выбора файла
});

hiddenInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith(".docx")) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const arrayBuffer = reader.result;
     mammoth.extractRawText({ arrayBuffer: arrayBuffer })
  .then((result) => {
    // Убираем лишние пустые строки (замена двойного переноса на один)
    const cleanedText = result.value.replace(/ns*n/g, 'n');
    editor.textContent = cleanedText;
  })
  .catch((err) => {
    console.error("Ошибка при чтении документа:", err);
    alert("Не удалось прочитать документ.");
  });

    reader.readAsArrayBuffer(file);
  } else {
    alert("Пожалуйста, выберите файл формата .docx");
  }
});
const toggleButton = document.querySelector(".theme-toggle");
const backFonEditor = document.querySelector("#editor");
const backFonToolbar = document.querySelector(".toolbar");
const backFonHeader = document.querySelector(".editor-container");
const backFonFooter = document.querySelector(".editor-footer");
const backButton = document.querySelectorAll("button");
const backInputFile = document.querySelector("#docTitleInput");
// Функция обновления фона кнопки в зависимости от темы
function updateToggleButtonBackground() {
  if (document.body.classList.contains("dark-theme")) {
    toggleButton.style.backgroundColor = "#333";
    backFonEditor.style.backgroundColor = "#494949ff";
    backFonEditor.style.color = "#ffffff";
    backFonToolbar.style.backgroundColor = "#494949ff";
    backFonHeader.style.backgroundColor = "#313131ff";
    backFonFooter.style.backgroundColor = "#494949ff";
    backFonFooter.style.color = "#ffffff";
    backInputFile.style.backgroundColor = "#313131ff";
    backButton.forEach((btn) => {
      if (!btn.classList.contains("theme-toggle")) {
        btn.style.backgroundColor = "#333";
      }
    });
  } else {
    toggleButton.style.backgroundColor = "#ffffff";
    backFonEditor.style.backgroundColor = "#ffffffff";
    backFonEditor.style.color = "#000000ff";
    backFonToolbar.style.backgroundColor = "#ffffff";
    backFonHeader.style.backgroundColor = "#c69e6b";
    backFonFooter.style.backgroundColor = "#ffffff";
    backFonFooter.style.color = "#666";
    backInputFile.style.backgroundColor = "#c69e6b";
    backButton.forEach((btn) => {
      if (!btn.classList.contains("theme-toggle")) {
        btn.style.backgroundColor = "#c69e6b";
      }
    });
  }
}

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  if (document.body.classList.contains("dark-theme")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }

  updateToggleButtonBackground();
});

// При загрузке страницы восстанавливаем выбор темы и фон кнопки
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
  updateToggleButtonBackground();
});


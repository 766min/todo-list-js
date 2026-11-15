(() => {
  const STORAGE_KEY = "todo-list-items";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));

  let todos = loadTodos();
  let currentFilter = "all";

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function createTodo(text) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      text,
      completed: false,
    };
  }

  function getFilteredTodos() {
    return todos.filter((todo) => {
      if (currentFilter === "active") return !todo.completed;
      if (currentFilter === "completed") return todo.completed;
      return true;
    });
  }

  function buildTodoItem(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " is-completed" : "");
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-item__checkbox" ${todo.completed ? "checked" : ""} aria-label="완료 처리" />
      <span class="todo-item__text" tabindex="0">${escapeHtml(todo.text)}</span>
      <button type="button" class="todo-item__delete" aria-label="삭제">×</button>
    `;

    return li;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    const filtered = getFilteredTodos();

    list.innerHTML = "";
    const fragment = document.createDocumentFragment();
    filtered.map(buildTodoItem).forEach((li) => fragment.appendChild(li));
    list.appendChild(fragment);

    emptyState.hidden = filtered.length !== 0;

    renderProgress();
    saveTodos();
  }

  function renderProgress() {
    const total = todos.length;
    const done = todos.reduce((count, todo) => (todo.completed ? count + 1 : count), 0);
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${done}/${total} 완료`;
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === filter);
    });
    render();
  }

  function startEdit(li, todo) {
    const span = li.querySelector(".todo-item__text");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "todo-item__edit-input";
    input.value = todo.text;

    span.replaceWith(input);
    input.focus();
    input.select();

    const finishEdit = () => {
      const newText = input.value.trim();
      if (newText) {
        todo.text = newText;
      }
      render();
    };

    input.addEventListener("blur", finishEdit, { once: true });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") {
        input.removeEventListener("blur", finishEdit);
        render();
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    todos.push(createTodo(text));
    input.value = "";
    render();
  });

  list.addEventListener("click", (e) => {
    const li = e.target.closest(".todo-item");
    if (!li) return;
    const todo = todos.find((t) => t.id === li.dataset.id);
    if (!todo) return;

    if (e.target.matches(".todo-item__checkbox")) {
      todo.completed = e.target.checked;
      render();
      return;
    }

    if (e.target.matches(".todo-item__delete")) {
      todos = todos.filter((t) => t.id !== todo.id);
      render();
      return;
    }

    if (e.target.matches(".todo-item__text")) {
      startEdit(li, todo);
    }
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  render();
})();

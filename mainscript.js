document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput'); // NEW
    const taskList = document.getElementById('taskList');
    const dateElement = document.getElementById('date');
    const themeSwitcher = document.getElementById('theme-switcher');

    // Modal elements
    const editModal = document.getElementById('editModal');
    const editInput = document.getElementById('editInput');
    const editDateInput = document.getElementById('editDateInput'); // NEW
    const saveEditButton = document.getElementById('saveEditButton');
    const closeModalButton = document.querySelector('.close-button');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let taskToEditIndex = -1;

    const saveToLocalStorage = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        tasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed - b.completed;
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityCompare !== 0) return priorityCompare;
            return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
        });

        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = '<li>No tasks yet!!</li>';
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.dataset.index = index;

            const priorityFlag = document.createElement('div');
            priorityFlag.className = `priority-flag priority-${task.priority}`;
            priorityFlag.title = `Priority: ${task.priority}. Click to change.`;
            priorityFlag.addEventListener('click', () => changePriority(index));
            li.appendChild(priorityFlag);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskComplete(index));
            li.appendChild(checkbox);

            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = task.text;
            li.appendChild(taskText);

            if (task.dueDate) {
                const dueDateSpan = document.createElement('span');
                dueDateSpan.className = 'due-date';
                dueDateSpan.textContent = ` (Due: ${task.dueDate})`;
                li.appendChild(dueDateSpan);
            }

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions';
            const editButton = document.createElement('button');
            editButton.className = 'edit-btn';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(index);
            });
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(index);
            });
            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            li.appendChild(actionsDiv);

            taskList.appendChild(li);
        });
    };

    const addTask = (event) => {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        if (taskText === '') {
            alert('Task cannot be empty.');
            return;
        }
        tasks.push({
            text: taskText,
            completed: false,
            priority: prioritySelect.value,
            dueDate: dueDate || null
        });
        taskInput.value = '';
        dueDateInput.value = '';
        saveToLocalStorage();
        renderTasks();
    };

    const toggleTaskComplete = (index) => {
        tasks[index].completed = !tasks[index].completed;
        saveToLocalStorage();
        renderTasks();
    };

    const changePriority = (index) => {
        const priorities = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(tasks[index].priority);
        tasks[index].priority = priorities[(currentIndex + 1) % priorities.length];
        saveToLocalStorage();
        renderTasks();
    };

    const deleteTask = (index) => {
        tasks.splice(index, 1);
        saveToLocalStorage();
        renderTasks();
    };

    const openEditModal = (index) => {
        taskToEditIndex = index;
        editInput.value = tasks[index].text;
        editDateInput.value = tasks[index].dueDate || '';
        editModal.style.display = 'block';
        editInput.focus();
    };

    const closeEditModal = () => {
        editModal.style.display = 'none';
    };

    const saveEditedTask = () => {
        const newText = editInput.value.trim();
        const newDueDate = editDateInput.value;
        if (newText !== '' && taskToEditIndex > -1) {
            tasks[taskToEditIndex].text = newText;
            tasks[taskToEditIndex].dueDate = newDueDate || null;
            saveToLocalStorage();
            renderTasks();
            closeEditModal();
        } else {
            alert('Edited task cannot be empty.');
        }
    };

    const applyTheme = (themeName) => {
        document.body.className = `theme-${themeName}`;
        localStorage.setItem('todoTheme', themeName);
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
    };

    const loadTheme = () => {
        const savedTheme = localStorage.getItem('todoTheme') || 'default';
        applyTheme(savedTheme);
    };

    const displayDate = () => {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    };

    // Event Listeners
    taskForm.addEventListener('submit', addTask);
    closeModalButton.addEventListener('click', closeEditModal);
    saveEditButton.addEventListener('click', saveEditedTask);
    window.addEventListener('click', (event) => {
        if (event.target === editModal) closeEditModal();
    });
    themeSwitcher.addEventListener('click', (e) => {
        if (e.target.classList.contains('theme-btn')) {
            applyTheme(e.target.dataset.theme);
        }
    });

    // Initial Load
    loadTheme();
    displayDate();
    renderTasks();
});

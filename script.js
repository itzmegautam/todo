let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';
let editingId = null;

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function addTask() {
  const input = document.getElementById('taskInput');
  const dateInput = document.getElementById('dateInput');
  const text = input.value.trim();
  if (!text) return;
  tasks.push({
    id: Date.now(),
    text: text,
    done: false,
    date: dateInput.value || ''
  });
  input.value = '';
  dateInput.value = '';
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  save();
  render();
}

function startEdit(id) {
  editingId = id;
  render();
  const input = document.getElementById('edit-' + id);
  if (input) { input.focus(); input.select(); }
}

function saveEdit(id) {
  const textInput = document.getElementById('edit-' + id);
  const dateInput = document.getElementById('editdate-' + id);
  const text = textInput.value.trim();
  if (!text) return;
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.text = text;
    task.date = dateInput.value || '';
  }
  editingId = null;
  save();
  render();
}

function cancelEdit() {
  editingId = null;
  render();
}

function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return d + '/' + m + '/' + y;
}

function getDateStatus(task) {
  if (!task.date) return 'none';
  const today = getToday();
  if (task.done) return 'done';
  if (task.date < today) return 'overdue';
  if (task.date === today) return 'today';
  return 'upcoming';
}

function render() {
  const list = document.getElementById('taskList');
  const today = getToday();

  const visible = tasks.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    if (filter === 'today') return t.date === today;
    if (filter === 'overdue') return t.date && t.date < today && !t.done;
    return true;
  });

  if (visible.length === 0) {
    list.innerHTML = '<p class="empty">No tasks here!</p>';
  } else {
    list.innerHTML = visible.map(task => {
      const status = getDateStatus(task);
      const isMissed = status === 'overdue';

      let dateDisplay = '';
      if (task.date) {
        let cls = 'task-date';
        let icon = '📅';
        if (status === 'overdue') { cls += ' overdue'; icon = '⚠️'; }
        else if (status === 'today') { cls += ' today'; icon = '🔔'; }
        else if (status === 'upcoming') { cls += ' upcoming'; icon = '📅'; }
        dateDisplay = '<span class="' + cls + '">' + icon + ' ' + formatDate(task.date) + '</span>';
      }

      if (editingId === task.id) {
        return '<li>' +
          '<input type="checkbox" ' + (task.done ? 'checked' : '') + ' onchange="toggleDone(' + task.id + ')" />' +
          '<div class="task-info">' +
            '<input class="edit-input" id="edit-' + task.id + '" value="' + task.text.replace(/"/g, '&quot;') + '"' +
            ' onkeydown="if(event.key===\'Enter\')saveEdit(' + task.id + ');if(event.key===\'Escape\')cancelEdit()" />' +
            '<input type="date" class="edit-date" id="editdate-' + task.id + '" value="' + (task.date || '') + '" />' +
          '</div>' +
          '<div class="actions">' +
            '<button class="btn-icon" onclick="saveEdit(' + task.id + ')">✅</button>' +
            '<button class="btn-icon" onclick="cancelEdit()">✖️</button>' +
          '</div>' +
        '</li>';
      }

      return '<li class="' + (isMissed ? 'missed' : '') + '">' +
        '<input type="checkbox" ' + (task.done ? 'checked' : '') + ' onchange="toggleDone(' + task.id + ')" />' +
        '<div class="task-info">' +
          '<span class="task-text ' + (task.done ? 'done' : isMissed ? 'missed-text' : '') + '">' + task.text + '</span>' +
          dateDisplay +
        '</div>' +
        '<div class="actions">' +
          '<button class="btn-icon" onclick="startEdit(' + task.id + ')">✏️</button>' +
          '<button class="btn-icon" onclick="deleteTask(' + task.id + ')">🗑️</button>' +
        '</div>' +
      '</li>';
    }).join('');
  }

  const left = tasks.filter(t => !t.done).length;
  document.getElementById('taskCount').textContent = left + ' task' + (left !== 1 ? 's' : '') + ' left';
}

document.getElementById('taskInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTask();
});

render();

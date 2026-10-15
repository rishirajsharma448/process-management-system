/**
 * OS Process Management & CPU Scheduling Simulator
 * Light Theme Edition with Inline Real-Time Number Updates and Smooth Transitions.
 */

// Available vibrant process colors
const PROCESS_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Violet
  '#059669', // Emerald
  '#d97706', // Amber
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#4f46e5', // Indigo
  '#0d9488', // Teal
  '#e11d48'  // Rose
];

// State variables
let processes = [];
let currentSimulationResult = null;
let currentTick = 0;
let isPlaying = false;
let animationTimer = null;
let simulationSpeedMs = 700;
let toastInstance = null;

// Presets
const SAMPLE_PRESET_1 = [
  { id: 'P1', at: 0, bt: 5, priority: 2 },
  { id: 'P2', at: 1, bt: 3, priority: 1 },
  { id: 'P3', at: 2, bt: 8, priority: 4 },
  { id: 'P4', at: 3, bt: 6, priority: 3 }
];

// DOM Elements
const algoSelect = document.getElementById('algoSelect');
const quantumContainer = document.getElementById('quantumContainer');
const timeQuantumInput = document.getElementById('timeQuantum');
const priorityRuleContainer = document.getElementById('priorityRuleContainer');
const priorityOrderSelect = document.getElementById('priorityOrder');
const simSpeedInput = document.getElementById('simSpeed');

const btnStep = document.getElementById('btnStep');
const btnPlay = document.getElementById('btnPlay');
const playIcon = document.getElementById('playIcon');
const playText = document.getElementById('playText');
const btnRunInstant = document.getElementById('btnRunInstant');
const btnReset = document.getElementById('btnReset');
const btnQuickDemo = document.getElementById('btnQuickDemo');
const btnRandomProcess = document.getElementById('btnRandomProcess');
const btnClearProcesses = document.getElementById('btnClearProcesses');
const btnAddQuickRow = document.getElementById('btnAddQuickRow');

const addProcessForm = document.getElementById('addProcessForm');
const newPidInput = document.getElementById('newPid');
const newArrivalInput = document.getElementById('newArrival');
const newBurstInput = document.getElementById('newBurst');
const newPriorityInput = document.getElementById('newPriority');
const newPriorityCol = document.getElementById('newPriorityCol');

const processListBody = document.getElementById('processListBody');
const processCountBadge = document.getElementById('processCountBadge');

const clockDisplay = document.getElementById('clockDisplay');
const simStatusBadge = document.getElementById('simStatusBadge');
const liveDot = document.getElementById('liveDot');
const activeCpuProcess = document.getElementById('activeCpuProcess');
const activeCpuDetails = document.getElementById('activeCpuDetails');
const activeJobProgress = document.getElementById('activeJobProgress');
const cpuCoreBox = document.querySelector('.cpu-core-box');

const readyQueueChips = document.getElementById('readyQueueChips');
const readyQueueCount = document.getElementById('readyQueueCount');

const ganttChart = document.getElementById('ganttChart');
const ganttTimeline = document.getElementById('ganttTimeline');
const totalDurationText = document.getElementById('totalDurationText');

const metricAvgWT = document.getElementById('metricAvgWT');
const metricAvgTAT = document.getElementById('metricAvgTAT');
const metricCpuUtil = document.getElementById('metricCpuUtil');
const metricThroughput = document.getElementById('metricThroughput');

const resultsTableBody = document.getElementById('resultsTableBody');
const compareTableBody = document.getElementById('compareTableBody');
const updateToastEl = document.getElementById('updateToast');
const toastMessage = document.getElementById('toastMessage');

// Initialize
function init() {
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(updateToastEl, { delay: 2000 });
  toastInstance = toastBootstrap;

  loadProcesses(SAMPLE_PRESET_1);
  setupEventListeners();
  updateFormControlsVisibility();
}

function showToast(msg) {
  if (toastMessage && toastInstance) {
    toastMessage.textContent = msg;
    toastInstance.show();
  }
}

function setupEventListeners() {
  algoSelect.addEventListener('change', () => {
    updateFormControlsVisibility();
    resetSimulationState();
  });

  timeQuantumInput.addEventListener('change', () => {
    resetSimulationState();
    showToast(`Time Quantum updated to ${timeQuantumInput.value}`);
  });
  
  priorityOrderSelect.addEventListener('change', () => {
    resetSimulationState();
    showToast(`Priority rule changed`);
  });

  simSpeedInput.addEventListener('input', (e) => {
    simulationSpeedMs = 1700 - parseInt(e.target.value, 10);
    if (isPlaying) {
      pauseSimulation();
      playSimulation();
    }
  });

  addProcessForm.addEventListener('submit', handleAddProcess);
  btnQuickDemo.addEventListener('click', () => {
    loadProcesses(SAMPLE_PRESET_1);
    showToast('Loaded standard 4-process preset');
  });

  btnRandomProcess.addEventListener('click', handleAddRandomProcess);
  btnAddQuickRow.addEventListener('click', handleQuickAddRow);
  
  btnClearProcesses.addEventListener('click', () => {
    processes = [];
    renderProcessInputTable();
    resetSimulationState();
    showToast('Process pool cleared');
  });

  btnRunInstant.addEventListener('click', runFullSimulation);
  btnPlay.addEventListener('click', togglePlayPause);
  btnStep.addEventListener('click', stepSimulation);
  btnReset.addEventListener('click', resetSimulationState);

  document.getElementById('compareModal').addEventListener('show.bs.modal', generateAlgorithmComparison);
}

function updateFormControlsVisibility() {
  const algo = algoSelect.value;
  quantumContainer.style.display = (algo === 'RR') ? 'block' : 'none';
  const isPriority = algo.startsWith('Priority');
  priorityRuleContainer.style.display = isPriority ? 'block' : 'none';
  newPriorityCol.style.display = isPriority ? 'block' : 'none';

  // Toggle table priority column header and cells
  document.querySelectorAll('.priority-header').forEach(el => {
    el.style.display = isPriority ? '' : 'none';
  });
  document.querySelectorAll('.priority-cell').forEach(el => {
    el.style.display = isPriority ? '' : 'none';
  });
}

function loadProcesses(list) {
  processes = list.map((p, idx) => ({
    id: p.id,
    at: parseInt(p.at, 10),
    bt: parseInt(p.bt, 10),
    priority: parseInt(p.priority || 1, 10),
    color: PROCESS_COLORS[idx % PROCESS_COLORS.length]
  }));
  renderProcessInputTable();
  resetSimulationState();
}

/**
 * Render the Process Pool table with inline editable number fields
 */
function renderProcessInputTable() {
  processCountBadge.textContent = `${processes.length} processes`;
  processListBody.innerHTML = '';

  const isPriority = algoSelect.value.startsWith('Priority');

  if (processes.length === 0) {
    processListBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-secondary py-3 fst-italic">No processes in pool. Add one above or click "Quick Row".</td>
      </tr>`;
    suggestNextPid();
    return;
  }

  processes.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-start ps-3 fw-bold">
        <span class="badge shadow-xs" style="background-color: ${p.color}; color: #fff;">${p.id}</span>
      </td>
      <td>
        <input type="number" 
               class="inline-proc-input font-monospace" 
               data-index="${idx}" 
               data-field="at" 
               min="0" 
               max="999" 
               value="${p.at}" 
               title="Arrival Time (Click to edit)">
      </td>
      <td>
        <input type="number" 
               class="inline-proc-input font-monospace" 
               data-index="${idx}" 
               data-field="bt" 
               min="1" 
               max="999" 
               value="${p.bt}" 
               title="Burst Time (Click to edit)">
      </td>
      <td class="priority-cell" style="${isPriority ? '' : 'display: none;'}">
        <input type="number" 
               class="inline-proc-input font-monospace" 
               data-index="${idx}" 
               data-field="priority" 
               min="0" 
               max="99" 
               value="${p.priority}" 
               title="Priority (Click to edit)">
      </td>
      <td>
        <button class="btn btn-outline-danger btn-xs" onclick="deleteProcess(${idx})" title="Remove ${p.id}">
          <i class="bi bi-x-lg"></i>
        </button>
      </td>
    `;
    processListBody.appendChild(tr);
  });

  // Attach real-time input change listeners
  document.querySelectorAll('.inline-proc-input').forEach(input => {
    input.addEventListener('change', handleInlineNumberChange);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });
  });

  suggestNextPid();
}

/**
 * Handle real-time inline number edit for AT, BT, and Priority
 */
function handleInlineNumberChange(e) {
  const input = e.target;
  const index = parseInt(input.getAttribute('data-index'), 10);
  const field = input.getAttribute('data-field');
  let val = parseInt(input.value, 10);

  if (isNaN(val)) val = field === 'bt' ? 1 : 0;
  if (field === 'bt' && val < 1) val = 1;
  if (val < 0) val = 0;

  input.value = val;
  processes[index][field] = val;

  // Flash animation
  input.classList.add('input-updated');
  setTimeout(() => input.classList.remove('input-updated'), 700);

  const fieldLabels = { at: 'Arrival Time', bt: 'Burst Time', priority: 'Priority' };
  showToast(`${processes[index].id} ${fieldLabels[field]} updated to ${val}`);

  // Re-sync simulation if currently computed
  if (currentSimulationResult) {
    runFullSimulation();
  }
}

function suggestNextPid() {
  newPidInput.value = `P${processes.length + 1}`;
}

window.deleteProcess = function(index) {
  const id = processes[index].id;
  processes.splice(index, 1);
  renderProcessInputTable();
  resetSimulationState();
  showToast(`Removed process ${id}`);
};

function handleAddProcess(e) {
  e.preventDefault();
  const pid = newPidInput.value.trim() || `P${processes.length + 1}`;
  const at = parseInt(newArrivalInput.value, 10);
  const bt = parseInt(newBurstInput.value, 10);
  const priority = parseInt(newPriorityInput.value, 10) || 1;

  if (processes.some(p => p.id === pid)) {
    alert(`Process ID "${pid}" already exists! Please pick a unique ID.`);
    return;
  }

  processes.push({
    id: pid,
    at: isNaN(at) ? 0 : at,
    bt: isNaN(bt) || bt <= 0 ? 1 : bt,
    priority: isNaN(priority) ? 1 : priority,
    color: PROCESS_COLORS[processes.length % PROCESS_COLORS.length]
  });

  renderProcessInputTable();
  resetSimulationState();
  showToast(`Added process ${pid}`);
  newArrivalInput.value = at;
  newBurstInput.value = 4;
}

function handleQuickAddRow() {
  const pid = `P${processes.length + 1}`;
  const lastProc = processes[processes.length - 1];
  const at = lastProc ? lastProc.at + 1 : 0;
  const bt = 4;
  const priority = lastProc ? lastProc.priority : 1;

  processes.push({
    id: pid,
    at,
    bt,
    priority,
    color: PROCESS_COLORS[processes.length % PROCESS_COLORS.length]
  });

  renderProcessInputTable();
  resetSimulationState();
  showToast(`Quick row ${pid} added to pool`);

  // Focus the new burst time input
  const allBtInputs = document.querySelectorAll('input[data-field="bt"]');
  if (allBtInputs.length > 0) {
    allBtInputs[allBtInputs.length - 1].focus();
    allBtInputs[allBtInputs.length - 1].select();
  }
}

function handleAddRandomProcess() {
  const pid = `P${processes.length + 1}`;
  const at = Math.floor(Math.random() * 8);
  const bt = Math.floor(Math.random() * 8) + 1;
  const priority = Math.floor(Math.random() * 5) + 1;

  processes.push({
    id: pid,
    at,
    bt,
    priority,
    color: PROCESS_COLORS[processes.length % PROCESS_COLORS.length]
  });

  renderProcessInputTable();
  resetSimulationState();
  showToast(`Random process ${pid} added`);
}

/* ==========================================================================
   CPU SCHEDULING ALGORITHMS ENGINE
   ========================================================================== */

function getCleanProcessList() {
  return processes.map(p => ({
    id: p.id,
    at: p.at,
    bt: p.bt,
    priority: p.priority,
    color: p.color,
    remBt: p.bt,
    firstCpuTime: null,
    ct: null,
    tat: null,
    wt: null,
    rt: null
  }));
}

function solveSchedule(algorithm, procList, quantum = 2, priorityOrder = 'lower') {
  if (!procList || procList.length === 0) return null;

  switch (algorithm) {
    case 'FCFS':
      return solveFCFS(procList);
    case 'SJF':
      return solveSJF(procList);
    case 'SRTF':
      return solveSRTF(procList);
    case 'RR':
      return solveRoundRobin(procList, quantum);
    case 'Priority_NP':
      return solvePriorityNonPreemptive(procList, priorityOrder);
    case 'Priority_P':
      return solvePriorityPreemptive(procList, priorityOrder);
    default:
      return solveFCFS(procList);
  }
}

// 1. First-Come, First-Served (FCFS)
function solveFCFS(procs) {
  let list = [...procs].sort((a, b) => a.at - b.at);
  let time = 0;
  let schedule = [];
  let unitTicks = [];
  let completed = [];

  list.forEach(p => {
    if (time < p.at) {
      const idleDuration = p.at - time;
      schedule.push({ pid: 'IDLE', start: time, end: p.at, duration: idleDuration, color: '#e2e8f0' });
      while (time < p.at) {
        unitTicks.push({ time, activePid: 'IDLE', readyQueue: [], completed: [...completed] });
        time++;
      }
    }

    p.firstCpuTime = time;
    p.ct = time + p.bt;
    p.tat = p.ct - p.at;
    p.wt = p.tat - p.bt;
    p.rt = p.firstCpuTime - p.at;

    schedule.push({ pid: p.id, start: time, end: p.ct, duration: p.bt, color: p.color });

    for (let i = 0; i < p.bt; i++) {
      const currentTickTime = time + i;
      const ready = list.filter(item => item.at <= currentTickTime && item.ct === null && item.id !== p.id).map(x => x.id);
      unitTicks.push({ time: currentTickTime, activePid: p.id, readyQueue: ready, completed: [...completed] });
    }

    time = p.ct;
    completed.push(p.id);
  });

  return finalizeMetrics(procs, schedule, unitTicks, time);
}

// 2. Shortest Job First (SJF - Non-Preemptive)
function solveSJF(procs) {
  let list = [...procs];
  let time = 0;
  let completed = [];
  let schedule = [];
  let unitTicks = [];
  const n = list.length;

  while (completed.length < n) {
    const arrived = list.filter(p => p.at <= time && !completed.includes(p.id));

    if (arrived.length === 0) {
      const nextArrival = Math.min(...list.filter(p => !completed.includes(p.id)).map(p => p.at));
      schedule.push({ pid: 'IDLE', start: time, end: nextArrival, duration: nextArrival - time, color: '#e2e8f0' });
      while (time < nextArrival) {
        unitTicks.push({ time, activePid: 'IDLE', readyQueue: [], completed: [...completed] });
        time++;
      }
      continue;
    }

    arrived.sort((a, b) => a.bt === b.bt ? a.at - b.at : a.bt - b.bt);
    const p = arrived[0];

    p.firstCpuTime = time;
    p.ct = time + p.bt;
    p.tat = p.ct - p.at;
    p.wt = p.tat - p.bt;
    p.rt = p.firstCpuTime - p.at;

    schedule.push({ pid: p.id, start: time, end: p.ct, duration: p.bt, color: p.color });

    for (let i = 0; i < p.bt; i++) {
      const currentTickTime = time + i;
      const ready = list.filter(item => item.at <= currentTickTime && !completed.includes(item.id) && item.id !== p.id)
                        .sort((a, b) => a.bt - b.bt)
                        .map(x => x.id);
      unitTicks.push({ time: currentTickTime, activePid: p.id, readyQueue: ready, completed: [...completed] });
    }

    time = p.ct;
    completed.push(p.id);
  }

  return finalizeMetrics(procs, schedule, unitTicks, time);
}

// 3. Shortest Remaining Time First (SRTF - Preemptive)
function solveSRTF(procs) {
  let list = [...procs];
  let time = 0;
  let completed = [];
  let schedule = [];
  let unitTicks = [];
  const n = list.length;

  let currentBlock = null;

  while (completed.length < n) {
    const arrived = list.filter(p => p.at <= time && p.remBt > 0);

    if (arrived.length === 0) {
      if (currentBlock && currentBlock.pid === 'IDLE') {
        currentBlock.end = time + 1;
        currentBlock.duration++;
      } else {
        if (currentBlock) schedule.push(currentBlock);
        currentBlock = { pid: 'IDLE', start: time, end: time + 1, duration: 1, color: '#e2e8f0' };
      }

      unitTicks.push({ time, activePid: 'IDLE', readyQueue: [], completed: [...completed] });
      time++;
      continue;
    }

    arrived.sort((a, b) => a.remBt === b.remBt ? a.at - b.at : a.remBt - b.remBt);
    const p = arrived[0];

    if (p.firstCpuTime === null) {
      p.firstCpuTime = time;
    }

    if (currentBlock && currentBlock.pid === p.id) {
      currentBlock.end = time + 1;
      currentBlock.duration++;
    } else {
      if (currentBlock) schedule.push(currentBlock);
      currentBlock = { pid: p.id, start: time, end: time + 1, duration: 1, color: p.color };
    }

    const ready = arrived.filter(item => item.id !== p.id).map(x => x.id);
    unitTicks.push({ time, activePid: p.id, readyQueue: ready, completed: [...completed] });

    p.remBt--;
    time++;

    if (p.remBt === 0) {
      p.ct = time;
      p.tat = p.ct - p.at;
      p.wt = p.tat - p.bt;
      p.rt = p.firstCpuTime - p.at;
      completed.push(p.id);
    }
  }

  if (currentBlock) schedule.push(currentBlock);

  return finalizeMetrics(procs, schedule, unitTicks, time);
}

// 4. Round Robin (RR)
function solveRoundRobin(procs, tq) {
  let list = [...procs].sort((a, b) => a.at - b.at);
  let time = 0;
  let completed = [];
  let schedule = [];
  let unitTicks = [];
  let queue = [];
  let inQueue = new Set();
  const n = list.length;

  list.filter(p => p.at <= time).forEach(p => {
    queue.push(p);
    inQueue.add(p.id);
  });

  while (completed.length < n) {
    if (queue.length === 0) {
      const unarrived = list.filter(p => !inQueue.has(p.id) && p.remBt > 0);
      if (unarrived.length > 0) {
        const nextTime = Math.min(...unarrived.map(p => p.at));
        schedule.push({ pid: 'IDLE', start: time, end: nextTime, duration: nextTime - time, color: '#e2e8f0' });
        while (time < nextTime) {
          unitTicks.push({ time, activePid: 'IDLE', readyQueue: [], completed: [...completed] });
          time++;
        }
        list.filter(p => p.at <= time && !inQueue.has(p.id)).forEach(p => {
          queue.push(p);
          inQueue.add(p.id);
        });
      }
      continue;
    }

    const p = queue.shift();
    if (p.firstCpuTime === null) {
      p.firstCpuTime = time;
    }

    const slice = Math.min(tq, p.remBt);
    const startSlice = time;

    schedule.push({ pid: p.id, start: startSlice, end: startSlice + slice, duration: slice, color: p.color });

    for (let i = 0; i < slice; i++) {
      const currentTickTime = time + i;
      list.filter(item => item.at === currentTickTime && !inQueue.has(item.id) && item.id !== p.id).forEach(item => {
        queue.push(item);
        inQueue.add(item.id);
      });

      unitTicks.push({
        time: currentTickTime,
        activePid: p.id,
        readyQueue: queue.map(x => x.id),
        completed: [...completed]
      });
    }

    time += slice;
    p.remBt -= slice;

    list.filter(item => item.at <= time && !inQueue.has(item.id) && item.id !== p.id).forEach(item => {
      queue.push(item);
      inQueue.add(item.id);
    });

    if (p.remBt > 0) {
      queue.push(p);
    } else {
      p.ct = time;
      p.tat = p.ct - p.at;
      p.wt = p.tat - p.bt;
      p.rt = p.firstCpuTime - p.at;
      completed.push(p.id);
    }
  }

  return finalizeMetrics(procs, schedule, unitTicks, time);
}

// 5. Priority (Non-Preemptive)
function solvePriorityNonPreemptive(procs, order = 'lower') {
  let list = [...procs];
  let time = 0;
  let completed = [];
  let schedule = [];
  let unitTicks = [];
  const n = list.length;

  const comparePriority = (a, b) => {
    if (order === 'lower') {
      return a.priority === b.priority ? a.at - b.at : a.priority - b.priority;
    } else {
      return a.priority === b.priority ? a.at - b.at : b.priority - a.priority;
    }
  };

  while (completed.length < n) {
    const arrived = list.filter(p => p.at <= time && !completed.includes(p.id));

    if (arrived.length === 0) {
      const nextArrival = Math.min(...list.filter(p => !completed.includes(p.id)).map(p => p.at));
      schedule.push({ pid: 'IDLE', start: time, end: nextArrival, duration: nextArrival - time, color: '#e2e8f0' });
      while (time < nextArrival) {
        unitTicks.push({ time, activePid: 'IDLE', readyQueue: [], completed: [...completed] });
        time++;
      }
      continue;
    }

    arrived.sort(comparePriority);
    const p = arrived[0];

    p.firstCpuTime = time;
    p.ct = time + p.bt;
    p.tat = p.ct - p.at;
    p.wt = p.tat - p.bt;
    p.rt = p.firstCpuTime - p.at;

    schedule.push({ pid: p.id, start: time, end: p.ct, duration: p.bt, color: p.color });

    for (let i = 0; i < p.bt; i++) {
      const currentTickTime = time + i;
      const ready = list.filter(item => item.at <= currentTickTime && !completed.includes(item.id) && item.id !== p.id)
                        .sort(comparePriority)
                        .map(x => x.id);
      unitTicks.push({ time: currentTickTime, activePid: p.id, readyQueue: ready, completed: [...completed] });
    }

    time = p.ct;
    completed.push(p.id);
  }

  return finalizeMetrics(procs, schedule, unitTicks, time);
}

// 6. Priority (Preemptive)
function solvePriorityPreemptive(procs, order = 'lower') {
  let list = [...procs];
  let time = 0;
  let completed = [];
  let schedule = [];
  let unitTicks = [];
  const n = list.length;

  let currentBlock = null;

  const comparePriority = (a, b) => {
    if (order === 'lower') {
      return a.priority === b.priority ? a.at - b.at : a.priority - b.priority;
    } else {
      return a.priority === b.priority ? a.at - b.at : b.priority - a.priority;
    }
  };

  while (completed.length < n) {
    const arrived = list.filter(p => p.at <= time && p.remBt > 0);

    if (arrived.length === 0) {
      if (currentBlock && currentBlock.pid === 'IDLE') {
        currentBlock.end = time + 1;
        currentBlock.duration++;
      } else {
        if (currentBlock) schedule.push(currentBlock);
        currentBlock = { pid: 'IDLE', start: time, end: time + 1, duration: 1, color: '#e2e8f0' };
      }

      unitTicks.push({ time, activePid: 'IDLE', readyQueue: [], completed: [...completed] });
      time++;
      continue;
    }

    arrived.sort(comparePriority);
    const p = arrived[0];

    if (p.firstCpuTime === null) {
      p.firstCpuTime = time;
    }

    if (currentBlock && currentBlock.pid === p.id) {
      currentBlock.end = time + 1;
      currentBlock.duration++;
    } else {
      if (currentBlock) schedule.push(currentBlock);
      currentBlock = { pid: p.id, start: time, end: time + 1, duration: 1, color: p.color };
    }

    const ready = arrived.filter(item => item.id !== p.id).map(x => x.id);
    unitTicks.push({ time, activePid: p.id, readyQueue: ready, completed: [...completed] });

    p.remBt--;
    time++;

    if (p.remBt === 0) {
      p.ct = time;
      p.tat = p.ct - p.at;
      p.wt = p.tat - p.bt;
      p.rt = p.firstCpuTime - p.at;
      completed.push(p.id);
    }
  }

  if (currentBlock) schedule.push(currentBlock);

  return finalizeMetrics(procs, schedule, unitTicks, time);
}

function finalizeMetrics(procs, schedule, unitTicks, totalDuration) {
  const n = procs.length;
  const totalWT = procs.reduce((acc, p) => acc + p.wt, 0);
  const totalTAT = procs.reduce((acc, p) => acc + p.tat, 0);
  const totalRT = procs.reduce((acc, p) => acc + p.rt, 0);

  const avgWT = totalWT / n;
  const avgTAT = totalTAT / n;
  const avgRT = totalRT / n;

  const totalBusy = schedule.filter(b => b.pid !== 'IDLE').reduce((acc, b) => acc + b.duration, 0);
  const cpuUtil = totalDuration > 0 ? (totalBusy / totalDuration) * 100 : 0;
  const throughput = totalDuration > 0 ? n / totalDuration : 0;

  return {
    procs,
    schedule,
    unitTicks,
    totalDuration,
    metrics: {
      avgWT,
      avgTAT,
      avgRT,
      cpuUtil,
      throughput
    }
  };
}

/* ==========================================================================
   SIMULATION CONTROLS & ANIMATION
   ========================================================================== */

function runFullSimulation() {
  if (processes.length === 0) {
    alert('Please add at least one process to the pool.');
    return;
  }

  pauseSimulation();
  const algo = algoSelect.value;
  const quantum = parseInt(timeQuantumInput.value, 10) || 2;
  const order = priorityOrderSelect.value;

  currentSimulationResult = solveSchedule(algo, getCleanProcessList(), quantum, order);

  renderGanttChart(currentSimulationResult.schedule, currentSimulationResult.totalDuration);
  renderResultsTable(currentSimulationResult.procs);
  renderMetrics(currentSimulationResult.metrics, currentSimulationResult.totalDuration);

  // Jump simulation clock to completion
  currentTick = currentSimulationResult.totalDuration;
  clockDisplay.textContent = currentTick;
  simStatusBadge.textContent = 'COMPLETED';
  simStatusBadge.className = 'badge bg-success-subtle text-success border border-success-subtle';
  liveDot.className = 'status-indicator';

  activeCpuProcess.textContent = 'DONE';
  activeCpuProcess.style.color = '#10b981';
  activeCpuDetails.textContent = 'All processes completed';
  activeJobProgress.style.width = '100%';
  activeJobProgress.className = 'progress-bar bg-success';
  cpuCoreBox.classList.remove('active-running');

  readyQueueChips.innerHTML = '<span class="text-secondary fs-xs fst-italic">Queue is empty</span>';
  readyQueueCount.textContent = '0 Waiting';
}

function resetSimulationState() {
  pauseSimulation();
  currentTick = 0;
  currentSimulationResult = null;

  clockDisplay.textContent = '0';
  simStatusBadge.textContent = 'IDLE';
  simStatusBadge.className = 'badge bg-light text-dark border';
  liveDot.className = 'status-indicator';

  activeCpuProcess.textContent = '-';
  activeCpuProcess.style.color = '';
  activeCpuDetails.textContent = 'Awaiting Job';
  activeJobProgress.style.width = '0%';
  cpuCoreBox.classList.remove('active-running');

  readyQueueChips.innerHTML = '<span class="text-secondary fs-xs fst-italic">Queue is empty</span>';
  readyQueueCount.textContent = '0 Waiting';

  ganttChart.innerHTML = `
    <div class="gantt-empty text-secondary text-center w-100 py-4 fst-italic">
      Click <strong>"Compute"</strong> or <strong>"Animate"</strong> to generate the timeline
    </div>`;
  ganttTimeline.innerHTML = '';
  totalDurationText.textContent = '0';

  metricAvgWT.textContent = '0.00';
  metricAvgTAT.textContent = '0.00';
  metricCpuUtil.textContent = '0.0%';
  metricThroughput.textContent = '0.00';

  resultsTableBody.innerHTML = `
    <tr>
      <td colspan="9" class="text-secondary py-3 fst-italic">No simulation run yet. Click "Compute" or "Animate".</td>
    </tr>`;
}

function togglePlayPause() {
  if (isPlaying) {
    pauseSimulation();
  } else {
    playSimulation();
  }
}

function playSimulation() {
  if (processes.length === 0) {
    alert('Please add at least one process to the pool.');
    return;
  }

  if (!currentSimulationResult) {
    const algo = algoSelect.value;
    const quantum = parseInt(timeQuantumInput.value, 10) || 2;
    const order = priorityOrderSelect.value;
    currentSimulationResult = solveSchedule(algo, getCleanProcessList(), quantum, order);
    renderResultsTable(currentSimulationResult.procs, true);
  }

  if (currentTick >= currentSimulationResult.unitTicks.length) {
    currentTick = 0;
  }

  isPlaying = true;
  playIcon.className = 'bi bi-pause-fill fs-6';
  playText.textContent = 'Pause';
  simStatusBadge.textContent = 'RUNNING';
  simStatusBadge.className = 'badge bg-primary text-white';
  liveDot.className = 'status-indicator live';

  animationTimer = setInterval(() => {
    if (currentTick < currentSimulationResult.unitTicks.length) {
      applyTickState(currentSimulationResult.unitTicks[currentTick]);
      currentTick++;
    } else {
      pauseSimulation();
      runFullSimulation();
    }
  }, simulationSpeedMs);
}

function pauseSimulation() {
  isPlaying = false;
  clearInterval(animationTimer);
  animationTimer = null;
  playIcon.className = 'bi bi-play-fill fs-6';
  playText.textContent = 'Animate';
  if (currentSimulationResult && currentTick >= currentSimulationResult.unitTicks.length) {
    simStatusBadge.textContent = 'COMPLETED';
    simStatusBadge.className = 'badge bg-success-subtle text-success border border-success-subtle';
  } else {
    simStatusBadge.textContent = 'PAUSED';
    simStatusBadge.className = 'badge bg-warning-subtle text-warning-emphasis border border-warning-subtle';
  }
}

function stepSimulation() {
  if (processes.length === 0) {
    alert('Please add at least one process to the pool.');
    return;
  }

  if (!currentSimulationResult) {
    const algo = algoSelect.value;
    const quantum = parseInt(timeQuantumInput.value, 10) || 2;
    const order = priorityOrderSelect.value;
    currentSimulationResult = solveSchedule(algo, getCleanProcessList(), quantum, order);
    renderResultsTable(currentSimulationResult.procs, true);
  }

  if (isPlaying) pauseSimulation();

  if (currentTick < currentSimulationResult.unitTicks.length) {
    applyTickState(currentSimulationResult.unitTicks[currentTick]);
    currentTick++;
  } else {
    runFullSimulation();
  }
}

function applyTickState(tickData) {
  clockDisplay.textContent = tickData.time;

  // Active CPU
  if (tickData.activePid === 'IDLE') {
    activeCpuProcess.textContent = 'IDLE';
    activeCpuProcess.style.color = '#64748b';
    activeCpuDetails.textContent = 'CPU is waiting for processes';
    activeJobProgress.style.width = '0%';
    cpuCoreBox.classList.remove('active-running');
  } else {
    const proc = processes.find(p => p.id === tickData.activePid);
    activeCpuProcess.textContent = tickData.activePid;
    activeCpuProcess.style.color = proc ? proc.color : '#0f172a';
    activeCpuDetails.textContent = `Executing (AT: ${proc ? proc.at : 0}, BT: ${proc ? proc.bt : 0})`;
    activeJobProgress.style.width = '100%';
    activeJobProgress.style.backgroundColor = proc ? proc.color : '#10b981';
    cpuCoreBox.classList.add('active-running');
  }

  // Ready Queue Chips
  readyQueueCount.textContent = `${tickData.readyQueue.length} Waiting`;
  if (tickData.readyQueue.length === 0) {
    readyQueueChips.innerHTML = '<span class="text-secondary fs-xs fst-italic">Queue is empty</span>';
  } else {
    readyQueueChips.innerHTML = '';
    tickData.readyQueue.forEach(id => {
      const proc = processes.find(p => p.id === id);
      const chip = document.createElement('span');
      chip.className = 'ready-chip shadow-xs';
      chip.style.backgroundColor = proc ? proc.color : '#2563eb';
      chip.style.color = '#fff';
      chip.innerHTML = `<i class="bi bi-clock"></i> ${id}`;
      readyQueueChips.appendChild(chip);
    });
  }

  // Update dynamic progressive Gantt chart
  const partialSchedule = buildPartialSchedule(currentSimulationResult.schedule, tickData.time + 1);
  renderGanttChart(partialSchedule, currentSimulationResult.totalDuration, tickData.time + 1);
}

function buildPartialSchedule(fullSchedule, currentTime) {
  const partial = [];
  for (const block of fullSchedule) {
    if (block.start >= currentTime) break;
    if (block.end <= currentTime) {
      partial.push(block);
    } else {
      partial.push({
        ...block,
        end: currentTime,
        duration: currentTime - block.start
      });
      break;
    }
  }
  return partial;
}

/* ==========================================================================
   RENDERING FUNCTIONS (Gantt, Tables, Metrics)
   ========================================================================== */

function renderGanttChart(schedule, totalDuration, activeMarkerTime = null) {
  ganttChart.innerHTML = '';
  ganttTimeline.innerHTML = '';
  totalDurationText.textContent = totalDuration;

  if (!schedule || schedule.length === 0) return;

  const timelineMarks = new Set([0]);

  schedule.forEach(block => {
    const blockEl = document.createElement('div');
    const pct = totalDuration > 0 ? (block.duration / totalDuration) * 100 : 0;
    blockEl.className = `gantt-block ${block.pid === 'IDLE' ? 'idle-block' : ''}`;
    blockEl.style.width = `${pct}%`;
    blockEl.style.minWidth = '36px';

    if (block.pid !== 'IDLE') {
      blockEl.style.backgroundColor = block.color;
    }

    blockEl.title = `${block.pid} [Time: ${block.start} -> ${block.end} (${block.duration} units)]`;
    blockEl.innerHTML = `<span>${block.pid}</span>`;

    ganttChart.appendChild(blockEl);

    timelineMarks.add(block.start);
    timelineMarks.add(block.end);
  });

  // Render timeline markers
  const sortedMarks = Array.from(timelineMarks).sort((a, b) => a - b);
  sortedMarks.forEach(mark => {
    const markEl = document.createElement('span');
    markEl.className = 'timeline-mark';
    const leftPct = totalDuration > 0 ? (mark / totalDuration) * 100 : 0;
    markEl.style.left = `${leftPct}%`;
    markEl.textContent = mark;
    ganttTimeline.appendChild(markEl);
  });
}

function renderResultsTable(procs, isInProgress = false) {
  resultsTableBody.innerHTML = '';

  const isPriority = algoSelect.value.startsWith('Priority');

  procs.forEach(p => {
    const tr = document.createElement('tr');
    const isFinished = !isInProgress && p.ct !== null;

    tr.innerHTML = `
      <td class="text-start ps-3 fw-bold">
        <span class="badge shadow-xs" style="background-color: ${p.color}; color: #fff;">${p.id}</span>
      </td>
      <td>${p.at}</td>
      <td>${p.bt}</td>
      <td class="priority-cell" style="${isPriority ? '' : 'display: none;'}">${p.priority}</td>
      <td class="fw-bold text-primary">${isFinished ? p.ct : '-'}</td>
      <td class="fw-bold text-success">${isFinished ? p.tat : '-'}</td>
      <td class="fw-bold text-warning-emphasis">${isFinished ? p.wt : '-'}</td>
      <td class="fw-bold text-info">${isFinished ? p.rt : '-'}</td>
      <td>
        <span class="badge ${isFinished ? 'badge-finished' : 'badge-ready'}">
          ${isFinished ? 'Completed' : 'Pending'}
        </span>
      </td>
    `;
    resultsTableBody.appendChild(tr);
  });
}

function renderMetrics(metrics, totalDuration) {
  metricAvgWT.textContent = metrics.avgWT.toFixed(2);
  metricAvgTAT.textContent = metrics.avgTAT.toFixed(2);
  metricCpuUtil.textContent = `${metrics.cpuUtil.toFixed(1)}%`;
  metricThroughput.textContent = metrics.throughput.toFixed(2);
}

/* ==========================================================================
   ALGORITHM COMPARISON BENCHMARK
   ========================================================================== */

function generateAlgorithmComparison() {
  compareTableBody.innerHTML = '';
  if (processes.length === 0) {
    compareTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-secondary py-3 fst-italic">No processes in pool to compare.</td>
      </tr>`;
    return;
  }

  const algorithms = [
    { key: 'FCFS', name: 'First-Come, First-Served (FCFS)', preemptive: 'No', desc: 'Simple batch systems, low overhead' },
    { key: 'SJF', name: 'Shortest Job First (SJF)', preemptive: 'No', desc: 'Optimal for non-preemptive batch' },
    { key: 'SRTF', name: 'Shortest Remaining Time First (SRTF)', preemptive: 'Yes', desc: 'Minimizes average waiting time' },
    { key: 'RR', name: 'Round Robin (RR, tq=2)', preemptive: 'Yes', desc: 'Time-sharing & interactive multi-tasking' },
    { key: 'Priority_NP', name: 'Priority (Non-Preemptive)', preemptive: 'No', desc: 'Critical jobs run first without interrupts' },
    { key: 'Priority_P', name: 'Priority (Preemptive)', preemptive: 'Yes', desc: 'Real-time & urgent process preemption' }
  ];

  const results = algorithms.map(item => {
    const list = getCleanProcessList();
    const res = solveSchedule(item.key, list, 2, 'lower');
    return {
      ...item,
      res
    };
  });

  const minAvgWT = Math.min(...results.map(r => r.res.metrics.avgWT));

  results.forEach(r => {
    const tr = document.createElement('tr');
    const isBest = r.res.metrics.avgWT === minAvgWT;

    tr.innerHTML = `
      <td class="text-start fw-semibold">
        ${r.name}
        ${isBest ? '<span class="badge bg-success ms-1 fs-xs">Best WT</span>' : ''}
      </td>
      <td class="fw-bold ${isBest ? 'text-success' : 'text-primary'}">${r.res.metrics.avgWT.toFixed(2)}</td>
      <td class="text-slate-800">${r.res.metrics.avgTAT.toFixed(2)}</td>
      <td class="text-info">${r.res.metrics.avgRT.toFixed(2)}</td>
      <td class="text-slate-800">${r.res.metrics.cpuUtil.toFixed(1)}%</td>
      <td><span class="badge ${r.preemptive === 'Yes' ? 'bg-primary-subtle text-primary border' : 'bg-light text-secondary border'}">${r.preemptive}</span></td>
      <td class="text-start text-secondary fs-xs">${r.desc}</td>
    `;
    compareTableBody.appendChild(tr);
  });
}

// Start on DOM loaded
document.addEventListener('DOMContentLoaded', init);

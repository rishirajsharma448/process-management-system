# ProcOS - OS Process Management & CPU Scheduling Simulator 🚀

An interactive, responsive **Operating System Process Management & CPU Scheduling Simulator** built with **HTML5, CSS3, Bootstrap 5, and JavaScript**.

Experience how operating system schedulers execute processes, manage ready queues, handle preemption, and calculate CPU performance metrics in real-time.

---

## 🌟 Key Features

* **6 Core Scheduling Algorithms Supported**:
  1. **FCFS (First-Come, First-Served)** - Non-preemptive FIFO scheduling
  2. **SJF (Shortest Job First)** - Non-preemptive shortest burst first
  3. **SRTF (Shortest Remaining Time First)** - Preemptive shortest remaining time
  4. **Round Robin (RR)** - Preemptive time-sharing with configurable **Time Quantum ($t_q$)**
  5. **Priority Scheduling (Non-Preemptive)** - Priority ordering (Lower # or Higher # as top priority)
  6. **Priority Scheduling (Preemptive)** - Real-time preemption upon arrival of higher priority processes

* **⚡ Real-Time Inline Number Editing**:
  * Edit **Arrival Time (AT)**, **Burst Time (BT)**, or **Priority** directly inside the table.
  * Instant auto-synchronization and toast alert confirmations.
  * Quick `+ Quick Row` button to dynamically append processes with 1 click.

* **📊 Live Dynamic Gantt Chart**:
  * Responsive, color-coded execution timeline blocks.
  * Idle CPU interval markers.
  * Timeline tick points with tooltips.

* **🖥️ CPU Core & Queue Monitor**:
  * Real-time active CPU core visualizer with ambient glowing state.
  * Dynamic animated **Ready Queue** tracking waiting processes tick-by-tick.
  * Simulation clock with **Play/Pause**, **Step Forward**, **Instant Compute**, and **Speed Slider**.

* **📈 Performance Telemetry & PCB Metrics**:
  * Process Control Block table: Completion Time ($CT$), Turnaround Time ($TAT$), Waiting Time ($WT$), Response Time ($RT$), and Final Status.
  * Performance summary: Average Waiting Time, Average Turnaround Time, CPU Utilization (%), and System Throughput.
  * **1-Click Algorithm Comparison Benchmark**: Evaluates all 6 algorithms side-by-side to find the optimal scheduling policy for your workload.

---

## 🚀 Live Demo / Getting Started

No compilation, Node.js, or complex installations needed!

1. Clone or download the repository:
   ```bash
   git clone https://github.com/rishirajsharma448/process-management-system.git
   ```
2. Open `index.html` in any web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

---

## 📂 Project Structure

```text
├── index.html     # Semantic HTML5 layout, Bootstrap 5 UI, and modal dialogs
├── styles.css     # Clean light theme design, animations, Gantt chart styling
├── app.js         # Algorithmic solvers, real-time clock engine, state manager
├── .gitignore     # Git ignore configuration
└── README.md      # Project documentation
```

---

## 📐 Formulas Used

* **Turnaround Time ($TAT$)** = $\text{Completion Time } (CT) - \text{Arrival Time } (AT)$
* **Waiting Time ($WT$)** = $\text{Turnaround Time } (TAT) - \text{Burst Time } (BT)$
* **Response Time ($RT$)** = $\text{First CPU Time} - \text{Arrival Time } (AT)$
* **CPU Utilization** = $\left(\frac{\text{Total Busy Time}}{\text{Total Simulation Duration}}\right) \times 100\%$
* **Throughput** = $\frac{\text{Completed Processes}}{\text{Total Simulation Duration}}$

---

## 🛠️ Built With

* **HTML5** & **CSS3**
* **JavaScript (ES6+)**
* [**Bootstrap 5.3**](https://getbootstrap.com/)
* [**Bootstrap Icons**](https://icons.getbootstrap.com/)
* [**Google Fonts** (Plus Jakarta Sans & Fira Code)](https://fonts.google.com/)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

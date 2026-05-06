# C3 | Round Robin vs Priority Scheduling Simulator

**Course:** Operating Systems  
**Project:** C3 — Algorithm Comparison Project  
**Algorithms:** Round Robin (RR) vs Preemptive Priority Scheduling  

## 🚀 How to Run
1. Download all 3 files: `index.html`, `style.css`, `script.js`
2. Put them in the same folder
3. Open `index.html` in any browser
4. No installation needed

## ⚙️ Configuration
- **Time Quantum** (for Round Robin): user-defined, must be ≥ 1
- **Priority Rule:** Lower number = higher priority (configurable)
- **Priority Scheduling:** Preemptive (checks every time unit)
- **Tie-breaking rule:** Earlier arrival time wins

---

## 📋 Test Scenarios

---

### Scenario A — Basic Mixed Workload

**Purpose:** Verify basic correctness of both algorithms on a normal workload.

**Input (Quantum = 3, Lower # = Higher Priority):**

| Process | Arrival | Burst | Priority |
|---------|---------|-------|----------|
| P1      | 0       | 8     | 2        |
| P2      | 1       | 4     | 1        |
| P3      | 2       | 9     | 3        |
| P4      | 3       | 5     | 2        |
| P5      | 4       | 2     | 4        |

**Results:**

| Metric   | Round Robin | Priority |
|----------|-------------|----------|
| Avg WT   | (your value)| (your value) |
| Avg TAT  | (your value)| (your value) |
| Avg RT   | (your value)| (your value) |

**Analysis:** *(copy the analysis text from the app after running)*

**Screenshot:**  
*(paste screenshot here)*

---

### Scenario B — Urgency Case

**Purpose:** Show how Priority Scheduling favors high-priority processes while Round Robin interleaves fairly.

**Input (Quantum = 4, Lower # = Higher Priority):**

| Process | Arrival | Burst | Priority |
|---------|---------|-------|----------|
| P1      | 0       | 12    | 1        |
| P2      | 0       | 3     | 4        |
| P3      | 2       | 5     | 2        |
| P4      | 3       | 2     | 3        |

**Results:**

| Metric   | Round Robin | Priority |
|----------|-------------|----------|
| Avg WT   | (your value)| (your value) |
| Avg TAT  | (your value)| (your value) |
| Avg RT   | (your value)| (your value) |

**Analysis:** *(copy from app)*

**Screenshot:**  
*(paste screenshot here)*

---

### Scenario C — Fairness Case

**Purpose:** Equal priority processes — Round Robin distributes CPU time evenly.

**Input (Quantum = 2, Lower # = Higher Priority):**

| Process | Arrival | Burst | Priority |
|---------|---------|-------|----------|
| P1      | 0       | 6     | 1        |
| P2      | 0       | 6     | 1        |
| P3      | 0       | 6     | 1        |
| P4      | 1       | 4     | 1        |

**Results:**

| Metric   | Round Robin | Priority |
|----------|-------------|----------|
| Avg WT   | (your value)| (your value) |
| Avg TAT  | (your value)| (your value) |
| Avg RT   | (your value)| (your value) |

**Analysis:** *(copy from app)*

**Screenshot:**  
*(paste screenshot here)*

---

### Scenario D — Starvation Risk

**Purpose:** P5 has priority 5 while all others have priority 1. Priority Scheduling will continuously preempt P5, demonstrating starvation risk.

**Input (Quantum = 3, Lower # = Higher Priority):**

| Process | Arrival | Burst | Priority |
|---------|---------|-------|----------|
| P1      | 0       | 3     | 1        |
| P2      | 0       | 3     | 1        |
| P3      | 1       | 3     | 1        |
| P4      | 2       | 3     | 1        |
| P5      | 0       | 10    | 5        |

**Results:**

| Metric   | Round Robin | Priority |
|----------|-------------|----------|
| Avg WT   | (your value)| (your value) |
| Avg TAT  | (your value)| (your value) |
| Avg RT   | (your value)| (your value) |

**Analysis:** *(copy from app)*

**Screenshot:**  
*(paste screenshot here)*

---

### Scenario E — Validation Test

**Purpose:** Show that the simulator correctly rejects invalid input.

**Invalid inputs used:**
- Quantum = -1 (invalid)
- P1: Arrival = -2 (negative, invalid)
- P2: Burst = -3 (negative, invalid)
- P3: Priority = 0 (must be ≥ 1, invalid)

**Expected result:** Simulator shows error messages and refuses to run.

**Screenshot:**  
*(paste screenshot here)*

---

## 📐 Assumptions & Limitations

**Assumptions:**
- Priority Scheduling is fully preemptive (checks every time unit)
- Lower priority number = higher urgency (configurable in UI)
- Tie-breaking: earlier arrival time wins; if equal, earlier process ID wins
- All processes are independent with no I/O bursts

**Limitations:**
- Simulator does not support I/O burst time
- No aging mechanism for Priority Scheduling
- Ready queue shows a mid-run snapshot, not a full step-by-step trace
- Maximum recommended processes: 10

---

## 📊 Formulas Used

| Metric | Formula |
|--------|---------|
| Turnaround Time (TAT) | Finish Time − Arrival Time |
| Waiting Time (WT) | TAT − Burst Time |
| Response Time (RT) | First CPU Time − Arrival Time |
| Average WT | Sum of all WT ÷ Number of processes |

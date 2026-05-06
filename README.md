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
| Avg WT   |    14.60    |   10.00  |
| Avg TAT  |    20.20    |   15.60  |
| Avg RT   |    4.60     |   9.20   |

**Analysis:** 
1 · Efficiency Analysis
Average Waiting Time: Round Robin = 14.60, Priority = 10.00. Priority produced a lower average waiting time.

Average Turnaround Time: RR = 20.20, Priority = 15.60.
Average Response Time: RR = 4.60, Priority = 9.20.
2 · Fairness vs Urgency
Round Robin used a Time Quantum of 3. Every ready process gets CPU access in a fixed rotation — no process is starved regardless of its priority or burst length. This gives balanced, fair service across all processes.

Priority Scheduling rule: Lower number = higher priority (tie-break: earlier arrival time). High-priority processes in this workload received faster service than average, confirming the urgency policy is effective.
3 · Starvation & Fairness Risk
⚠ Starvation risk observed in Priority Scheduling. Maximum waiting time (22) is significantly above the average (10.00). A low-priority process experienced severe delay — this happens when high-priority processes continuously preempt it.

**Screenshot:**  
<img width="1128" height="935" alt="Screenshot 2026-05-06 134417" src="https://github.com/user-attachments/assets/09c72b4d-7557-4123-93d7-ace5d0970d65" />
<img width="589" height="930" alt="Screenshot 2026-05-06 134505" src="https://github.com/user-attachments/assets/17783899-9401-4459-82a7-75ed9f4993dd" />


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
| Avg WT   |     8.25    |   10.75  |
| Avg TAT  |     13.75   |   16.25  |
| Avg RT   |     4.25    |   10.75  |

**Analysis:** 
1 · Efficiency Analysis
Average Waiting Time: Round Robin = 8.25, Priority = 10.75. Round Robin produced a lower average waiting time.

Average Turnaround Time: RR = 13.75, Priority = 16.25.
Average Response Time: RR = 4.25, Priority = 10.75.
2 · Fairness vs Urgency
Round Robin used a Time Quantum of 4. Every ready process gets CPU access in a fixed rotation — no process is starved regardless of its priority or burst length. This gives balanced, fair service across all processes.

Priority Scheduling rule: Lower number = higher priority (tie-break: earlier arrival time). High-priority processes in this workload received faster service than average, confirming the urgency policy is effective.
3 · Starvation & Fairness Risk
No significant starvation was detected in this workload. However, Priority Scheduling remains susceptible to starvation whenever high-priority processes keep arriving — Round Robin structurally prevents this through its rotation mechanism.

**Screenshot:**  
<img width="1140" height="870" alt="Screenshot 2026-05-06 135704" src="https://github.com/user-attachments/assets/5f6bdf27-123f-4418-8524-0ddbb647e99a" />
<img width="585" height="942" alt="Screenshot 2026-05-06 135728" src="https://github.com/user-attachments/assets/a415bb5b-5617-4e22-be6f-6ff761fc07f0" />


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
| Avg WT   |     13.25   |   8.75	  |
| Avg TAT  |     18.75   |   14.25  |
| Avg RT   |     2.75    |   8.75   |

**Analysis:** 
1 · Efficiency Analysis
Average Waiting Time: Round Robin = 13.25, Priority = 8.75. Priority produced a lower average waiting time.

Average Turnaround Time: RR = 18.75, Priority = 14.25.
Average Response Time: RR = 2.75, Priority = 8.75.
2 · Fairness vs Urgency
Round Robin used a Time Quantum of 2. Every ready process gets CPU access in a fixed rotation — no process is starved regardless of its priority or burst length. This gives balanced, fair service across all processes.

Priority Scheduling rule: Lower number = higher priority (tie-break: earlier arrival time). High-priority processes did not consistently gain a decisive speed advantage — check per-process RT for details.
3 · Starvation & Fairness Risk
No significant starvation was detected in this workload. However, Priority Scheduling remains susceptible to starvation whenever high-priority processes keep arriving — Round Robin structurally prevents this through its rotation mechanism.

**Screenshot:**  
<img width="1241" height="942" alt="Screenshot 2026-05-06 152829" src="https://github.com/user-attachments/assets/1cdff415-23cf-4aa5-88b7-a90cebe4d643" />
<img width="574" height="938" alt="Screenshot 2026-05-06 152852" src="https://github.com/user-attachments/assets/d03cc523-c9d4-4f3d-8fd8-fae02befbd10" />

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
| Avg WT   |    6.60     |   5.40	  |
| Avg TAT  |    11.00    |   9.80   |
| Avg RT   |    5.40     |   5.40   |

**Analysis:** 
1 · Efficiency Analysis
Average Waiting Time: Round Robin = 6.60, Priority = 5.40. Priority produced a lower average waiting time.

Average Turnaround Time: RR = 11.00, Priority = 9.80.
Average Response Time: RR = 5.40, Priority = 5.40.
2 · Fairness vs Urgency
Round Robin used a Time Quantum of 3. Every ready process gets CPU access in a fixed rotation — no process is starved regardless of its priority or burst length. This gives balanced, fair service across all processes.

Priority Scheduling rule: Lower number = higher priority (tie-break: earlier arrival time). High-priority processes did not consistently gain a decisive speed advantage — check per-process RT for details.
3 · Starvation & Fairness Risk
⚠ Starvation risk observed in Priority Scheduling. Maximum waiting time (12) is significantly above the average (5.40). A low-priority process experienced severe delay — this happens when high-priority processes continuously preempt it.

**Screenshot:**  
<img width="1115" height="921" alt="Screenshot 2026-05-06 153248" src="https://github.com/user-attachments/assets/f3a10db3-940c-4f2d-8aaf-39397bc504a6" />

<img width="579" height="944" alt="image" src="https://github.com/user-attachments/assets/cbc1a6c2-7d4b-42d7-af3d-efa1fc28fac8" />

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
<img width="1116" height="928" alt="image" src="https://github.com/user-attachments/assets/557bb1e5-63f1-425d-811e-af168ea84623" />


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

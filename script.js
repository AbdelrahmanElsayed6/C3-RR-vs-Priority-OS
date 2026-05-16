const PROCESS_COLORS = [
  { bg: '#00b4d8', text: '#000' },
  { bg: '#ef476f', text: '#fff' },
  { bg: '#ffd166', text: '#000' },
  { bg: '#06d6a0', text: '#000' },
  { bg: '#a16cf7', text: '#fff' },
  { bg: '#ff9f1c', text: '#000' },
  { bg: '#2ec4b6', text: '#000' },
  { bg: '#e63946', text: '#fff' },
  { bg: '#4cc9f0', text: '#000' },
  { bg: '#f72585', text: '#fff' },
];

let colorMap   = {};
let pidCounter = 0;

function getColor(pid) {
  if (!colorMap[pid]) {
    const idx = Object.keys(colorMap).length % PROCESS_COLORS.length;
    colorMap[pid] = PROCESS_COLORS[idx];
  }
  return colorMap[pid];
}


function addRow(arrival = 0, burst = 5, priority = 2) {
  pidCounter++;
  const id   = `P${pidCounter}`;
  const tbody = document.getElementById('process-list');
  const row   = document.createElement('tr');
  row.dataset.pid = id;
  row.innerHTML = `
    <td class="pid-cell">${id}</td>
    <td><input type="number" class="arrival"  value="${arrival}"  min="0"></td>
    <td><input type="number" class="burst"    value="${burst}"    min="1"></td>
    <td><input type="number" class="priority" value="${priority}" min="1"></td>
    <td><button class="btn-del" onclick="this.closest('tr').remove()">✕</button></td>`;
  tbody.appendChild(row);
}

function resetAll() {
  
  document.getElementById('process-list').innerHTML = '';
  pidCounter = 0;
  colorMap   = {};

  
  document.getElementById('quantum').value       = 3;
  document.getElementById('priority-rule').value = 'low';

  
  const msgEl = document.getElementById('validation-msg');
  msgEl.style.display = 'none';
  msgEl.innerHTML = '';

  
  const descEl = document.getElementById('scenario-desc');
  descEl.style.display = 'none';
  descEl.innerHTML = '';
  document.querySelectorAll('.btn-scenario').forEach(b => b.classList.remove('active'));

  
  document.getElementById('rr-gantt').innerHTML =
    '<div class="placeholder"><div class="icon-big">⬡</div>No data yet</div>';
  document.getElementById('priority-gantt').innerHTML =
    '<div class="placeholder"><div class="icon-big">◈</div>No data yet</div>';
  document.getElementById('rr-table-container').innerHTML =
    '<div class="placeholder">Run simulation to see metrics</div>';
  document.getElementById('priority-table-container').innerHTML =
    '<div class="placeholder">Run simulation to see metrics</div>';
  document.getElementById('final-report').innerHTML =
    '<div class="placeholder"><div class="icon-big">≋</div>Run a simulation to generate the technical analysis and conclusion.</div>';
  document.getElementById('rr-queue-display').innerHTML =
    '<span class="queue-label">Ready Queue:</span><span class="queue-empty">Run simulation to see queue state</span>';
  document.getElementById('rr-legend').style.display = 'none';
  document.getElementById('pr-legend').style.display = 'none';
  document.getElementById('starvation-warn').style.display = 'none';
  document.getElementById('rr-quantum-badge').textContent  = '';
  document.getElementById('pr-rule-badge').textContent     = '';
}


function getProcesses() {
  const rows = document.querySelectorAll('#process-list tr');
  return Array.from(rows).map(row => ({
    id:        row.dataset.pid,
    arrival:   parseInt(row.querySelector('.arrival').value),
    burst:     parseInt(row.querySelector('.burst').value),
    priority:  parseInt(row.querySelector('.priority').value),
    remaining: parseInt(row.querySelector('.burst').value),
    finish: 0, tat: 0, wt: 0, rt: -1
  }));
}


function validate(processes, quantum) {
  const errors = [];

  if (processes.length === 0) {
    errors.push('• No processes added. Please add at least one process.');
    return errors;
  }

  if (isNaN(quantum) || quantum < 1)
    errors.push('• Time Quantum must be a positive integer ≥ 1.');

 
  const ids = processes.map(p => p.id);
  const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dups.length)
    errors.push(`• Duplicate Process IDs detected: ${[...new Set(dups)].join(', ')}`);

  processes.forEach(p => {
    if (isNaN(p.arrival) || p.arrival < 0)
      errors.push(`• ${p.id}: Arrival time must be ≥ 0 (entered: ${p.arrival}).`);
    if (isNaN(p.burst) || p.burst < 1)
      errors.push(`• ${p.id}: Burst time must be ≥ 1 (entered: ${p.burst}).`);
    if (isNaN(p.priority) || p.priority < 1)
      errors.push(`• ${p.id}: Priority must be a positive integer ≥ 1 (entered: ${p.priority}).`);
  });

  return errors;
}


function deepClone(proc) {
  return proc.map(p => ({ ...p, remaining: p.burst, finish: 0, tat: 0, wt: 0, rt: -1 }));
}


function solveRR(proc, q) {
  let time = 0, n = proc.length, gantt = [], queue = [], completed = 0;
  const sorted   = [...proc].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
  const enqueued = new Set();
  const queueHistory = [];

  
  sorted.forEach(p => {
    if (p.arrival <= time && !enqueued.has(p.id)) {
      queue.push(p);
      enqueued.add(p.id);
    }
  });

  while (completed < n) {
    
    sorted.forEach(p => {
      if (p.arrival <= time && !enqueued.has(p.id) && p.remaining > 0) {
        queue.push(p);
        enqueued.add(p.id);
      }
    });

    if (queue.length > 0) {
      const p    = queue.shift();
      if (p.rt === -1) p.rt = time - p.arrival;

      const exec = Math.min(p.remaining, q);

      for (let i = 0; i < exec; i++) {
        gantt.push({ id: p.id, time: time });
        // Check arrivals during execution
        sorted.forEach(np => {
          if (np.arrival === time + 1 && !enqueued.has(np.id) && np.remaining > 0) {
            queue.push(np);
            enqueued.add(np.id);
          }
        });
        time++;
      }

      p.remaining -= exec;

      if (p.remaining > 0) {
        queue.push(p);
      } else {
        p.finish = time;
        p.tat    = p.finish - p.arrival;
        p.wt     = p.tat - p.burst;
        completed++;
      }

      queueHistory.push([...queue.map(x => x.id)]);
    } else {
      // CPU idle
      gantt.push({ id: 'Idle', time: time });
      time++;
      sorted.forEach(p => {
        if (p.arrival <= time && !enqueued.has(p.id) && p.remaining > 0) {
          queue.push(p);
          enqueued.add(p.id);
        }
      });
    }
  }

  const avgWt  = proc.reduce((s, p) => s + p.wt,  0) / n;
  const avgTat = proc.reduce((s, p) => s + p.tat,  0) / n;
  const avgRt  = proc.reduce((s, p) => s + p.rt,   0) / n;
  return { metrics: proc, gantt, avgWt, avgTat, avgRt, queueHistory };
}


function solvePriority(proc, rule) {
  let time = 0, n = proc.length, gantt = [], completed = 0;

  while (completed < n) {
    const available = proc.filter(p => p.arrival <= time && p.remaining > 0);

    if (available.length > 0) {
      
      available.sort((a, b) => {
        const priDiff = rule === 'low'
          ? a.priority - b.priority    
          : b.priority - a.priority;   
        return priDiff !== 0 ? priDiff : a.arrival - b.arrival;
      });

      const p = available[0];
      if (p.rt === -1) p.rt = time - p.arrival;
      p.remaining--;
      gantt.push({ id: p.id, time: time });
      time++;

      if (p.remaining === 0) {
        p.finish = time;
        p.tat    = p.finish - p.arrival;
        p.wt     = p.tat - p.burst;
        completed++;
      }
    } else {
      gantt.push({ id: 'Idle', time: time });
      time++;
    }
  }

  const avgWt  = proc.reduce((s, p) => s + p.wt,  0) / n;
  const avgTat = proc.reduce((s, p) => s + p.tat,  0) / n;
  const avgRt  = proc.reduce((s, p) => s + p.rt,   0) / n;
  return { metrics: proc, gantt, avgWt, avgTat, avgRt };
}


function startSimulation() {
  colorMap = {};

  const msgEl    = document.getElementById('validation-msg');
  const processes = getProcesses();
  const quantum   = parseInt(document.getElementById('quantum').value);
  const pRule     = document.getElementById('priority-rule').value;

  
  const errors = validate(processes, quantum);
  if (errors.length) {
    msgEl.style.display = 'block';
    msgEl.innerHTML = '<b>⚠ Validation Errors — please fix before running:</b><br>' + errors.join('<br>');
    return;
  }
  msgEl.style.display = 'none';

  
  processes.forEach(p => getColor(p.id));

  
  const rrResult = solveRR(deepClone(processes), quantum);
  const prResult = solvePriority(deepClone(processes), pRule);

  
  document.getElementById('rr-quantum-badge').textContent =
    `Quantum = ${quantum}`;
  document.getElementById('pr-rule-badge').textContent =
    pRule === 'low' ? 'Lower # = Higher Priority' : 'Higher # = Higher Priority';

 
  renderQueueDisplay(rrResult.queueHistory);
  renderGantt('rr-gantt',       rrResult.gantt);
  renderGantt('priority-gantt', prResult.gantt);
  renderLegend('rr-legend', processes);
  renderLegend('pr-legend', processes);
  renderTable('rr-table-container',       rrResult.metrics, rrResult.avgWt, rrResult.avgTat, rrResult.avgRt, 'rr');
  renderTable('priority-table-container', prResult.metrics, prResult.avgWt, prResult.avgTat, prResult.avgRt, 'pr');

  
  const maxPrWt = Math.max(...prResult.metrics.map(p => p.wt));
  document.getElementById('starvation-warn').style.display =
    (maxPrWt > prResult.avgWt * 2.5 && processes.length > 2) ? 'block' : 'none';

  
  generateReport(rrResult, prResult, quantum, pRule, processes);
}


function renderGantt(id, data) {
  const container = document.getElementById(id);
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="placeholder">No data</div>';
    return;
  }

 
  const compressed = [];
  data.forEach(d => {
    const last = compressed[compressed.length - 1];
    if (last && last.id === d.id) {
      last.end = d.time + 1;
    } else {
      compressed.push({ id: d.id, start: d.time, end: d.time + 1 });
    }
  });

  const total = compressed.reduce((s, b) => s + (b.end - b.start), 0);
  let html = '';

  compressed.forEach((b, i) => {
    const duration = b.end - b.start;
    const w        = Math.max(38, Math.round((duration / total) * 780));
    const isIdle   = b.id === 'Idle';
    const col      = isIdle ? { bg: '#2a2f42', text: '#7a82a0' } : getColor(b.id);

    html += `<div class="gantt-block"
      style="width:${w}px;background:${col.bg};color:${col.text};"
      title="${b.id} | t${b.start} → t${b.end} (${duration} unit${duration>1?'s':''})">
      ${b.id}
      <span class="time-label">${b.start}</span>
      ${i === compressed.length - 1
        ? `<span class="gantt-end-label">${b.end}</span>`
        : ''}
    </div>`;
  });

  container.innerHTML = html;
}


function renderLegend(id, processes) {
  const el = document.getElementById(id);
  el.style.display = 'flex';
  el.innerHTML =
    processes.map(p => {
      const c = getColor(p.id);
      return `<div class="legend-item">
        <div class="legend-dot" style="background:${c.bg}"></div>${p.id}
      </div>`;
    }).join('') +
    `<div class="legend-item">
      <div class="legend-dot" style="background:#2a2f42"></div>Idle
    </div>`;
}


function renderQueueDisplay(queueHistory) {
  const el   = document.getElementById('rr-queue-display');
  const snap = queueHistory.length
    ? queueHistory[Math.floor(queueHistory.length * 0.4)]
    : [];

  el.innerHTML =
    `<span class="queue-label">Ready Queue (mid-run snapshot):</span>` +
    (snap.length === 0
      ? '<span class="queue-empty">Empty at this snapshot point</span>'
      : snap
          .map(id => `<span class="queue-item">${id}</span>`)
          .join('<span class="queue-arrow">→</span>'));
}


function renderTable(containerId, data, avgWt, avgTat, avgRt, type) {
  const container = document.getElementById(containerId);
  const accent    = type === 'rr' ? 'var(--accent-rr)' : 'var(--accent-pr)';

  let html = `
    <table class="metrics-table">
      <thead>
        <tr>
          <th>Process</th>
          <th>Arrival</th>
          <th>Burst</th>
          <th>Priority</th>
          <th>Finish</th>
          <th>Waiting (WT)</th>
          <th>Turnaround (TAT)</th>
          <th>Response (RT)</th>
        </tr>
      </thead>
      <tbody>`;

  data.forEach(p => {
    const c = getColor(p.id);
    html += `<tr>
      <td>
        <span style="background:${c.bg};color:${c.text};
          padding:2px 8px;border-radius:4px;
          font-family:var(--font-mono);font-size:11px;font-weight:700;">
          ${p.id}
        </span>
      </td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>
      <td>${p.priority}</td>
      <td>${p.finish}</td>
      <td style="color:${accent};font-weight:700;">${p.wt}</td>
      <td style="color:${accent};font-weight:700;">${p.tat}</td>
      <td style="color:${accent};font-weight:700;">${p.rt}</td>
    </tr>`;
  });

  html += `
      <tr class="avg-row">
        <td colspan="5" style="text-align:left;padding-left:12px;">Averages</td>
        <td>${avgWt.toFixed(2)}</td>
        <td>${avgTat.toFixed(2)}</td>
        <td>${avgRt.toFixed(2)}</td>
      </tr>
      </tbody>
    </table>`;

  container.innerHTML = html;
}


function generateReport(rr, pr, quantum, pRule, processes) {
  const report = document.getElementById('final-report');

  const winWt  = rr.avgWt  < pr.avgWt  ? 'RR' : rr.avgWt  > pr.avgWt  ? 'PR' : 'TIE';
  const winTat = rr.avgTat < pr.avgTat ? 'RR' : rr.avgTat > pr.avgTat ? 'PR' : 'TIE';
  const winRt  = rr.avgRt  < pr.avgRt  ? 'RR' : rr.avgRt  > pr.avgRt  ? 'PR' : 'TIE';

  function winLabel(w) {
    return w === 'RR' ? 'Round Robin' : w === 'PR' ? 'Priority' : 'Tie';
  }
  function winClass(w) {
    return w === 'RR' ? 'win-rr' : w === 'PR' ? 'win-pr' : 'win-tie';
  }

  
  const prWts    = pr.metrics.map(p => p.wt);
  const maxPrWt  = Math.max(...prWts);
  const starvRisk = maxPrWt > pr.avgWt * 2 && processes.length > 2;

 
  const highPriProcs = pRule === 'low'
    ? processes.filter(p => p.priority === Math.min(...processes.map(x => x.priority)))
    : processes.filter(p => p.priority === Math.max(...processes.map(x => x.priority)));

  const urgencyBenefit = highPriProcs.length > 0 &&
    pr.metrics
      .filter(pm => highPriProcs.some(h => h.id === pm.id))
      .every(pm => pm.wt <= pr.avgWt);

  
  const scores = [winWt, winTat, winRt];
  const rrWins = scores.filter(w => w === 'RR').length;
  const prWins = scores.filter(w => w === 'PR').length;
  const recommendation = rrWins >= prWins ? 'Round Robin' : 'Priority Scheduling';
  const recClass = recommendation === 'Round Robin' ? 'win-rr' : 'win-pr';

  report.innerHTML = `
    <!-- ── STAT BOXES ── -->
    <div class="report-grid">
      <div class="stat-box">
        <div class="stat-label">Avg Waiting Time</div>
        <div class="stat-winner ${winClass(winWt)}">${winLabel(winWt)} wins</div>
        <div class="stat-vals">RR: ${rr.avgWt.toFixed(2)} &nbsp;·&nbsp; PR: ${pr.avgWt.toFixed(2)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Avg Turnaround Time</div>
        <div class="stat-winner ${winClass(winTat)}">${winLabel(winTat)} wins</div>
        <div class="stat-vals">RR: ${rr.avgTat.toFixed(2)} &nbsp;·&nbsp; PR: ${pr.avgTat.toFixed(2)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Avg Response Time</div>
        <div class="stat-winner ${winClass(winRt)}">${winLabel(winRt)} wins</div>
        <div class="stat-vals">RR: ${rr.avgRt.toFixed(2)} &nbsp;·&nbsp; PR: ${pr.avgRt.toFixed(2)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Overall Recommendation</div>
        <div class="stat-winner ${recClass}">${recommendation}</div>
        <div class="stat-vals">Based on WT · TAT · RT</div>
      </div>
    </div>

    <!-- ── ANALYSIS ── -->
    <div class="analysis-block">
      <h4>1 · Efficiency Analysis</h4>
      <strong>Average Waiting Time:</strong>
        Round Robin = <strong>${rr.avgWt.toFixed(2)}</strong>,
        Priority = <strong>${pr.avgWt.toFixed(2)}</strong>.
      ${winWt === 'TIE'
        ? 'Both algorithms produced equal average waiting time for this workload.'
        : `<strong>${winLabel(winWt)}</strong> produced a lower average waiting time.`}
      <br><br>
      <strong>Average Turnaround Time:</strong>
        RR = <strong>${rr.avgTat.toFixed(2)}</strong>,
        Priority = <strong>${pr.avgTat.toFixed(2)}</strong>.
      <br>
      <strong>Average Response Time:</strong>
        RR = <strong>${rr.avgRt.toFixed(2)}</strong>,
        Priority = <strong>${pr.avgRt.toFixed(2)}</strong>.
    </div>

    <div class="analysis-block">
      <h4>2 · Fairness vs Urgency</h4>
      Round Robin used a Time Quantum of <strong>${quantum}</strong>.
      Every ready process gets CPU access in a fixed rotation —
      no process is starved regardless of its priority or burst length.
      This gives <strong>balanced, fair service</strong> across all processes.
      <br><br>
      Priority Scheduling rule: <strong>${pRule === 'low' ? 'Lower number = higher priority' : 'Higher number = higher priority'}</strong> (tie-break: earlier arrival time).
      ${urgencyBenefit
        ? 'High-priority processes in this workload received faster service than average, confirming the urgency policy is effective.'
        : 'High-priority processes did not consistently gain a decisive speed advantage — check per-process RT for details.'}
    </div>

    <div class="analysis-block">
      <h4>3 · Starvation &amp; Fairness Risk</h4>
      ${starvRisk
        ? `⚠ <strong>Starvation risk observed</strong> in Priority Scheduling.
           Maximum waiting time (${maxPrWt}) is significantly above the average (${pr.avgWt.toFixed(2)}).
           A low-priority process experienced severe delay — this happens when high-priority
           processes continuously preempt it.`
        : `No significant starvation was detected in this workload.
           However, Priority Scheduling remains susceptible to starvation whenever
           high-priority processes keep arriving — Round Robin structurally prevents
           this through its rotation mechanism.`}
    </div>

    <div class="analysis-block">
      <h4>4 · Required Analysis Questions</h4>
      <strong>Q1: Which algorithm gave better average waiting time?</strong><br>
      ${winWt === 'TIE'
        ? 'Equal on this workload.'
        : `<strong>${winLabel(winWt)}</strong> — RR: ${rr.avgWt.toFixed(2)}, PR: ${pr.avgWt.toFixed(2)}.`}
      <br><br>
      <strong>Q2: Which algorithm gave better average response time?</strong><br>
      ${winRt === 'TIE'
        ? 'Equal on this workload.'
        : `<strong>${winLabel(winRt)}</strong> — RR: ${rr.avgRt.toFixed(2)}, PR: ${pr.avgRt.toFixed(2)}.`}
      <br><br>
      <strong>Q3: Did higher-priority processes gain a significant advantage?</strong><br>
      ${urgencyBenefit
        ? 'Yes — high-priority processes completed with below-average waiting time.'
        : 'Partially — depends on burst length competition with other processes.'}
      <br><br>
      <strong>Q4: Did Round Robin appear more balanced across all processes?</strong><br>
      Yes — with quantum = ${quantum}, all processes received CPU time in rotation.
      No process was completely blocked by another.
      <br><br>
      <strong>Q5: Was starvation observed or likely in Priority Scheduling?</strong><br>
      ${starvRisk
        ? 'Yes — a low-priority process experienced disproportionately high waiting time.'
        : 'Not in this workload, but the structural risk exists with continuous high-priority arrivals.'}
    </div>

    <!-- ── CONCLUSION ── -->
    <div class="conclusion-box">
      <h4>✓ Conclusion</h4>
      <p>
        For this workload, <strong>${recommendation}</strong> performed better overall
        based on average WT, TAT, and RT.
        <br><br>
        <strong>Round Robin</strong> is the superior choice for
        <strong>time-sharing and interactive systems</strong> where fairness
        and guaranteed response time matter.
        All processes receive CPU time within at most one quantum cycle.
        Its main trade-off: higher average turnaround time when the quantum is
        poorly sized relative to burst lengths.
        <br><br>
        <strong>Priority Scheduling</strong> is better suited for
        <strong>real-time and mission-critical systems</strong> where certain
        tasks must be serviced urgently. It gives a decisive advantage to
        high-priority processes but risks
        <strong>starvation</strong> of low-priority ones —
        a risk that does not structurally exist in Round Robin.
        Aging techniques can be added to mitigate starvation.
        <br><br>
        The core trade-off is:
        <strong>Fairness (RR) vs Urgency (Priority)</strong>.
        For workloads with heterogeneous urgency, Priority Scheduling
        provides better treatment of critical processes.
        For balanced workloads, Round Robin is the fairer and more
        predictable choice.
      </p>
    </div>`;
}


const SCENARIOS = {
  A: {
    label:       'Scenario A — Basic Mixed Workload',
    description: 'A normal workload with multiple processes, different arrival times, and different burst times. Used to verify basic correctness of both algorithms.',
    quantum: 3,
    rule:    'low',
    processes: [
      { arrival: 0, burst: 8,  priority: 2 },
      { arrival: 1, burst: 4,  priority: 1 },
      { arrival: 2, burst: 9,  priority: 3 },
      { arrival: 3, burst: 5,  priority: 2 },
      { arrival: 4, burst: 2,  priority: 4 },
    ]
  },
  B: {
    label:       'Scenario B — Urgency Case',
    description: 'Includes a high-priority long process (P1) and a low-priority short process (P2). The two algorithms behave very differently: Priority serves P1 immediately; Round Robin interleaves fairly.',
    quantum: 4,
    rule:    'low',
    processes: [
      { arrival: 0, burst: 12, priority: 1 },
      { arrival: 0, burst: 3,  priority: 4 },
      { arrival: 2, burst: 5,  priority: 2 },
      { arrival: 3, burst: 2,  priority: 3 },
    ]
  },
  C: {
    label:       'Scenario C — Fairness Case',
    description: 'Processes with equal priority and similar burst times. Round Robin distributes CPU time evenly. Priority Scheduling behaves like FCFS here, showing little differentiation.',
    quantum: 2,
    rule:    'low',
    processes: [
      { arrival: 0, burst: 6, priority: 1 },
      { arrival: 0, burst: 6, priority: 1 },
      { arrival: 0, burst: 6, priority: 1 },
      { arrival: 1, burst: 4, priority: 1 },
    ]
  },
  D: {
    label:       'Scenario D — Starvation Risk',
    description: 'P5 has low priority (5) while P1–P4 all have priority 1. Priority Scheduling will keep preempting P5, demonstrating starvation risk. Round Robin serves P5 fairly regardless.',
    quantum: 3,
    rule:    'low',
    processes: [
      { arrival: 0, burst: 3,  priority: 1 },
      { arrival: 0, burst: 3,  priority: 1 },
      { arrival: 1, burst: 3,  priority: 1 },
      { arrival: 2, burst: 3,  priority: 1 },
      { arrival: 0, burst: 10, priority: 5 },
    ]
  },
  E: {
    label:       'Scenario E — Validation Test',
    description: 'Contains intentional invalid inputs: negative arrival time, negative burst time, invalid priority value, and an invalid quantum. The simulator must reject all of these.',
    quantum: -1,
    rule:    'low',
    processes: [
      { arrival: -2, burst: 5,  priority: 1 },
      { arrival: 0,  burst: -3, priority: 2 },
      { arrival: 0,  burst: 4,  priority: 0 },
    ]
  }
};

function loadScenario(key) {
  const s = SCENARIOS[key];

  document.querySelectorAll('.btn-scenario').forEach(b => b.classList.remove('active'));
  document.querySelector(`[onclick="loadScenario('${key}')"]`).classList.add('active');

  const descEl = document.getElementById('scenario-desc');
  descEl.style.display = 'block';
  descEl.innerHTML = `<strong>${s.label}</strong><br>${s.description}`;

 
  document.getElementById('quantum').value       = s.quantum;
  document.getElementById('priority-rule').value = s.rule;

  
  document.getElementById('process-list').innerHTML = '';
  pidCounter = 0;
  colorMap   = {};
  s.processes.forEach(p => addRow(p.arrival, p.burst, p.priority));

  startSimulation();
}


(function init() {
  loadScenario('A');
})();

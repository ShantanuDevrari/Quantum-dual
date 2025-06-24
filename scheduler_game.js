document.addEventListener('DOMContentLoaded', () => {
  const algorithm = localStorage.getItem('selectedAlgorithm') || 'FCFS';
  const processList = JSON.parse(localStorage.getItem('processList') || '[]');
  const quantumTime = parseInt(localStorage.getItem('quantumTime') || '2');

  if (processList.length === 0) {
    alert('No processes found! Please start from the Algorithm Selection.');
    window.location.href = 'scheduler_gui.html';
    return;
  }

  const TOTAL_QUESTIONS = 10;
  const BOT_SPEED = 2000; // ms per answer
  const BOT_MISTAKE_CHANCE = 0.3;

  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const playerFill = document.getElementById('player-fill');
  const botFill = document.getElementById('bot-fill');

  let questions = generateQuestions(processList, algorithm, quantumTime);
  let currentQuestionIndex = 0;
  let score = 0;
  let playerProgress = 0;
  let botProgress = 0;

  showCountdown(startGame);

  function showCountdown(callback) {
    let countdown = 3;
    questionEl.textContent = `Starting in ${countdown}...`;
    optionsEl.innerHTML = '';
    const interval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        questionEl.textContent = `Starting in ${countdown}...`;
      } else {
        clearInterval(interval);
        callback();
      }
    }, 1000);
  }

  function startGame() {
    showNextQuestion();
    startBot();
  }

  function showNextQuestion() {
    if (currentQuestionIndex >= TOTAL_QUESTIONS) {
      finishGame();
      return;
    }

    const q = questions[currentQuestionIndex];
    questionEl.textContent = q.text;
    optionsEl.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(opt, q.answer);
      optionsEl.appendChild(btn);
    });
  }

  function handleAnswer(selected, correct) {
    if (selected === correct) {
      score += 10;
      playerProgress += 100 / TOTAL_QUESTIONS;
    } else {
      score -= 2;
    }
    updateDisplay();
    currentQuestionIndex++;
    showNextQuestion();
  }

  function updateDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
    playerFill.style.height = `${playerProgress}%`;
  }

  function startBot() {
    const botInterval = setInterval(() => {
      if (currentQuestionIndex >= TOTAL_QUESTIONS && botProgress >= 100) {
        clearInterval(botInterval);
        return;
      }
      if (Math.random() > BOT_MISTAKE_CHANCE) {
        botProgress += 100 / TOTAL_QUESTIONS;
        botFill.style.height = `${botProgress}%`;
      }
    }, BOT_SPEED);
  }

  function finishGame() {
    const result = playerProgress >= botProgress ? 'You Won!' : 'Bot Won!';
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({
      algorithm: formatAlgorithmName(algorithm),
      result,
      score,
      date: new Date().toLocaleString(),
      processes: JSON.stringify(processList)
    });
    localStorage.setItem('scores', JSON.stringify(scores));
    window.location.href = 'scoreboard.html';
  }

  function formatAlgorithmName(algo) {
    switch (algo) {
      case 'FCFS': return 'First Come First Serve (FCFS)';
      case 'SJF': return 'Shortest Job First (SJF)';
      case 'Priority': return 'Priority Scheduling';
      case 'RR': return `Round Robin (RR) [Quantum=${quantumTime}]`;
      default: return algo;
    }
  }

  function calculateFCFS(processes) {
    let time = 0;
    const results = [];
    processes.sort((a, b) => a.arrival - b.arrival);
    processes.forEach(p => {
      const start = Math.max(time, p.arrival);
      const waiting = start - p.arrival;
      const turnaround = waiting + p.burst;
      time = start + p.burst;
      results.push({ ...p, waiting, turnaround });
    });
    return results;
  }

  function calculateSJF(processes) {
    const ready = [...processes];
    const results = [];
    let time = 0;
    while (ready.length > 0) {
      const available = ready.filter(p => p.arrival <= time);
      if (available.length === 0) {
        time++;
        continue;
      }
      available.sort((a, b) => a.burst - b.burst);
      const p = available[0];
      const start = Math.max(time, p.arrival);
      const waiting = start - p.arrival;
      const turnaround = waiting + p.burst;
      time = start + p.burst;
      results.push({ ...p, waiting, turnaround });
      ready.splice(ready.indexOf(p), 1);
    }
    return results;
  }

  function calculatePriority(processes) {
    const ready = [...processes];
    const results = [];
    let time = 0;
    while (ready.length > 0) {
      const available = ready.filter(p => p.arrival <= time);
      if (available.length === 0) {
        time++;
        continue;
      }
      available.sort((a, b) => a.priority - b.priority);
      const p = available[0];
      const start = Math.max(time, p.arrival);
      const waiting = start - p.arrival;
      const turnaround = waiting + p.burst;
      time = start + p.burst;
      results.push({ ...p, waiting, turnaround });
      ready.splice(ready.indexOf(p), 1);
    }
    return results;
  }

  function calculateRR(processes, quantum) {
    const ready = processes.map(p => ({ ...p, remaining: p.burst, completionTime: 0 }));
    const results = [];
    let time = 0;
    const queue = [];
    ready.sort((a, b) => a.arrival - b.arrival);
    let index = 0;

    while (results.length < processes.length) {
      while (index < ready.length && ready[index].arrival <= time) {
        queue.push(ready[index]);
        index++;
      }

      if (queue.length === 0) {
        time++;
        continue;
      }

      const p = queue.shift();
      const execTime = Math.min(quantum, p.remaining);
      p.remaining -= execTime;
      time += execTime;

      while (index < ready.length && ready[index].arrival <= time) {
        queue.push(ready[index]);
        index++;
      }

      if (p.remaining > 0) {
        queue.push(p);
      } else {
        p.completionTime = time;
        const turnaround = p.completionTime - p.arrival;
        const waiting = turnaround - p.burst;
        results.push({ id: p.id, burst: p.burst, arrival: p.arrival, priority: p.priority, waiting, turnaround });
      }
    }
    return results;
  }

  function generateQuestions(processes, algo, quantum) {
    const scheduled = algo === 'FCFS' ? calculateFCFS(processes)
                     : algo === 'SJF' ? calculateSJF(processes)
                     : algo === 'Priority' ? calculatePriority(processes)
                     : calculateRR(processes, quantum);

    const used = new Set();
    const questions = [];

    while (questions.length < TOTAL_QUESTIONS && used.size < scheduled.length * 4) {
      const p = scheduled[Math.floor(Math.random() * scheduled.length)];
      let text = '';
      let answer = '';
      let options = [];

      const type = Math.floor(Math.random() * 5);
      const key = `${p.id}-${type}`;
      if (used.has(key)) continue;
      used.add(key);

      if (type === 0) {
        text = `What is the burst time of ${p.id}?`;
        answer = p.burst.toString();
        options = shuffle([p.burst, p.burst + 1, Math.max(1, p.burst - 1)]).map(x => x.toString());
      } else if (type === 1) {
        text = `What is the waiting time of ${p.id}?`;
        answer = p.waiting.toString();
        options = shuffle([p.waiting, p.waiting + 1, Math.max(0, p.waiting - 1)]).map(x => x.toString());
      } else if (type === 2) {
        text = `What is the turnaround time of ${p.id}?`;
        answer = p.turnaround.toString();
        options = shuffle([p.turnaround, p.turnaround + 1, Math.max(0, p.turnaround - 1)]).map(x => x.toString());
      } else if (type === 3) {
        text = `What is the arrival time of ${p.id}?`;
        answer = p.arrival.toString();
        options = shuffle([p.arrival, p.arrival + 1, Math.max(0, p.arrival - 1)]).map(x => x.toString());
      } else {
        const isEarly = Math.random() > 0.5;
        text = `${p.id} has ${isEarly ? 'shorter' : 'longer'} burst than ${Math.floor(Math.random() * 10 + 1)}. True or False?`;
        answer = 'True';
        options = shuffle(['True', 'False']);
      }

      questions.push({ text, answer, options });
    }

    return questions;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
});

// scheduler_gui.js

document.addEventListener("DOMContentLoaded", () => {
  const algorithmButtons = document.querySelectorAll(".algorithm-sim");
  const selectedAlgoDisplay = document.getElementById("selected-algo");
  const inputSection = document.getElementById("input-section");
  const quantumInput = document.getElementById("quantum-time-input");
  const priorityHeader = document.getElementById("priority-header");
  const processTableContainer = document.getElementById("process-table-container");
  const processTableBody = document.querySelector("#process-table tbody");
  const generateTableBtn = document.getElementById("generate-table");
  let selectedAlgorithm = "";

  algorithmButtons.forEach(button => {
    button.addEventListener("click", () => {
      algorithmButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      selectedAlgorithm = button.getAttribute("data-algo");
      selectedAlgoDisplay.textContent = `Selected Algorithm: ${button.textContent}`;

      localStorage.setItem('selectedAlgorithm', selectedAlgorithm); // ✅ Save algorithm to localStorage here

      inputSection.style.display = "block";

      // Show quantum input only for RR
      if (selectedAlgorithm === "RR") {
        quantumInput.style.display = "block";
      } else {
        quantumInput.style.display = "none";
      }
    });
  });

  generateTableBtn.addEventListener("click", () => {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    if (isNaN(numProcesses) || numProcesses < 1 || numProcesses > 10) return;

    processTableBody.innerHTML = "";

    for (let i = 1; i <= numProcesses; i++) {
      const row = document.createElement("tr");

      const pidCell = document.createElement("td");
      pidCell.textContent = `P${i}`;
      row.appendChild(pidCell);

      const arrivalTimeCell = document.createElement("td");
      const arrivalInput = document.createElement("input");
      arrivalInput.type = "number";
      arrivalInput.min = "0";
      arrivalInput.classList.add("input-box");
      arrivalTimeCell.appendChild(arrivalInput);
      row.appendChild(arrivalTimeCell);

      const burstTimeCell = document.createElement("td");
      const burstInput = document.createElement("input");
      burstInput.type = "number";
      burstInput.min = "1";
      burstInput.classList.add("input-box");
      burstTimeCell.appendChild(burstInput);
      row.appendChild(burstTimeCell);

      if (selectedAlgorithm === "Priority") {
        priorityHeader.style.display = "table-cell";
        const priorityCell = document.createElement("td");
        const priorityInput = document.createElement("input");
        priorityInput.type = "number";
        priorityInput.min = "1";
        priorityInput.classList.add("input-box");
        priorityCell.appendChild(priorityInput);
        row.appendChild(priorityCell);
      } else {
        priorityHeader.style.display = "none";
      }

      processTableBody.appendChild(row);
    }

    processTableContainer.style.display = "block";
  });
});

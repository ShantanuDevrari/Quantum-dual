document.addEventListener("DOMContentLoaded", () => {
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  const scoreboardTable = document.getElementById("scoreboard-table");
  const resultHeading = document.getElementById("result-heading");
  const animationDiv = document.getElementById("result-animation");

  if (scores.length === 0) {
    scoreboardTable.innerHTML = "<tr><td colspan='4'>No scores yet.</td></tr>";
    return;
  }

  // Display latest result at the top with animation
  const latest = scores[scores.length - 1];
  displayResultAnimation(latest.result);

  scores.reverse().forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.algorithm}</td>
      <td>${entry.result}</td>
      <td>${entry.score}</td>
      <td>${entry.date}</td>
    `;
    scoreboardTable.appendChild(row);
  });

  function displayResultAnimation(result) {
    if (result === "You Won!") {
      resultHeading.textContent = "🎉 Congratulations! You Won!";
      animationDiv.classList.add("win-animation");
    } else {
      resultHeading.textContent = "😢 Better Luck Next Time...";
      animationDiv.classList.add("lose-animation");
    }
  }
});

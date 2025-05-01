const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const themeToggle = document.getElementById("theme-toggle");
const chartCanvas = document.getElementById('expense-chart');

const dailyBtn = document.getElementById("daily-btn");
const weeklyBtn = document.getElementById("weekly-btn");
const monthlyBtn = document.getElementById("monthly-btn");
const transactionTypeToggle = document.getElementById("transaction-type");
let isExpense = true;

transactionTypeToggle.addEventListener("click", () => {
  isExpense = !isExpense;
  transactionTypeToggle.textContent = isExpense ? "Expense" : "Income";
  transactionTypeToggle.classList.toggle("income", !isExpense);
});


let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chart;
let currentFilter = "daily"; // default

form.addEventListener('submit', addTransaction);
themeToggle.addEventListener('click', toggleTheme);
dailyBtn.addEventListener('click', () => setFilter("daily"));
weeklyBtn.addEventListener('click', () => setFilter("weekly"));
monthlyBtn.addEventListener('click', () => setFilter("monthly"));

function addTransaction(e) {
  e.preventDefault();
  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add text and amount');
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: isExpense ? -Math.abs(+amount.value) : Math.abs(+amount.value),
      date: new Date().toISOString()
    };
    transactions.push(transaction);
    updateLocalStorage();
    text.value = '';
    amount.value = '';
    Init();
  }
}


function generateID() {
  return Math.floor(Math.random() * 1000000000);
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "minus" : "plus");
  const date = new Date(transaction.date).toLocaleDateString();
  const formattedDate = currentFilter === "daily" ? "" : date;
  
  item.innerHTML = `
    <div>
      <strong>${transaction.text}</strong><br/>
      <small>${formattedDate}</small>
    </div>
    <span>${sign}₹${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
      💸
    </button>
  `;
  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts.filter(item => item > 0)
    .reduce((acc, item) => (acc += item), 0).toFixed(2);
  const expense = (
    amounts.filter(item => item < 0)
    .reduce((acc, item) => (acc += item), 0) * -1
  ).toFixed(2);

  balance.innerHTML = `₹${total}`;
  money_plus.innerHTML = `+₹${income}`;
  money_minus.innerHTML = `-₹${expense}`;
  updateChart(income, expense);
}

function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateLocalStorage();
  Init();
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function Init() {
  list.innerHTML = "";
  transactions.filter(filterTransactions).forEach(addTransactionDOM);
  updateValues();
}

function updateChart(income, expense) {
  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#2ecc71', '#e74c3c']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  themeToggle.textContent = document.body.classList.contains('dark-theme') ? "☀️" : "🌙";
}

function setFilter(filter) {
  currentFilter = filter;
  dailyBtn.classList.remove('active');
  weeklyBtn.classList.remove('active');
  monthlyBtn.classList.remove('active');
  if (filter === "daily") dailyBtn.classList.add('active');
  if (filter === "weekly") weeklyBtn.classList.add('active');
  if (filter === "monthly") monthlyBtn.classList.add('active');
  Init();
}

function filterTransactions(transaction) {
  const today = new Date();
  const txDate = new Date(transaction.date);

  if (currentFilter === "daily") {
    return today.toDateString() === txDate.toDateString();
  } else if (currentFilter === "weekly") {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return txDate >= weekStart;
  } else if (currentFilter === "monthly") {
    return today.getMonth() === txDate.getMonth();
  }
  return true;
}

Init();

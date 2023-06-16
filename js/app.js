"use strict";
let rows = 20;


function createTable(rows, cols) {
  let tableElement = document.createElement("table")
  tableElement.className = "table"
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
      const td = document.createElement("td");
      tr.appendChild(td)
    }
    tableElement.appendChild(tr)
  }

  document.body.querySelector(".game-wrapper").appendChild(tableElement)
}
createTable(rows, rows)
const table = document.querySelector(".table");


function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function randomPosition() {
  return [
    random(0, rows),
    random(0, rows),
  ];
}

function getElementByPosition(x, y) {
  return table.querySelectorAll("tr")[x].querySelectorAll("td")[y];
}

function addRandomCoin() {
  if (coinPosition) getElementByPosition(coinPosition[0], coinPosition[1]).classList.remove("coin")
  const position = randomPosition();
  const cell = getElementByPosition(position[0], position[1]);
  cell.classList.add("coin")
  return position;
}

const jahats = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
}

const initialDots = [
  [1, 0],
  [1, 1]
];

const snake = {}

snake.draw = function () {
  for (let b of document.querySelectorAll(".snake-body")) {
    b.classList.remove("snake-body")
  }
  if (document.querySelector(".snake-head")) document.querySelector(".snake-head").classList.remove("snake-head")
  for (let p of snake.dots) {
    let el = getElementByPosition(...p)
    el.classList.add("snake-body")
  }
  getElementByPosition(...snake.dots[snake.dots.length - 1]).classList.add("snake-head")
}

function tic() {
  let jv = jahats[jahat]
  let head = snake.dots[snake.dots.length - 1]

  let newHead = [
    head[0] + jv[0],
    head[1] + jv[1]
  ]

  if (newHead[0] >= rows) newHead[0] = 0;
  if (newHead[1] >= rows) newHead[1] = 0;

  if (newHead[0] < 0) newHead[0] = rows - 1;
  if (newHead[1] < 0) newHead[1] = rows - 1;

  //console.log(snake.dots.map(d => `[${String(d[0]).padStart(2, "0")},${String(d[1]).padStart(2, "0")}]`).join("-"))

  if (snake.dots.map(d => `[${d[0]}-${d[1]}]`).includes(`[${newHead[0]}-${newHead[1]}]`)) {
    displayMenu("start", { title: "باختی", subtitle: `امتیاز: ${score}` })
    gameOver = true
    stop()
  }

  if (gameOver) return

  snake.dots.push(newHead)
  head = newHead

  if (head[0] === coinPosition[0] && head[1] === coinPosition[1]) {
    coinPosition = addRandomCoin();
    score++
    document.querySelector(".score-container").textContent = score
  } else {
    snake.dots = snake.dots.slice(1)
  }
  snake.draw()
}

let coinPosition;
let initialJahat = "down";
let jahat = initialJahat;
let gameInterval;
let gameStoped = true;
let gameOver = true;
let speed = 100;
let score = 0;


function init() {
  document.addEventListener("keyup", (e) => {
    let x = {
      "ArrowRight": "right",
      "ArrowLeft": "left",
      "ArrowUp": "up",
      "ArrowDown": "down"
    }
    let newJahat = x[e.key];
    if (x[e.key]) setJahat(newJahat)

    if (e.key == "Escape") {
      if (gameStoped) {
        gameOver ? displayMenu("start") : (hideMenu() + start())
      } else {
        stop();
      }
    }
  })

  for (const btn of document.querySelectorAll("[data-onclick]")) {
    btn.addEventListener("click", () => {
      switch (btn.dataset.onclick) {
        case "restart":
          hideMenu()
          speed = btn.dataset.speed || speed
          restart()
          break;
        case "start":
          hideMenu()
          start()
          break;
        case "stop":
          stop();
          break;
        case "displayMenu":
          if (btn.dataset.menu === "start") gameOver = true
          displayMenu(btn.dataset.menu)
          break;
        default:
          break;
      }
    })
  }

  document.addEventListener("touchend", draggable.ontouchend)
  document.addEventListener("touchstart", draggable.ontouchstart)
  document.addEventListener("ontouchmove", draggable.ontouchmove)
  document.addEventListener("pointerup", draggable.ontouchend)
  document.addEventListener("pointerdown", draggable.ontouchstart)
  document.addEventListener("pointermove", draggable.ontouchmove)

  displayMenu("start")
}

function setJahat(newJahat) {
  let badJahats = {
    "up": "down",
    "down": "up",
    "left": "right",
    "right": "left"
  }

  if (jahats[newJahat] && badJahats[newJahat] != jahat) jahat = newJahat
}

function start() {
  hideMenu()
  document.body.classList.add("playing")
  gameInterval = setInterval(tic, speed)
  gameStoped = false
}
function stop() {
  clearInterval(gameInterval)
  gameStoped = true
  document.body.classList.remove("playing")
  if (!currentMenu && !gameOver) displayMenu("stop", { title: "توقف", subtitle: `امتیاز: ${score}` })
}
function restart() {
  stop()
  snake.dots = [...initialDots]
  jahat = initialJahat
  coinPosition = addRandomCoin()
  gameOver = false
  score = 0
  start()
}

//  draggable


let s = {}, //start
  t = {}; // transform
let draggable = {};
draggable.pointerDown = false;


draggable.ontouchstart = (e) => {
  let { x, y } = (e || { x: e.touches[0].clinetX, y: e.touches[0].clinetY })
  if (x && y) {
    draggable.pointerDown = true;
    s.y = y;
    s.x = x;
  }
};

draggable.ontouchend = () => {
  draggable.pointerDown = false;
};

draggable.ontouchmove = (e) => {
  if (!draggable.pointerDown) return;
  let newJahat;
  let { x, y } = (e || { x: e.touches[0].clinetX, y: e.touches[0].clinetY })
  if (x && y) {
    t.x = x - s.x;
    t.y = y - s.y;

    let horizontal = Math.abs(t.x) > Math.abs(t.y);
    if (horizontal) {
      newJahat = (t.x > 0) ? "right" : "left"
    } else {
      newJahat = (t.y > 0) ? "down" : "up"
    }
    setJahat(newJahat)
  }
};

let currentMenu;
function displayMenu(menu, data = {}) {
  if (menu === currentMenu) return
  let container = document.querySelector(".menu-container")
  let menus = Array.from(container.querySelectorAll(".game-menu"))
  let title = container.querySelector(".menu-title")
  let subtitle = container.querySelector(".menu-subtitle")
  container.classList.remove("hide")
  title.textContent = data.title || "بازی مارا"
  subtitle.textContent = data.subtitle || "بهترین بازی جهان"
  menus.forEach(m => {
    m.dataset.menu === menu ? m.classList.add("show") : m.classList.remove("show")
  })
  currentMenu = menu
  container.setAttribute("currentMenu", currentMenu)
}

function hideMenu() {
  currentMenu = undefined;
  document.querySelector(".menu-container").classList.add("hide")
}

init()
const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start")
const modal = document.querySelector(".modal")
const startGameModal = document.querySelector(".start-game")
const gameOverModal = document.querySelector(".game-over")
const restartButton = document.querySelector(".btn-restart")

const highScoreElement = document.querySelector("#high-score")
const scoreElement = document.querySelector("#score")
const timeElement = document.querySelector("#time")
const finalScoreElement = document.querySelector("#final-score")

const blockHeight = 50;
const blockWidth = 50;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00-00`;

highScoreElement.innerText = highScore;

const blocks = []; 
let snake = [
    {
        x: Math.floor(rows / 2),
        y: Math.floor(cols / 2)  
    },
]
let direction = "down"

let intervalId = null;
let timerIntervalId = null;

let food = generateFood();
let gameSpeed = 300;



// Board //
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement("div");
        block.classList.add("block");
        board.appendChild(block); 
        blocks[`${row}-${col}`] = block   
    }  
}

function generateFood(){
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * rows),  // row
            y: Math.floor(Math.random() * cols)   // col
        }

    } while (
        snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );

    return newFood;
}

function handleGameSpeed(){
    if (gameSpeed > 150) {

        gameSpeed -= 5;

        clearInterval(intervalId);

        intervalId = setInterval(() => {
            render();
        }, gameSpeed);  
    } 
}

function render(){

    let head = null;
    blocks[`${food.x}-${food.y}`].classList.add("food")

    // Snake movement logic

    if (direction === "left") {
        head = {x: snake[0].x, y: snake[0].y - 1}
    } else if (direction === "right") {
        head = {x: snake[0].x, y: snake[0].y + 1}
    } else if (direction === "down") {
        head = {x: snake[0].x + 1, y: snake[0].y}
    } else if (direction === "up") {
        head = {x: snake[0].x - 1, y: snake[0].y}
    }
    
    // Wall collision logic
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalId)
        clearInterval(timerIntervalId)

        modal.style.display = "flex";
        startGameModal.style.display = "none"
        gameOverModal.style.display = "flex"
        finalScoreElement.innerText = score;

        return;
    }

    // Snake itself Collision
    const isCollideWithBody = snake.some(segment => {
        return segment.x === head.x && segment.y === head.y;
    })

    if (isCollideWithBody) {
        clearInterval(intervalId);
        clearInterval(timerIntervalId)

        modal.style.display = "flex";
        startGameModal.style.display = "none"
        gameOverModal.style.display = "flex"
        finalScoreElement.innerText = score;

        return
    }

    // Food consume logic 
    let isEatFood = false;
    if (head.x == food.x && head.y == food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        food = generateFood();
        blocks[`${food.x}-${food.y}`].classList.add("food");

        isEatFood = true;

        score += 10;
        scoreElement.innerText = score;

        handleGameSpeed();

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore.toString())
        }

    }


    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill", "head-fill")
    }) 

    snake.unshift(head);
       // unshift() is used to add one or more elements to the beginning of an array.
    if (!isEatFood) {
        snake.pop();          // removes the tail of the snake after adding a new head, which creates the movement effect.
    }
    

    snake.forEach((segment, index) => {
        if (index === 0) {
            blocks[`${segment.x}-${segment.y}`].classList.add("head-fill")
        } else {
            blocks[`${segment.x}-${segment.y}`].classList.add("fill")
        }

    })
}


startButton.addEventListener("click", (e) => {
    modal.style.display = "none";

    intervalId = setInterval(() => {
        render();
    }, gameSpeed)

    timerIntervalId = setInterval(() => {
        let [ min, sec] = time.split("-").map(Number);

        if (sec == 59) {
            min += 1;
            sec = 0;
        } else {
            sec += 1;
        }

        time = `${min}-${sec}`
        timeElement.innerText = time;

    }, 1000)

})

restartButton.addEventListener("click", restartGame)

function restartGame() {
    clearInterval(intervalId);
    clearInterval(timerIntervalId)

    gameSpeed = 300;

    // Update score
    score = 0;
    time = `00-00`
    scoreElement.innerText = score;
    timeElement.innerText = time;
    highScoreElement.innerText = highScore;

    blocks[`${food.x}-${food.y}`].classList.remove("food");
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill", "head-fill")
    })
    
    direction = "down"
    modal.style.display = "none";
    snake = [{
        x: Math.floor(rows / 2),
        y: Math.floor(cols / 2)  
    }]
    food = generateFood();
 
    intervalId = setInterval(() => {
        render()
    }, gameSpeed)

    timerIntervalId = setInterval(() => {
        let [ min, sec] = time.split("-").map(Number);

        if (sec == 59) {
            min += 1;
            sec = 0;
        } else {
            sec += 1;
        }

        time = `${min}-${sec}`
        timeElement.innerText = time;

    }, 1000)
 
}

addEventListener("keydown", (event) => {
    if (event.key == "ArrowUp" && direction !== "down") {
        direction = "up";
    } else if (event.key == "ArrowRight" && direction !== "left") {
        direction = "right";
    } else if (event.key == "ArrowLeft" && direction !== "right") {
        direction = "left";
    } else if (event.key == "ArrowDown" && direction !== "up") {
        direction = "down";
    }
    
})
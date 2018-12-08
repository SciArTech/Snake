//有关地图的信息和操作
var map = {
    element : null,

    food : {
        element : null,
        set : function() {
            div = map.food.element = document.createElement("div");
            div.classList.add("food");
            div.style.width = snake.SIZE + "px";
            div.style.height = snake.SIZE + "px";
            var posX, posY;
            do {
                posX = Math.floor(Math.random() * map.WIDTH) * snake.SIZE;
                posY = Math.floor(Math.random() * map.HEIGHT) * snake.SIZE;
            } while (snake.hasItem(posX, posY));
            div.style.left = posX + "px";
            div.style.top = posY + "px";
            map.element.appendChild(div);
        },
        clean : function() {
            if (map.food.element) {
                map.food.element.classList.remove("food");
                map.element.removeChild(map.food.element);
                map.food.element = null;
            }
        }
    },
    WIDTH : 40,
    HEIGHT : 40
};

//蛇的对象
var snake = {
    snakeBody : [],

    state : "stopping", // stopping or walking
    
    prepareSnake : function() {
        //清空蛇
        for (var i = 0; i < snake.snakeBody.length; i++) {
            map.element.removeChild(snake.snakeBody[i]);
        }
        snake.snakeBody = [];
        //生成蛇
        for (var i = 0; i < 3; i++) {
            var item = snake.snakeBody[i] = document.createElement("div");
            item.classList.add("snake-item");
            item.style.width = snake.SIZE + "px";
            item.style.height = snake.SIZE + "px";
            //确定蛇的初始位置
            item.style.top = 5 * snake.SIZE + "px";
            item.style.left = (4 - i) * snake.SIZE + "px";
            map.element.appendChild(item);            
        }    
        snake.snakeBody[0].classList.add("snake-head");

        snake.dirNow = snake.dir;
        snake.dir = snake.DIR_RIGHT;
    },
    moveSnake : function() {
        var headX = parseInt(snake.snakeBody[0].style.left);
        var headY = parseInt(snake.snakeBody[0].style.top);
        var newHeadX, newHeadY;
        switch (snake.dir) {
            case snake.DIR_UP:
                newHeadX = headX;
                newHeadY = headY - snake.SIZE;
                break;
            case snake.DIR_RIGHT:
                newHeadX = headX + snake.SIZE;
                newHeadY = headY;
                break;
            case snake.DIR_DOWN:
                newHeadX = headX;
                newHeadY = headY + snake.SIZE;
                break;
            case snake.DIR_LEFT:
                newHeadX = headX - snake.SIZE;
                newHeadY = headY;
                break;
        }
        result = snake.check(newHeadX, newHeadY);
        
        if (snake.state === "walking") {
            switch (result) {
                case 1:
                    //处理食物
                    map.food.clean();
                    map.food.set();
                    score.firstChild.nodeValue++;
                case 0:
                    //删除尾部
                    if (result === 0) { //如果吃到了食物就不删除尾部
                        var deletedItem = snake.snakeBody.pop();
                        map.element.removeChild(deletedItem);
                    }
                    //添加头部
                    var newItem = document.createElement("div");
                    newItem.classList.add("snake-item");
                    newItem.style.width = snake.SIZE + "px";
                    newItem.style.height = snake.SIZE + "px";
                    newItem.style.top = newHeadY + "px";
                    newItem.style.left = newHeadX + "px";
                    snake.snakeBody[0].classList.remove("snake-head");
                    newItem.classList.add("snake-head");
                    snake.snakeBody.unshift(newItem);
                    map.element.appendChild(newItem);
                    snake.dirNow = snake.dir;
            
                    setTimeout(snake.moveSnake, snake.SPEED);
                    break;
                case 2:
                case 3:
                    snake.state = "stopping";
                    removeOperation();
                    pause.removeEventListener("click", pauseHandler, false);
                    document.removeEventListener("keydown", pauseBySpaceHandler, false);                    
                    pause.style.display = "none";
                    replay.style.display = "block";
                    replay.addEventListener("click", replayHandler, false);            
                    break;
            }
        }
    },
    check : function(posX, posY) {
        if (posX < 0 || posX === parseInt(map.element.style.width) || posY < 0 || posY === parseInt(map.element.style.height)) {
            return 3; //撞墙
        } else if (snake.hasItem(posX, posY)) {
            return 2; //吃到自己
        } else if (map.food.element && posX === parseInt(map.food.element.style.left) && posY === parseInt(map.food.element.style.top)) {
            return 1; //吃到食物
        } else {
            return 0;
        }
    },
    //如果蛇有给定坐标的节点，返回true
    hasItem : function(posX, posY) {
        return snake.snakeBody.some(function(item, index, array) {
            return parseInt(item.style.left) === posX && parseInt(item.style.top) === posY; 
        });
    },
    dir : -1, //下一步的方向
    dirNow : -1, //刚更改方向还没行走时保存蛇的当前方向

    DIR_UP : 1,
    DIR_RIGHT : 2,
    DIR_DOWN : 3,
    DIR_LEFT : 4,
    SIZE : 15,
    SPEED : 150
};

//进行游戏初始化
function prepareGame() {
    map.element.style.width = map.WIDTH * snake.SIZE + "px";
    map.element.style.height = map.HEIGHT * snake.SIZE + "px";
    map.food.clean();
    snake.prepareSnake();
    score.firstChild.nodeValue = "0";
}

var replayHandler = function() {
    prepareGame();
    pause.addEventListener("click", pauseHandler, false);
    document.addEventListener("keydown", pauseBySpaceHandler, false);    
    pause.style.display = "block";
    pause.style.backgroundImage = "url(./images/icons/start.png)";
}

var pauseHandler = function() {
    var replay = document.getElementById("replay");

    if (snake.state === "stopping") {
        snake.state = "walking";
        snake.moveSnake();
        if (!map.food.element) {
            map.food.set();
        }
        addOperation();
        replay.style.display = "none";
        replay.removeEventListener("click", replayHandler, false);
        pause.style.backgroundImage = "url(./images/icons/pause.png)";
    } else {
        snake.state = "stopping";
        removeOperation();
        replay.style.display = "block";
        replay.addEventListener("click", replayHandler, false);
        pause.style.backgroundImage = "url(./images/icons/start.png)";
    }
}

var pauseBySpaceHandler = function(event) {
    if (event.keyCode === 32) {
        pauseHandler();
    }
}

var operationHandler = function(event) {
    switch (event.keyCode) {
        case 38:
        case 87:
            if (snake.dirNow !== snake.DIR_DOWN) {
                snake.dirNow = snake.dir;
                snake.dir = snake.DIR_UP;
            }
            break;
        case 39:
        case 68:
            if (snake.dirNow !== snake.DIR_LEFT) {
                snake.dirNow = snake.dir;
                snake.dir = snake.DIR_RIGHT;
            }
            break;
        case 40:
        case 83:
            if (snake.dirNow !== snake.DIR_UP) {
                snake.dirNow = snake.dir;
                snake.dir = snake.DIR_DOWN;
            }
            break;
        case 37:
        case 65:
            if (snake.dirNow !== snake.DIR_RIGHT) {
                snake.dirNow = snake.dir;
                snake.dir = snake.DIR_LEFT;
            }
            break;
    }
    switch (this.id) {
        case "dir-up":
            if (snake.dirNow !== snake.DIR_DOWN) {
                snake.dirNow = snake.dir;
                snake.dir = snake.DIR_UP;
            }
            break;
        case "dir-right":
            if (snake.dirNow !== snake.DIR_LEFT) {
                snake.dirNow = snake.dir;
                snake.dir = snake.DIR_RIGHT;
            }
            break;
        case "dir-down":
            if (snake.dirNow !== snake.DIR_UP) {
                snake.dirNow = snake.dir;
                snake.dir = snake.DIR_DOWN;
            }
            break;
        case "dir-left":
            if (snake.dirNow !== snake.DIR_RIGHT) {
                snake.dirNow = snake.dir;
                snake.dir = snake.DIR_LEFT;
            }
            break;
    }
}

var loadHandler = function() {
    map.element = document.getElementById("map");
    score = document.getElementById("score");    
    prepareGame();
    
    pause = document.getElementById("pause");
    pause.addEventListener("click", pauseHandler, false);
    document.addEventListener("keydown", pauseBySpaceHandler, false);

    var boardBtn = document.getElementsByClassName("board-btn");
    for (var i = 0, len = boardBtn.length; i < len; i++) {
        boardBtn[i].addEventListener("click", function() {
            var elem = document.getElementById(this.id + "-board");
            var game = document.getElementById("game");
            elem.classList.toggle("show");
            if (document.getElementsByClassName("show").length === 0) {
                game.classList.remove("change");
            } else {
                game.classList.add("change");
            }
        }, false);
    }
};
window.addEventListener("load", loadHandler, false);

//添加控制方向事件
function addOperation() {
    document.addEventListener("keydown", operationHandler, false);

    var dirBtn = document.getElementsByClassName("dir");
    for (var i = 0, len = dirBtn.length; i < len; i++) {
        dirBtn[i].addEventListener("click", operationHandler, false);
    }
}
//移除控制方向事件
function removeOperation() {
    document.removeEventListener("keydown", operationHandler, false);

    var dirBtn = document.getElementsByClassName("dir");
    for (var i = 0, len = dirBtn.length; i < len; i++) {
        dirBtn[i].removeEventListener("click", operationHandler, false);
    }
}


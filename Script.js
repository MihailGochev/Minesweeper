var minesweeper = function () {
    var gameFieldWidth;
    var gameFieldHeight;
    var gameFieldContainer;
    var gameFieldContainerWidth;
    var gameFieldContainerHeight;
    var bombCount;
    var innerFieldsClicked = 0;
    var innerFieldSize = 30;
    var firstClick;
    var gameOver;

    var startGame = function () {
        gameOver = false;
        firstClick = true;
        gameFieldContainerWidth = innerFieldSize * gameFieldWidth + "px";
        gameFieldContainerHeight = innerFieldSize * gameFieldHeight + "px";
        gameFieldContainer = document.getElementById("gamefield");
        gameFieldContainer.style.width = gameFieldContainerWidth;
        gameFieldContainer.style.height = gameFieldContainerHeight;

        //Generating the game field child elements
        gameField = new Array(gameFieldWidth);
        var gameFieldContent = "";
        for (var row = 0; row < gameFieldHeight; row++) {
            gameField[row] = new Array(gameFieldWidth);
            for (var col = 0; col < gameFieldWidth; col++) {
                gameField[row][col] = 0;
                gameFieldContent += "<div id='" + row + "_" + col + "'></div>";
            }
        }
        gameFieldContainer.innerHTML = gameFieldContent;

        //Placing the bombs on random coordinates
        var currentBombs = 0;
        while (currentBombs < bombCount) {
            row = Math.floor((Math.random() * gameFieldHeight));
            col = Math.floor((Math.random() * gameFieldWidth));
            if (gameField[row][col] == 0) {
                gameField[row][col] = 10;
                currentBombs++;
            }
        }

        //Calculating the values of the fields
        for (row = 0; row < gameFieldHeight; row++) {
            for (col = 0; col < gameFieldWidth; col++) {
                if (gameField[row][col] != 10) {
                    gameField[row][col] = checkNeighbours(row, col);
                }
            }
        }

        //Assigning click events
        var innerBoxes = gameFieldContainer.childNodes;
        for (row = 0; row < innerBoxes.length; row++) {
            innerBoxes[row].onclick = rightClickEvent;
            innerBoxes[row].oncontextmenu = leftClickEvent;
        }
    }

    var rightClickEvent = function () {
        if (gameOver) {
            return;
        }

        var field = this;

        if (field.className == "question" || field.className == "flag" || field.className == "clicked") {
            return;
        }

        var coordinates = field.id.split("_");
        var currentRow = parseInt(coordinates[0]);
        var currentCol = parseInt(coordinates[1]);
        var fieldValue = gameField[currentRow][currentCol];

        //Prevents finding a bomb on first click
        if (firstClick && fieldValue == 10) {
            firstClickSaver(currentRow, currentCol);
            fieldValue = gameField[currentRow][currentCol];
        }
        firstClick = false;


        if (fieldValue == 10) { //Bomb: losing the game
            field.className = "bomb";
            document.getElementById("gameEnd").innerHTML = "You have lost!";
            document.getElementById("gameover").style.display = "block";
            gameOver = true;
            detonateBombs();
            document.getElementById("gameover").style.top = ((parseInt(gameFieldContainerHeight) + 50) / 2) * -1 + "px";
        } else if (fieldValue > 0) { //the field is empty and has a bomb around it
            field.className = "clicked";
            field.innerHTML = fieldValue;
            field.style.color = setTextColor(fieldValue);
            innerFieldsClicked++;
            if (innerFieldsClicked == (gameFieldWidth * gameFieldHeight - bombCount)) { //all the empty fields are oppened: winning the game
                document.getElementById("gameEnd").innerHTML = "You won!";
                document.getElementById("gameover").style.display = "block";
                document.getElementById("gameover").style.top = ((parseInt(gameFieldContainerHeight) + 50) / 2) * -1 + "px";
                gameOver = true;
            }
        } else { //the field is empty and has no bombs around it
            openEmptyNeighbours(currentRow, currentCol);
        }
    }

    var leftClickEvent = function () {
        if (gameOver) {
            return;
        }

        var field = this;

        if (field.className == "flag") {
            field.className = "question";
        } else if (field.className == "question") {
            field.className = "";
        } else if (field.className != "clicked" && field.className != "bomb") {
            field.className = "flag";
        }

        return false;
    }

    var firstClickSaver = function (row, col) {
        var savedRow = row;
        var savedCol = col;
        gameField[row][col] = checkNeighbours(row, col);

        var bombReplaced = false;
        while (!bombReplaced) {
            var row = Math.floor((Math.random() * gameFieldHeight));
            var col = Math.floor((Math.random() * gameFieldWidth));
            if (gameField[row][col] != 10 && (row != savedRow || col != savedCol)) {
                gameField[row][col] = 10;
                bombReplaced = true;
            }
        }

        for (row = 0; row < gameFieldHeight; row++) {
            for (col = 0; col < gameFieldWidth; col++) {
                if (gameField[row][col] != 10) {
                    gameField[row][col] = checkNeighbours(row, col);
                }
            }
        }
    }

    var checkNeighbours = function (row, col) {
        //counts all the bombs around the field at the given coordinates
        var result = 0;
        result += isBomb(row, col + 1);
        result += isBomb(row - 1, col + 1);
        result += isBomb(row + 1, col + 1);
        result += isBomb(row, col - 1);
        result += isBomb(row - 1, col - 1);
        result += isBomb(row + 1, col - 1);
        result += isBomb(row - 1, col);
        result += isBomb(row + 1, col);
        return result;
    }

    var openEmptyNeighbours = function (row, col) {
        if (row < 0 || col < 0 || col >= gameFieldWidth || row >= gameFieldHeight) { //invalid coordinates: returning
            return;
        } else if (gameField[row][col] == 10) {//the field is a bomb: returning
            return;
        } else {
            var field = document.getElementById(row + "_" + col);
            if (field.className == "clicked") { //the field is already oppened: returning
                return;
            }
            field.className = "clicked";
            innerFieldsClicked++;
            if (innerFieldsClicked == (gameFieldWidth * gameFieldHeight - bombCount)) { //all the empty fields are oppened: winning the game
                document.getElementById("gameEnd").innerHTML = "You won!";
                document.getElementById("gameover").style.display = "block";
                document.getElementById("gameover").style.top = ((parseInt(gameFieldContainerHeight) + 50) / 2) * -1 + "px";
                gameOver = true;
            }

            if (gameField[row][col] > 0) { //the field has bombs around it: oppening it and giving it proper color
                field.innerHTML = gameField[row][col];
                field.style.color = setTextColor(gameField[row][col]);

            } else if (gameField[row][col] == 0) { //the field has no bombs around it: calling the function recursively for all neighbours
                openEmptyNeighbours(row, col + 1);
                openEmptyNeighbours(row - 1, col + 1);
                openEmptyNeighbours(row + 1, col + 1);
                openEmptyNeighbours(row, col - 1);
                openEmptyNeighbours(row - 1, col - 1);
                openEmptyNeighbours(row + 1, col - 1);
                openEmptyNeighbours(row - 1, col);
                openEmptyNeighbours(row + 1, col);
            }
        }
    }

    var isBomb = function (row, col) { //checking if the field at the given coordinates is a bomb
        if (row >= 0 && col >= 0 && col < gameFieldWidth && row < gameFieldHeight && gameField[row][col] == 10) {
            return 1;
        } else {
            return 0;
        }
    }

    var setTextColor = function (value) { //setting text color for the oppened blocks
        switch (value) {
            case 1:
                return "#189400";
            case 2:
                return "#005ead";
            case 3:
                return "#9f7e00";
            case 4:
                return "#973800";
            default:
                return "#d10000";
        }
    }

    var detonateBombs = function () { //detonating all bombs at the end of the game
        for (row = 0; row < gameFieldHeight; row++) {
            for (col = 0; col < gameFieldWidth; col++) {
                if (gameField[row][col] == 10) {
                    document.getElementById(row + "_" + col).className = "bomb";
                }
            }
        }
    }

    var restartGame = function () {
        document.getElementById("startgame").style.display = "block";
        document.getElementById("gamefield").innerHTML = "";
        document.getElementById("gameover").style.display = "none";
        minesweeper();
    }

    document.getElementById("playagain").onclick = restartGame;

    //starting the game on easy difficulty
    document.getElementById("easy").onclick = function () {
        document.getElementById("startgame").style.display = "none";
        gameFieldWidth = 10;
        gameFieldHeight = 10;
        bombCount = 12;
        startGame();
    }

    //starting the game on medium difficulty
    document.getElementById("medium").onclick = function () {
        document.getElementById("startgame").style.display = "none";
        gameFieldWidth = 20;
        gameFieldHeight = 15;
        bombCount = 40;
        startGame();
    }

    //starting the game on hard difficulty
    document.getElementById("hard").onclick = function () {
        document.getElementById("startgame").style.display = "none";
        gameFieldWidth = 35;
        gameFieldHeight = 20;
        bombCount = 150;
        startGame();
    }

    document.getElementById("custom").onclick = function () {
        //TODO
    }
}

minesweeper();
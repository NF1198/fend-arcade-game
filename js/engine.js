/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 *
 * The game state is made globally available via the Engine variable.
 * See declaration of gameState below.
 *
 * ex: Engine.lives refers to the number of lives left (from the global context).
 *
 * Within the Engine function, refer to the state directly via the gameState variable.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     * The background canvas is used to pre-render the game background.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        bgcanvas = doc.createElement('canvas'),
        bgctx = bgcanvas.getContext('2d'),
        bgDrawn = false,
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    bgcanvas.width = canvas.width;
    bgcanvas.height = canvas.height;
    ctx.imageSmoothingEnabled = false;
    doc.body.appendChild(canvas);

    var gameState = {
        lives: 3,
        score: 0,
        bonusLives: 0,
        bonusScore: 0,
        bonusMultiplier: 0
    };

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get time delta information
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        if (dt >= 1.0 / 90) {
            update(dt);
            render();

            /* Set our lastTime variable which is used to determine the time delta
             * for the next time this function is called.
             */
            lastTime = now;

            /* Use the browser's requestAnimationFrame function to call this
             * function again as soon as the browser is able to draw another frame.
             */
        }
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        document.addEventListener('keyup', function(e) {
            switch (e.keyCode) {
                case 32: // space
                    reset();
                    break;
                default:
            }
        });
        reset();
        lastTime = Date.now();
        main();
    }

    /*
     * This function checks collisions between the various game elements.
     */
    function checkCollisions() {

        // check collisions beteen player and extras
        allExtras.forEach(function(extra) {
            if (extra.active && player.active && player.intersects(extra, 0, 50)) {
                extra.kind.callback();
                extra.active = false;
            }
        });

        // check collisions between bugs
        for (var i = 0; i < allEnemies.length; i++) {
            var enemyI = allEnemies[i];
            if (enemyI.active) {
                for (var j = i + 1; j < allEnemies.length; j++) {
                    if (i !== j) {
                        var enemyJ = allEnemies[j];
                        if (enemyJ.active && enemyI.intersects(enemyJ, 0, 5)) {
                            enemyI.swapSpeeds(enemyJ);
                        }
                    }
                }
            }
        }

        // check collisions beteen player and bugs
        allEnemies.forEach(function(enemy) {
            if (enemy.active && player.active && player.intersects(enemy, 15, 30)) {
                Engine.lives += -1;
                player.active = false;
                if (Engine.lives > 0) {
                    player.reset();
                }
            }
        });
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data.
     */
    function update(dt) {
        if (Engine.lives > 0) {
            updateEntities(dt);
            checkCollisions();
        }
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allExtras.forEach(function(extra) {
            extra.update(dt);
        });
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update(dt);
    }

    /*
     * This function renders all elements of the game
     */
    function render() {
        renderBackground();
        renderEntities();
        renderStats();
        renderMenu();
    }

    /*
     * This fuction renders the background image.
     * The rendered background image is cached to reduce CPU load
     */
    function renderBackground() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        if (!bgDrawn) {
            var rowImages = [
                    'water-block', // Top row is water
                    'stone-block', // Row 1 of 3 of stone
                    'stone-block', // Row 2 of 3 of stone
                    'stone-block', // Row 3 of 3 of stone
                    'grass-block', // Row 1 of 2 of grass
                    'grass-block' // Row 2 of 2 of grass
                ],
                numRows = 6,
                numCols = 5,
                row, col;

            /* Loop through the number of rows and columns we've defined above
             * and, using the rowImages array, draw the correct image for that
             * portion of the "grid"
             */
            bgDrawn = true;
            for (row = 0; row < numRows; row++) {
                var sprite = Resources.getSprite(rowImages[row]);
                if (sprite) {
                    for (col = 0; col < numCols; col++) {
                        bgctx.drawImage(sprite.img, sprite.srcx, sprite.srcy, sprite.width, sprite.height, col * 101, row * 83, sprite.width, sprite.height);
                    }
                } else {
                    bgDrawn = false;
                }
            }
        }
        ctx.drawImage(bgcanvas, 0, 0);
    }

    /*
     * This function renders all dynamic entities in the scene.
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allExtras.forEach(function(extra) {
            extra.render();
        });
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        player.render();
    }

    /*
     * This function renders the game stats at the top of the screen
     */
    function renderStats() {
        ctx.font = "25px Arial";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, 40);
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText("Score: " + gameState.score, 10, 35);
        ctx.textAlign = "right";
        ctx.fillText("Lives: " + gameState.lives, canvas.width - 10, 35);
        if (gameState.bonusScore > 0 || gameState.bonusLives > 0 || gameState.bonusMultiplier > 0) {
            ctx.fillStyle = "blue";
            ctx.textAlign = "center";
            ctx.fillText("Bonus: " + gameState.bonusScore + "x" + gameState.bonusMultiplier + " (" + gameState.bonusLives + ")", canvas.width / 2, 35);
        }
    }

    /*
     * This fuction renders the "game over" menu
     */
    function renderMenu() {
        if (Engine.lives <= 0) {
            ctx.fillStyle = "gray";
            var width = canvas.width * 0.8;
            var height = 120;
            var x = (canvas.width - width) * 0.5;
            var y = (canvas.height - height) * 0.5;
            ctx.fillRect(x, y, width, height);
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.fillText("Game Over!", canvas.width * 0.5, canvas.height * 0.5 - 10);
            ctx.fillText("Press space to restart", canvas.width * 0.5, canvas.height * 0.5 + 30);
        }
    }

    /*
     * This function resets the game.
     */
    function reset() {
        allEnemies.forEach(function(enemy) {
            enemy.reset();
        });
        player.reset();
        gameState.score = 0;
        gameState.lives = 3;
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.onReady(init);
    Resources.load();


    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    return gameState;
})(this);

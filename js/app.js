/* app.js
 * This file defines most of the game logic. All dynamic
 * entities are derived from the GameObject class.
 *
 * Entities:
 *  - GameObject (base class for other entities)
 *  - Enemy      (things that kill the player)
 *  - Player     (the user-controlled player)
 *  - Extra      (extra bonus items)
 */

// Prototype for all dynamic game objects
var GameObject = function(width, height) {
    this.sprite = false;
    this.speed = 0;
    this.x = 0;
    this.y = 0;
    this.height = height;
    this.width = width;
    this.active = true;
};

// define some constants
GameObject.prototype.PX_PER_COL = 100;
GameObject.prototype.PX_PER_ROW = 83;
GameObject.prototype.NUM_ROWS = 6;
GameObject.prototype.NUM_COLS = 5;

// prototype for update function;
GameObject.prototype.update = function(dt) {};

// Draw the enemy on the screen, required method for game
GameObject.prototype.render = function() {
    if (this.active && this.sprite) {
        ctx.drawImage(this.sprite.img,
            this.sprite.srcx, this.sprite.srcy,
            this.sprite.width, this.sprite.height,
            this.x, this.y, this.sprite.width, this.sprite.height);
    }
};

// collision detection along x and y-axes.
GameObject.prototype.intersects = function(gameObject, xGive, yGive) {
    if (this === gameObject) {
        console.log("attempting to intersect self");
    }
    return (this.x < (gameObject.x + gameObject.width - xGive) &&
        (this.x + this.width - xGive) > gameObject.x &&
        this.y < (gameObject.y + gameObject.height - yGive) &&
        (this.height + this.y - yGive) > gameObject.y);
};

// Enemies our player must avoid
var Enemy = function() {
    GameObject.call(this, 0, 0);
    this.reset();
};
Enemy.prototype = Object.create(GameObject.prototype);
Enemy.prototype.constructor = Enemy;

// constant to offset enemy height
Enemy.prototype.ROW_PX_OFFSET = 59;

// This function resets the enemy.
Enemy.prototype.reset = function() {
    // constants related to our game
    this.sprite = Resources.getSprite('enemy-bug');
    this.width = this.sprite.width;
    this.height = this.sprite.height;
    this.speed = Util.randomFloat(0.5, 2.0) * this.PX_PER_COL; // (cols per second) * (px per column) = (px per second)
    this.y = Util.randomInt(1, 3) * this.PX_PER_ROW + this.ROW_PX_OFFSET;
    this.x = Util.randomInt(-5 * this.PX_PER_COL, -this.PX_PER_COL); // start off of screen
};

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (this.active) {
        var numCols = 5;

        this.x += dt * this.speed;
        if (this.x > this.PX_PER_COL * numCols) {
            this.reset();
        }
    }
};

// This function is swaps speeds of two enemies (used for collision dynamics)
Enemy.prototype.swapSpeeds = function(enemy) {
    var fasterObj = (this.speed > enemy.speed) ? this : enemy;
    var slowerObj = (this.speed > enemy.speed) ? enemy : this;
    if (fasterObj.x < slowerObj.x) {
        var oldSpeed = this.speed;
        this.speed = enemy.speed;
        enemy.speed = oldSpeed;
    } else {
        fasterObj.speed *= 1.0375;
    }
};

// Player class
var Player = function() {
    GameObject.call(this, 0, 0);
    this.reset();
};
Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;

// define some constants for Player
Player.prototype.PLAYER_SPRITES = ['char-boy', 'char-cat-girl', 'char-horn-girl', 'char-pink-girl', 'char-princess-girl'];
Player.prototype.Y_OFFSET = 30;

// This function resets the player.
Player.prototype.reset = function() {
    this.sprite = Resources.getSprite(this.PLAYER_SPRITES[Util.randomInt(0, this.PLAYER_SPRITES.length - 1)]);
    this.width = this.sprite.width;
    this.height = this.sprite.height;
    this.row = 5;
    this.col = Util.randomInt(0, 4);
    this.active = true;
};

// This function updates the player state.
// Parameter: dt, a time delta between ticks
Player.prototype.update = function(ms) {
    if (this.row <= 0) {
        var bonus = Engine.bonusScore * Engine.bonusMultiplier;
        var plusLives = Engine.bonusLives;
        Engine.bonusScore = 0;
        Engine.bonusMultiplier = 0;
        Engine.bonusLives = 0;
        Engine.score += bonus + 1;
        Engine.lives += plusLives;
        return this.reset();
    } else if (this.row > 3) {
        Engine.bonusScore = 0;
        Engine.bonusMultiplier = 0;
        Engine.bonusLives = 0;
    }
    this.x = this.PX_PER_COL * (this.col + 0.5) - this.width * 0.5 + 4;
    this.y = this.PX_PER_ROW * (this.row + 0.5) - this.height * 0.5 + this.Y_OFFSET;
};

// This function handles user input
// Parameter: key, the keyCode to handle
Player.prototype.handleInput = function(key) {
    switch (key) {
        case 37: //left
            this.col += (this.col > 0) ? -1 : 0;
            break;
        case 39: //right
            this.col += (this.col < this.NUM_COLS - 1) ? 1 : 0;
            break;
        case 38: //up
            this.row += (this.row > 0) ? -1 : 0;
            break;
        case 40: //down
            this.row += (this.row < this.NUM_ROWS - 1) ? 1 : 0;
            break;
        default:
    }
};

// Class for "extras" and bonuses
var Extra = function() {
    GameObject.call(this, 0, 0);
    this.reset();
};
Extra.prototype = Object.create(GameObject.prototype);
Extra.prototype.constructor = Extra;
Extra.prototype.Y_OFFSET = 52;

// Define various implementationso of the Extra.
// Each kind of extra defines a callback function
// that is exectued when they payer hits the extra.
// The activeLife option defines how long (in seconds)
// The extra will appear on the screen.
Extra.prototype.KINDS = [{
    kind: 'Heart',
    sprite: 'Heart',
    activeLife: 2.5,
    callback: function() {
        Engine.bonusLives++;
    }
}, {
    kind: 'BlueGem',
    sprite: 'Gem Blue',
    activeLife: 5,
    callback: function() {
        Engine.bonusScore += 5;
        Engine.bonusMultiplier++;
    }
}, {
    kind: 'GreenGem',
    sprite: 'Gem Green',
    activeLife: 3,
    callback: function() {
        Engine.bonusScore += 10;
        Engine.bonusMultiplier++;
    }
}, {
    kind: 'OrangeGem',
    sprite: 'Gem Orange',
    activeLife: 2,
    callback: function() {
        Engine.bonusScore += 15;
        Engine.bonusMultiplier++;
    }
}, {
    kind: 'Key',
    sprite: 'Key',
    activeLife: 2.5,
    callback: function() {
        Engine.bonusMultiplier+=10;
    }
}];

// This function resets the extra
Extra.prototype.reset = function() {
    this.kind = this.KINDS[Util.randomInt(0, this.KINDS.length - 1)];
    this.sprite = Resources.getSprite(this.kind.sprite);
    this.width = this.sprite.width;
    this.height = this.sprite.height;
    this.row = Util.randomInt(1, 3);
    this.col = Util.randomInt(0, 4);
    this.remainingActive = this.kind.activeLife;
    this.remainingTime = Util.randomFloat(this.remainingActive, this.remainingActive + 4);
    this.active = true;
    this.update(0);
};

// This function updates the extra
// Parameter: dt, a time delta between ticks
Extra.prototype.update = function(ms) {
    this.remainingTime -= ms;
    this.remainingActive -= ms;
    this.x = this.PX_PER_COL * (this.col + 0.5) - this.width * 0.5 + 4;
    this.y = this.PX_PER_ROW * (this.row + 0.5) - this.height * 0.5 + this.Y_OFFSET;
    if (this.remainingActive <= 0) {
        this.active = false;
    }
    if (this.remainingTime <= 0) {
        this.reset();
    }
};

// instantiate all dynamic game objects
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
// Place all extras in an array called allExtras;
var allEnemies = [];
var allExtras = [];
var player;

// create a scope
(function() {
    // This callback function will execute after resources are loaded
    function buildGameObjects() {
        for (var i = 0; i < 5; i++) {
            allEnemies.push(new Enemy());
        }
        for (i = 0; i < 1; i++) {
            allExtras.push(new Extra());
        }
        player = new Player();

        // This listens for key presses and sends the keys to your
        // Player.handleInput() method. You don't need to modify this.
        document.addEventListener('keyup', function(e) {
            player.handleInput(e.keyCode);
        });
    }

    // Register the callback defined above
    Resources.onReady(buildGameObjects);
}());

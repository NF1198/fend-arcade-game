/* Resources.js
 * This is simply an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 */

 /* The Sprite class encapuslates a sprite region of a sprite sheet
  */
var Sprite = function(img, definition) {
    this.img = img;
    this.name = definition.name;
    this.srcx = definition.x;
    this.srcy = definition.y;
    this.width = definition.width;
    this.height = definition.height;
};

(function() {
    var resourceCache = {};
    var readyCallbacks = [];
    var spriteCache = {};

    // Define the parameters for the sprite sheet.
    // Ref: https://www.leshylabs.com/apps/sstool/
    var spriteSheetFile = 'images/spritesheet.png';
    var spriteDef = [{
        "name": "char-boy",
        "x": 224,
        "y": 284,
        "width": 66,
        "height": 87
    }, {
        "name": "char-cat-girl",
        "x": 156,
        "y": 284,
        "width": 67,
        "height": 89
    }, {
        "name": "char-horn-girl",
        "x": 102,
        "y": 90,
        "width": 76,
        "height": 89
    }, {
        "name": "char-pink-girl",
        "x": 291,
        "y": 112,
        "width": 75,
        "height": 88
    }, {
        "name": "char-princess-girl",
        "x": 102,
        "y": 180,
        "width": 74,
        "height": 98
    }, {
        "name": "enemy-bug",
        "x": 291,
        "y": 301,
        "width": 96,
        "height": 76
    }, {
        "name": "Gem Blue",
        "x": 291,
        "y": 0,
        "width": 99,
        "height": 111
    }, {
        "name": "Gem Green",
        "x": 191,
        "y": 0,
        "width": 99,
        "height": 111
    }, {
        "name": "Gem Orange",
        "x": 0,
        "y": 0,
        "width": 99,
        "height": 111
    }, {
        "name": "grass-block",
        "x": 391,
        "y": 172,
        "width": 101,
        "height": 171
    }, {
        "name": "Heart",
        "x": 102,
        "y": 0,
        "width": 88,
        "height": 89
    }, {
        "name": "Key",
        "x": 98,
        "y": 284,
        "width": 57,
        "height": 97
    }, {
        "name": "Rock",
        "x": 0,
        "y": 284,
        "width": 97,
        "height": 97
    }, {
        "name": "Selector",
        "x": 191,
        "y": 112,
        "width": 99,
        "height": 170
    }, {
        "name": "Star",
        "x": 291,
        "y": 201,
        "width": 98,
        "height": 99
    }, {
        "name": "stone-block",
        "x": 391,
        "y": 0,
        "width": 101,
        "height": 171
    }, {
        "name": "water-block",
        "x": 0,
        "y": 112,
        "width": 101,
        "height": 171
    }];

    // This function loads the sprite sheet and initializes the spriteCache
    function loadSpriteSheet() {
        spriteDef.forEach(function(def) {
            spriteCache[def.name] = false;
        });
        var img = new Image();
        img.onload = function() {
            spriteDef.forEach(function(def) {
                spriteCache[def.name] = new Sprite(img, def);
            });
            if (isReady()) {
                readyCallbacks.forEach(function(func) {
                    func();
                });
            }
        };
        img.src = spriteSheetFile;
    }

    /* This is the publicly accessible image loading function. It accepts
     * an array of strings pointing to image files or a string for a single
     * image. It will then call our private image loading function accordingly.
     */
    function load(urlOrArr) {
        loadSpriteSheet();
        if (urlOrArr instanceof Array) {
            /* If the developer passed in an array of images
             * loop through each value and call our image
             * loader on that image file
             */
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        } else if (urlOrArr) {
            /* The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _load(urlOrArr);
        }
    }

    /* This is our private image loader function, it is
     * called by the public image loader function.
     */
    function _load(url) {
        if (resourceCache[url]) {
            /* If this URL has been previously loaded it will exist within
             * our resourceCache array. Just return that image rather
             * re-loading the image.
             */
            return resourceCache[url];
        } else {
            /* This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            var img = new Image();
            img.onload = function() {
                /* Once our image has properly loaded, add it to our cache
                 * so that we can simply return this image if the developer
                 * attempts to load this file in the future.
                 */
                resourceCache[url] = img;

                /* Once the image is actually loaded and properly cached,
                 * call all of the onReady() callbacks we have defined.
                 */
                if (isReady()) {
                    readyCallbacks.forEach(function(func) {
                        func();
                    });
                }
            };

            /* Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the image's src attribute to the passed in URL.
             */
            resourceCache[url] = false;
            img.src = url;
        }
    }

    /* This is used by developers to grab references to images they know
     * have been previously loaded. If an image is cached, this functions
     * the same as calling load() on that URL.
     */
    function get(url) {
        return resourceCache[url];
    }

    function getSprite(name) {
        return spriteCache[name];
    }

    /* This function determines if all of the images that have been requested
     * for loading have in fact been properly loaded.
     */
    function isReady() {
        var ready = true;
        for (var k in resourceCache) {
            if (resourceCache.hasOwnProperty(k) &&
                !resourceCache[k]) {
                ready = false;
            }
        }
        for (var s in spriteCache) {
            if (spriteCache.hasOwnProperty(s) &&
                !spriteCache[s]) {
                ready = false;
            }
        }
        return ready;
    }

    /* This function will add a function to the callback stack that is called
     * when all requested images are properly loaded.
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /* This object defines the publicly accessible functions available to
     * developers by creating a global Resources object.
     */

    window.Resources = {
        load: load,
        get: get,
        getSprite: getSprite,
        onReady: onReady,
        isReady: isReady
    };
})();

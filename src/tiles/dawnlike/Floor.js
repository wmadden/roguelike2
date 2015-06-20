var FloorTextures, floorMap, floorMapAt, floorMapGroupAt, textureAt,
  slice = [].slice;

import pixi from 'pixi.js';

textureAt = function(originX, originY, x, y, w, h, baseTexture) {
  return new pixi.Texture(baseTexture, new pixi.Rectangle(originX + x * w, originY + y * h, w, h));
};

floorMap = function(originX, originY, tileWidth, tileHeight, baseTexture) {
  var oX, oY, th, tw;
  oX = originX;
  oY = originY;
  tw = tileWidth;
  th = tileHeight;
  return {
    wall: {
      wall: {
        wall: {
          wall: textureAt(oX, oY, 5, 0, tw, th, baseTexture),
          none: textureAt(oX, oY, 6, 1, tw, th, baseTexture)
        },
        none: {
          wall: textureAt(oX, oY, 3, 0, tw, th, baseTexture),
          none: textureAt(oX, oY, 2, 0, tw, th, baseTexture)
        }
      },
      none: {
        wall: {
          wall: textureAt(oX, oY, 4, 1, tw, th, baseTexture),
          none: textureAt(oX, oY, 5, 1, tw, th, baseTexture)
        },
        none: {
          wall: textureAt(oX, oY, 0, 0, tw, th, baseTexture),
          none: textureAt(oX, oY, 1, 0, tw, th, baseTexture)
        }
      }
    },
    none: {
      wall: {
        wall: {
          wall: textureAt(oX, oY, 3, 2, tw, th, baseTexture),
          none: textureAt(oX, oY, 2, 2, tw, th, baseTexture)
        },
        none: {
          wall: textureAt(oX, oY, 3, 1, tw, th, baseTexture),
          none: textureAt(oX, oY, 2, 1, tw, th, baseTexture)
        }
      },
      none: {
        wall: {
          wall: textureAt(oX, oY, 0, 2, tw, th, baseTexture),
          none: textureAt(oX, oY, 1, 2, tw, th, baseTexture)
        },
        none: {
          wall: textureAt(oX, oY, 0, 1, tw, th, baseTexture),
          none: textureAt(oX, oY, 1, 1, tw, th, baseTexture)
        }
      }
    }
  };
};

floorMapAt = function(column, row, tileWidth, tileHeight, baseTexture) {
  var floorMapHeight, floorMapWidth;
  floorMapWidth = 7;
  floorMapHeight = 3;
  return floorMap(column * floorMapWidth * tileWidth, row * floorMapHeight * tileHeight, tileWidth, tileHeight, baseTexture);
};

floorMapGroupAt = function() {
  var baseTexture, column, i, j, len, name, names, result, row, tileHeight, tileWidth;
  column = arguments[0], row = arguments[1], tileWidth = arguments[2], tileHeight = arguments[3], baseTexture = arguments[4], names = 6 <= arguments.length ? slice.call(arguments, 5) : [];
  result = {};
  for (i = j = 0, len = names.length; j < len; i = ++j) {
    name = names[i];
    result[names[i]] = floorMapAt(column, row + i, tileWidth, tileHeight, baseTexture);
  }
  return result;
};

FloorTextures = (function() {
  function FloorTextures() {}

  FloorTextures.load = function() {
    var th, tileHeight, tileWidth, tw;
    this.baseTexture = pixi.Texture.fromImage("images/dawnlike/Objects/Floor.png");
    tw = tileWidth = 16;
    th = tileHeight = 16;
    return this.floorTypes = {
      blackAndWhite: floorMapAt(0, 0, tw, th, this.baseTexture),
      bricks: floorMapGroupAt(0, 1, tw, th, this.baseTexture, 'cyan', 'grey', 'darkgrey', 'blue'),
      grass: floorMapGroupAt(1, 1, tw, th, this.baseTexture, 'cyan', 'grey', 'darkgreen', 'blue'),
      rock: floorMapGroupAt(2, 1, tw, th, this.baseTexture, 'yellow', 'orange', 'red', 'blue'),
      dirt: floorMapGroupAt(0, 5, tw, th, this.baseTexture, 'yellow', 'orange', 'red', 'blue'),
      planks: floorMapGroupAt(1, 5, tw, th, this.baseTexture, 'pink', 'orange', 'greygreen', 'brown'),
      sunlitDirt: floorMapGroupAt(2, 5, tw, th, this.baseTexture, 'yellow', 'orange', 'brown', 'blue'),
      furrows: floorMapGroupAt(0, 9, tw, th, this.baseTexture, 'orange', 'brown', 'blue', 'darkblue')
    };
  };

  return FloorTextures;

})();

export default FloorTextures;

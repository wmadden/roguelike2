import * as Array2D from "util/Array2D";
import { ROT } from "rot-js";
import _ from "underscore";

const WALL = 1;
const FLOOR = 0;

let Level = (function() {
  function Level(arg) {
    this.width = arg.width, this.height = arg.height;
    this.freeTiles = [];
    this.tiles = Array2D.create(this.width, this.height);
    this.entities = [];
  }

  Level.prototype.generate = function() {
    var callback, tiles;
    tiles = Array2D.create(this.width, this.height);
    callback = (function(_this) {
      return function(x, y, wall) {
        var base;
        if ((base = tiles[x])[y] == null) {
          base[y] = [];
        }
        tiles[x][y] = wall;
        if (wall !== 1) {
          return _this.freeTiles.push([x, y]);
        }
      };
    })(this);
    this.map = new ROT.Map.Digger(this.width, this.height);
    this.map.create(callback);
    return this.processGeneratedMap(this.map, tiles);
  };

  Level.prototype.processGeneratedMap = function(map, rawTiles) {
    var i, ref, results, x, y;
    results = [];
    for (x = i = 0, ref = this.width; 0 <= ref ? i <= ref : i >= ref; x = 0 <= ref ? ++i : --i) {
      results.push((function() {
        var j, ref1, results1;
        results1 = [];
        for (y = j = 0, ref1 = this.height; 0 <= ref1 ? j <= ref1 : j >= ref1; y = 0 <= ref1 ? ++j : --j) {
          results1.push(this.tiles[x][y] = this.createTile(rawTiles, x, y));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  Level.prototype.createTile = function(rawTiles, x, y) {
    if (rawTiles[x][y] === 1) {
      return this.createWallTile(rawTiles, x, y);
    } else {
      return this.createFloorTile(rawTiles, x, y);
    }
  };

  Level.prototype.createFloorTile = function(rawTiles, x, y) {
    var tile;
    tile = new Tile("floor");
    tile.north = this.hasNorthWall(rawTiles, x, y) ? "wall" : "none";
    tile.east = this.hasEastWall(rawTiles, x, y) ? "wall" : "none";
    tile.south = this.hasSouthWall(rawTiles, x, y) ? "wall" : "none";
    tile.west = this.hasWestWall(rawTiles, x, y) ? "wall" : "none";
    return tile;
  };

  Level.prototype.createWallTile = function(rawTiles, x, y) {
    var tile;
    if (this.adjacentFloorTile(rawTiles, x, y)) {
      tile = new Tile("wall");
      tile.north = this.wallContinuesNorth(rawTiles, x, y) ? "wall" : "none";
      tile.east = this.wallContinuesEast(rawTiles, x, y) ? "wall" : "none";
      tile.south = this.wallContinuesSouth(rawTiles, x, y) ? "wall" : "none";
      tile.west = this.wallContinuesWest(rawTiles, x, y) ? "wall" : "none";
      return tile;
    }
  };

  Level.prototype.adjacentFloorTile = function(rawTiles, x, y) {
    return this.adjacentTiles(rawTiles, x, y).indexOf(FLOOR) !== -1;
  };

  Level.prototype.adjacentTiles = function(rawTiles, x, y) {
    var result;
    result = [];
    if (y > 0) {
      result.push(rawTiles[x][y - 1]);
    }
    if (y > 0 && x < this.width) {
      result.push(rawTiles[x + 1][y - 1]);
    }
    if (x < this.width) {
      result.push(rawTiles[x + 1][y]);
    }
    if (x < this.width && y < this.height) {
      result.push(rawTiles[x + 1][y + 1]);
    }
    if (y < this.height) {
      result.push(rawTiles[x][y + 1]);
    }
    if (x > 0 && y < this.height) {
      result.push(rawTiles[x - 1][y + 1]);
    }
    if (x > 0) {
      result.push(rawTiles[x - 1][y]);
    }
    if (x > 0 && y > 0) {
      result.push(rawTiles[x - 1][y - 1]);
    }
    return result;
  };

  Level.prototype.hasNorthWall = function(tiles, x, y) {
    if (y === 0) {
      return true;
    }
    return tiles[x][y - 1] === 1;
  };

  Level.prototype.hasSouthWall = function(tiles, x, y) {
    if (y === this.height) {
      return true;
    }
    return tiles[x][y + 1] === 1;
  };

  Level.prototype.hasWestWall = function(tiles, x, y) {
    if (x === 0) {
      return true;
    }
    return tiles[x - 1][y] === 1;
  };

  Level.prototype.hasEastWall = function(tiles, x, y) {
    if (x === this.width) {
      return true;
    }
    return tiles[x + 1][y] === 1;
  };

  Level.prototype.wallContinuesNorth = function(tiles, x, y) {
    if (y === 0) {
      return false;
    }
    return tiles[x][y - 1] === 1 && this.adjacentFloorTile(tiles, x, y - 1);
  };

  Level.prototype.wallContinuesSouth = function(tiles, x, y) {
    if (y === this.height) {
      return false;
    }
    return tiles[x][y + 1] === 1 && this.adjacentFloorTile(tiles, x, y + 1);
  };

  Level.prototype.wallContinuesWest = function(tiles, x, y) {
    if (x === 0) {
      return false;
    }
    return tiles[x - 1][y] === 1 && this.adjacentFloorTile(tiles, x - 1, y);
  };

  Level.prototype.wallContinuesEast = function(tiles, x, y) {
    if (x === this.width) {
      return false;
    }
    return tiles[x + 1][y] === 1 && this.adjacentFloorTile(tiles, x + 1, y);
  };

  Level.prototype.entityAt = function(x, y) {
    return _(this.entities).find(function(entity) {
      return entity.x === x && entity.y === y;
    });
  };

  return Level;

})();

let Tile = (function() {
  function Tile(type) {
    this.type = type;
  }

  return Tile;

})();

export default Level;

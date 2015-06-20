import pixi from 'pixi.js';
import { Transition } from 'drawing/Animation';

let hasProp = {}.hasOwnProperty;
function extend(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }

const Tile = (function(superClass) {
  extend(Tile, superClass);

  function Tile(options) {
    this.set(options);
    delete options.floor;
    delete options.wall;
    delete options.decals;
    Tile.__super__.constructor.call(this, options);
    this.rebuild();
  }

  Tile.prototype.set = function(arg) {
    this.floor = arg.floor, this.wall = arg.wall, this.decals = arg.decals;
  };

  Tile.prototype.rebuild = function() {
    var decal, i, len, ref, results;
    if (this.floor) {
      this.addChild(this._floor(this.floor));
    }
    if (this.wall) {
      this.addChild(this._wall(this.wall));
    }
    if (this.decals) {
      ref = this.decals;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        decal = ref[i];
        results.push(this.addChild(this._decal(this.decals.textureMap, decal)));
      }
      return results;
    }
  };

  Tile.prototype.transition = function(duration, properties) {
    if (this.transitionAnimation && !this.transitionAnimation.isFinished()) {
      this.transitionAnimation.stop();
    }
    return this.transitionAnimation = new Transition(this, properties, duration);
  };

  Tile.prototype._floor = function(arg) {
    var east, north, south, textureMap, west;
    textureMap = arg.textureMap, north = arg.north, east = arg.east, south = arg.south, west = arg.west;
    return new pixi.Sprite(textureMap[north][east][south][west]);
  };

  Tile.prototype._wall = function(arg) {
    var east, north, south, textureMap, textureName, west;
    textureMap = arg.textureMap, north = arg.north, east = arg.east, south = arg.south, west = arg.west;
    textureName = "" + (north === 'wall' ? 'N' : '_') + (east === "wall" ? "E" : "_") + (south === "wall" ? "S" : "_") + (west === "wall" ? "W" : "_");
    return new pixi.Sprite(textureMap[textureName]);
  };

  Tile.prototype._decal = function(arg) {
    var textureMap, type;
    textureMap = arg.textureMap, type = arg.type;
    return new pixi.Sprite(textureMap[type]);
  };

  return Tile;

})(pixi.DisplayObjectContainer);

export default Tile;

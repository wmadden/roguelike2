import SightMap from "SightMap";
import Entity from "Entity";

let hasProp = {}.hasOwnProperty;
function extend(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }

let Player = (function(superClass) {
  extend(Player, superClass);

  function Player(options) {
    if (options.health == null) {
      options.health = 10;
    }
    Player.__super__.constructor.call(this, options);
    this.type = "player";
    this.sightMap = new SightMap();
  }

  Player.prototype.nextAction = function() {
    throw new Error("Don't call me baby");
  };

  return Player;

})(Entity);

export default Player;

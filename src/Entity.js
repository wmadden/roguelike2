import _ from "underscore";
import { ROT } from "rot-js";

let Entity = (function() {
  function Entity(arg) {
    this.type = arg.type, this.x = arg.x, this.y = arg.y, this.health = arg.health, this.visibleWorld = arg.visibleWorld;
  }

  Entity.prototype.sightRadius = 10;

  Entity.prototype.nextAction = function() {
    var availableDirections, direction, index;
    availableDirections = _(ROT.DIRS[8]).reduce((function(_this) {
      return function(memo, movementDiff, i) {
        var destX, destY, ref, xDiff, yDiff;
        xDiff = movementDiff[0], yDiff = movementDiff[1];
        ref = [_this.x + xDiff, _this.y + yDiff], destX = ref[0], destY = ref[1];
        if (_this.visibleWorld.tileOccupied(destX, destY)) {
          memo.push(i);
        }
        return memo;
      };
    })(this), []);
    if (availableDirections.length === 0) {
      throw new Error("Can't do anything");
    }
    index = Math.floor(Math.random() * availableDirections.length);
    direction = availableDirections[index];
    return {
      action: "step",
      direction: direction,
    };
  };

  Entity.prototype.state = function() {
    return _(this).pick("x", "y", "type", "id", "dead");
  };

  return Entity;

})();

export default Entity;

import pixi from "pixi.js";
import { ROT } from "rot-js";
import Level from "Level";
import Player from "Player";
import _ from "underscore";
import KeyboardJS from "keyboardjs";

import Renderer from "drawing/StreamRenderer";
import RulesEngine from "RulesEngine";
import Entity from "Entity";
import SightMap from "SightMap";

let hasProp = {}.hasOwnProperty;
function extend(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }

let Game = (function() {
  function Game(arg) {
    this.stage = arg.stage, this.pixiRenderer = arg.pixiRenderer;
    this.scheduler = new ROT.Scheduler.Simple();
    this.engine = new ROT.Engine(this.scheduler);
    this.level = new Level({
      width: 80,
      height: 40
    });
    this.level.generate();
    this.rulesEngine = new RulesEngine(this.level, this.player);
    this.player = this.rulesEngine.spawnPlayer();
    this.generateSomeTestEnemies();
    this.renderer = new Renderer({
      stage: this.stage,
      game: this,
      scale: this.scale
    });
  }

  Game.prototype.load = function() {
    this.schedule((function(_this) {
      return function() {
        return _this.renderer.loadTextures();
      };
    })(this));
    this.schedule((function(_this) {
      return function() {
        _this.renderer.attachToEventStream(_this.player.sightMap.eventStream);
        return Promise.resolve();
      };
    })(this));
    this.schedule(((function(_this) {
      return function() {
        return _this.waitForAllEventsToBeDrawn();
      };
    })(this)), {
      repeat: true
    });
    this.schedule((function(_this) {
      return function() {
        return _this.clearDeadEntities();
      };
    })(this), {
      repeat: true
    });
    this.schedule(new WaitForPlayerInput(this.rulesEngine, this.level, this.player), {
      repeat: true
    });
    this.schedule(((function(_this) {
      return function() {
        return _this.waitForAllEventsToBeDrawn();
      };
    })(this)), {
      repeat: true
    });
    this.schedule((function(_this) {
      return function() {
        var action, entity, j, len, ref, results;
        ref = _(_this.level.entities).without(_this.player);
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          entity = ref[j];
          if (entity.dead) {
            continue;
          }
          action = entity.nextAction();
          action.actor = entity;
          results.push(_this.processAction(action));
        }
        return results;
      };
    })(this), {
      repeat: true
    });
    return this.engine.start();
  };

  Game.prototype.waitForAllEventsToBeDrawn = function() {
    return Promise.all([
      new Promise((function(_this) {
        return function(resolve, reject) {
          var test;
          test = function() {
            if (_this.player.sightMap.eventStream.eventsRemaining() === 0) {
              return resolve();
            } else {
              return _this.player.sightMap.eventStream.once("pop", test);
            }
          };
          return test();
        };
      })(this)), new Promise((function(_this) {
        return function(resolve, reject) {
          var test;
          test = function() {
            if (_this.renderer.pendingAnimations.length === 0) {
              return resolve();
            } else {
              return _this.renderer.once("animationsComplete", test);
            }
          };
          return test();
        };
      })(this))
    ]);
  };

  Game.prototype.processAction = function(actionDetails) {
    var action;
    action = actionDetails.action;
    if (!_(RulesEngine.PERMITTED_ENTITY_ACTIONS).include(action)) {
      throw new Error("Action " + action + " requested by entity is not permitted");
    }
    return this.rulesEngine[action](actionDetails);
  };

  Game.prototype.schedule = function(action, options) {
    var schedulable;
    if (options == null) {
      options = {};
    }
    if (typeof action === "function") {
      schedulable = new Schedulable(action);
    } else {
      schedulable = action;
    }
    if (!(schedulable instanceof Schedulable)) {
      throw new Error("Don't know how to schedule " + action);
    }
    return this.scheduler.add(schedulable, options.repeat);
  };

  Game.prototype.draw = function(msElapsed) {
    this.renderer.update(msElapsed);
    if (this.renderer.needsRedraw) {
      this.pixiRenderer.render(this.stage);
      return this.renderer.needsRedraw = false;
    }
  };

  Game.prototype.generateSomeTestEnemies = function() {
    var freeTile, i, index, j, results;
    results = [];
    for (i = j = 0; j <= 10; i = ++j) {
      index = Math.floor(Math.random() * this.level.freeTiles.length);
      freeTile = this.level.freeTiles[index];
      this.level.freeTiles.splice(index, 1);
      results.push(this.rulesEngine.spawn({
        entity: new Entity({
          type: "bunny-brown",
          health: 3,
          visibleWorld: this.visibleWorld()
        }),
        x: freeTile[0],
        y: freeTile[1]
      }));
    }
    return results;
  };

  Game.prototype.clearDeadEntities = function() {
    return this.level.entities = _(this.level.entities).filter(function(entity) {
      return !entity.dead;
    });
  };

  Game.prototype.visibleWorld = function(actor) {
    return {
      tileOccupied: (function(_this) {
        return function(x, y) {
          return _this.rulesEngine.canOccupy(x, y);
        };
      })(this)
    };
  };

  return Game;

})();

let Schedulable = (function() {
  function Schedulable(act) {
    if (act == null) {
      act = null;
    }
    if (act != null) {
      this.act = act;
    }
  }

  Schedulable.prototype.act = function() {
    return Promise.resolve();
  };

  return Schedulable;

})();

let WaitForPlayerInput = (function(superClass) {
  var E, N, NE, NW, S, SE, SW, W;

  extend(WaitForPlayerInput, superClass);

  N = 0;

  NE = 1;

  E = 2;

  SE = 3;

  S = 4;

  SW = 5;

  W = 6;

  NW = 7;

  WaitForPlayerInput.prototype.keymap = {
    h: W,
    j: S,
    k: N,
    l: E,
    y: NW,
    u: NE,
    b: SW,
    n: SE,
    left: W,
    right: E,
    up: N,
    down: S
  };

  function WaitForPlayerInput(rulesEngine, level, player) {
    this.rulesEngine = rulesEngine;
    this.level = level;
    this.player = player;
  }

  WaitForPlayerInput.prototype.act = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var direction, keyBindings, keyCombo, keydownHandler, removeKeyHandlers;
        keydownHandler = function(event, keys, comboString) {
          var destX, destY, direction, entityOnTile, movementDiff, ref, xDiff, yDiff;
          event.preventDefault();
          direction = _this.keymap[comboString];
          movementDiff = ROT.DIRS[8][direction];
          xDiff = movementDiff[0], yDiff = movementDiff[1];
          ref = [_this.player.x + xDiff, _this.player.y + yDiff], destX = ref[0], destY = ref[1];
          entityOnTile = _this.level.entityAt(destX, destY);
          if (entityOnTile != null) {
            _this.rulesEngine.attack({
              actor: _this.player,
              direction: direction
            });
            removeKeyHandlers();
            return resolve();
          } else if (_this.rulesEngine.step({
            actor: _this.player,
            direction: direction
          })) {
            removeKeyHandlers();
            return resolve();
          }
        };
        keyBindings = (function() {
          var ref, results;
          ref = this.keymap;
          results = [];
          for (keyCombo in ref) {
            direction = ref[keyCombo];
            results.push(KeyboardJS.on(keyCombo, keydownHandler));
          }
          return results;
        }).call(_this);
        return removeKeyHandlers = function() {
          var binding, j, len, results;
          results = [];
          for (j = 0, len = keyBindings.length; j < len; j++) {
            binding = keyBindings[j];
            results.push(binding.clear());
          }
          return results;
        };
      };
    })(this));
  };

  return WaitForPlayerInput;

})(Schedulable);

export default Game;

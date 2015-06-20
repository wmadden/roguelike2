import _ from 'underscore';
import events from 'events';
import { ROT } from 'rot-js';
import Player from 'Player';
import * as sightMap from 'SightMap';

let entityIdCounter = 0;

let hasProp = {}.hasOwnProperty;
function extend(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }

const RulesEngine = (function(superClass) {
  extend(RulesEngine, superClass);

  RulesEngine.PERMITTED_ENTITY_ACTIONS = ['step', 'attack'];

  function RulesEngine(level) {
    this.level = level;
  }

  RulesEngine.prototype.step = function(arg) {
    var actor, destX, destY, direction, ref;
    actor = arg.actor, direction = arg.direction;
    ref = this.getDestination(actor, direction), destX = ref[0], destY = ref[1];
    if (this.canOccupy(destX, destY)) {
      this.move(actor, [destX, destY]);
      return true;
    } else {
      return false;
    }
  };

  RulesEngine.prototype.spawn = function(arg) {
    var entity, i, len, observer, ref, ref1, results, x, y;
    entity = arg.entity, x = arg.x, y = arg.y;
    entity.x = x;
    entity.y = y;
    entity.id = entityIdCounter++;
    if (entity.sightMap != null) {
      this.updateSightmap(entity);
    }
    this.level.entities.push(entity);
    ref = this.whoCanSeeEntity(entity);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      observer = ref[i];
      results.push((ref1 = observer.sightMap) != null ? ref1.observeEntitySpawn({
        type: entity.type,
        id: entity.id,
        entityState: entity.state()
      }) : void 0);
    }
    return results;
  };

  RulesEngine.prototype.spawnPlayer = function() {
    var freeTile;
    freeTile = this.level.freeTiles.shift();
    this.player = new Player({});
    this.spawn({
      entity: this.player,
      x: freeTile[0],
      y: freeTile[1]
    });
    return this.player;
  };

  RulesEngine.prototype.canOccupy = function(x, y) {
    var destinationTile;
    destinationTile = this.level.tiles[x][y];
    return (destinationTile != null ? destinationTile.type : void 0) === 'floor' && (this.level.entityAt(x, y) == null) && !(this.player.x === x && this.player.y === y);
  };

  RulesEngine.prototype.lightPasses = function(x, y) {
    var ref, ref1;
    return ((ref = this.level.tiles[x]) != null ? (ref1 = ref[y]) != null ? ref1.type : void 0 : void 0) === 'floor';
  };

  RulesEngine.prototype.updateSightmap = function(entity) {
    var fov, nowVisibleEntities, nowVisibleTiles;
    fov = new ROT.FOV.PreciseShadowcasting((function(_this) {
      return function(x, y) {
        return _this.lightPasses(x, y);
      };
    })(this));
    nowVisibleTiles = [];
    nowVisibleEntities = [];
    fov.compute(entity.x, entity.y, entity.sightRadius, (function(_this) {
      return function(x, y, r, visibility) {
        var entityOnTile;
        nowVisibleTiles.push({
          x: x,
          y: y
        });
        entityOnTile = _this.level.entityAt(x, y);
        if (entityOnTile) {
          return nowVisibleEntities.push(entityOnTile.state());
        }
      };
    })(this));
    entity.sightMap.updateVisibleTiles(nowVisibleTiles);
    return entity.sightMap.updateVisibleEntities(nowVisibleEntities);
  };

  RulesEngine.prototype.attack = function(arg) {
    var actor, coords, direction, ref, targetEntity;
    actor = arg.actor, direction = arg.direction;
    coords = this.getDestination(actor, direction);
    targetEntity = (ref = this.level).entityAt.apply(ref, coords);
    return this.inflictDamage(actor, targetEntity, 1);
  };

  RulesEngine.prototype.getDestination = function(actor, direction) {
    var movementDiff, xDiff, yDiff;
    movementDiff = ROT.DIRS[8][direction];
    xDiff = movementDiff[0], yDiff = movementDiff[1];
    return [actor.x + xDiff, actor.y + yDiff];
  };

  RulesEngine.prototype.move = function(movingEntity, destination) {
    var currentlyVisible, destX, destY, entitiesObservingTargetAtDestination, entitiesObservingTargetAtOrigin, entity, i, len, newState, previousState, previouslyVisible, ref, ref1, results;
    previousState = movingEntity.state();
    previousState.visibility = sightMap.CURRENTLY_VISIBLE;
    entitiesObservingTargetAtOrigin = this.whoCanSeeEntity(movingEntity);
    destX = destination[0], destY = destination[1];
    movingEntity.x = destX;
    movingEntity.y = destY;
    if (movingEntity.sightMap != null) {
      this.updateSightmap(movingEntity);
    }
    newState = movingEntity.state();
    newState.visibility = sightMap.CURRENTLY_VISIBLE;
    entitiesObservingTargetAtDestination = this.whoCanSeeEntity(movingEntity);
    ref = this.level.entities;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      entity = ref[i];
      previouslyVisible = _(entitiesObservingTargetAtOrigin).contains(entity);
      currentlyVisible = _(entitiesObservingTargetAtDestination).contains(entity);
      if (previouslyVisible || currentlyVisible) {
        previousState.visibility = previouslyVisible ? sightMap.CURRENTLY_VISIBLE : sightMap.UNSEEN;
        newState.visibility = currentlyVisible ? sightMap.CURRENTLY_VISIBLE : sightMap.UNSEEN;
        results.push((ref1 = entity.sightMap) != null ? ref1.observeEntityMove({
          id: movingEntity.id,
          previousState: previousState,
          newState: newState
        }) : void 0);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  RulesEngine.prototype.inflictDamage = function(source, destination, damage) {
    var i, len, observer, observers, originalDestinationState, ref, results;
    originalDestinationState = destination.state();
    destination.health -= damage;
    observers = this.whoCanSeeEntity(destination);
    if (destination.health <= 0) {
      destination.health = 0;
      destination.dead = true;
      this.level.entities = _(this.level.entities).without(destination);
    }
    results = [];
    for (i = 0, len = observers.length; i < len; i++) {
      observer = observers[i];
      results.push((ref = observer.sightMap) != null ? ref.observeDamageInflicted({
        source: {
          type: source.type,
          id: source.id,
          entityState: source.state()
        },
        destination: {
          type: destination.type,
          id: destination.id,
          previousState: originalDestinationState,
          newState: destination.state()
        }
      }) : void 0);
    }
    return results;
  };

  RulesEngine.prototype.whoCanSeeEntity = function(entity) {
    return this.whoCanSeeTile({
      x: entity.x,
      y: entity.y
    });
  };

  RulesEngine.prototype.whoCanSeeTile = function(tile) {
    return _(this.level.entities).filter(function(entity) {
      var ref;
      return (ref = entity.sightMap) != null ? ref.isVisible(tile) : void 0;
    });
  };

  return RulesEngine;

})(events.EventEmitter);

export default RulesEngine;

import events from "events";
import pixi from "pixi.js";
import * as Array2D from "util/Array2D";
import Textures from "drawing/Textures";
import _ from "underscore";
import Tile from "drawing/Tile";
import { UNSEEN, PREVIOUSLY_SEEN, CURRENTLY_VISIBLE } from "SightMap";
import Entity from "drawing/Entity";

const VISIBILITY_ALPHAS = {};
VISIBILITY_ALPHAS[UNSEEN] = 0.0;
VISIBILITY_ALPHAS[PREVIOUSLY_SEEN] = 0.5;
VISIBILITY_ALPHAS[CURRENTLY_VISIBLE] = 1.0;

const ANIMATION_DURATION = 50;

let hasProp = {}.hasOwnProperty;
function extend(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }

const StreamRenderer = (function(superClass) {
  extend(StreamRenderer, superClass);

  StreamRenderer.prototype.scale = new pixi.Point(1, 1);

  function StreamRenderer(arg) {
    var scale;
    this.stage = arg.stage, this.game = arg.game, scale = arg.scale;
    this.needsRedraw = false;
    this.pendingAnimations = [];
    if (scale != null) {
      this.scale = scale;
    }
    this.layers = {
      level: new pixi.DisplayObjectContainer(),
      decals: new pixi.DisplayObjectContainer(),
      entities: new pixi.DisplayObjectContainer(),
      effects: new pixi.DisplayObjectContainer()
    };
    this.rootDisplayObjectContainer = new pixi.DisplayObjectContainer();
    this.rootDisplayObjectContainer.addChild(this.layers.level);
    this.rootDisplayObjectContainer.addChild(this.layers.entities);
    this.rootDisplayObjectContainer.addChild(this.layers.effects);
    this.rootDisplayObjectContainer.scale = this.scale;
    this.tiles = Array2D.create(this.game.level.width, this.game.level.height);
    this.entities = {};
    this.stage.addChild(this.rootDisplayObjectContainer);
  }

  StreamRenderer.prototype.loadTextures = function() {
    return Textures.loadAll().then((function(_this) {
      return function() {
        _this.bloodTexture = Textures.bloodTexture;
        _this.wallTexture = Textures.wallTexture;
        _this.rodentTextures = Textures.rodentTextures;
        _this.floorTextureMap = Textures.floorTextureMap;
        _this.playerTexture = Textures.playerTexture;
        return _this.texturesLoaded = true;
      };
    })(this));
  };

  StreamRenderer.prototype.update = function(msElapsed) {
    if (!this.texturesLoaded) {
      return;
    }
    if (this.pendingAnimations.length > 0) {
      this.needsRedraw = true;
      return this.updateAnimations(msElapsed);
    }
  };

  StreamRenderer.prototype.updateAnimations = function(msElapsed) {
    this.pendingAnimations = _(this.pendingAnimations).filter(function(animation) {
      animation.update(msElapsed);
      return !animation.isFinished();
    });
    if (this.pendingAnimations.length === 0) {
      return this.emit("animationsComplete");
    }
  };

  StreamRenderer.prototype.queueAnimation = function(animation) {
    return this.pendingAnimations.push(animation);
  };

  StreamRenderer.prototype.attachToEventStream = function(eventStream) {
    return eventStream.next().then((function(_this) {
      return function(event) {
        return _this.processEvent(event).then(function() {
          return _this.attachToEventStream(eventStream);
        });
      };
    })(this));
  };

  StreamRenderer.prototype.processEvent = function(event) {
    var name, name1, processEventsSequentially;
    console.log("Render event '" + event.type + "'", event);
    processEventsSequentially = true;
    if (processEventsSequentially) {
      return Promise.resolve(typeof this[name = "process_" + event.type] === "function" ? this[name](event) : void 0);
    } else {
      if (typeof this[name1 = "process_" + event.type] === "function") {
        this[name1](event);
      }
      return Promise.resolve();
    }
  };

  StreamRenderer.prototype.process_entitySpawn = function(event) {
    var id, newState, ref;
    ref = event.entity, id = ref.id, newState = ref.newState;
    return this.updateEntity(event.entity);
  };

  StreamRenderer.prototype.process_entityMove = function(event) {
    var id, newState, previousState, ref;
    ref = event.entity, id = ref.id, previousState = ref.previousState, newState = ref.newState;
    return this.updateEntity(event.entity);
  };

  StreamRenderer.prototype.process_damageInflicted = function(event) {
    var entity, id, newState, previousState, ref;
    ref = event.destination, id = ref.id, previousState = ref.previousState, newState = ref.newState;
    entity = this.entities[id];
    this.queueAnimation(entity.bulge(ANIMATION_DURATION, new pixi.Point(1.25, 1.25)));
    if (!event.destination.newState.dead) {
      return this.updateEntity(event.destination);
    } else {
      event.destination.newState.visibility = UNSEEN;
      return this.updateEntity(event.destination);
    }
  };

  StreamRenderer.prototype.process_entitiesVisibilityChanged = function(event) {
    var entitiesEnteringFOV, entitiesLeavingFOV, entityState, i, j, len, len1, newState, previousState, results;
    entitiesEnteringFOV = event.entitiesEnteringFOV, entitiesLeavingFOV = event.entitiesLeavingFOV;
    for (i = 0, len = entitiesEnteringFOV.length; i < len; i++) {
      entityState = entitiesEnteringFOV[i];
      previousState = entityState;
      previousState.visibility = UNSEEN;
      newState = _(previousState).clone();
      newState.visibility = CURRENTLY_VISIBLE;
      this.updateEntity({
        id: entityState.id,
        previousState: previousState,
        newState: newState
      });
    }
    results = [];
    for (j = 0, len1 = entitiesLeavingFOV.length; j < len1; j++) {
      entityState = entitiesLeavingFOV[j];
      previousState = entityState;
      previousState.visibility = CURRENTLY_VISIBLE;
      newState = _(previousState).clone();
      newState.visibility = UNSEEN;
      results.push(this.updateEntity({
        id: entityState.id,
        previousState: previousState,
        newState: newState
      }));
    }
    return results;
  };

  StreamRenderer.prototype.updateEntity = function(arg) {
    var entity, id, newState, previousState;
    id = arg.id, previousState = arg.previousState, newState = arg.newState;
    entity = this.entities[id];
    if (!entity) {
      entity = this.createEntity(previousState.type);
      this.entities[id] = entity;
      this.layers.entities.addChild(entity);
    }
    if (previousState.type !== newState.type) {
      throw new Error("Can't yet render entity transformation");
    }
    entity.x = previousState.x * 16 + 8;
    entity.y = previousState.y * 16 + 8;
    entity.alpha = this.visibilityAlpha(previousState.visibility);
    return new Promise((function(_this) {
      return function(resolve, reject) {
        let animation = entity.transition(ANIMATION_DURATION, {
          x: newState.x * 16 + 8,
          y: newState.y * 16 + 8,
          alpha: _this.visibilityAlpha(newState.visibility)
        });
        _this.queueAnimation(animation);
        return animation.on("finished", resolve);
      };
    })(this));
  };

  StreamRenderer.prototype.createEntity = function(type) {
    var entity;
    switch (type) {
      case "player":
        entity = new Entity({
          type: "player",
          texture: this.playerTexture
        });
        break;
      case "bunny-brown":
        entity = Entity.create(this.rodentTextures, type);
    }
    entity.pivot = new pixi.Point(8, 8);
    return entity;
  };

  StreamRenderer.prototype.process_dungeonFeaturesVisibilityChange = function(event) {
    var i, j, len, len1, newlyVisibleTiles, previouslyVisibleTiles, tile, updates, x, y;
    previouslyVisibleTiles = event.previouslyVisibleTiles, newlyVisibleTiles = event.newlyVisibleTiles;
    updates = [];
    for (i = 0, len = previouslyVisibleTiles.length; i < len; i++) {
      tile = previouslyVisibleTiles[i];
      x = tile.x, y = tile.y;
      updates.push(this.updateTile(x, y, this.game.level.tiles[x][y], PREVIOUSLY_SEEN));
    }
    for (j = 0, len1 = newlyVisibleTiles.length; j < len1; j++) {
      tile = newlyVisibleTiles[j];
      x = tile.x, y = tile.y;
      updates.push(this.updateTile(x, y, this.game.level.tiles[x][y], CURRENTLY_VISIBLE));
    }
    return Promise.all(updates);
  };

  StreamRenderer.prototype.createTile = function(x, y) {
    var gameTile, tileDescriptor;
    gameTile = this.game.level.tiles[x][y];
    if (gameTile.type === "floor") {
      tileDescriptor = {
        floor: _(gameTile).extend({
          textureMap: this.floorTextureMap
        })
      };
    } else {
      tileDescriptor = {
        wall: _(gameTile).extend({
          textureMap: this.wallTexture
        })
      };
    }
    return _(new Tile(tileDescriptor)).tap(function(tile) {
      tile.x = x * 16;
      return tile.y = y * 16;
    });
  };

  StreamRenderer.prototype.updateTile = function(x, y, gameTile, visibility) {
    var tile;
    tile = this.tiles[x][y];
    if (tile == null) {
      tile = this.createTile(x, y);
      tile.alpha = 0;
      this.layers.level.addChild(tile);
      this.tiles[x][y] = tile;
    }
    return new Promise((function(_this) {
      return function(resolve, reject) {
        let animation = tile.transition(ANIMATION_DURATION, {
          alpha: _this.visibilityAlpha(visibility)
        });
        _this.queueAnimation(animation);
        return animation.on("finished", resolve);
      };
    })(this));
  };

  StreamRenderer.prototype.visibilityAlpha = function(visibility) {
    return VISIBILITY_ALPHAS[visibility];
  };

  return StreamRenderer;

})(events.EventEmitter);

export default StreamRenderer;

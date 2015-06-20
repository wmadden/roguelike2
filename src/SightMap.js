import _ from "underscore";
import EventStream from "EventStream";

export const UNSEEN = 'unseen';
export const PREVIOUSLY_SEEN = 'previouslySeen';
export const CURRENTLY_VISIBLE = 'currentlyVisible';

const SightMap = (function() {
  function SightMap() {
    this.seen = {};
    this.visible = {};
    this.seenTiles = [];
    this.visibleTiles = [];
    this.visibleEntities = [];
    this.eventStream = new EventStream();
  }

  SightMap.prototype.haveSeen = function(arg) {
    var ref, x, y;
    x = arg.x, y = arg.y;
    return (ref = this.seen[x]) != null ? ref[y] : void 0;
  };

  SightMap.prototype.isVisible = function(arg) {
    var ref, x, y;
    x = arg.x, y = arg.y;
    return (ref = this.visible[x]) != null ? ref[y] : void 0;
  };

  SightMap.prototype.markAsSeen = function(tile) {
    var base, x, y;
    x = tile.x, y = tile.y;
    if ((base = this.seen)[x] == null) {
      base[x] = {};
    }
    if (this.seen[x][y]) {
      return;
    }
    this.seen[x][y] = true;
    return this.seenTiles.push(tile);
  };

  SightMap.prototype.markAsVisible = function(tile) {
    var base, x, y;
    x = tile.x, y = tile.y;
    if ((base = this.visible)[x] == null) {
      base[x] = {};
    }
    if (this.visible[x][y]) {
      return;
    }
    this.markAsSeen(tile);
    this.visible[x][y] = true;
    return this.visibleTiles.push(tile);
  };

  SightMap.prototype.updateVisibleTiles = function(newlyVisibleTiles) {
    var i, len, previouslyVisibleTiles, tile;
    previouslyVisibleTiles = this.visibleTiles;
    this.clearVisible();
    for (i = 0, len = newlyVisibleTiles.length; i < len; i++) {
      tile = newlyVisibleTiles[i];
      this.markAsVisible(tile);
    }
    return this._observeDungeonFeaturesVisibilityChange(previouslyVisibleTiles, newlyVisibleTiles);
  };

  SightMap.prototype.updateVisibleEntities = function(newlyVisibleEntities) {
    var entitiesEnteringFOV, entitiesLeavingFOV, entity, i, isCurrentlyVisible, len, previouslyVisibleEntities, ref, wasPreviouslyVisible;
    previouslyVisibleEntities = this.visibleEntities;
    entitiesEnteringFOV = [];
    entitiesLeavingFOV = [];
    ref = _(previouslyVisibleEntities.concat(newlyVisibleEntities)).unique(function(e) {
      return e.id;
    });
    for (i = 0, len = ref.length; i < len; i++) {
      entity = ref[i];
      wasPreviouslyVisible = !!_(previouslyVisibleEntities).find(function(e) {
        return e.id === entity.id;
      });
      isCurrentlyVisible = !!_(newlyVisibleEntities).find(function(e) {
        return e.id === entity.id;
      });
      if (wasPreviouslyVisible && !isCurrentlyVisible) {
        entitiesLeavingFOV.push(entity);
      } else if (!wasPreviouslyVisible && isCurrentlyVisible) {
        entitiesEnteringFOV.push(entity);
      }
    }
    this._observeEntitiesVisibilityChange({
      entitiesEnteringFOV: entitiesEnteringFOV,
      entitiesLeavingFOV: entitiesLeavingFOV
    });
    return this.visibleEntities = newlyVisibleEntities;
  };

  SightMap.prototype.clearVisible = function() {
    this.visible = {};
    return this.visibleTiles = [];
  };

  SightMap.prototype._observeDungeonFeaturesVisibilityChange = function(previouslyVisibleTiles, newlyVisibleTiles) {
    return this.eventStream.push({
      type: 'dungeonFeaturesVisibilityChange',
      previouslyVisibleTiles: previouslyVisibleTiles,
      newlyVisibleTiles: newlyVisibleTiles
    });
  };

  SightMap.prototype._observeEntitiesVisibilityChange = function(arg) {
    var entitiesEnteringFOV, entitiesLeavingFOV;
    entitiesEnteringFOV = arg.entitiesEnteringFOV, entitiesLeavingFOV = arg.entitiesLeavingFOV;
    return this.eventStream.push({
      type: 'entitiesVisibilityChanged',
      entitiesEnteringFOV: entitiesEnteringFOV,
      entitiesLeavingFOV: entitiesLeavingFOV
    });
  };

  SightMap.prototype.observeEntitySpawn = function(arg) {
    var entityState, id, newState, previousState;
    id = arg.id, entityState = arg.entityState;
    previousState = entityState;
    previousState.visibility = UNSEEN;
    newState = _(previousState).clone();
    newState.visibility = CURRENTLY_VISIBLE;
    this.visibleEntities.push(entityState);
    return this.eventStream.push({
      type: 'entitySpawn',
      entity: {
        id: id,
        previousState: previousState,
        newState: newState
      }
    });
  };

  SightMap.prototype.observeEntityMove = function(arg) {
    var id, isVisible, newState, previousState;
    id = arg.id, previousState = arg.previousState, newState = arg.newState;
    if (newState.visibility === CURRENTLY_VISIBLE) {
      isVisible = _(this.visibleEntities).find(function(e) {
        return e.id === id;
      });
      if (!isVisible) {
        this.visibleEntities.push(newState);
      }
    } else {
      this.visibleEntities = _(this.visibleEntities).reject(function(e) {
        return e.id === id;
      });
    }
    return this.eventStream.push({
      type: 'entityMove',
      entity: {
        id: id,
        previousState: previousState,
        newState: newState
      }
    });
  };

  SightMap.prototype.observeDamageInflicted = function(arg) {
    var destination, source;
    source = arg.source, destination = arg.destination;
    if (destination.newState.dead) {
      this.visibleEntities = _(this.visibleEntities).reject(function(e) {
        return e.id === destination.id;
      });
    }
    return this.eventStream.push({
      type: 'damageInflicted',
      source: {
        type: source.type,
        id: source.id,
        entityState: _(source.entityState).extend({
          visibility: CURRENTLY_VISIBLE
        })
      },
      destination: {
        type: destination.type,
        id: destination.id,
        previousState: _(destination.previousState).extend({
          visibility: CURRENTLY_VISIBLE
        }),
        newState: _(destination.newState).extend({
          visibility: CURRENTLY_VISIBLE
        })
      }
    });
  };

  return SightMap;

})();

export default SightMap;
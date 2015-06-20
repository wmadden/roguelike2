var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

import pixi from 'pixi.js';
import * as animation from 'drawing/Animation';

const Entity = (function(superClass) {
  extend(Entity, superClass);

  function Entity(options) {
    var texture;
    texture = options.texture;
    this.set(options);
    Entity.__super__.constructor.call(this, texture);
  }

  Entity.prototype.set = function(arg) {
    this.type = arg.type, this.id = arg.id;
  };

  Entity.prototype.transition = function(duration, properties) {
    if (this.transitionAnimation && !this.transitionAnimation.isFinished()) {
      this.transitionAnimation.stop();
    }
    return this.transitionAnimation = new animation.Transition(this, properties, duration);
  };

  Entity.prototype.bulge = function(duration, bulgeAmount) {
    if (this.bulgeAnimation && !this.bulgeAnimation.isFinished()) {
      this.bulgeAnimation.stop();
    }
    return this.bulgeAnimation = new animation.Bulge(this, bulgeAmount, duration);
  };

  Entity.create = function(textureMap, type) {
    return new Entity({
      type: type,
      texture: textureMap[type + "_0"]
    });
  };

  return Entity;

})(pixi.Sprite);

export default Entity;

import pixi from 'pixi.js';
import events from 'events';
import _ from 'underscore';

let hasProp = {}.hasOwnProperty;
function extend(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }

const Animation = (function(superClass) {
  extend(Animation, superClass);

  function Animation() {
    this._started = false;
    this._finished = false;
  }

  Animation.prototype.update = function(msElapsed) {};

  Animation.prototype.isStarted = function() {
    return this._started;
  };

  Animation.prototype.isFinished = function() {
    return this._finished;
  };

  Animation.prototype.stop = function() {
    if (this._finished) {
      return;
    }
    this._finished = true;
    return this.emit('finished');
  };

  return Animation;

})(events.EventEmitter);

export const AnimationChain = (function(superClass) {
  extend(AnimationChain, superClass);

  function AnimationChain(animations1) {
    var animation, i, len, ref;
    this.animations = animations1 != null ? animations1 : [];
    this.currentAnimationIndex = null;
    ref = this.animations;
    for (i = 0, len = ref.length; i < len; i++) {
      animation = ref[i];
      animation.duration = this.duration / this.animations.length;
    }
  }

  AnimationChain.prototype.update = function(msElapsed) {
    var allAnimationsAreFinished, currentAnimation;
    if (!this._started) {
      this._started = true;
      this.currentAnimationIndex = 0;
    }
    if (this.animations[this.currentAnimationIndex].isFinished()) {
      allAnimationsAreFinished = this.currentAnimationIndex === this.animations.length - 1;
      if (allAnimationsAreFinished) {
        this.stop();
        return;
      }
      this.currentAnimationIndex += 1;
    }
    currentAnimation = this.animations[this.currentAnimationIndex];
    return currentAnimation.update(msElapsed);
  };

  return AnimationChain;

})(Animation);

export const Transition = (function(superClass) {
  extend(Transition, superClass);

  function Transition(sprite1, properties1, duration1, transitionFunction) {
    this.sprite = sprite1;
    this.properties = properties1;
    this.duration = duration1;
    if (transitionFunction != null) {
      this.transitionFunction = transitionFunction;
    }
    this.originalProperties = _(this.sprite).pick(_(this.properties).keys());
  }

  Transition.prototype.update = function(msElapsed) {
    var allPropertiesTransitioned, currentValue, delta, distanceToFinalValue, finalValue, originalValue, property, ref;
    if (this.isFinished()) {
      return;
    }
    allPropertiesTransitioned = true;
    ref = this.properties;
    for (property in ref) {
      finalValue = ref[property];
      currentValue = this.sprite[property];
      if (currentValue === finalValue) {
        continue;
      }
      originalValue = this.originalProperties[property];
      delta = this.transitionFunction(originalValue, finalValue, currentValue, this.duration, msElapsed);
      distanceToFinalValue = finalValue - currentValue;
      if (Math.abs(distanceToFinalValue) < Math.abs(delta)) {
        this.sprite[property] = finalValue;
      } else {
        allPropertiesTransitioned = false;
        this.sprite[property] += delta;
      }
    }
    if (allPropertiesTransitioned) {
      return this.stop();
    }
  };

  Transition.LINEAR = function(originalValue, finalValue, currentValue, duration, msElapsed) {
    var delta, totalDelta;
    totalDelta = finalValue - originalValue;
    return delta = totalDelta / duration * msElapsed;
  };

  Transition.prototype.transitionFunction = Transition.LINEAR;

  return Transition;

})(Animation);

export const ScaleTransition = (function(superClass) {
  extend(ScaleTransition, superClass);

  function ScaleTransition(sprite1, desiredScale, duration1, transitionFunction) {
    this.sprite = sprite1;
    this.desiredScale = desiredScale;
    this.duration = duration1;
    if (transitionFunction != null) {
      this.transitionFunction = transitionFunction;
    }
    if (!(this.desiredScale instanceof pixi.Point)) {
      throw new Error("Scale must be a Point");
    }
    ScaleTransition.__super__.constructor.call(this, this.sprite, {}, this.duration, transitionFunction);
  }

  ScaleTransition.prototype.update = function(msElapsed) {
    var currentScale, deltaX, deltaY, desiredScaleReached, newX, newY;
    if (this.isFinished()) {
      return;
    }
    if (!this._started) {
      this.originalScale = this.sprite.scale.clone();
      this._started = true;
    }
    currentScale = this.sprite.scale;
    desiredScaleReached = currentScale.x === this.desiredScale.x && currentScale.y === this.desiredScale.y;
    if (desiredScaleReached) {
      this.stop();
      return;
    }
    deltaX = this.transitionFunction(this.originalScale.x, this.desiredScale.x, this.sprite.scale.x, this.duration, msElapsed);
    deltaY = this.transitionFunction(this.originalScale.y, this.desiredScale.y, this.sprite.scale.y, this.duration, msElapsed);
    newX = this.sprite.scale.x + deltaX;
    newY = this.sprite.scale.y + deltaY;
    if (deltaX > 0 && newX > this.desiredScale.x || deltaX < 0 && newX < this.desiredScale.x) {
      newX = this.desiredScale.x;
    }
    if (deltaY > 0 && newY > this.desiredScale.y || deltaY < 0 && newY < this.desiredScale.y) {
      newY = this.desiredScale.y;
    }
    return this.sprite.scale = new pixi.Point(newX, newY);
  };

  ScaleTransition.prototype.transitionFunction = Transition.LINEAR;

  return ScaleTransition;

})(Animation);

export const Bulge = (function(superClass) {
  extend(Bulge, superClass);

  function Bulge(sprite1, bulgeAmount, duration1, transitionFunction) {
    var animations;
    this.sprite = sprite1;
    this.bulgeAmount = bulgeAmount;
    this.duration = duration1;
    animations = [new ScaleTransition(this.sprite, this.bulgeAmount, this.duration, transitionFunction), new ScaleTransition(this.sprite, new pixi.Point(1.0, 1.0), this.duration, transitionFunction)];
    Bulge.__super__.constructor.call(this, animations);
  }

  return Bulge;

})(AnimationChain);

export const transition = function(sprite, properties, duration, transitionFunction) {
  if (transitionFunction == null) {
    transitionFunction = null;
  }
  return new Transition(sprite, properties, duration, transitionFunction);
};

export default Animation;

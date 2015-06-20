import events from "events";

let hasProp = {}.hasOwnProperty;
function extend(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }

const EventStream = (function(superClass) {
  extend(EventStream, superClass);

  function EventStream() {
    this._eventQueue = [];
  }

  EventStream.prototype.eventsRemaining = function() {
    return this._eventQueue.length;
  };

  EventStream.prototype.push = function(event) {
    this._eventQueue.push(event);
    return this.emit("push", event);
  };

  EventStream.prototype.pop = function() {
    var event;
    event = this._eventQueue.shift();
    this.emit("pop", event);
    return event;
  };

  EventStream.prototype.next = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        if (_this.eventsRemaining() > 0) {
          return resolve(_this.pop());
        } else {
          return _this.once("push", function() {
            return resolve(_this.pop());
          });
        }
      };
    })(this));
  };

  EventStream.prototype.remainingEvents = function() {
    return this._eventQueue.length;
  };

  return EventStream;

})(events.EventEmitter);

export default EventStream;
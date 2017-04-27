(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.D = factory());
}(this, (function () { 'use strict';

/**
 * EventEmitter
 */

function EventAir() {
    if (this instanceof EventAir) {
        return new EventAir();
    }
    this.__openlog__ = arguments && arguments[0] === 'openlog' ? 0 : 1;
    this.__maxListeners__ = 5;
    this.stack = [];
}

// Log
EventAir.log = {
    repeatRegister: function repeatRegister(name) {
        console.info('[Warning] event ' + name + ' has been registered');
    },
    notFound: function notFound(name) {
        console.error('[Error Code 404] event \'' + name + '\' is not registered');
    },
    maxLimit: function maxLimit(name, n) {
        console.error('[Warning] Listeners of event \'' + name + '\' goes beyond the maximum limit ' + n);
    }
};

/**
 * Get event from events stack by event's name
 * @param name
 * @returns {*}
 */
EventAir.prototype.getEventByName = function (name) {
    return this.stack.find(function (event) {
        return event.name === name;
    });
};

/**
 * Get listener by event's name and listener
 * If the given event is present and the listener is present ...
 * the listener will be returned, otherwise it returns undefined
 * @param name
 * @param listener
 * @returns {T}
 */
EventAir.prototype.getListener = function (event, listener) {
    return event ? event.listeners.find(function (l) {
        return l === listener;
    }) : void 0;
};

/**
 *
 * @param n
 * @returns {Event}
 */
EventAir.prototype.setMaxListeners = function (n) {
    this.__maxListeners__ = n;
    return this;
};

/**
 * Base register
 * @param name
 * @param listener
 * @param typeId
 * @returns {Event}
 * @private
 */
EventAir.prototype._baseRegister = function (name, listener, typeId) {

    var _event = this.getEventByName(name),
        _listener = this.getListener(_event, listener),
        _max = this.__maxListeners__;

    if (!_event) {

        this.stack.push({
            name: name,
            listeners: [listener],
            typeId: typeId
        });
    } else if (!_listener) {

        _event.listeners.push(listener);

        if (_event.listeners.length > _max) {
            Event.log.maxLimit(name, _max);
        }
    }

    return this;
};

/**
 * Register or add a listener for the specified event
 * @param name
 * @param listener
 */
EventAir.prototype.on = function (name, listener) {
    return this._baseRegister(name, listener, 1);
};

/**
 * Register a single listener for the specified event
 * that is, the listener will only trigger once
 * and the listener will be released immediately after the trigger.
 * @param name
 * @param listener
 */
EventAir.prototype.once = function (name, listener) {
    return this._baseRegister(name, listener, 2);
};

/**
 * Base catch
 * @param statusCode
 * @private
 */
EventAir.prototype._baseCatch = function (statusCode) {

    if (this.errorCatch) this.errorCatch(statusCode);

    return null;
};

/**
 *
 * @param name
 * @returns {Event}
 */
EventAir.prototype.emit = function (name) {

    var _event = this.getEventByName(name);

    if (!_event) {

        if (this.__openlog__) Event.log.notFound(name);

        this._baseCatch(404);

        return this;
    }

    if (_event.listeners.length === 0) {
        this._baseCatch(405);
    }

    // run listener
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = _event.listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var listener = _step.value;

            listener();
        }

        // for Event.prototype.once()
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    _event.typeId === 2 ? this.stack.splice(this.stack.indexOf(_event), 1) : void 0;

    return this;
};

/**
 * Removes specified listener for the specified event
 * The listener must be a listener that the event has already registered.
 * @param name
 * @param listener
 * @returns {Event}
 */
EventAir.prototype.removeListener = function (name, listener) {

    var _event = this.getEventByName(name),
        _listener = this.getListener(_event, listener);

    // Unregisted event
    if (!_event) {
        this._baseCatch(404);
        return this;

        // Unregisted listener
    } else if (!_listener) {
        this._baseCatch(405);
        return this;
    }

    _event.listeners.splice(_event.listeners.indexOf(_listener), 1);

    return this;
};

/**
 * Removes all listeners for all events,
 * and if the event is specified,
 * then removes all listeners for the specified event.
 * @returns {Event}
 */
EventAir.prototype.removeAllListeners = function () {
    var _this = this;

    // no arguments
    if (arguments.length === 0) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = this.stack[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _event = _step2.value;

                _event.listeners = [];
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return this;
    }

    // exist arguments
    Array.prototype.forEach.call(arguments, function (name) {
        if (typeof name === 'string') {
            var _event2 = _this.getEventByName(name);
            _event2.listeners = [];
        }
    });

    return this;
};

/**
 * Returns an array of listeners for the specified event.
 * @param name
 * @returns {Array|Event.listeners|*}
 */
EventAir.prototype.listeners = function (name) {

    var _event = this.getEventByName(name);

    return _event ? _event.listeners : this._baseCatch(405);
};

/**
 * Catch Error
 * @param func
 */
EventAir.prototype.catch = function (func) {
    this.errorCatch = typeof func === 'function' ? func : null;
};

return EventAir;

})));

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

var invariant_1 = invariant;

var Dispatcher_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }



var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

var Dispatcher = (function () {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    this._callbacks = {};
    this._isDispatching = false;
    this._isHandled = {};
    this._isPending = {};
    this._lastID = 1;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   */

  Dispatcher.prototype.register = function register(callback) {
    var id = _prefix + this._lastID++;
    this._callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   */

  Dispatcher.prototype.unregister = function unregister(id) {
    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant_1(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant_1(false) : undefined;
    delete this._callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */

  Dispatcher.prototype.waitFor = function waitFor(ids) {
    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant_1(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant_1(false) : undefined;
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this._isPending[id]) {
        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant_1(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant_1(false) : undefined;
        continue;
      }
      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant_1(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant_1(false) : undefined;
      this._invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   */

  Dispatcher.prototype.dispatch = function dispatch(payload) {
    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant_1(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant_1(false) : undefined;
    this._startDispatching(payload);
    try {
      for (var id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   */

  Dispatcher.prototype.isDispatching = function isDispatching() {
    return this._isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @internal
   */

  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
    this._isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
    for (var id in this._callbacks) {
      this._isPending[id] = false;
      this._isHandled[id] = false;
    }
    this._pendingPayload = payload;
    this._isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
    delete this._pendingPayload;
    this._isDispatching = false;
  };

  return Dispatcher;
})();

module.exports = Dispatcher;
});

unwrapExports(Dispatcher_1);

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var Dispatcher = Dispatcher_1;

var dispatcher = new Dispatcher();

var ADD_ADDRESS_TAG = 'address_tag_add';
var CLEAR_DATABASE = 'clear_database';
var MARK_ALL_AS_DIRTY = 'mark_all_as_dirty';
var MERGE_DATA = 'merge_data';
var REMOVE_ADDRESS = 'address_remove';
var REMOVE_ADDRESS_TAG = 'address_tag_remove';
var REMOVE_TX = 'remove_tx';
var REPLACE_ADDRESS_TAGS_AND_NOTE = 'address_tags_and_note_replace';
var REPLACE_TX_NOTE = 'replace_tx_note';
var RESET_FROM_DATA = 'reset_from_data';
var RESET_FROM_STORE = 'reset_from_store';
var SYNC_CHANGES = 'sync_changes';
var TOGGLE_PUSH_CHANGES = 'toggle_push_changes';
var TOGGLE_SHOW_DIALOG_HELP = 'toggle_show_dialog_help';
var TOGGLE_SYNC_TAGS_AND_NOTES = 'toggle_sync_tags_and_notes';
var UPDATE_DIRTY_STATUS = 'update_dirty_status';
var UPDATE_LAST_SYNC_TIME = 'update_last_sync_time';
var UPDATE_USERNAME = 'userinfo_username_update';
var replaceTxNote = function replaceTxNote(txHash, note) {
  return {
    type: REPLACE_TX_NOTE,
    payload: {
      txHash: txHash,
      note: note
    }
  };
};
var boundReplaceTxNote = function boundReplaceTxNote(txHash, note) {
  return dispatcher.dispatch(replaceTxNote(txHash, note));
};
var removeTx = function removeTx(tx) {
  return {
    type: REMOVE_TX,
    payload: tx
  };
};
var boundRemoveTx = function boundRemoveTx(tx) {
  return dispatcher.dispatch(removeTx(tx));
};
var replaceAddressTagsAndNote = function replaceAddressTagsAndNote(address, data) {
  return {
    type: REPLACE_ADDRESS_TAGS_AND_NOTE,
    payload: {
      address: address,
      tags: data.tags,
      note: data.note
    }
  };
};
var boundReplaceAddressTagsAndNote = function boundReplaceAddressTagsAndNote(address, data) {
  return dispatcher.dispatch(replaceAddressTagsAndNote(address, data));
};
var addAddressTag = function addAddressTag(address, tag) {
  return {
    type: ADD_ADDRESS_TAG,
    payload: {
      address: address,
      tag: tag
    }
  };
};
var boundAddAddressTag = function boundAddAddressTag(address, tag) {
  return dispatcher.dispatch(addAddressTag(address, tag));
};
var removeAddressTag = function removeAddressTag(address, tag) {
  return {
    type: REMOVE_ADDRESS_TAG,
    payload: {
      address: address,
      tag: tag
    }
  };
};
var boundRemoveAddressTag = function boundRemoveAddressTag(address, tag) {
  return dispatcher.dispatch(removeAddressTag(address, tag));
};
var removeAddress = function removeAddress(address) {
  return {
    type: REMOVE_ADDRESS,
    payload: address
  };
};
var boundRemoveAddress = function boundRemoveAddress(address) {
  return dispatcher.dispatch(removeAddress(address));
};
var updateUserName = function updateUserName(username) {
  return {
    type: UPDATE_USERNAME,
    payload: username
  };
};
var boundUpdateUserName = function boundUpdateUserName(username) {
  return dispatcher.dispatch(updateUserName(username));
};
var togglePushChanges = function togglePushChanges(toggle) {
  return {
    type: TOGGLE_PUSH_CHANGES,
    payload: toggle
  };
};
var syncChanges = function syncChanges(changes) {
  return {
    type: SYNC_CHANGES,
    payload: changes
  };
};
var boundSyncChanges = function boundSyncChanges(changes) {
  dispatcher.dispatch(togglePushChanges(false));
  dispatcher.dispatch(syncChanges(changes));
  dispatcher.dispatch(togglePushChanges(true));
};
var resetFromStore = function resetFromStore() {
  return {
    type: RESET_FROM_STORE
  };
};
var boundResetFromStore = function boundResetFromStore() {
  dispatcher.dispatch(togglePushChanges(false));
  dispatcher.dispatch(resetFromStore());
  dispatcher.dispatch(togglePushChanges(true));
};
var resetFromData = function resetFromData(data) {
  return {
    type: RESET_FROM_DATA,
    payload: data
  };
};
var boundResetFromData = function boundResetFromData(data) {
  dispatcher.dispatch(togglePushChanges(false));
  dispatcher.dispatch(resetFromData(data));
  dispatcher.dispatch(togglePushChanges(true));
};
var mergeData = function mergeData(data, isTargetPriority) {
  return {
    type: MERGE_DATA,
    payload: {
      data: data,
      isTargetPriority: isTargetPriority
    }
  };
};
var boundMergeData = function boundMergeData(data, isTargetPriority) {
  dispatcher.dispatch(togglePushChanges(false));
  dispatcher.dispatch(mergeData(data, isTargetPriority));
  dispatcher.dispatch(togglePushChanges(true));
};
var updateLastSyncTime = function updateLastSyncTime(timestamp) {
  return {
    type: UPDATE_LAST_SYNC_TIME,
    payload: timestamp
  };
};
var boundUpdateLastSyncTime = function boundUpdateLastSyncTime(timestamp) {
  return dispatcher.dispatch(updateLastSyncTime(timestamp));
};
var clearDatabase = function clearDatabase() {
  return {
    type: CLEAR_DATABASE
  };
};
var boundClearDatabase = function boundClearDatabase() {
  dispatcher.dispatch(togglePushChanges(false));
  dispatcher.dispatch(clearDatabase());
  dispatcher.dispatch(togglePushChanges(true));
};
var markAllAsDirty = function markAllAsDirty() {
  return {
    type: MARK_ALL_AS_DIRTY
  };
};
var boundMarkAllAsDirty = function boundMarkAllAsDirty() {
  dispatcher.dispatch(togglePushChanges(false));
  dispatcher.dispatch(markAllAsDirty());
  dispatcher.dispatch(togglePushChanges(true));
};
var toggleShowDialogHelp = function toggleShowDialogHelp(value) {
  return {
    type: TOGGLE_SHOW_DIALOG_HELP,
    payload: value
  };
};
var boundToggleShowDialogHelp = function boundToggleShowDialogHelp(value) {
  return dispatcher.dispatch(toggleShowDialogHelp(value));
};
var updateDirtyStatus = function updateDirtyStatus(from, to, targets) {
  return {
    type: UPDATE_DIRTY_STATUS,
    payload: _objectSpread2({}, targets, {
      from: from,
      to: to
    })
  };
};
var boundUpdateDirtyStatus = function boundUpdateDirtyStatus(from, to, targets) {
  return dispatcher.dispatch(updateDirtyStatus(from, to, targets));
};
var toggleSyncTagsAndNotes = function toggleSyncTagsAndNotes(value) {
  return {
    type: TOGGLE_SYNC_TAGS_AND_NOTES,
    payload: value
  };
};
var boundToggleSyncTagsAndNotes = function boundToggleSyncTagsAndNotes(value) {
  return dispatcher.dispatch(toggleSyncTagsAndNotes(value));
};

var actions = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ADD_ADDRESS_TAG: ADD_ADDRESS_TAG,
  CLEAR_DATABASE: CLEAR_DATABASE,
  MARK_ALL_AS_DIRTY: MARK_ALL_AS_DIRTY,
  MERGE_DATA: MERGE_DATA,
  REMOVE_ADDRESS: REMOVE_ADDRESS,
  REMOVE_ADDRESS_TAG: REMOVE_ADDRESS_TAG,
  REMOVE_TX: REMOVE_TX,
  REPLACE_ADDRESS_TAGS_AND_NOTE: REPLACE_ADDRESS_TAGS_AND_NOTE,
  REPLACE_TX_NOTE: REPLACE_TX_NOTE,
  RESET_FROM_DATA: RESET_FROM_DATA,
  RESET_FROM_STORE: RESET_FROM_STORE,
  SYNC_CHANGES: SYNC_CHANGES,
  TOGGLE_PUSH_CHANGES: TOGGLE_PUSH_CHANGES,
  TOGGLE_SHOW_DIALOG_HELP: TOGGLE_SHOW_DIALOG_HELP,
  TOGGLE_SYNC_TAGS_AND_NOTES: TOGGLE_SYNC_TAGS_AND_NOTES,
  UPDATE_DIRTY_STATUS: UPDATE_DIRTY_STATUS,
  UPDATE_LAST_SYNC_TIME: UPDATE_LAST_SYNC_TIME,
  UPDATE_USERNAME: UPDATE_USERNAME,
  replaceTxNote: replaceTxNote,
  boundReplaceTxNote: boundReplaceTxNote,
  removeTx: removeTx,
  boundRemoveTx: boundRemoveTx,
  replaceAddressTagsAndNote: replaceAddressTagsAndNote,
  boundReplaceAddressTagsAndNote: boundReplaceAddressTagsAndNote,
  addAddressTag: addAddressTag,
  boundAddAddressTag: boundAddAddressTag,
  removeAddressTag: removeAddressTag,
  boundRemoveAddressTag: boundRemoveAddressTag,
  removeAddress: removeAddress,
  boundRemoveAddress: boundRemoveAddress,
  updateUserName: updateUserName,
  boundUpdateUserName: boundUpdateUserName,
  togglePushChanges: togglePushChanges,
  syncChanges: syncChanges,
  boundSyncChanges: boundSyncChanges,
  resetFromStore: resetFromStore,
  boundResetFromStore: boundResetFromStore,
  resetFromData: resetFromData,
  boundResetFromData: boundResetFromData,
  mergeData: mergeData,
  boundMergeData: boundMergeData,
  updateLastSyncTime: updateLastSyncTime,
  boundUpdateLastSyncTime: boundUpdateLastSyncTime,
  clearDatabase: clearDatabase,
  boundClearDatabase: boundClearDatabase,
  markAllAsDirty: markAllAsDirty,
  boundMarkAllAsDirty: boundMarkAllAsDirty,
  toggleShowDialogHelp: toggleShowDialogHelp,
  boundToggleShowDialogHelp: boundToggleShowDialogHelp,
  updateDirtyStatus: updateDirtyStatus,
  boundUpdateDirtyStatus: boundUpdateDirtyStatus,
  toggleSyncTagsAndNotes: toggleSyncTagsAndNotes,
  boundToggleSyncTagsAndNotes: boundToggleSyncTagsAndNotes
});

// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
// find the complete implementation of crypto (msCrypto) on IE11.
var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);
var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

function rng() {
  if (!getRandomValues) {
    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
  }

  return getRandomValues(rnds8);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

  return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
}

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof options == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }

  options = options || {};
  var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

var store2 = createCommonjsModule(function (module) {
(function(window, define) {
    var _ = {
        version: "2.11.0",
        areas: {},
        apis: {},

        // utilities
        inherit: function(api, o) {
            for (var p in api) {
                if (!o.hasOwnProperty(p)) {
                    Object.defineProperty(o, p, Object.getOwnPropertyDescriptor(api, p));
                }
            }
            return o;
        },
        stringify: function(d) {
            return d === undefined || typeof d === "function" ? d+'' : JSON.stringify(d);
        },
        parse: function(s, fn) {
            // if it doesn't parse, return as is
            try{ return JSON.parse(s,fn||_.revive); }catch(e){ return s; }
        },

        // extension hooks
        fn: function(name, fn) {
            _.storeAPI[name] = fn;
            for (var api in _.apis) {
                _.apis[api][name] = fn;
            }
        },
        get: function(area, key){ return area.getItem(key); },
        set: function(area, key, string){ area.setItem(key, string); },
        remove: function(area, key){ area.removeItem(key); },
        key: function(area, i){ return area.key(i); },
        length: function(area){ return area.length; },
        clear: function(area){ area.clear(); },

        // core functions
        Store: function(id, area, namespace) {
            var store = _.inherit(_.storeAPI, function(key, data, overwrite) {
                if (arguments.length === 0){ return store.getAll(); }
                if (typeof data === "function"){ return store.transact(key, data, overwrite); }// fn=data, alt=overwrite
                if (data !== undefined){ return store.set(key, data, overwrite); }
                if (typeof key === "string" || typeof key === "number"){ return store.get(key); }
                if (typeof key === "function"){ return store.each(key); }
                if (!key){ return store.clear(); }
                return store.setAll(key, data);// overwrite=data, data=key
            });
            store._id = id;
            try {
                var testKey = '_-bad-_';
                area.setItem(testKey, 'wolf');
                store._area = area;
                area.removeItem(testKey);
            } catch (e) {}
            if (!store._area) {
                store._area = _.storage('fake');
            }
            store._ns = namespace || '';
            if (!_.areas[id]) {
                _.areas[id] = store._area;
            }
            if (!_.apis[store._ns+store._id]) {
                _.apis[store._ns+store._id] = store;
            }
            return store;
        },
        storeAPI: {
            // admin functions
            area: function(id, area) {
                var store = this[id];
                if (!store || !store.area) {
                    store = _.Store(id, area, this._ns);//new area-specific api in this namespace
                    if (!this[id]){ this[id] = store; }
                }
                return store;
            },
            namespace: function(namespace, singleArea) {
                if (!namespace){
                    return this._ns ? this._ns.substring(0,this._ns.length-1) : '';
                }
                var ns = namespace, store = this[ns];
                if (!store || !store.namespace) {
                    store = _.Store(this._id, this._area, this._ns+ns+'.');//new namespaced api
                    if (!this[ns]){ this[ns] = store; }
                    if (!singleArea) {
                        for (var name in _.areas) {
                            store.area(name, _.areas[name]);
                        }
                    }
                }
                return store;
            },
            isFake: function(){ return this._area.name === 'fake'; },
            toString: function() {
                return 'store'+(this._ns?'.'+this.namespace():'')+'['+this._id+']';
            },

            // storage functions
            has: function(key) {
                if (this._area.has) {
                    return this._area.has(this._in(key));//extension hook
                }
                return !!(this._in(key) in this._area);
            },
            size: function(){ return this.keys().length; },
            each: function(fn, fill) {// fill is used by keys(fillList) and getAll(fillList))
                for (var i=0, m=_.length(this._area); i<m; i++) {
                    var key = this._out(_.key(this._area, i));
                    if (key !== undefined) {
                        if (fn.call(this, key, this.get(key), fill) === false) {
                            break;
                        }
                    }
                    if (m > _.length(this._area)) { m--; i--; }// in case of removeItem
                }
                return fill || this;
            },
            keys: function(fillList) {
                return this.each(function(k, v, list){ list.push(k); }, fillList || []);
            },
            get: function(key, alt) {
                var s = _.get(this._area, this._in(key)),
                    fn;
                if (typeof alt === "function") {
                    fn = alt;
                    alt = null;
                }
                return s !== null ? _.parse(s, fn) : alt || s;// support alt for easy default mgmt
            },
            getAll: function(fillObj) {
                return this.each(function(k, v, all){ all[k] = v; }, fillObj || {});
            },
            transact: function(key, fn, alt) {
                var val = this.get(key, alt),
                    ret = fn(val);
                this.set(key, ret === undefined ? val : ret);
                return this;
            },
            set: function(key, data, overwrite) {
                var d = this.get(key);
                if (d != null && overwrite === false) {
                    return data;
                }
                return _.set(this._area, this._in(key), _.stringify(data), overwrite) || d;
            },
            setAll: function(data, overwrite) {
                var changed, val;
                for (var key in data) {
                    val = data[key];
                    if (this.set(key, val, overwrite) !== val) {
                        changed = true;
                    }
                }
                return changed;
            },
            add: function(key, data) {
                var d = this.get(key);
                if (d instanceof Array) {
                    data = d.concat(data);
                } else if (d !== null) {
                    var type = typeof d;
                    if (type === typeof data && type === 'object') {
                        for (var k in data) {
                            d[k] = data[k];
                        }
                        data = d;
                    } else {
                        data = d + data;
                    }
                }
                _.set(this._area, this._in(key), _.stringify(data));
                return data;
            },
            remove: function(key, alt) {
                var d = this.get(key, alt);
                _.remove(this._area, this._in(key));
                return d;
            },
            clear: function() {
                if (!this._ns) {
                    _.clear(this._area);
                } else {
                    this.each(function(k){ _.remove(this._area, this._in(k)); }, 1);
                }
                return this;
            },
            clearAll: function() {
                var area = this._area;
                for (var id in _.areas) {
                    if (_.areas.hasOwnProperty(id)) {
                        this._area = _.areas[id];
                        this.clear();
                    }
                }
                this._area = area;
                return this;
            },

            // internal use functions
            _in: function(k) {
                if (typeof k !== "string"){ k = _.stringify(k); }
                return this._ns ? this._ns + k : k;
            },
            _out: function(k) {
                return this._ns ?
                    k && k.indexOf(this._ns) === 0 ?
                        k.substring(this._ns.length) :
                        undefined : // so each() knows to skip it
                    k;
            }
        },// end _.storeAPI
        storage: function(name) {
            return _.inherit(_.storageAPI, { items: {}, name: name });
        },
        storageAPI: {
            length: 0,
            has: function(k){ return this.items.hasOwnProperty(k); },
            key: function(i) {
                var c = 0;
                for (var k in this.items){
                    if (this.has(k) && i === c++) {
                        return k;
                    }
                }
            },
            setItem: function(k, v) {
                if (!this.has(k)) {
                    this.length++;
                }
                this.items[k] = v;
            },
            removeItem: function(k) {
                if (this.has(k)) {
                    delete this.items[k];
                    this.length--;
                }
            },
            getItem: function(k){ return this.has(k) ? this.items[k] : null; },
            clear: function(){ for (var k in this.items){ this.removeItem(k); } }
        }// end _.storageAPI
    };

    var store =
        // safely set this up (throws error in IE10/32bit mode for local files)
        _.Store("local", (function(){try{ return localStorage; }catch(e){}})());
    store.local = store;// for completeness
    store._ = _;// for extenders and debuggers...
    // safely setup store.session (throws exception in FF for file:/// urls)
    store.area("session", (function(){try{ return sessionStorage; }catch(e){}})());
    store.area("page", _.storage("page"));

    if (typeof define === 'function' && define.amd !== undefined) {
        define('store2', [], function () {
            return store;
        });
    } else if ( module.exports) {
        module.exports = store;
    } else {
        // expose the primary store fn to the global object and save conflicts
        if (window.store){ _.conflict = window.store; }
        window.store = store;
    }

})(commonjsGlobal, commonjsGlobal && commonjsGlobal.define);
});

var LocalStore = /*#__PURE__*/function () {
  function LocalStore() {
    var uuid = v4();
    var ethpuuid = store2('ethpuuid') || (store2('ethpuuid', uuid), uuid);
    this._store = store2.namespace(ethpuuid);
  }

  var _proto = LocalStore.prototype;

  _proto.store = function store() {
    return this._store.apply(this, arguments);
  };

  _proto.userId = function userId() {
    return this._store.namespace();
  };

  _proto.reset = function reset(uuid) {
    if (uuid === void 0) {
      uuid = v4();
    }

    var prevStore = this._store;
    store2('ethpuuid', uuid);
    this._store = store2.namespace(uuid);
    prevStore.clearAll();
  };

  _proto.clear = function clear() {
    this._store.clearAll();
  };

  _proto["switch"] = function _switch(uuid) {
    if (uuid) {
      store2('ethpuuid', uuid);
      this._store = store2.namespace(uuid);
    }
  };

  return LocalStore;
}();

var localStore = new LocalStore();

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventSubscription
 * @typechecks
 */

/**
 * EventSubscription represents a subscription to a particular event. It can
 * remove its own subscription.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EventSubscription = (function () {

  /**
   * @param {EventSubscriptionVendor} subscriber the subscriber that controls
   *   this subscription.
   */

  function EventSubscription(subscriber) {
    _classCallCheck(this, EventSubscription);

    this.subscriber = subscriber;
  }

  /**
   * Removes this subscription from the subscriber that controls it.
   */

  EventSubscription.prototype.remove = function remove() {
    if (this.subscriber) {
      this.subscriber.removeSubscription(this);
      this.subscriber = null;
    }
  };

  return EventSubscription;
})();

var EventSubscription_1 = EventSubscription;

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }



/**
 * EmitterSubscription represents a subscription with listener and context data.
 */

var EmitterSubscription = (function (_EventSubscription) {
  _inherits(EmitterSubscription, _EventSubscription);

  /**
   * @param {EventSubscriptionVendor} subscriber - The subscriber that controls
   *   this subscription
   * @param {function} listener - Function to invoke when the specified event is
   *   emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   */

  function EmitterSubscription(subscriber, listener, context) {
    _classCallCheck$1(this, EmitterSubscription);

    _EventSubscription.call(this, subscriber);
    this.listener = listener;
    this.context = context;
  }

  return EmitterSubscription;
})(EventSubscription_1);

var EmitterSubscription_1 = EmitterSubscription;

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }



/**
 * EventSubscriptionVendor stores a set of EventSubscriptions that are
 * subscribed to a particular event type.
 */

var EventSubscriptionVendor = (function () {
  function EventSubscriptionVendor() {
    _classCallCheck$2(this, EventSubscriptionVendor);

    this._subscriptionsForType = {};
    this._currentSubscription = null;
  }

  /**
   * Adds a subscription keyed by an event type.
   *
   * @param {string} eventType
   * @param {EventSubscription} subscription
   */

  EventSubscriptionVendor.prototype.addSubscription = function addSubscription(eventType, subscription) {
    !(subscription.subscriber === this) ? process.env.NODE_ENV !== 'production' ? invariant_1(false, 'The subscriber of the subscription is incorrectly set.') : invariant_1(false) : undefined;
    if (!this._subscriptionsForType[eventType]) {
      this._subscriptionsForType[eventType] = [];
    }
    var key = this._subscriptionsForType[eventType].length;
    this._subscriptionsForType[eventType].push(subscription);
    subscription.eventType = eventType;
    subscription.key = key;
    return subscription;
  };

  /**
   * Removes a bulk set of the subscriptions.
   *
   * @param {?string} eventType - Optional name of the event type whose
   *   registered supscriptions to remove, if null remove all subscriptions.
   */

  EventSubscriptionVendor.prototype.removeAllSubscriptions = function removeAllSubscriptions(eventType) {
    if (eventType === undefined) {
      this._subscriptionsForType = {};
    } else {
      delete this._subscriptionsForType[eventType];
    }
  };

  /**
   * Removes a specific subscription. Instead of calling this function, call
   * `subscription.remove()` directly.
   *
   * @param {object} subscription
   */

  EventSubscriptionVendor.prototype.removeSubscription = function removeSubscription(subscription) {
    var eventType = subscription.eventType;
    var key = subscription.key;

    var subscriptionsForType = this._subscriptionsForType[eventType];
    if (subscriptionsForType) {
      delete subscriptionsForType[key];
    }
  };

  /**
   * Returns the array of subscriptions that are currently registered for the
   * given event type.
   *
   * Note: This array can be potentially sparse as subscriptions are deleted
   * from it when they are removed.
   *
   * TODO: This returns a nullable array. wat?
   *
   * @param {string} eventType
   * @return {?array}
   */

  EventSubscriptionVendor.prototype.getSubscriptionsForType = function getSubscriptionsForType(eventType) {
    return this._subscriptionsForType[eventType];
  };

  return EventSubscriptionVendor;
})();

var EventSubscriptionVendor_1 = EventSubscriptionVendor;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

var emptyFunction_1 = emptyFunction;

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }







/**
 * @class BaseEventEmitter
 * @description
 * An EventEmitter is responsible for managing a set of listeners and publishing
 * events to them when it is told that such events happened. In addition to the
 * data for the given event it also sends a event control object which allows
 * the listeners/handlers to prevent the default behavior of the given event.
 *
 * The emitter is designed to be generic enough to support all the different
 * contexts in which one might want to emit events. It is a simple multicast
 * mechanism on top of which extra functionality can be composed. For example, a
 * more advanced emitter may use an EventHolder and EventFactory.
 */

var BaseEventEmitter = (function () {
  /**
   * @constructor
   */

  function BaseEventEmitter() {
    _classCallCheck$3(this, BaseEventEmitter);

    this._subscriber = new EventSubscriptionVendor_1();
    this._currentSubscription = null;
  }

  /**
   * Adds a listener to be invoked when events of the specified type are
   * emitted. An optional calling context may be provided. The data arguments
   * emitted will be passed to the listener function.
   *
   * TODO: Annotate the listener arg's type. This is tricky because listeners
   *       can be invoked with varargs.
   *
   * @param {string} eventType - Name of the event to listen to
   * @param {function} listener - Function to invoke when the specified event is
   *   emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   */

  BaseEventEmitter.prototype.addListener = function addListener(eventType, listener, context) {
    return this._subscriber.addSubscription(eventType, new EmitterSubscription_1(this._subscriber, listener, context));
  };

  /**
   * Similar to addListener, except that the listener is removed after it is
   * invoked once.
   *
   * @param {string} eventType - Name of the event to listen to
   * @param {function} listener - Function to invoke only once when the
   *   specified event is emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   */

  BaseEventEmitter.prototype.once = function once(eventType, listener, context) {
    var emitter = this;
    return this.addListener(eventType, function () {
      emitter.removeCurrentListener();
      listener.apply(context, arguments);
    });
  };

  /**
   * Removes all of the registered listeners, including those registered as
   * listener maps.
   *
   * @param {?string} eventType - Optional name of the event whose registered
   *   listeners to remove
   */

  BaseEventEmitter.prototype.removeAllListeners = function removeAllListeners(eventType) {
    this._subscriber.removeAllSubscriptions(eventType);
  };

  /**
   * Provides an API that can be called during an eventing cycle to remove the
   * last listener that was invoked. This allows a developer to provide an event
   * object that can remove the listener (or listener map) during the
   * invocation.
   *
   * If it is called when not inside of an emitting cycle it will throw.
   *
   * @throws {Error} When called not during an eventing cycle
   *
   * @example
   *   var subscription = emitter.addListenerMap({
   *     someEvent: function(data, event) {
   *       console.log(data);
   *       emitter.removeCurrentListener();
   *     }
   *   });
   *
   *   emitter.emit('someEvent', 'abc'); // logs 'abc'
   *   emitter.emit('someEvent', 'def'); // does not log anything
   */

  BaseEventEmitter.prototype.removeCurrentListener = function removeCurrentListener() {
    !!!this._currentSubscription ? process.env.NODE_ENV !== 'production' ? invariant_1(false, 'Not in an emitting cycle; there is no current subscription') : invariant_1(false) : undefined;
    this._subscriber.removeSubscription(this._currentSubscription);
  };

  /**
   * Returns an array of listeners that are currently registered for the given
   * event.
   *
   * @param {string} eventType - Name of the event to query
   * @return {array}
   */

  BaseEventEmitter.prototype.listeners = function listeners(eventType) /* TODO: Array<EventSubscription> */{
    var subscriptions = this._subscriber.getSubscriptionsForType(eventType);
    return subscriptions ? subscriptions.filter(emptyFunction_1.thatReturnsTrue).map(function (subscription) {
      return subscription.listener;
    }) : [];
  };

  /**
   * Emits an event of the given type with the given data. All handlers of that
   * particular type will be notified.
   *
   * @param {string} eventType - Name of the event to emit
   * @param {*} Arbitrary arguments to be passed to each registered listener
   *
   * @example
   *   emitter.addListener('someEvent', function(message) {
   *     console.log(message);
   *   });
   *
   *   emitter.emit('someEvent', 'abc'); // logs 'abc'
   */

  BaseEventEmitter.prototype.emit = function emit(eventType) {
    var subscriptions = this._subscriber.getSubscriptionsForType(eventType);
    if (subscriptions) {
      var keys = Object.keys(subscriptions);
      for (var ii = 0; ii < keys.length; ii++) {
        var key = keys[ii];
        var subscription = subscriptions[key];
        // The subscription may have been removed during this event loop.
        if (subscription) {
          this._currentSubscription = subscription;
          this.__emitToSubscription.apply(this, [subscription].concat(Array.prototype.slice.call(arguments)));
        }
      }
      this._currentSubscription = null;
    }
  };

  /**
   * Provides a hook to override how the emitter emits an event to a specific
   * subscription. This allows you to set up logging and error boundaries
   * specific to your environment.
   *
   * @param {EmitterSubscription} subscription
   * @param {string} eventType
   * @param {*} Arbitrary arguments to be passed to each registered listener
   */

  BaseEventEmitter.prototype.__emitToSubscription = function __emitToSubscription(subscription, eventType) {
    var args = Array.prototype.slice.call(arguments, 2);
    subscription.listener.apply(subscription.context, args);
  };

  return BaseEventEmitter;
})();

var BaseEventEmitter_1 = BaseEventEmitter;

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var fbemitter = {
  EventEmitter: BaseEventEmitter_1,
  EmitterSubscription : EmitterSubscription_1
};

var fbemitter_1 = fbemitter;

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }



var EventEmitter = fbemitter_1.EventEmitter;



/**
 * This class represents the most basic functionality for a FluxStore. Do not
 * extend this store directly; instead extend FluxReduceStore when creating a
 * new store.
 */

var FluxStore = (function () {
  function FluxStore(dispatcher) {
    var _this = this;

    _classCallCheck$4(this, FluxStore);

    this.__className = this.constructor.name;

    this.__changed = false;
    this.__changeEvent = 'change';
    this.__dispatcher = dispatcher;
    this.__emitter = new EventEmitter();
    this._dispatchToken = dispatcher.register(function (payload) {
      _this.__invokeOnDispatch(payload);
    });
  }

  FluxStore.prototype.addListener = function addListener(callback) {
    return this.__emitter.addListener(this.__changeEvent, callback);
  };

  FluxStore.prototype.getDispatcher = function getDispatcher() {
    return this.__dispatcher;
  };

  /**
   * This exposes a unique string to identify each store's registered callback.
   * This is used with the dispatcher's waitFor method to declaratively depend
   * on other stores updating themselves first.
   */

  FluxStore.prototype.getDispatchToken = function getDispatchToken() {
    return this._dispatchToken;
  };

  /**
   * Returns whether the store has changed during the most recent dispatch.
   */

  FluxStore.prototype.hasChanged = function hasChanged() {
    !this.__dispatcher.isDispatching() ? process.env.NODE_ENV !== 'production' ? invariant_1(false, '%s.hasChanged(): Must be invoked while dispatching.', this.__className) : invariant_1(false) : undefined;
    return this.__changed;
  };

  FluxStore.prototype.__emitChange = function __emitChange() {
    !this.__dispatcher.isDispatching() ? process.env.NODE_ENV !== 'production' ? invariant_1(false, '%s.__emitChange(): Must be invoked while dispatching.', this.__className) : invariant_1(false) : undefined;
    this.__changed = true;
  };

  /**
   * This method encapsulates all logic for invoking __onDispatch. It should
   * be used for things like catching changes and emitting them after the
   * subclass has handled a payload.
   */

  FluxStore.prototype.__invokeOnDispatch = function __invokeOnDispatch(payload) {
    this.__changed = false;
    this.__onDispatch(payload);
    if (this.__changed) {
      this.__emitter.emit(this.__changeEvent);
    }
  };

  /**
   * The callback that will be registered with the dispatcher during
   * instantiation. Subclasses must override this method. This callback is the
   * only way the store receives new data.
   */

  FluxStore.prototype.__onDispatch = function __onDispatch(payload) {
     process.env.NODE_ENV !== 'production' ? invariant_1(false, '%s has not overridden FluxStore.__onDispatch(), which is required', this.__className) : invariant_1(false) ;
  };

  return FluxStore;
})();

var FluxStore_1 = FluxStore;

function abstractMethod(className, methodName) {
   process.env.NODE_ENV !== 'production' ? invariant_1(false, 'Subclasses of %s must override %s() with their own implementation.', className, methodName) : invariant_1(false) ;
}

var abstractMethod_1 = abstractMethod;

function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits$1(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }






/**
 * This is the basic building block of a Flux application. All of your stores
 * should extend this class.
 *
 *   class CounterStore extends FluxReduceStore<number> {
 *     getInitialState(): number {
 *       return 1;
 *     }
 *
 *     reduce(state: number, action: Object): number {
 *       switch(action.type) {
 *         case: 'add':
 *           return state + action.value;
 *         case: 'double':
 *           return state * 2;
 *         default:
 *           return state;
 *       }
 *     }
 *   }
 */

var FluxReduceStore = (function (_FluxStore) {
  _inherits$1(FluxReduceStore, _FluxStore);

  function FluxReduceStore(dispatcher) {
    _classCallCheck$5(this, FluxReduceStore);

    _FluxStore.call(this, dispatcher);
    this._state = this.getInitialState();
  }

  /**
   * Getter that exposes the entire state of this store. If your state is not
   * immutable you should override this and not expose _state directly.
   */

  FluxReduceStore.prototype.getState = function getState() {
    return this._state;
  };

  /**
   * Constructs the initial state for this store. This is called once during
   * construction of the store.
   */

  FluxReduceStore.prototype.getInitialState = function getInitialState() {
    return abstractMethod_1('FluxReduceStore', 'getInitialState');
  };

  /**
   * Used to reduce a stream of actions coming from the dispatcher into a
   * single state object.
   */

  FluxReduceStore.prototype.reduce = function reduce(state, action) {
    return abstractMethod_1('FluxReduceStore', 'reduce');
  };

  /**
   * Checks if two versions of state are the same. You do not need to override
   * this if your state is immutable.
   */

  FluxReduceStore.prototype.areEqual = function areEqual(one, two) {
    return one === two;
  };

  FluxReduceStore.prototype.__invokeOnDispatch = function __invokeOnDispatch(action) {
    this.__changed = false;

    // Reduce the stream of incoming actions to state, update when necessary.
    var startingState = this._state;
    var endingState = this.reduce(startingState, action);

    // This means your ending state should never be undefined.
    !(endingState !== undefined) ? process.env.NODE_ENV !== 'production' ? invariant_1(false, '%s returned undefined from reduce(...), did you forget to return ' + 'state in the default case? (use null if this was intentional)', this.constructor.name) : invariant_1(false) : undefined;

    if (!this.areEqual(startingState, endingState)) {
      this._state = endingState;

      // `__emitChange()` sets `this.__changed` to true and then the actual
      // change will be fired from the emitter at the end of the dispatch, this
      // is required in order to support methods like `hasChanged()`
      this.__emitChange();
    }

    if (this.__changed) {
      this.__emitter.emit(this.__changeEvent);
    }
  };

  return FluxReduceStore;
})(FluxStore_1);

var FluxReduceStore_1 = FluxReduceStore;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

var _listCacheClear = listCacheClear;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

var eq_1 = eq;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var _assocIndexOf = assocIndexOf;

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

var _listCacheDelete = listCacheDelete;

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

var _listCacheGet = listCacheGet;

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

var _listCacheHas = listCacheHas;

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

var _listCacheSet = listCacheSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;

var _ListCache = ListCache;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new _ListCache;
  this.size = 0;
}

var _stackClear = stackClear;

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

var _stackDelete = stackDelete;

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

var _stackGet = stackGet;

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

var _stackHas = stackHas;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

/** Built-in value references. */
var Symbol = _root.Symbol;

var _Symbol = Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject;

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject_1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction;

/** Used to detect overreaching core-js shims. */
var coreJsData = _root['__core-js_shared__'];

var _coreJsData = coreJsData;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

var _isMasked = isMasked;

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

var _toSource = toSource;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto$1 = Function.prototype,
    objectProto$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject_1(value) || _isMasked(value)) {
    return false;
  }
  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

var _baseIsNative = baseIsNative;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

var _getNative = getNative;

/* Built-in method references that are verified to be native. */
var Map = _getNative(_root, 'Map');

var _Map = Map;

/* Built-in method references that are verified to be native. */
var nativeCreate = _getNative(Object, 'create');

var _nativeCreate = nativeCreate;

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

var _hashClear = hashClear;

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var _hashDelete = hashDelete;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$3.call(data, key);
}

var _hashHas = hashHas;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

var _hashSet = hashSet;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;

var _Hash = Hash;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash,
    'map': new (_Map || _ListCache),
    'string': new _Hash
  };
}

var _mapCacheClear = mapCacheClear;

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

var _isKeyable = isKeyable;

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

var _getMapData = getMapData;

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

var _mapCacheDelete = mapCacheDelete;

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

var _mapCacheGet = mapCacheGet;

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

var _mapCacheHas = mapCacheHas;

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

var _mapCacheSet = mapCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;

var _MapCache = MapCache;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache) {
    var pairs = data.__data__;
    if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new _MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

var _stackSet = stackSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new _ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = _stackClear;
Stack.prototype['delete'] = _stackDelete;
Stack.prototype.get = _stackGet;
Stack.prototype.has = _stackHas;
Stack.prototype.set = _stackSet;

var _Stack = Stack;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED$2);
  return this;
}

var _setCacheAdd = setCacheAdd;

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

var _setCacheHas = setCacheHas;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new _MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
SetCache.prototype.has = _setCacheHas;

var _SetCache = SetCache;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

var _arraySome = arraySome;

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

var _cacheHas = cacheHas;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new _SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!_arraySome(other, function(othValue, othIndex) {
            if (!_cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

var _equalArrays = equalArrays;

/** Built-in value references. */
var Uint8Array$1 = _root.Uint8Array;

var _Uint8Array = Uint8Array$1;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

var _mapToArray = mapToArray;

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

var _setToArray = setToArray;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$1 = 1,
    COMPARE_UNORDERED_FLAG$1 = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq_1(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = _mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
      convert || (convert = _setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$1;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

var _equalByTag = equalByTag;

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var _arrayPush = arrayPush;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

var isArray_1 = isArray;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var _arrayFilter = arrayFilter;

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

var stubArray_1 = stubArray;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return _arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

var _getSymbols = getSymbols;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

var _baseTimes = baseTimes;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
}

var _baseIsArguments = baseIsArguments;

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
  return isObjectLike_1(value) && hasOwnProperty$4.call(value, 'callee') &&
    !propertyIsEnumerable$1.call(value, 'callee');
};

var isArguments_1 = isArguments;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

var stubFalse_1 = stubFalse;

var isBuffer_1 = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports =  exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse_1;

module.exports = isBuffer;
});

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}

var isLength_1 = isLength;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    errorTag$1 = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag$1 = '[object Map]',
    numberTag$1 = '[object Number]',
    objectTag = '[object Object]',
    regexpTag$1 = '[object RegExp]',
    setTag$1 = '[object Set]',
    stringTag$1 = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] =
typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag$1] =
typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag$1] = typedArrayTags[numberTag$1] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag$1] =
typedArrayTags[setTag$1] = typedArrayTags[stringTag$1] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike_1(value) &&
    isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
}

var _baseIsTypedArray = baseIsTypedArray;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

var _baseUnary = baseUnary;

var _nodeUtil = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports =  exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && _freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;
});

/* Node.js helper references. */
var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

var isTypedArray_1 = isTypedArray;

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_1(value),
      isArg = !isArr && isArguments_1(value),
      isBuff = !isArr && !isArg && isBuffer_1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? _baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$5.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           _isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

var _arrayLikeKeys = arrayLikeKeys;

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

  return value === proto;
}

var _isPrototype = isPrototype;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = _overArg(Object.keys, Object);

var _nativeKeys = nativeKeys;

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$9.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!_isPrototype(object)) {
    return _nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$6.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength_1(value.length) && !isFunction_1(value);
}

var isArrayLike_1 = isArrayLike;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
}

var keys_1 = keys;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return _baseGetAllKeys(object, keys_1, _getSymbols);
}

var _getAllKeys = getAllKeys;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$2 = 1;

/** Used for built-in method references. */
var objectProto$a = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$a.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
      objProps = _getAllKeys(object),
      objLength = objProps.length,
      othProps = _getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$7.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

var _equalObjects = equalObjects;

/* Built-in method references that are verified to be native. */
var DataView = _getNative(_root, 'DataView');

var _DataView = DataView;

/* Built-in method references that are verified to be native. */
var Promise$1 = _getNative(_root, 'Promise');

var _Promise = Promise$1;

/* Built-in method references that are verified to be native. */
var Set = _getNative(_root, 'Set');

var _Set = Set;

/* Built-in method references that are verified to be native. */
var WeakMap = _getNative(_root, 'WeakMap');

var _WeakMap = WeakMap;

/** `Object#toString` result references. */
var mapTag$2 = '[object Map]',
    objectTag$1 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$2 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';

var dataViewTag$2 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = _toSource(_DataView),
    mapCtorString = _toSource(_Map),
    promiseCtorString = _toSource(_Promise),
    setCtorString = _toSource(_Set),
    weakMapCtorString = _toSource(_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = _baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
    (_Map && getTag(new _Map) != mapTag$2) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set) != setTag$2) ||
    (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
  getTag = function(value) {
    var result = _baseGetTag(value),
        Ctor = result == objectTag$1 ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$2;
        case mapCtorString: return mapTag$2;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$2;
        case weakMapCtorString: return weakMapTag$1;
      }
    }
    return result;
  };
}

var _getTag = getTag;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$3 = 1;

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    objectTag$2 = '[object Object]';

/** Used for built-in method references. */
var objectProto$b = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$b.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_1(object),
      othIsArr = isArray_1(other),
      objTag = objIsArr ? arrayTag$1 : _getTag(object),
      othTag = othIsArr ? arrayTag$1 : _getTag(other);

  objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
  othTag = othTag == argsTag$2 ? objectTag$2 : othTag;

  var objIsObj = objTag == objectTag$2,
      othIsObj = othTag == objectTag$2,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer_1(object)) {
    if (!isBuffer_1(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new _Stack);
    return (objIsArr || isTypedArray_1(object))
      ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
    var objIsWrapped = objIsObj && hasOwnProperty$8.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$8.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new _Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new _Stack);
  return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

var _baseIsEqualDeep = baseIsEqualDeep;

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike_1(value) && !isObjectLike_1(other))) {
    return value !== value && other !== other;
  }
  return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

var _baseIsEqual = baseIsEqual;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$4 = 1,
    COMPARE_UNORDERED_FLAG$2 = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new _Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

var _baseIsMatch = baseIsMatch;

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject_1(value);
}

var _isStrictComparable = isStrictComparable;

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys_1(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, _isStrictComparable(value)];
  }
  return result;
}

var _getMatchData = getMatchData;

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

var _matchesStrictComparable = matchesStrictComparable;

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = _getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || _baseIsMatch(object, source, matchData);
  };
}

var _baseMatches = baseMatches;

/** `Object#toString` result references. */
var symbolTag$1 = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike_1(value) && _baseGetTag(value) == symbolTag$1);
}

var isSymbol_1 = isSymbol;

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray_1(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol_1(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

var _isKey = isKey;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || _MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = _MapCache;

var memoize_1 = memoize;

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize_1(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

var _memoizeCapped = memoizeCapped;

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = _memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

var _stringToPath = stringToPath;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

var _arrayMap = arrayMap;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
    symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray_1(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return _arrayMap(value, baseToString) + '';
  }
  if (isSymbol_1(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

var _baseToString = baseToString;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : _baseToString(value);
}

var toString_1 = toString;

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray_1(value)) {
    return value;
  }
  return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
}

var _castPath = castPath;

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol_1(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

var _toKey = toKey;

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = _castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[_toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

var _baseGet = baseGet;

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : _baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

var get_1 = get;

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

var _baseHasIn = baseHasIn;

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = _castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = _toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength_1(length) && _isIndex(key, length) &&
    (isArray_1(object) || isArguments_1(object));
}

var _hasPath = hasPath;

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && _hasPath(object, path, _baseHasIn);
}

var hasIn_1 = hasIn;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$5 = 1,
    COMPARE_UNORDERED_FLAG$3 = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (_isKey(path) && _isStrictComparable(srcValue)) {
    return _matchesStrictComparable(_toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get_1(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn_1(object, path)
      : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
  };
}

var _baseMatchesProperty = baseMatchesProperty;

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

var identity_1 = identity;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

var _baseProperty = baseProperty;

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return _baseGet(object, path);
  };
}

var _basePropertyDeep = basePropertyDeep;

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
}

var property_1 = property;

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity_1;
  }
  if (typeof value == 'object') {
    return isArray_1(value)
      ? _baseMatchesProperty(value[0], value[1])
      : _baseMatches(value);
  }
  return property_1(value);
}

var _baseIteratee = baseIteratee;

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

var _baseFindIndex = baseFindIndex;

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

var _baseIsNaN = baseIsNaN;

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

var _strictIndexOf = strictIndexOf;

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? _strictIndexOf(array, value, fromIndex)
    : _baseFindIndex(array, _baseIsNaN, fromIndex);
}

var _baseIndexOf = baseIndexOf;

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && _baseIndexOf(array, value, 0) > -1;
}

var _arrayIncludes = arrayIncludes;

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

var _arrayIncludesWith = arrayIncludesWith;

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

var noop_1 = noop;

/** Used as references for various `Number` constants. */
var INFINITY$2 = 1 / 0;

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(_Set && (1 / _setToArray(new _Set([,-0]))[1]) == INFINITY$2) ? noop_1 : function(values) {
  return new _Set(values);
};

var _createSet = createSet;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE$1 = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = _arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = _arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE$1) {
    var set = iteratee ? null : _createSet(array);
    if (set) {
      return _setToArray(set);
    }
    isCommon = false;
    includes = _cacheHas;
    seen = new _SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

var _baseUniq = baseUniq;

/**
 * This method is like `_.uniq` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the criterion by which
 * uniqueness is computed. The order of result values is determined by the
 * order they occur in the array. The iteratee is invoked with one argument:
 * (value).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
 * // => [2.1, 1.2]
 *
 * // The `_.property` iteratee shorthand.
 * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
 * // => [{ 'x': 1 }, { 'x': 2 }]
 */
function uniqBy(array, iteratee) {
  return (array && array.length) ? _baseUniq(array, _baseIteratee(iteratee)) : [];
}

var uniqBy_1 = uniqBy;

/** `Object#toString` result references. */
var mapTag$3 = '[object Map]',
    setTag$3 = '[object Set]';

/** Used for built-in method references. */
var objectProto$c = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$9 = objectProto$c.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike_1(value) &&
      (isArray_1(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        isBuffer_1(value) || isTypedArray_1(value) || isArguments_1(value))) {
    return !value.length;
  }
  var tag = _getTag(value);
  if (tag == mapTag$3 || tag == setTag$3) {
    return !value.size;
  }
  if (_isPrototype(value)) {
    return !_baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty$9.call(value, key)) {
      return false;
    }
  }
  return true;
}

var isEmpty_1 = isEmpty;

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return _baseIsEqual(value, other);
}

var isEqual_1 = isEqual;

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

var _arrayEach = arrayEach;

var defineProperty = (function() {
  try {
    var func = _getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

var _defineProperty$1 = defineProperty;

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && _defineProperty$1) {
    _defineProperty$1(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

var _baseAssignValue = baseAssignValue;

/** Used for built-in method references. */
var objectProto$d = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$a = objectProto$d.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$a.call(object, key) && eq_1(objValue, value)) ||
      (value === undefined && !(key in object))) {
    _baseAssignValue(object, key, value);
  }
}

var _assignValue = assignValue;

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      _baseAssignValue(object, key, newValue);
    } else {
      _assignValue(object, key, newValue);
    }
  }
  return object;
}

var _copyObject = copyObject;

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && _copyObject(source, keys_1(source), object);
}

var _baseAssign = baseAssign;

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

var _nativeKeysIn = nativeKeysIn;

/** Used for built-in method references. */
var objectProto$e = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$b = objectProto$e.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject_1(object)) {
    return _nativeKeysIn(object);
  }
  var isProto = _isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$b.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

var _baseKeysIn = baseKeysIn;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn$1(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
}

var keysIn_1 = keysIn$1;

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && _copyObject(source, keysIn_1(source), object);
}

var _baseAssignIn = baseAssignIn;

var _cloneBuffer = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports =  exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;
});

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

var _copyArray = copyArray;

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return _copyObject(source, _getSymbols(source), object);
}

var _copySymbols = copySymbols;

/** Built-in value references. */
var getPrototype = _overArg(Object.getPrototypeOf, Object);

var _getPrototype = getPrototype;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function(object) {
  var result = [];
  while (object) {
    _arrayPush(result, _getSymbols(object));
    object = _getPrototype(object);
  }
  return result;
};

var _getSymbolsIn = getSymbolsIn;

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return _copyObject(source, _getSymbolsIn(source), object);
}

var _copySymbolsIn = copySymbolsIn;

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
}

var _getAllKeysIn = getAllKeysIn;

/** Used for built-in method references. */
var objectProto$f = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$c = objectProto$f.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty$c.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

var _initCloneArray = initCloneArray;

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
  return result;
}

var _cloneArrayBuffer = cloneArrayBuffer;

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

var _cloneDataView = cloneDataView;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

var _cloneRegExp = cloneRegExp;

/** Used to convert symbols to primitives and strings. */
var symbolProto$2 = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf$1 = symbolProto$2 ? symbolProto$2.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {};
}

var _cloneSymbol = cloneSymbol;

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

var _cloneTypedArray = cloneTypedArray;

/** `Object#toString` result references. */
var boolTag$2 = '[object Boolean]',
    dateTag$2 = '[object Date]',
    mapTag$4 = '[object Map]',
    numberTag$2 = '[object Number]',
    regexpTag$2 = '[object RegExp]',
    setTag$4 = '[object Set]',
    stringTag$2 = '[object String]',
    symbolTag$2 = '[object Symbol]';

var arrayBufferTag$2 = '[object ArrayBuffer]',
    dataViewTag$3 = '[object DataView]',
    float32Tag$1 = '[object Float32Array]',
    float64Tag$1 = '[object Float64Array]',
    int8Tag$1 = '[object Int8Array]',
    int16Tag$1 = '[object Int16Array]',
    int32Tag$1 = '[object Int32Array]',
    uint8Tag$1 = '[object Uint8Array]',
    uint8ClampedTag$1 = '[object Uint8ClampedArray]',
    uint16Tag$1 = '[object Uint16Array]',
    uint32Tag$1 = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$2:
      return _cloneArrayBuffer(object);

    case boolTag$2:
    case dateTag$2:
      return new Ctor(+object);

    case dataViewTag$3:
      return _cloneDataView(object, isDeep);

    case float32Tag$1: case float64Tag$1:
    case int8Tag$1: case int16Tag$1: case int32Tag$1:
    case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
      return _cloneTypedArray(object, isDeep);

    case mapTag$4:
      return new Ctor;

    case numberTag$2:
    case stringTag$2:
      return new Ctor(object);

    case regexpTag$2:
      return _cloneRegExp(object);

    case setTag$4:
      return new Ctor;

    case symbolTag$2:
      return _cloneSymbol(object);
  }
}

var _initCloneByTag = initCloneByTag;

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject_1(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

var _baseCreate = baseCreate;

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !_isPrototype(object))
    ? _baseCreate(_getPrototype(object))
    : {};
}

var _initCloneObject = initCloneObject;

/** `Object#toString` result references. */
var mapTag$5 = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return isObjectLike_1(value) && _getTag(value) == mapTag$5;
}

var _baseIsMap = baseIsMap;

/* Node.js helper references. */
var nodeIsMap = _nodeUtil && _nodeUtil.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? _baseUnary(nodeIsMap) : _baseIsMap;

var isMap_1 = isMap;

/** `Object#toString` result references. */
var setTag$5 = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return isObjectLike_1(value) && _getTag(value) == setTag$5;
}

var _baseIsSet = baseIsSet;

/* Node.js helper references. */
var nodeIsSet = _nodeUtil && _nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? _baseUnary(nodeIsSet) : _baseIsSet;

var isSet_1 = isSet;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag$3 = '[object Arguments]',
    arrayTag$2 = '[object Array]',
    boolTag$3 = '[object Boolean]',
    dateTag$3 = '[object Date]',
    errorTag$2 = '[object Error]',
    funcTag$2 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    mapTag$6 = '[object Map]',
    numberTag$3 = '[object Number]',
    objectTag$3 = '[object Object]',
    regexpTag$3 = '[object RegExp]',
    setTag$6 = '[object Set]',
    stringTag$3 = '[object String]',
    symbolTag$3 = '[object Symbol]',
    weakMapTag$2 = '[object WeakMap]';

var arrayBufferTag$3 = '[object ArrayBuffer]',
    dataViewTag$4 = '[object DataView]',
    float32Tag$2 = '[object Float32Array]',
    float64Tag$2 = '[object Float64Array]',
    int8Tag$2 = '[object Int8Array]',
    int16Tag$2 = '[object Int16Array]',
    int32Tag$2 = '[object Int32Array]',
    uint8Tag$2 = '[object Uint8Array]',
    uint8ClampedTag$2 = '[object Uint8ClampedArray]',
    uint16Tag$2 = '[object Uint16Array]',
    uint32Tag$2 = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag$3] = cloneableTags[arrayTag$2] =
cloneableTags[arrayBufferTag$3] = cloneableTags[dataViewTag$4] =
cloneableTags[boolTag$3] = cloneableTags[dateTag$3] =
cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
cloneableTags[int32Tag$2] = cloneableTags[mapTag$6] =
cloneableTags[numberTag$3] = cloneableTags[objectTag$3] =
cloneableTags[regexpTag$3] = cloneableTags[setTag$6] =
cloneableTags[stringTag$3] = cloneableTags[symbolTag$3] =
cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
cloneableTags[errorTag$2] = cloneableTags[funcTag$2] =
cloneableTags[weakMapTag$2] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject_1(value)) {
    return value;
  }
  var isArr = isArray_1(value);
  if (isArr) {
    result = _initCloneArray(value);
    if (!isDeep) {
      return _copyArray(value, result);
    }
  } else {
    var tag = _getTag(value),
        isFunc = tag == funcTag$2 || tag == genTag$1;

    if (isBuffer_1(value)) {
      return _cloneBuffer(value, isDeep);
    }
    if (tag == objectTag$3 || tag == argsTag$3 || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : _initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? _copySymbolsIn(value, _baseAssignIn(result, value))
          : _copySymbols(value, _baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = _initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new _Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet_1(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap_1(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? _getAllKeysIn : _getAllKeys)
    : (isFlat ? keysIn : keys_1);

  var props = isArr ? undefined : keysFunc(value);
  _arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

var _baseClone = baseClone;

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

var last_1 = last;

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

var _baseSlice = baseSlice;

/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */
function parent(object, path) {
  return path.length < 2 ? object : _baseGet(object, _baseSlice(path, 0, -1));
}

var _parent = parent;

/**
 * The base implementation of `_.unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
function baseUnset(object, path) {
  path = _castPath(path, object);
  object = _parent(object, path);
  return object == null || delete object[_toKey(last_1(path))];
}

var _baseUnset = baseUnset;

/** `Object#toString` result references. */
var objectTag$4 = '[object Object]';

/** Used for built-in method references. */
var funcProto$2 = Function.prototype,
    objectProto$g = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$2 = funcProto$2.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$d = objectProto$g.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString$2.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag$4) {
    return false;
  }
  var proto = _getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$d.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString$2.call(Ctor) == objectCtorString;
}

var isPlainObject_1 = isPlainObject;

/**
 * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
 * objects.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {string} key The key of the property to inspect.
 * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
 */
function customOmitClone(value) {
  return isPlainObject_1(value) ? undefined : value;
}

var _customOmitClone = customOmitClone;

/** Built-in value references. */
var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray_1(value) || isArguments_1(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

var _isFlattenable = isFlattenable;

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = _isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        _arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

var _baseFlatten = baseFlatten;

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? _baseFlatten(array, 1) : [];
}

var flatten_1 = flatten;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

var _apply = apply;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return _apply(func, this, otherArgs);
  };
}

var _overRest = overRest;

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

var constant_1 = constant;

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !_defineProperty$1 ? identity_1 : function(func, string) {
  return _defineProperty$1(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant_1(string),
    'writable': true
  });
};

var _baseSetToString = baseSetToString;

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

var _shortOut = shortOut;

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = _shortOut(_baseSetToString);

var _setToString = setToString;

/**
 * A specialized version of `baseRest` which flattens the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @returns {Function} Returns the new function.
 */
function flatRest(func) {
  return _setToString(_overRest(func, undefined, flatten_1), func + '');
}

var _flatRest = flatRest;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$1 = 1,
    CLONE_FLAT_FLAG$1 = 2,
    CLONE_SYMBOLS_FLAG$1 = 4;

/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable property paths of `object` that are not omitted.
 *
 * **Note:** This method is considerably slower than `_.pick`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to omit.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */
var omit = _flatRest(function(object, paths) {
  var result = {};
  if (object == null) {
    return result;
  }
  var isDeep = false;
  paths = _arrayMap(paths, function(path) {
    path = _castPath(path, object);
    isDeep || (isDeep = path.length > 1);
    return path;
  });
  _copyObject(object, _getAllKeysIn(object), result);
  if (isDeep) {
    result = _baseClone(result, CLONE_DEEP_FLAG$1 | CLONE_FLAT_FLAG$1 | CLONE_SYMBOLS_FLAG$1, _customOmitClone);
  }
  var length = paths.length;
  while (length--) {
    _baseUnset(result, paths[length]);
  }
  return result;
});

var omit_1 = omit;

/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!isObject_1(object)) {
    return object;
  }
  path = _castPath(path, object);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = _toKey(path[index]),
        newValue = value;

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject_1(objValue)
          ? objValue
          : (_isIndex(path[index + 1]) ? [] : {});
      }
    }
    _assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

var _baseSet = baseSet;

/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};

  while (++index < length) {
    var path = paths[index],
        value = _baseGet(object, path);

    if (predicate(value, path)) {
      _baseSet(result, _castPath(path, object), value);
    }
  }
  return result;
}

var _basePickBy = basePickBy;

/**
 * The base implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @returns {Object} Returns the new object.
 */
function basePick(object, paths) {
  return _basePickBy(object, paths, function(value, path) {
    return hasIn_1(object, path);
  });
}

var _basePick = basePick;

/**
 * Creates an object composed of the picked `object` properties.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pick(object, ['a', 'c']);
 * // => { 'a': 1, 'c': 3 }
 */
var pick = _flatRest(function(object, paths) {
  return object == null ? {} : _basePick(object, paths);
});

var pick_1 = pick;

/**
 * Creates an object composed of the `object` properties `predicate` returns
 * truthy for. The predicate is invoked with two arguments: (value, key).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The source object.
 * @param {Function} [predicate=_.identity] The function invoked per property.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pickBy(object, _.isNumber);
 * // => { 'a': 1, 'c': 3 }
 */
function pickBy(object, predicate) {
  if (object == null) {
    return {};
  }
  var props = _arrayMap(_getAllKeysIn(object), function(prop) {
    return [prop];
  });
  predicate = _baseIteratee(predicate);
  return _basePickBy(object, props, function(value, path) {
    return predicate(value, path[0]);
  });
}

var pickBy_1 = pickBy;

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var _createBaseFor = createBaseFor;

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = _createBaseFor();

var _baseFor = baseFor;

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && _baseFor(object, iteratee, keys_1);
}

var _baseForOwn = baseForOwn;

/**
 * Creates an object with the same keys as `object` and values generated
 * by running each own enumerable string keyed property of `object` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, key, object).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @see _.mapKeys
 * @example
 *
 * var users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * };
 *
 * _.mapValues(users, function(o) { return o.age; });
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 *
 * // The `_.property` iteratee shorthand.
 * _.mapValues(users, 'age');
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */
function mapValues(object, iteratee) {
  var result = {};
  iteratee = _baseIteratee(iteratee);

  _baseForOwn(object, function(value, key, object) {
    _baseAssignValue(result, key, iteratee(value, key, object));
  });
  return result;
}

var mapValues_1 = mapValues;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return _root.Date.now();
};

var now_1 = now;

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol_1(value)) {
    return NAN;
  }
  if (isObject_1(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject_1(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var toNumber_1 = toNumber;

/** Error message constants. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax$1 = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber_1(wait) || 0;
  if (isObject_1(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax$1(toNumber_1(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now_1();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now_1());
  }

  function debounced() {
    var time = now_1(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

var debounce_1 = debounce;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$2 = 1,
    CLONE_SYMBOLS_FLAG$2 = 4;

/**
 * This method is like `_.cloneWith` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @param {Function} [customizer] The function to customize cloning.
 * @returns {*} Returns the deep cloned value.
 * @see _.cloneWith
 * @example
 *
 * function customizer(value) {
 *   if (_.isElement(value)) {
 *     return value.cloneNode(true);
 *   }
 * }
 *
 * var el = _.cloneDeepWith(document.body, customizer);
 *
 * console.log(el === document.body);
 * // => false
 * console.log(el.nodeName);
 * // => 'BODY'
 * console.log(el.childNodes.length);
 * // => 20
 */
function cloneDeepWith(value, customizer) {
  customizer = typeof customizer == 'function' ? customizer : undefined;
  return _baseClone(value, CLONE_DEEP_FLAG$2 | CLONE_SYMBOLS_FLAG$2, customizer);
}

var cloneDeepWith_1 = cloneDeepWith;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE$2 = 200;

/**
 * The base implementation of methods like `_.difference` without support
 * for excluding multiple arrays or iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values, iteratee, comparator) {
  var index = -1,
      includes = _arrayIncludes,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length;

  if (!length) {
    return result;
  }
  if (iteratee) {
    values = _arrayMap(values, _baseUnary(iteratee));
  }
  if (comparator) {
    includes = _arrayIncludesWith;
    isCommon = false;
  }
  else if (values.length >= LARGE_ARRAY_SIZE$2) {
    includes = _cacheHas;
    isCommon = false;
    values = new _SetCache(values);
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee == null ? value : iteratee(value);

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (!includes(values, computed, comparator)) {
      result.push(value);
    }
  }
  return result;
}

var _baseDifference = baseDifference;

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return _setToString(_overRest(func, start, identity_1), func + '');
}

var _baseRest = baseRest;

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike_1(value) && isArrayLike_1(value);
}

var isArrayLikeObject_1 = isArrayLikeObject;

/**
 * This method is like `_.difference` except that it accepts `iteratee` which
 * is invoked for each element of `array` and `values` to generate the criterion
 * by which they're compared. The order and references of result values are
 * determined by the first array. The iteratee is invoked with one argument:
 * (value).
 *
 * **Note:** Unlike `_.pullAllBy`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The values to exclude.
 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * _.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor);
 * // => [1.2]
 *
 * // The `_.property` iteratee shorthand.
 * _.differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x');
 * // => [{ 'x': 2 }]
 */
var differenceBy = _baseRest(function(array, values) {
  var iteratee = last_1(values);
  if (isArrayLikeObject_1(iteratee)) {
    iteratee = undefined;
  }
  return isArrayLikeObject_1(array)
    ? _baseDifference(array, _baseFlatten(values, 1, isArrayLikeObject_1, true), _baseIteratee(iteratee))
    : [];
});

var differenceBy_1 = differenceBy;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMin$1 = Math.min;

/**
 * The base implementation of methods like `_.intersection`, without support
 * for iteratee shorthands, that accepts an array of arrays to inspect.
 *
 * @private
 * @param {Array} arrays The arrays to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of shared values.
 */
function baseIntersection(arrays, iteratee, comparator) {
  var includes = comparator ? _arrayIncludesWith : _arrayIncludes,
      length = arrays[0].length,
      othLength = arrays.length,
      othIndex = othLength,
      caches = Array(othLength),
      maxLength = Infinity,
      result = [];

  while (othIndex--) {
    var array = arrays[othIndex];
    if (othIndex && iteratee) {
      array = _arrayMap(array, _baseUnary(iteratee));
    }
    maxLength = nativeMin$1(array.length, maxLength);
    caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
      ? new _SetCache(othIndex && array)
      : undefined;
  }
  array = arrays[0];

  var index = -1,
      seen = caches[0];

  outer:
  while (++index < length && result.length < maxLength) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (!(seen
          ? _cacheHas(seen, computed)
          : includes(result, computed, comparator)
        )) {
      othIndex = othLength;
      while (--othIndex) {
        var cache = caches[othIndex];
        if (!(cache
              ? _cacheHas(cache, computed)
              : includes(arrays[othIndex], computed, comparator))
            ) {
          continue outer;
        }
      }
      if (seen) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

var _baseIntersection = baseIntersection;

/**
 * Casts `value` to an empty array if it's not an array like object.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array|Object} Returns the cast array-like object.
 */
function castArrayLikeObject(value) {
  return isArrayLikeObject_1(value) ? value : [];
}

var _castArrayLikeObject = castArrayLikeObject;

/**
 * This method is like `_.intersection` except that it accepts `iteratee`
 * which is invoked for each element of each `arrays` to generate the criterion
 * by which they're compared. The order and references of result values are
 * determined by the first array. The iteratee is invoked with one argument:
 * (value).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
 * @returns {Array} Returns the new array of intersecting values.
 * @example
 *
 * _.intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor);
 * // => [2.1]
 *
 * // The `_.property` iteratee shorthand.
 * _.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
 * // => [{ 'x': 1 }]
 */
var intersectionBy = _baseRest(function(arrays) {
  var iteratee = last_1(arrays),
      mapped = _arrayMap(arrays, _castArrayLikeObject);

  if (iteratee === last_1(mapped)) {
    iteratee = undefined;
  } else {
    mapped.pop();
  }
  return (mapped.length && mapped[0] === arrays[0])
    ? _baseIntersection(mapped, _baseIteratee(iteratee))
    : [];
});

var intersectionBy_1 = intersectionBy;

function validate(data, constraints) {
  if (constraints === void 0) {
    constraints = {};
  }

  for (var name in data) {
    var _constraints$name, _constraints;

    if (!((_constraints$name = (_constraints = constraints)[name]) === null || _constraints$name === void 0 ? void 0 : _constraints$name.call(_constraints, data[name], data))) {
      return false;
    }
  }

  return true;
}

var AppStore = /*#__PURE__*/function (_ReduceStore) {
  _inheritsLoose(AppStore, _ReduceStore);

  function AppStore() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _ReduceStore.call.apply(_ReduceStore, [this].concat(args)) || this;

    _this.handleResetFromData = function (state) {
      return state; // return {
      //   ...state,
      //   lastSyncedAt: 1,
      // }
    };

    _this.handleResetFromStore = function () {
      return _this.getInitialState();
    };

    _this.handleTogglePushChanges = function (state, action) {
      return _objectSpread2({}, state, {}, _this.getInitialState(), {
        pushChanges: typeof action.payload === 'boolean' ? action.payload : !state.pushChanges
      });
    };

    _this.handleUpdateLastSyncTime = function (state, action) {
      if (state.lastSyncedAt === action.payload) {
        return state;
      }

      return _objectSpread2({}, state, {
        lastSyncedAt: action.payload
      });
    };

    _this.handleClearDatabase = function (state) {
      return _objectSpread2({}, state, {
        lastSyncedAt: 1
      });
    };

    _this.handleToggleShowDialogHelp = function (state, action) {
      return _objectSpread2({}, state, {
        showDialogHelp: Boolean(action.payload)
      });
    };

    _this.handleToggleSyncTagsAndNotes = function (state, action) {
      return _objectSpread2({}, state, {
        syncTagsAndNotes: Boolean(action.payload)
      });
    };

    return _this;
  }

  var _proto = AppStore.prototype;

  _proto.getInitialState = function getInitialState() {
    var state = _objectSpread2({}, localStore.store(this.key));

    if (state.showDialogHelp === undefined) {
      state.showDialogHelp = true;
    }

    if (state.pushChanges === undefined) {
      state.pushChanges = true;
    }

    if (state.lastSyncedAt === undefined) {
      state.lastSyncedAt = 1;
    }

    if (state.syncTagsAndNotes === undefined) {
      state.syncTagsAndNotes = true;
    }

    return state;
  };

  _proto.getStoreState = function getStoreState() {
    return this.getState();
  };

  _proto.canSyncTagsAndNotes = function canSyncTagsAndNotes() {
    return this.getState().syncTagsAndNotes;
  };

  _proto.canShowDialogHelp = function canShowDialogHelp() {
    return this.getState().showDialogHelp;
  };

  _proto.canPushChanges = function canPushChanges() {
    return this.getState().pushChanges;
  };

  _proto.getLastSyncedAt = function getLastSyncedAt() {
    return this.getState().lastSyncedAt || 1;
  };

  _proto.reduce = function reduce(state, action) {
    if (action.type && typeof this.actions[action.type] === 'function') {
      return this.actions[action.type](state, action);
    }

    return state;
  };

  _createClass(AppStore, [{
    key: "key",
    get: function get() {
      return 'app';
    }
  }, {
    key: "actions",
    get: function get() {
      var _ref;

      return _ref = {}, _ref[CLEAR_DATABASE] = this.handleClearDatabase, _ref[RESET_FROM_DATA] = this.handleResetFromData, _ref[RESET_FROM_STORE] = this.handleResetFromStore, _ref[TOGGLE_PUSH_CHANGES] = this.handleTogglePushChanges, _ref[TOGGLE_SHOW_DIALOG_HELP] = this.handleToggleShowDialogHelp, _ref[TOGGLE_SYNC_TAGS_AND_NOTES] = this.handleToggleSyncTagsAndNotes, _ref[UPDATE_LAST_SYNC_TIME] = this.handleUpdateLastSyncTime, _ref;
    }
  }]);

  return AppStore;
}(FluxReduceStore_1);

var appStore = new AppStore(dispatcher);

var INITIAL_STATE = {
  items: {}
};

var UserTagsStore = /*#__PURE__*/function (_ReduceStore) {
  _inheritsLoose(UserTagsStore, _ReduceStore);

  function UserTagsStore() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _ReduceStore.call.apply(_ReduceStore, [this].concat(args)) || this;

    _this.handleMergeData = function (state, action) {
      var _action$payload, _action$payload$data, _action$payload$data$;

      var data = (action === null || action === void 0 ? void 0 : (_action$payload = action.payload) === null || _action$payload === void 0 ? void 0 : (_action$payload$data = _action$payload.data) === null || _action$payload$data === void 0 ? void 0 : (_action$payload$data$ = _action$payload$data.userTags) === null || _action$payload$data$ === void 0 ? void 0 : _action$payload$data$.items) || [];
      data = Array.isArray(data) ? data : [];

      if (isEmpty_1(data)) {
        return state;
      }

      var items = data.reduce(function (out, item) {
        var _state$items;

        var key = _this.createKey(item.tagName);

        out[key] = {
          tagName: item.tagName,
          tagUserNote: item.tagUserNote,
          dirty: (state === null || state === void 0 ? void 0 : (_state$items = state.items) === null || _state$items === void 0 ? void 0 : _state$items[key]) ? 2 : 1
        };
        return out;
      }, {});

      if (_this.descriptor) {
        items = Object.values(items).filter(function (item) {
          return validate(item, _this.descriptor);
        }).reduce(function (out, item) {
          out[_this.createKey(item.tagName)] = item;
          return out;
        }, {});
      }

      return _objectSpread2({}, state, {
        items: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, {}, items)
      });
    };

    _this.handleResetFromData = function (state, action) {
      var _action$payload2, _action$payload2$user;

      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      var data = ((_action$payload2 = action.payload) === null || _action$payload2 === void 0 ? void 0 : (_action$payload2$user = _action$payload2.userTags) === null || _action$payload2$user === void 0 ? void 0 : _action$payload2$user.items) || [];
      data = Array.isArray(data) ? data : [];

      if (_this.descriptor) {
        data = data.filter(function (item) {
          return validate(item, _this.descriptor);
        });
      }

      var prevData = Object.values(state.items || {});
      var created = differenceBy_1(data, prevData, function (item) {
        return _this.createKey(item.tagName);
      });
      var removed = differenceBy_1(prevData, data, function (item) {
        return _this.createKey(item.tagName);
      });
      var updated = intersectionBy_1(data, prevData, function (item) {
        return _this.createKey(item.tagName);
      });

      var create = function create(item) {
        return {
          tagName: item.tagName,
          tagUserNote: item.tagUserNote
        };
      };

      return {
        items: _objectSpread2({}, created.reduce(function (out, item) {
          out[_this.createKey(item.tagName)] = _objectSpread2({}, create(item), {
            dirty: 1
          });
          return out;
        }, {}), {}, updated.reduce(function (out, item) {
          out[_this.createKey(item.tagName)] = _objectSpread2({}, create(item), {
            dirty: 2
          });
          return out;
        }, {}), {}, removed.reduce(function (out, item) {
          out[_this.createKey(item.tagName)] = _objectSpread2({}, create(item), {
            removed: true
          });
          return out;
        }, {}))
      };
    };

    _this.handleClearDatabase = function () {
      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      return INITIAL_STATE;
    };

    _this.handleResetFromStore = function () {
      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      return _this.getInitialState();
    };

    _this.handleAddAddressTag = function (state, action) {
      var _state$items2, _objectSpread2$1;

      var tagName = action.payload.tag;

      var key = _this.createKey(tagName);

      var prevData = state === null || state === void 0 ? void 0 : (_state$items2 = state.items) === null || _state$items2 === void 0 ? void 0 : _state$items2[key];
      prevData = prevData && !prevData.removed ? prevData : undefined;
      return _objectSpread2({}, state, {
        items: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread2$1 = {}, _objectSpread2$1[key] = {
          tagName: tagName,
          tagUserNote: undefined,
          dirty: prevData ? prevData.dirty || 2 : 1,
          removed: false
        }, _objectSpread2$1))
      });
    };

    _this.handleReplaceAddressTagsAndNote = function (state, action) {
      var _action$payload3;

      if (!(action === null || action === void 0 ? void 0 : (_action$payload3 = action.payload) === null || _action$payload3 === void 0 ? void 0 : _action$payload3.tags)) {
        return state;
      }

      var tags = action.payload.tags.reduce(function (out, tagName) {
        var _state$items3;

        var key = _this.createKey(tagName);

        var prevData = state === null || state === void 0 ? void 0 : (_state$items3 = state.items) === null || _state$items3 === void 0 ? void 0 : _state$items3[key];
        prevData = prevData && !prevData.removed ? prevData : undefined;
        out[key] = {
          tagName: tagName,
          tagUserNote: undefined,
          dirty: prevData ? prevData.dirty || 2 : 1,
          removed: false
        };
        return out;
      }, {});
      return _objectSpread2({}, state, {
        items: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, {}, tags)
      });
    };

    _this.handleSyncChanges = function (state, action) {
      var _action$payload4, _state, _ref, _ref$reduce, _ref2, _ref2$reduce;

      if (!(action === null || action === void 0 ? void 0 : (_action$payload4 = action.payload) === null || _action$payload4 === void 0 ? void 0 : _action$payload4.userTag)) {
        return state;
      }

      var _action$payload$userT = action.payload.userTag,
          created = _action$payload$userT.created,
          updated = _action$payload$userT.updated,
          deleted = _action$payload$userT.deleted,
          update = _action$payload$userT.update,
          insert = _action$payload$userT.insert,
          remove = _action$payload$userT.remove;

      if (!isEmpty_1(deleted) || !isEmpty_1(remove)) {
        var keys = (deleted || remove).map(function (item) {
          var _item$tagName;

          return _this.createKey((_item$tagName = item === null || item === void 0 ? void 0 : item.tagName) !== null && _item$tagName !== void 0 ? _item$tagName : item);
        });
        state = _objectSpread2({}, state, {
          items: omit_1(state.items, keys)
        });
      }

      state = _objectSpread2({}, state, {
        items: _objectSpread2({}, (_state = state) === null || _state === void 0 ? void 0 : _state.items, {}, (_ref = created || insert) === null || _ref === void 0 ? void 0 : (_ref$reduce = _ref.reduce) === null || _ref$reduce === void 0 ? void 0 : _ref$reduce.call(_ref, function (out, item) {
          var _Object$assign;

          return Object.assign(out, (_Object$assign = {}, _Object$assign[_this.createKey(item.tagName)] = item, _Object$assign));
        }, {}), {}, (_ref2 = updated || update) === null || _ref2 === void 0 ? void 0 : (_ref2$reduce = _ref2.reduce) === null || _ref2$reduce === void 0 ? void 0 : _ref2$reduce.call(_ref2, function (out, item) {
          var _Object$assign2;

          return Object.assign(out, (_Object$assign2 = {}, _Object$assign2[_this.createKey(item.tagName)] = item, _Object$assign2));
        }, {}))
      });
      return state;
    };

    _this.handleMarkAllAsDirty = function (state) {
      var items = {};

      for (var key in state.items) {
        var _state$items$key$dirt, _state$items$key;

        items[key] = _objectSpread2({}, state.items[key], {
          dirty: (_state$items$key$dirt = (_state$items$key = state.items[key]) === null || _state$items$key === void 0 ? void 0 : _state$items$key.dirty) !== null && _state$items$key$dirt !== void 0 ? _state$items$key$dirt : 1
        });
      }

      return _objectSpread2({}, state, {
        items: items
      });
    };

    _this.handleUpdateDirtyStatus = function (state, action) {
      var _action$payload$tags, _action$payload5, _action$payload6, _action$payload7;

      var tags = (_action$payload$tags = action === null || action === void 0 ? void 0 : (_action$payload5 = action.payload) === null || _action$payload5 === void 0 ? void 0 : _action$payload5.tags) !== null && _action$payload$tags !== void 0 ? _action$payload$tags : [];
      var from = action === null || action === void 0 ? void 0 : (_action$payload6 = action.payload) === null || _action$payload6 === void 0 ? void 0 : _action$payload6.from;
      var to = action === null || action === void 0 ? void 0 : (_action$payload7 = action.payload) === null || _action$payload7 === void 0 ? void 0 : _action$payload7.to;

      if (isEmpty_1(tags) || !from || !to) {
        return state;
      }

      var items = {};

      for (var key in state.items) {
        var _state$items$key2;

        var dirty = (_state$items$key2 = state.items[key]) === null || _state$items$key2 === void 0 ? void 0 : _state$items$key2.dirty;

        if (dirty === from && tags.indexOf(key) !== -1) {
          items[key] = _objectSpread2({}, state.items[key], {
            dirty: to
          });
        } else {
          items[key] = state.items[key];
        }
      }

      return _objectSpread2({}, state, {
        items: items
      });
    };

    return _this;
  }

  var _proto = UserTagsStore.prototype;

  _proto.createKey = function createKey(data) {
    return String(data).toLowerCase();
  };

  _proto.setDescriptor = function setDescriptor(data) {
    this.descriptor = data;
  };

  _proto.getInitialState = function getInitialState() {
    return localStore.store(this.key) || INITIAL_STATE;
  };

  _proto.getStoreState = function getStoreState() {
    var _this$getState = this.getState(),
        items = _this$getState.items;

    return {
      items: items
    };
  };

  _proto.getExportJSON = function getExportJSON() {
    var state = this.getState();
    return {
      userTags: {
        items: Object.values(state.items).filter(function (item) {
          return !item.removed;
        }).map(function (item) {
          return {
            tagName: item.tagName,
            tagUserNote: item.tagUserNote
          };
        })
      }
    };
  };

  _proto.getTags = function getTags() {
    var state = this.getState();
    return Object.values(state.items).filter(function (item) {
      return !item.removed;
    }).map(function (item) {
      return item.tagName;
    }).sort();
  };

  _proto.getTag = function getTag(key) {
    key = this.createKey(key);
    var state = this.getState();
    var tag = state.items[key];
    return tag && !tag.removed ? tag : undefined;
  };

  _proto.hasTag = function hasTag(key) {
    key = this.createKey(key);
    var state = this.getState();
    return Boolean(state.items[key] && !state.items[key].removed);
  };

  _proto.getChanges = function getChanges()
  /* timestamp */
  {
    var state = this.getState();
    var remove = Object.values(mapValues_1(pickBy_1(state.items, function (item) {
      return item.removed;
    }), function (item) {
      return {
        tagName: item.tagName
      };
    }));
    var insert = Object.values(mapValues_1(pickBy_1(state.items, function (item) {
      return item.dirty === 1 && !item.removed;
    }), function (item) {
      return {
        tagName: item.tagName,
        tagUserNote: item.tagUserNote
      };
    }));
    var update = Object.values(mapValues_1(pickBy_1(state.items, function (item) {
      return item.dirty === 2 && !item.removed;
    }), function (item) {
      return {
        tagName: item.tagName,
        tagUserNote: item.tagUserNote
      };
    }));

    if (isEmpty_1(remove) && isEmpty_1(insert) && isEmpty_1(update)) {
      return;
    }

    return {
      userTag: {
        update: update,
        insert: insert,
        remove: remove
      }
    };
  };

  _proto.reduce = function reduce(state, action) {
    if (action.type && typeof this.actions[action.type] === 'function') {
      return this.actions[action.type](state, action);
    }

    return state;
  };

  _createClass(UserTagsStore, [{
    key: "key",
    get: function get() {
      return 'userTags';
    }
  }, {
    key: "actions",
    get: function get() {
      var _ref3;

      return _ref3 = {}, _ref3[ADD_ADDRESS_TAG] = this.handleAddAddressTag, _ref3[CLEAR_DATABASE] = this.handleClearDatabase, _ref3[MARK_ALL_AS_DIRTY] = this.handleMarkAllAsDirty, _ref3[MERGE_DATA] = this.handleMergeData, _ref3[REPLACE_ADDRESS_TAGS_AND_NOTE] = this.handleReplaceAddressTagsAndNote, _ref3[RESET_FROM_DATA] = this.handleResetFromData, _ref3[RESET_FROM_STORE] = this.handleResetFromStore, _ref3[SYNC_CHANGES] = this.handleSyncChanges, _ref3[UPDATE_DIRTY_STATUS] = this.handleUpdateDirtyStatus, _ref3;
    }
  }]);

  return UserTagsStore;
}(FluxReduceStore_1);

var userTagsStore = new UserTagsStore(dispatcher);

var INITIAL_STATE$1 = {
  items: {},
  tmpRemoved: {}
};

var UserAddressesStore = /*#__PURE__*/function (_ReduceStore) {
  _inheritsLoose(UserAddressesStore, _ReduceStore);

  function UserAddressesStore() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _ReduceStore.call.apply(_ReduceStore, [this].concat(args)) || this;

    _this.handleMergeData = function (state, action) {
      var _action$payload, _action$payload$data, _action$payload$data$;

      _this.getDispatcher().waitFor([userTagsStore.getDispatchToken()]);

      var data = (action === null || action === void 0 ? void 0 : (_action$payload = action.payload) === null || _action$payload === void 0 ? void 0 : (_action$payload$data = _action$payload.data) === null || _action$payload$data === void 0 ? void 0 : (_action$payload$data$ = _action$payload$data.userAddresses) === null || _action$payload$data$ === void 0 ? void 0 : _action$payload$data$.items) || [];
      data = Array.isArray(data) ? data : [];

      if (isEmpty_1(data)) {
        return state;
      }

      var now = Date.now();
      var isTargetPriority = action.payload.isTargetPriority;
      var items = data.reduce(function (out, item) {
        var _state$items, _currentData$addressT;

        var key = _this.createKey(item.address);

        var currentData = state === null || state === void 0 ? void 0 : (_state$items = state.items) === null || _state$items === void 0 ? void 0 : _state$items[key];
        var nextData = {
          address: item.address,
          addressTags: uniqBy_1([].concat((_currentData$addressT = currentData === null || currentData === void 0 ? void 0 : currentData.addressTags) !== null && _currentData$addressT !== void 0 ? _currentData$addressT : [], item.addressTags), function (tag) {
            return userTagsStore.createKey(tag);
          }),
          addressUserNote: isTargetPriority ? (currentData === null || currentData === void 0 ? void 0 : currentData.addressUserNote) || item.addressUserNote : item.addressUserNote || (currentData === null || currentData === void 0 ? void 0 : currentData.addressUserNote),
          createdTime: isTargetPriority ? (currentData === null || currentData === void 0 ? void 0 : currentData.createdTime) || item.createdTime || now : item.createdTime && item.updatedTime ? item.createdTime : (currentData === null || currentData === void 0 ? void 0 : currentData.createdTime) || now,
          updatedTime: isTargetPriority ? (currentData === null || currentData === void 0 ? void 0 : currentData.updatedTime) || item.updatedTime || now : item.createdTime && item.updatedTime ? item.updatedTime : (currentData === null || currentData === void 0 ? void 0 : currentData.updatedTime) || now
        };

        if (!currentData) {
          nextData.dirty = 1;
        } else if (!isEqual_1(pick_1(currentData, ['addressTags', 'addressUserNote', 'createdTime', 'updatedTime']), pick_1(nextData, ['addressTags', 'addressUserNote', 'createdTime', 'updatedTime']))) {
          nextData.dirty = 2;
        }

        out[key] = nextData;
        return out;
      }, {});
      items = items.map(function (item) {
        return _objectSpread2({}, item, {
          addressTags: Array.isArray(item.addressTags) ? item.addressTags.filter(function (item) {
            return userTagsStore.hasTag(item);
          }) : []
        });
      });

      if (_this.descriptor) {
        items = Object.values(items).filter(function (item) {
          return validate(item, _this.descriptor);
        }).reduce(function (out, item) {
          out[_this.createKey(item.address)] = item;
          return out;
        }, {});
      }

      return _objectSpread2({}, state, {
        tmpRemoved: omit_1(state === null || state === void 0 ? void 0 : state.tmpRemoved, Object.keys(items)),
        items: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, {}, items)
      });
    };

    _this.handleResetFromData = function (state, action) {
      var _action$payload2, _action$payload2$user;

      _this.getDispatcher().waitFor([appStore.getDispatchToken(), userTagsStore.getDispatchToken()]);

      var data = ((_action$payload2 = action.payload) === null || _action$payload2 === void 0 ? void 0 : (_action$payload2$user = _action$payload2.userAddresses) === null || _action$payload2$user === void 0 ? void 0 : _action$payload2$user.items) || [];
      data = Array.isArray(data) ? data : [];
      data = data.map(function (item) {
        return _objectSpread2({}, item, {
          addressTags: Array.isArray(item.addressTags) ? item.addressTags.filter(function (item) {
            return userTagsStore.hasTag(item);
          }) : []
        });
      });

      if (_this.descriptor) {
        data = data.filter(function (item) {
          return validate(item, _this.descriptor);
        });
      }

      var prevData = Object.values(state.items || {});
      var created = differenceBy_1(data, prevData, function (item) {
        return _this.createKey(item.address);
      });
      var removed = differenceBy_1(prevData, data, function (item) {
        return _this.createKey(item.address);
      });
      var updated = intersectionBy_1(data, prevData, function (item) {
        return _this.createKey(item.address);
      });
      var now = Date.now();

      var create = function create(item) {
        return {
          address: item.address,
          addressTags: item.addressTags,
          addressUserNote: item.addressUserNote,
          createdTime: item.createdTime || now,
          updatedTime: item.updatedTime || now
        };
      };

      return {
        tmpRemoved: {},
        items: _objectSpread2({}, created.reduce(function (out, item) {
          out[_this.createKey(item.address)] = _objectSpread2({}, create(item), {
            dirty: 1
          });
          return out;
        }, {}), {}, updated.reduce(function (out, item) {
          out[_this.createKey(item.address)] = _objectSpread2({}, create(item), {
            dirty: 2
          });
          return out;
        }, {}), {}, removed.reduce(function (out, item) {
          out[_this.createKey(item.address)] = _objectSpread2({}, create(item), {
            removed: true
          });
          return out;
        }, {}))
      };
    };

    _this.handleClearDatabase = function () {
      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      return INITIAL_STATE$1;
    };

    _this.handleResetFromStore = function () {
      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      return _this.getInitialState();
    };

    _this.handleRemoveAddressTag = function (state, action) {
      var _state$items2, _prevData$addressTags, _prevData, _objectSpread4;

      var now = Date.now();
      var data = action.payload;
      var keyTag = userTagsStore.createKey(data.tag);

      var keyAddress = _this.createKey(data.address);

      var prevData = state === null || state === void 0 ? void 0 : (_state$items2 = state.items) === null || _state$items2 === void 0 ? void 0 : _state$items2[keyAddress];
      prevData = prevData && !prevData.removed ? prevData : undefined;
      var addressTags = (_prevData$addressTags = (_prevData = prevData) === null || _prevData === void 0 ? void 0 : _prevData.addressTags) !== null && _prevData$addressTags !== void 0 ? _prevData$addressTags : [];
      addressTags = addressTags.filter(function (item) {
        return userTagsStore.createKey(item) !== keyTag;
      });

      if (prevData && isEmpty_1(addressTags) && isEmpty_1(prevData.addressUserNote)) {
        var _objectSpread2$1, _prevData2, _objectSpread3;

        var _item = _objectSpread2({
          createdTime: now
        }, prevData, {
          address: data.address,
          addressTags: addressTags,
          removed: true,
          updatedTime: now
        });

        return _objectSpread2({}, state, {
          tmpRemoved: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.tmpRemoved, (_objectSpread2$1 = {}, _objectSpread2$1[keyAddress] = _item, _objectSpread2$1)),
          items: ((_prevData2 = prevData) === null || _prevData2 === void 0 ? void 0 : _prevData2.dirty) === 1 ? omit_1(state.items, [keyAddress]) : _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread3 = {}, _objectSpread3[keyAddress] = _item, _objectSpread3))
        });
      }

      var item = _objectSpread2({
        createdTime: now
      }, prevData, {
        address: data.address,
        addressTags: addressTags,
        dirty: prevData ? prevData.dirty || 2 : 1,
        removed: false,
        updatedTime: now
      });

      return _objectSpread2({}, state, {
        tmpRemoved: omit_1(state === null || state === void 0 ? void 0 : state.tmpRemoved, [keyAddress]),
        items: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread4 = {}, _objectSpread4[keyAddress] = item, _objectSpread4))
      });
    };

    _this.handleAddAddressTag = function (state, action) {
      var _state$items3, _prevData$addressTags2, _prevData3, _objectSpread5;

      _this.getDispatcher().waitFor([userTagsStore.getDispatchToken()]);

      var data = action.payload;
      var keyTag = userTagsStore.createKey(data.tag);

      var keyAddress = _this.createKey(data.address);

      var prevData = state === null || state === void 0 ? void 0 : (_state$items3 = state.items) === null || _state$items3 === void 0 ? void 0 : _state$items3[keyAddress];
      prevData = prevData && !prevData.removed ? prevData : undefined;
      var addressTags = (_prevData$addressTags2 = (_prevData3 = prevData) === null || _prevData3 === void 0 ? void 0 : _prevData3.addressTags) !== null && _prevData$addressTags2 !== void 0 ? _prevData$addressTags2 : [];
      var now = Date.now();
      return _objectSpread2({}, state, {
        tmpRemoved: omit_1(state === null || state === void 0 ? void 0 : state.tmpRemoved, [keyAddress]),
        items: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread5 = {}, _objectSpread5[keyAddress] = _objectSpread2({
          createdTime: now
        }, prevData, {
          address: data.address,
          addressTags: addressTags.concat(data.tag),
          dirty: prevData ? prevData.dirty || 2 : 1,
          removed: false,
          updatedTime: now
        }), _objectSpread5))
      });
    };

    _this.handleReplaceAddressTagsAndNote = function (state, action) {
      var _state$items4, _objectSpread8;

      _this.getDispatcher().waitFor([userTagsStore.getDispatchToken()]);

      var data = action.payload;

      var keyAddress = _this.createKey(data.address);

      var prevData = state === null || state === void 0 ? void 0 : (_state$items4 = state.items) === null || _state$items4 === void 0 ? void 0 : _state$items4[keyAddress];
      prevData = prevData && !prevData.removed ? prevData : undefined;
      var addressTags = uniqBy_1(data.tags, function (item) {
        return userTagsStore.createKey(item);
      });
      var now = Date.now();

      if (isEmpty_1(addressTags) && isEmpty_1(data.note)) {
        var _objectSpread6, _prevData4, _objectSpread7;

        if (!prevData) {
          return state;
        }

        var _item2 = _objectSpread2({
          createdTime: now
        }, prevData, {
          addressTags: addressTags,
          addressUserNote: data.note,
          address: data.address,
          removed: true,
          updatedTime: now
        });

        return _objectSpread2({}, state, {
          tmpRemoved: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.tmpRemoved, (_objectSpread6 = {}, _objectSpread6[keyAddress] = _item2, _objectSpread6)),
          items: ((_prevData4 = prevData) === null || _prevData4 === void 0 ? void 0 : _prevData4.dirty) === 1 ? omit_1(state.items, [keyAddress]) : _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread7 = {}, _objectSpread7[keyAddress] = _item2, _objectSpread7))
        });
      }

      var item = _objectSpread2({
        createdTime: now
      }, prevData, {
        addressTags: addressTags,
        addressUserNote: data.note,
        address: data.address,
        dirty: prevData ? prevData.dirty || 2 : 1,
        removed: false,
        updatedTime: now
      });

      return _objectSpread2({}, state, {
        tmpRemoved: omit_1(state === null || state === void 0 ? void 0 : state.tmpRemoved, [keyAddress]),
        items: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread8 = {}, _objectSpread8[keyAddress] = item, _objectSpread8))
      });
    };

    _this.handleRemoveAddress = function (state, action) {
      var _state$items5, _objectSpread9, _objectSpread10;

      var keyAddress = _this.createKey(action.payload);

      var prevData = state === null || state === void 0 ? void 0 : (_state$items5 = state.items) === null || _state$items5 === void 0 ? void 0 : _state$items5[keyAddress];

      var item = _objectSpread2({}, prevData, {
        removed: true
      });

      return _objectSpread2({}, state, {
        tmpRemoved: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.tmpRemoved, (_objectSpread9 = {}, _objectSpread9[keyAddress] = item, _objectSpread9)),
        items: (prevData === null || prevData === void 0 ? void 0 : prevData.dirty) === 1 ? omit_1(state.items, [keyAddress]) : _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread10 = {}, _objectSpread10[keyAddress] = item, _objectSpread10))
      });
    };

    _this.handleSyncChanges = function (state, action) {
      var _action$payload3, _map, _ref, _ref$map, _map2, _ref2, _ref2$map, _state, _ref3, _ref3$reduce, _ref4, _ref4$reduce;

      _this.getDispatcher().waitFor([userTagsStore.getDispatchToken()]);

      if (!(action === null || action === void 0 ? void 0 : (_action$payload3 = action.payload) === null || _action$payload3 === void 0 ? void 0 : _action$payload3.userAddress)) {
        return state;
      }

      var _action$payload$userA = action.payload.userAddress,
          created = _action$payload$userA.created,
          updated = _action$payload$userA.updated,
          deleted = _action$payload$userA.deleted,
          update = _action$payload$userA.update,
          insert = _action$payload$userA.insert,
          remove = _action$payload$userA.remove;

      if (!isEmpty_1(deleted) || !isEmpty_1(remove)) {
        var _keys = (deleted || remove).map(function (item) {
          var _item$address;

          return _this.createKey((_item$address = item === null || item === void 0 ? void 0 : item.address) !== null && _item$address !== void 0 ? _item$address : item);
        });

        state = _objectSpread2({}, state, {
          items: omit_1(state.items, _keys)
        });
      }

      var keys = [].concat((_map = (_ref = created || insert) === null || _ref === void 0 ? void 0 : (_ref$map = _ref.map) === null || _ref$map === void 0 ? void 0 : _ref$map.call(_ref, function (item) {
        return _this.createKey(item.address);
      })) !== null && _map !== void 0 ? _map : [], (_map2 = (_ref2 = updated || update) === null || _ref2 === void 0 ? void 0 : (_ref2$map = _ref2.map) === null || _ref2$map === void 0 ? void 0 : _ref2$map.call(_ref2, function (item) {
        return _this.createKey(item.address);
      })) !== null && _map2 !== void 0 ? _map2 : []);
      state = _objectSpread2({}, state, {
        tmpRemoved: omit_1(state.tmpRemoved, keys),
        items: _objectSpread2({}, (_state = state) === null || _state === void 0 ? void 0 : _state.items, {}, (_ref3 = created || insert) === null || _ref3 === void 0 ? void 0 : (_ref3$reduce = _ref3.reduce) === null || _ref3$reduce === void 0 ? void 0 : _ref3$reduce.call(_ref3, function (out, item) {
          var _Object$assign;

          return Object.assign(out, (_Object$assign = {}, _Object$assign[_this.createKey(item.address)] = _objectSpread2({}, item, {
            createdTime: item.clientCreatedTime || item.createdTime,
            updatedTime: item.clientUpdatedTime || item.updatedTime
          }), _Object$assign));
        }, {}), {}, (_ref4 = updated || update) === null || _ref4 === void 0 ? void 0 : (_ref4$reduce = _ref4.reduce) === null || _ref4$reduce === void 0 ? void 0 : _ref4$reduce.call(_ref4, function (out, item) {
          var _Object$assign2;

          return Object.assign(out, (_Object$assign2 = {}, _Object$assign2[_this.createKey(item.address)] = _objectSpread2({}, item, {
            createdTime: item.clientCreatedTime || item.createdTime,
            updatedTime: item.clientUpdatedTime || item.updatedTime
          }), _Object$assign2));
        }, {}))
      });
      return state;
    };

    _this.handleMarkAllAsDirty = function (state) {
      var items = {};

      for (var key in state.items) {
        var _state$items$key$dirt, _state$items$key;

        items[key] = _objectSpread2({}, state.items[key], {
          dirty: (_state$items$key$dirt = (_state$items$key = state.items[key]) === null || _state$items$key === void 0 ? void 0 : _state$items$key.dirty) !== null && _state$items$key$dirt !== void 0 ? _state$items$key$dirt : 1
        });
      }

      return _objectSpread2({}, state, {
        items: items
      });
    };

    _this.handleUpdateDirtyStatus = function (state, action) {
      var _action$payload$addre, _action$payload4, _action$payload5, _action$payload6;

      var addresses = (_action$payload$addre = action === null || action === void 0 ? void 0 : (_action$payload4 = action.payload) === null || _action$payload4 === void 0 ? void 0 : _action$payload4.addresses) !== null && _action$payload$addre !== void 0 ? _action$payload$addre : [];
      var from = action === null || action === void 0 ? void 0 : (_action$payload5 = action.payload) === null || _action$payload5 === void 0 ? void 0 : _action$payload5.from;
      var to = action === null || action === void 0 ? void 0 : (_action$payload6 = action.payload) === null || _action$payload6 === void 0 ? void 0 : _action$payload6.to;

      if (isEmpty_1(addresses) || !from || !to) {
        return state;
      }

      var items = {};

      for (var key in state.items) {
        var _state$items$key2;

        var dirty = (_state$items$key2 = state.items[key]) === null || _state$items$key2 === void 0 ? void 0 : _state$items$key2.dirty;

        if (dirty === from && addresses.indexOf(key) !== -1) {
          items[key] = _objectSpread2({}, state.items[key], {
            dirty: to
          });
        } else {
          items[key] = state.items[key];
        }
      }

      return _objectSpread2({}, state, {
        items: items
      });
    };

    return _this;
  }

  var _proto = UserAddressesStore.prototype;

  _proto.createKey = function createKey(data) {
    return String(data).toLowerCase();
  };

  _proto.setDescriptor = function setDescriptor(data) {
    this.descriptor = data;
  };

  _proto.getInitialState = function getInitialState() {
    return localStore.store(this.key) || INITIAL_STATE$1;
  };

  _proto.getStoreState = function getStoreState() {
    var _this$getState = this.getState(),
        items = _this$getState.items;

    return {
      items: items
    };
  };

  _proto.getExportJSON = function getExportJSON() {
    var state = this.getState();
    return {
      userAddresses: {
        items: Object.values(state.items).filter(function (item) {
          return !item.removed;
        }).map(function (item) {
          return {
            address: item.address,
            addressTags: item.addressTags,
            addressUserNote: item.addressUserNote,
            createdTime: item.createdTime,
            updatedTime: item.updatedTime
          };
        })
      }
    };
  };

  _proto.getItems = function getItems() {
    var _state$items6, _state$tmpRemoved;

    var state = this.getState();
    return [].concat(Object.values((_state$items6 = state === null || state === void 0 ? void 0 : state.items) !== null && _state$items6 !== void 0 ? _state$items6 : {}).filter(function (item) {
      return !item.removed;
    }), Object.values((_state$tmpRemoved = state === null || state === void 0 ? void 0 : state.tmpRemoved) !== null && _state$tmpRemoved !== void 0 ? _state$tmpRemoved : {}));
  };

  _proto.getAddressNote = function getAddressNote(address) {
    var _state$items7;

    var state = this.getState();
    var data = state === null || state === void 0 ? void 0 : (_state$items7 = state.items) === null || _state$items7 === void 0 ? void 0 : _state$items7[this.createKey(address)];
    return data && !data.removed && data.addressUserNote || '';
  };

  _proto.getAddressTags = function getAddressTags(address) {
    var _state$items8;

    var state = this.getState();
    var data = state === null || state === void 0 ? void 0 : (_state$items8 = state.items) === null || _state$items8 === void 0 ? void 0 : _state$items8[this.createKey(address)];
    return data && !data.removed && data.addressTags || [];
  };

  _proto.getAllAddressTagsCount = function getAllAddressTagsCount() {
    var state = this.getState();
    var cnt = 0;

    for (var addr in state.items) {
      var _state$items9;

      var data = (_state$items9 = state.items) === null || _state$items9 === void 0 ? void 0 : _state$items9[addr];

      if (data && !data.removed) {
        cnt += 1;
      }
    }

    return cnt;
  };

  _proto.getChanges = function getChanges()
  /* timestamp */
  {
    var state = this.getState();
    var remove = Object.values(mapValues_1(pickBy_1(state.items, function (item) {
      return item.removed;
    }), function (item, address) {
      return {
        address: address
      };
    }));
    var insert = Object.values(mapValues_1(pickBy_1(state.items, function (item) {
      return item.dirty === 1 && !item.removed;
    }), function (item) {
      return {
        address: item.address,
        addressTags: item.addressTags,
        addressUserNote: item.addressUserNote,
        createdTime: item.createdTime,
        updatedTime: item.updatedTime
      };
    }));
    var update = Object.values(mapValues_1(pickBy_1(state.items, function (item) {
      return item.dirty === 2 && !item.removed;
    }), function (item) {
      return {
        address: item.address,
        addressTags: item.addressTags,
        addressUserNote: item.addressUserNote,
        createdTime: item.createdTime,
        updatedTime: item.updatedTime
      };
    }));

    if (isEmpty_1(remove) && isEmpty_1(insert) && isEmpty_1(update)) {
      return;
    }

    return {
      userAddress: {
        update: update,
        insert: insert,
        remove: remove
      }
    };
  };

  _proto.reduce = function reduce(state, action) {
    if (action.type && typeof this.actions[action.type] === 'function') {
      return this.actions[action.type](state, action);
    }

    return state;
  };

  _createClass(UserAddressesStore, [{
    key: "key",
    get: function get() {
      return 'userAddresses';
    }
  }, {
    key: "actions",
    get: function get() {
      var _ref5;

      return _ref5 = {}, _ref5[ADD_ADDRESS_TAG] = this.handleAddAddressTag, _ref5[CLEAR_DATABASE] = this.handleClearDatabase, _ref5[MARK_ALL_AS_DIRTY] = this.handleMarkAllAsDirty, _ref5[MERGE_DATA] = this.handleMergeData, _ref5[REMOVE_ADDRESS_TAG] = this.handleRemoveAddressTag, _ref5[REMOVE_ADDRESS] = this.handleRemoveAddress, _ref5[REPLACE_ADDRESS_TAGS_AND_NOTE] = this.handleReplaceAddressTagsAndNote, _ref5[RESET_FROM_DATA] = this.handleResetFromData, _ref5[RESET_FROM_STORE] = this.handleResetFromStore, _ref5[SYNC_CHANGES] = this.handleSyncChanges, _ref5[UPDATE_DIRTY_STATUS] = this.handleUpdateDirtyStatus, _ref5;
    }
  }]);

  return UserAddressesStore;
}(FluxReduceStore_1);

var userAddressesStore = new UserAddressesStore(dispatcher);

var lastLogin = Date.now();
var INITIAL_STATE$2 = {};

var UserInfoStore = /*#__PURE__*/function (_ReduceStore) {
  _inheritsLoose(UserInfoStore, _ReduceStore);

  function UserInfoStore() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _ReduceStore.call.apply(_ReduceStore, [this].concat(args)) || this;

    _this.handleResetFromData = function (state, action) {
      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      var data = action.payload;

      if (data.userInfo) {
        return {
          userName: data.userInfo.userName
        };
      }

      return INITIAL_STATE$2;
    };

    _this.handleClearDatabase = function (state) {
      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      return _objectSpread2({}, state);
    };

    _this.handleResetFromStore = function () {
      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      return _this.getInitialState();
    };

    _this.handleUpdateUsername = function (state, action) {
      return _objectSpread2({}, state, {
        userName: action.payload
      });
    };

    return _this;
  }

  var _proto = UserInfoStore.prototype;

  _proto.getInitialState = function getInitialState() {
    var state = localStore.store(this.key) || INITIAL_STATE$2;

    if (!state.dateCreated) {
      state.dateCreated = Date.now();
    }

    if (lastLogin > state.lastLogin) {
      state.lastLogin = lastLogin;
    }

    return state;
  };

  _proto.getStoreState = function getStoreState() {
    return this.getState();
  };

  _proto.getExportJSON = function getExportJSON() {
    var state = this.getState();
    return {
      userInfo: {
        userName: state.userName
      }
    };
  };

  _proto.reduce = function reduce(state, action) {
    if (action.type && typeof this.actions[action.type] === 'function') {
      return this.actions[action.type](state, action);
    }

    return state;
  };

  _createClass(UserInfoStore, [{
    key: "key",
    get: function get() {
      return 'userInfo';
    }
  }, {
    key: "actions",
    get: function get() {
      var _ref;

      return _ref = {}, _ref[RESET_FROM_STORE] = this.handleResetFromStore, _ref[UPDATE_USERNAME] = this.handleUpdateUsername, _ref[CLEAR_DATABASE] = this.handleClearDatabase, _ref[RESET_FROM_DATA] = this.handleResetFromData, _ref;
    }
  }]);

  return UserInfoStore;
}(FluxReduceStore_1);

var userInfoStore = new UserInfoStore(dispatcher);

var INITIAL_STATE$3 = {
  items: {},
  tmpRemoved: {}
};

var UserTxsStore = /*#__PURE__*/function (_ReduceStore) {
  _inheritsLoose(UserTxsStore, _ReduceStore);

  function UserTxsStore() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _ReduceStore.call.apply(_ReduceStore, [this].concat(args)) || this;

    _this.handleMergeData = function (state, action) {
      var _action$payload, _action$payload$data, _action$payload$data$;

      var data = (action === null || action === void 0 ? void 0 : (_action$payload = action.payload) === null || _action$payload === void 0 ? void 0 : (_action$payload$data = _action$payload.data) === null || _action$payload$data === void 0 ? void 0 : (_action$payload$data$ = _action$payload$data.userTxs) === null || _action$payload$data$ === void 0 ? void 0 : _action$payload$data$.items) || [];
      data = Array.isArray(data) ? data : [];

      if (isEmpty_1(data)) {
        return state;
      }

      var now = Date.now();
      var isTargetPriority = action.payload.isTargetPriority;
      var items = data.reduce(function (out, item) {
        var _state$items;

        var key = _this.createKey(item.txHash);

        var currentData = state === null || state === void 0 ? void 0 : (_state$items = state.items) === null || _state$items === void 0 ? void 0 : _state$items[key];
        var nextData = {
          txHash: item.txHash,
          txUserNote: isTargetPriority ? (currentData === null || currentData === void 0 ? void 0 : currentData.txUserNote) || item.txUserNote : item.txUserNote || (currentData === null || currentData === void 0 ? void 0 : currentData.txUserNote),
          createdTime: isTargetPriority ? (currentData === null || currentData === void 0 ? void 0 : currentData.createdTime) || item.createdTime || now : item.createdTime && item.updatedTime ? item.createdTime : (currentData === null || currentData === void 0 ? void 0 : currentData.createdTime) || now,
          updatedTime: isTargetPriority ? (currentData === null || currentData === void 0 ? void 0 : currentData.updatedTime) || item.updatedTime || now : item.createdTime && item.updatedTime ? item.updatedTime : (currentData === null || currentData === void 0 ? void 0 : currentData.updatedTime) || now
        };

        if (!currentData) {
          nextData.dirty = 1;
        } else if (!isEqual_1(pick_1(currentData, ['txUserNote', 'createdTime', 'updatedTime']), pick_1(nextData, ['txUserNote', 'createdTime', 'updatedTime']))) {
          nextData.dirty = 2;
        }

        out[key] = nextData;
        return out;
      }, {});

      if (_this.descriptor) {
        items = Object.values(items).filter(function (item) {
          return validate(item, _this.descriptor);
        }).reduce(function (out, item) {
          out[_this.createKey(item.txHash)] = item;
          return out;
        }, {});
      }

      return _objectSpread2({}, state, {
        tmpRemoved: omit_1(state === null || state === void 0 ? void 0 : state.tmpRemoved, Object.keys(items)),
        items: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, {}, items)
      });
    };

    _this.handleResetFromData = function (state, action) {
      var _action$payload2, _action$payload2$user;

      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      var data = ((_action$payload2 = action.payload) === null || _action$payload2 === void 0 ? void 0 : (_action$payload2$user = _action$payload2.userTxs) === null || _action$payload2$user === void 0 ? void 0 : _action$payload2$user.items) || [];
      data = Array.isArray(data) ? data : [];

      if (_this.descriptor) {
        data = data.filter(function (item) {
          return validate(item, _this.descriptor);
        });
      }

      var prevData = Object.values(state.items || {});
      var created = differenceBy_1(data, prevData, function (item) {
        return _this.createKey(item.txHash);
      });
      var removed = differenceBy_1(prevData, data, function (item) {
        return _this.createKey(item.txHash);
      });
      var updated = intersectionBy_1(data, prevData, function (item) {
        return _this.createKey(item.txHash);
      });
      var now = Date.now();

      var create = function create(item) {
        return {
          txHash: item.txHash,
          txUserNote: item.txUserNote,
          createdTime: item.createdTime || now,
          updatedTime: item.updatedTime || now
        };
      };

      return {
        tmpRemoved: {},
        items: _objectSpread2({}, created.reduce(function (out, item) {
          out[_this.createKey(item.txHash)] = _objectSpread2({}, create(item), {
            dirty: 1
          });
          return out;
        }, {}), {}, updated.reduce(function (out, item) {
          out[_this.createKey(item.txHash)] = _objectSpread2({}, create(item), {
            dirty: 2
          });
          return out;
        }, {}), {}, removed.reduce(function (out, item) {
          out[_this.createKey(item.txHash)] = _objectSpread2({}, create(item), {
            removed: true
          });
          return out;
        }, {}))
      };
    };

    _this.handleClearDatabase = function () {
      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      return INITIAL_STATE$3;
    };

    _this.handleResetFromStore = function () {
      _this.getDispatcher().waitFor([appStore.getDispatchToken()]);

      return _this.getInitialState();
    };

    _this.handleMarkAllAsDirty = function (state) {
      var items = {};

      for (var key in state.items) {
        var _state$items$key$dirt, _state$items$key;

        items[key] = _objectSpread2({}, state.items[key], {
          dirty: (_state$items$key$dirt = (_state$items$key = state.items[key]) === null || _state$items$key === void 0 ? void 0 : _state$items$key.dirty) !== null && _state$items$key$dirt !== void 0 ? _state$items$key$dirt : 1
        });
      }

      return _objectSpread2({}, state, {
        items: items
      });
    };

    _this.handleSyncChanges = function (state, action) {
      var _action$payload3, _map, _ref, _ref$map, _map2, _ref2, _ref2$map, _state, _ref3, _ref3$reduce, _ref4, _ref4$reduce;

      if (isEmpty_1(action === null || action === void 0 ? void 0 : (_action$payload3 = action.payload) === null || _action$payload3 === void 0 ? void 0 : _action$payload3.userTx)) {
        return state;
      }

      var _action$payload$userT = action.payload.userTx,
          created = _action$payload$userT.created,
          updated = _action$payload$userT.updated,
          deleted = _action$payload$userT.deleted,
          update = _action$payload$userT.update,
          insert = _action$payload$userT.insert,
          remove = _action$payload$userT.remove;

      if (!isEmpty_1(deleted) || !isEmpty_1(remove)) {
        var _keys = (deleted || remove).map(function (item) {
          var _item$txHash;

          return _this.createKey((_item$txHash = item === null || item === void 0 ? void 0 : item.txHash) !== null && _item$txHash !== void 0 ? _item$txHash : item);
        });

        state = _objectSpread2({}, state, {
          items: omit_1(state.items, _keys)
        });
      }

      if (isEmpty_1(created) && isEmpty_1(insert) && isEmpty_1(updated) && isEmpty_1(update)) {
        return state;
      }

      var keys = [].concat((_map = (_ref = created || insert) === null || _ref === void 0 ? void 0 : (_ref$map = _ref.map) === null || _ref$map === void 0 ? void 0 : _ref$map.call(_ref, function (item) {
        return _this.createKey(item.txHash);
      })) !== null && _map !== void 0 ? _map : [], (_map2 = (_ref2 = updated || update) === null || _ref2 === void 0 ? void 0 : (_ref2$map = _ref2.map) === null || _ref2$map === void 0 ? void 0 : _ref2$map.call(_ref2, function (item) {
        return _this.createKey(item.txHash);
      })) !== null && _map2 !== void 0 ? _map2 : []);
      state = _objectSpread2({}, state, {
        tmpRemoved: omit_1(state.tmpRemoved, keys),
        items: _objectSpread2({}, (_state = state) === null || _state === void 0 ? void 0 : _state.items, {}, (_ref3 = created || insert) === null || _ref3 === void 0 ? void 0 : (_ref3$reduce = _ref3.reduce) === null || _ref3$reduce === void 0 ? void 0 : _ref3$reduce.call(_ref3, function (out, item) {
          var _Object$assign;

          return Object.assign(out, (_Object$assign = {}, _Object$assign[_this.createKey(item.txHash)] = _objectSpread2({}, item, {
            createdTime: item.clientCreatedTime || item.createdTime,
            updatedTime: item.clientUpdatedTime || item.updatedTime
          }), _Object$assign));
        }, {}), {}, (_ref4 = updated || update) === null || _ref4 === void 0 ? void 0 : (_ref4$reduce = _ref4.reduce) === null || _ref4$reduce === void 0 ? void 0 : _ref4$reduce.call(_ref4, function (out, item) {
          var _Object$assign2;

          return Object.assign(out, (_Object$assign2 = {}, _Object$assign2[_this.createKey(item.txHash)] = _objectSpread2({}, item, {
            createdTime: item.clientCreatedTime || item.createdTime,
            updatedTime: item.clientUpdatedTime || item.updatedTime
          }), _Object$assign2));
        }, {}))
      });
      return state;
    };

    _this.handleReplaceTxNote = function (state, action) {
      var _state$items2, _objectSpread4;

      var now = Date.now();
      var data = action.payload;

      var key = _this.createKey(data.txHash);

      var prevData = state === null || state === void 0 ? void 0 : (_state$items2 = state.items) === null || _state$items2 === void 0 ? void 0 : _state$items2[key];
      prevData = prevData && !prevData.removed ? prevData : undefined;

      if (!data.note) {
        var _objectSpread2$1, _prevData, _objectSpread3;

        if (!prevData) {
          return state;
        }

        var _item = _objectSpread2({
          createdTime: now
        }, prevData, {
          txHash: data.txHash,
          txUserNote: data.note,
          removed: true,
          updatedTime: now
        });

        return _objectSpread2({}, state, {
          tmpRemoved: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.tmpRemoved, (_objectSpread2$1 = {}, _objectSpread2$1[key] = _item, _objectSpread2$1)),
          items: ((_prevData = prevData) === null || _prevData === void 0 ? void 0 : _prevData.dirty) === 1 ? omit_1(state.items, [key]) : _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread3 = {}, _objectSpread3[key] = _item, _objectSpread3))
        });
      }

      var item = _objectSpread2({
        createdTime: now
      }, prevData, {
        txHash: data.txHash,
        txUserNote: data.note,
        dirty: prevData ? prevData.dirty || 2 : 1,
        removed: false,
        updatedTime: now
      });

      return _objectSpread2({}, state, {
        tmpRemoved: omit_1(state === null || state === void 0 ? void 0 : state.tmpRemoved, [key]),
        items: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread4 = {}, _objectSpread4[key] = item, _objectSpread4))
      });
    };

    _this.handleRemoveTx = function (state, action) {
      var _state$items3, _objectSpread5, _objectSpread6;

      var key = _this.createKey(action.payload);

      var prevData = state === null || state === void 0 ? void 0 : (_state$items3 = state.items) === null || _state$items3 === void 0 ? void 0 : _state$items3[key];

      var item = _objectSpread2({}, prevData, {
        removed: true
      });

      return _objectSpread2({}, state, {
        tmpRemoved: _objectSpread2({}, state === null || state === void 0 ? void 0 : state.tmpRemoved, (_objectSpread5 = {}, _objectSpread5[key] = item, _objectSpread5)),
        items: (prevData === null || prevData === void 0 ? void 0 : prevData.dirty) === 1 ? omit_1(state.items, [key]) : _objectSpread2({}, state === null || state === void 0 ? void 0 : state.items, (_objectSpread6 = {}, _objectSpread6[key] = item, _objectSpread6))
      });
    };

    _this.handleUpdateDirtyStatus = function (state, action) {
      var _action$payload$txs, _action$payload4, _action$payload5, _action$payload6;

      var txs = (_action$payload$txs = action === null || action === void 0 ? void 0 : (_action$payload4 = action.payload) === null || _action$payload4 === void 0 ? void 0 : _action$payload4.txs) !== null && _action$payload$txs !== void 0 ? _action$payload$txs : [];
      var from = action === null || action === void 0 ? void 0 : (_action$payload5 = action.payload) === null || _action$payload5 === void 0 ? void 0 : _action$payload5.from;
      var to = action === null || action === void 0 ? void 0 : (_action$payload6 = action.payload) === null || _action$payload6 === void 0 ? void 0 : _action$payload6.to;

      if (isEmpty_1(txs) || !from || !to) {
        return state;
      }

      var items = {};

      for (var key in state.items) {
        var _state$items$key2;

        var dirty = (_state$items$key2 = state.items[key]) === null || _state$items$key2 === void 0 ? void 0 : _state$items$key2.dirty;

        if (dirty === from && txs.indexOf(key) !== -1) {
          items[key] = _objectSpread2({}, state.items[key], {
            dirty: to
          });
        } else {
          items[key] = state.items[key];
        }
      }

      return _objectSpread2({}, state, {
        items: items
      });
    };

    return _this;
  }

  var _proto = UserTxsStore.prototype;

  _proto.createKey = function createKey(data) {
    return String(data).toLowerCase();
  };

  _proto.setDescriptor = function setDescriptor(data) {
    this.descriptor = data;
  };

  _proto.getInitialState = function getInitialState() {
    return localStore.store(this.key) || INITIAL_STATE$3;
  };

  _proto.getStoreState = function getStoreState() {
    var _this$getState = this.getState(),
        items = _this$getState.items;

    return {
      items: items
    };
  };

  _proto.getExportJSON = function getExportJSON() {
    var state = this.getState();
    return {
      userTxs: {
        items: Object.values(state.items).filter(function (item) {
          return !item.removed;
        }).map(function (item) {
          return {
            txHash: item.txHash,
            txUserNote: item.txUserNote,
            createdTime: item.createdTime,
            updatedTime: item.updatedTime
          };
        })
      }
    };
  };

  _proto.getItems = function getItems() {
    var _state$items4, _state$tmpRemoved;

    var state = this.getState();
    return [].concat(Object.values((_state$items4 = state === null || state === void 0 ? void 0 : state.items) !== null && _state$items4 !== void 0 ? _state$items4 : {}).filter(function (item) {
      return !item.removed;
    }), Object.values((_state$tmpRemoved = state === null || state === void 0 ? void 0 : state.tmpRemoved) !== null && _state$tmpRemoved !== void 0 ? _state$tmpRemoved : {}));
  };

  _proto.getTxNote = function getTxNote(tx) {
    var _state$items5;

    var state = this.getState();
    var data = state === null || state === void 0 ? void 0 : (_state$items5 = state.items) === null || _state$items5 === void 0 ? void 0 : _state$items5[this.createKey(tx)];
    return data && !data.removed && data.txUserNote || '';
  };

  _proto.getAllTxsCount = function getAllTxsCount() {
    var state = this.getState();
    var cnt = 0;

    for (var tx in state.items) {
      var data = state.items[tx];

      if (data && !data.removed) {
        cnt += 1;
      }
    }

    return cnt;
  };

  _proto.getChanges = function getChanges() {
    var state = this.getState();
    var remove = Object.values(mapValues_1(pickBy_1(state.items, function (item) {
      return item.removed;
    }), function (item, txHash) {
      return {
        txHash: txHash
      };
    }));
    var insert = Object.values(mapValues_1(pickBy_1(state.items, function (item) {
      return item.dirty === 1 && !item.removed;
    }), function (item) {
      return {
        txHash: item.txHash,
        txUserNote: item.txUserNote,
        createdTime: item.createdTime,
        updatedTime: item.updatedTime
      };
    }));
    var update = Object.values(mapValues_1(pickBy_1(state.items, function (item) {
      return item.dirty === 2 && !item.removed;
    }), function (item) {
      return {
        txHash: item.txHash,
        txUserNote: item.txUserNote,
        createdTime: item.createdTime,
        updatedTime: item.updatedTime
      };
    }));

    if (isEmpty_1(remove) && isEmpty_1(insert) && isEmpty_1(update)) {
      return;
    }

    return {
      userTx: {
        update: update,
        insert: insert,
        remove: remove
      }
    };
  };

  _proto.reduce = function reduce(state, action) {
    if (action.type && typeof this.actions[action.type] === 'function') {
      return this.actions[action.type](state, action);
    }

    return state;
  };

  _createClass(UserTxsStore, [{
    key: "key",
    get: function get() {
      return 'userTxs';
    }
  }, {
    key: "actions",
    get: function get() {
      var _ref5;

      return _ref5 = {}, _ref5[CLEAR_DATABASE] = this.handleClearDatabase, _ref5[MARK_ALL_AS_DIRTY] = this.handleMarkAllAsDirty, _ref5[MERGE_DATA] = this.handleMergeData, _ref5[REMOVE_TX] = this.handleRemoveTx, _ref5[REPLACE_TX_NOTE] = this.handleReplaceTxNote, _ref5[RESET_FROM_DATA] = this.handleResetFromData, _ref5[RESET_FROM_STORE] = this.handleResetFromStore, _ref5[SYNC_CHANGES] = this.handleSyncChanges, _ref5[UPDATE_DIRTY_STATUS] = this.handleUpdateDirtyStatus, _ref5;
    }
  }]);

  return UserTxsStore;
}(FluxReduceStore_1);

var userTxsStore = new UserTxsStore(dispatcher);

var LoggerStore = /*#__PURE__*/function (_ReduceStore) {
  _inheritsLoose(LoggerStore, _ReduceStore);

  function LoggerStore() {
    return _ReduceStore.apply(this, arguments) || this;
  }

  var _proto = LoggerStore.prototype;

  _proto.getInitialState = function getInitialState() {
    return null;
  };

  _proto.reduce = function reduce(state, action) {
    // console.log(Date.now(), action)
    return state;
  };

  return LoggerStore;
}(FluxReduceStore_1);

new LoggerStore(dispatcher);

function unfetch(url, options) {
	options = options || {};
	return new Promise( (resolve, reject) => {
		const request = new XMLHttpRequest();
		const keys = [];
		const all = [];
		const headers = {};

		const response = () => ({
			ok: (request.status/100|0) == 2,		// 200-299
			statusText: request.statusText,
			status: request.status,
			url: request.responseURL,
			text: () => Promise.resolve(request.responseText),
			json: () => Promise.resolve(JSON.parse(request.responseText)),
			blob: () => Promise.resolve(new Blob([request.response])),
			clone: response,
			headers: {
				keys: () => keys,
				entries: () => all,
				get: n => headers[n.toLowerCase()],
				has: n => n.toLowerCase() in headers
			}
		});

		request.open(options.method || 'get', url, true);

		request.onload = () => {
			request.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, (m, key, value) => {
				keys.push(key = key.toLowerCase());
				all.push([key, value]);
				headers[key] = headers[key] ? `${headers[key]},${value}` : value;
			});
			resolve(response());
		};

		request.onerror = reject;

		request.withCredentials = options.credentials=='include';

		for (const i in options.headers) {
			request.setRequestHeader(i, options.headers[i]);
		}

		request.send(options.body || null);
	});
}

if (!self.fetch) self.fetch = unfetch;

var eventemitter3 = createCommonjsModule(function (module) {

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
{
  module.exports = EventEmitter;
}
});

var pFinally = (promise, onFinally) => {
	onFinally = onFinally || (() => {});

	return promise.then(
		val => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => val),
		err => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => {
			throw err;
		})
	);
};

class TimeoutError extends Error {
	constructor(message) {
		super(message);
		this.name = 'TimeoutError';
	}
}

const pTimeout = (promise, milliseconds, fallback) => new Promise((resolve, reject) => {
	if (typeof milliseconds !== 'number' || milliseconds < 0) {
		throw new TypeError('Expected `milliseconds` to be a positive number');
	}

	if (milliseconds === Infinity) {
		resolve(promise);
		return;
	}

	const timer = setTimeout(() => {
		if (typeof fallback === 'function') {
			try {
				resolve(fallback());
			} catch (error) {
				reject(error);
			}

			return;
		}

		const message = typeof fallback === 'string' ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
		const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);

		if (typeof promise.cancel === 'function') {
			promise.cancel();
		}

		reject(timeoutError);
	}, milliseconds);

	// TODO: Use native `finally` keyword when targeting Node.js 10
	pFinally(
		// eslint-disable-next-line promise/prefer-await-to-then
		promise.then(resolve, reject),
		() => {
			clearTimeout(timer);
		}
	);
});

var pTimeout_1 = pTimeout;
// TODO: Remove this for the next major release
var default_1 = pTimeout;

var TimeoutError_1 = TimeoutError;
pTimeout_1.default = default_1;
pTimeout_1.TimeoutError = TimeoutError_1;

var lowerBound_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
// Port of lower_bound from http://en.cppreference.com/w/cpp/algorithm/lower_bound
// Used to compute insertion index to keep queue sorted after insertion
function lowerBound(array, value, comparator) {
    let first = 0;
    let count = array.length;
    while (count > 0) {
        const step = (count / 2) | 0;
        let it = first + step;
        if (comparator(array[it], value) <= 0) {
            first = ++it;
            count -= step + 1;
        }
        else {
            count = step;
        }
    }
    return first;
}
exports.default = lowerBound;
});

unwrapExports(lowerBound_1);

var priorityQueue = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class PriorityQueue {
    constructor() {
        Object.defineProperty(this, "_queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    enqueue(run, options) {
        options = Object.assign({ priority: 0 }, options);
        const element = {
            priority: options.priority,
            run
        };
        if (this.size && this._queue[this.size - 1].priority >= options.priority) {
            this._queue.push(element);
            return;
        }
        const index = lowerBound_1.default(this._queue, element, (a, b) => b.priority - a.priority);
        this._queue.splice(index, 0, element);
    }
    dequeue() {
        const item = this._queue.shift();
        return item && item.run;
    }
    filter(options) {
        return this._queue.filter(element => element.priority === options.priority).map(element => element.run);
    }
    get size() {
        return this._queue.length;
    }
}
exports.default = PriorityQueue;
});

unwrapExports(priorityQueue);

var dist = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



const empty = () => { };
const timeoutError = new pTimeout_1.TimeoutError();
/**
Promise queue with concurrency control.
*/
class PQueue extends eventemitter3 {
    constructor(options) {
        super();
        Object.defineProperty(this, "_carryoverConcurrencyCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isIntervalIgnored", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_intervalCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_intervalCap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_interval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_intervalEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_intervalId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_timeoutId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_queueClass", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_pendingCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        // The `!` is needed because of https://github.com/microsoft/TypeScript/issues/32194
        Object.defineProperty(this, "_concurrency", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isPaused", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_resolveEmpty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: empty
        });
        Object.defineProperty(this, "_resolveIdle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: empty
        });
        Object.defineProperty(this, "_timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_throwOnTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
        options = Object.assign({ carryoverConcurrencyCount: false, intervalCap: Infinity, interval: 0, concurrency: Infinity, autoStart: true, queueClass: priorityQueue.default }, options
        // TODO: Remove this `as`.
        );
        if (!(typeof options.intervalCap === 'number' && options.intervalCap >= 1)) {
            throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${options.intervalCap}\` (${typeof options.intervalCap})`);
        }
        if (options.interval === undefined || !(Number.isFinite(options.interval) && options.interval >= 0)) {
            throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${options.interval}\` (${typeof options.interval})`);
        }
        this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
        this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
        this._intervalCap = options.intervalCap;
        this._interval = options.interval;
        this._queue = new options.queueClass();
        this._queueClass = options.queueClass;
        this.concurrency = options.concurrency;
        this._timeout = options.timeout;
        this._throwOnTimeout = options.throwOnTimeout === true;
        this._isPaused = options.autoStart === false;
    }
    get _doesIntervalAllowAnother() {
        return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
    }
    get _doesConcurrentAllowAnother() {
        return this._pendingCount < this._concurrency;
    }
    _next() {
        this._pendingCount--;
        this._tryToStartAnother();
    }
    _resolvePromises() {
        this._resolveEmpty();
        this._resolveEmpty = empty;
        if (this._pendingCount === 0) {
            this._resolveIdle();
            this._resolveIdle = empty;
        }
    }
    _onResumeInterval() {
        this._onInterval();
        this._initializeIntervalIfNeeded();
        this._timeoutId = undefined;
    }
    _isIntervalPaused() {
        const now = Date.now();
        if (this._intervalId === undefined) {
            const delay = this._intervalEnd - now;
            if (delay < 0) {
                // Act as the interval was done
                // We don't need to resume it here because it will be resumed on line 160
                this._intervalCount = (this._carryoverConcurrencyCount) ? this._pendingCount : 0;
            }
            else {
                // Act as the interval is pending
                if (this._timeoutId === undefined) {
                    this._timeoutId = setTimeout(() => {
                        this._onResumeInterval();
                    }, delay);
                }
                return true;
            }
        }
        return false;
    }
    _tryToStartAnother() {
        if (this._queue.size === 0) {
            // We can clear the interval ("pause")
            // Because we can redo it later ("resume")
            if (this._intervalId) {
                clearInterval(this._intervalId);
            }
            this._intervalId = undefined;
            this._resolvePromises();
            return false;
        }
        if (!this._isPaused) {
            const canInitializeInterval = !this._isIntervalPaused();
            if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                this.emit('active');
                this._queue.dequeue()();
                if (canInitializeInterval) {
                    this._initializeIntervalIfNeeded();
                }
                return true;
            }
        }
        return false;
    }
    _initializeIntervalIfNeeded() {
        if (this._isIntervalIgnored || this._intervalId !== undefined) {
            return;
        }
        this._intervalId = setInterval(() => {
            this._onInterval();
        }, this._interval);
        this._intervalEnd = Date.now() + this._interval;
    }
    _onInterval() {
        if (this._intervalCount === 0 && this._pendingCount === 0 && this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = undefined;
        }
        this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
        this._processQueue();
    }
    /**
    Executes all queued functions until it reaches the limit.
    */
    _processQueue() {
        // eslint-disable-next-line no-empty
        while (this._tryToStartAnother()) { }
    }
    get concurrency() {
        return this._concurrency;
    }
    set concurrency(newConcurrency) {
        if (!(typeof newConcurrency === 'number' && newConcurrency >= 1)) {
            throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
        }
        this._concurrency = newConcurrency;
        this._processQueue();
    }
    /**
    Adds a sync or async task to the queue. Always returns a promise.
    */
    async add(fn, options = {}) {
        return new Promise((resolve, reject) => {
            const run = async () => {
                this._pendingCount++;
                this._intervalCount++;
                try {
                    const operation = (this._timeout === undefined && options.timeout === undefined) ? fn() : pTimeout_1.default(Promise.resolve(fn()), (options.timeout === undefined ? this._timeout : options.timeout), () => {
                        if (options.throwOnTimeout === undefined ? this._throwOnTimeout : options.throwOnTimeout) {
                            reject(timeoutError);
                        }
                        return undefined;
                    });
                    resolve(await operation);
                }
                catch (error) {
                    reject(error);
                }
                this._next();
            };
            this._queue.enqueue(run, options);
            this._tryToStartAnother();
        });
    }
    /**
    Same as `.add()`, but accepts an array of sync or async functions.

    @returns A promise that resolves when all functions are resolved.
    */
    async addAll(functions, options) {
        return Promise.all(functions.map(async (function_) => this.add(function_, options)));
    }
    /**
    Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
    */
    start() {
        if (!this._isPaused) {
            return this;
        }
        this._isPaused = false;
        this._processQueue();
        return this;
    }
    /**
    Put queue execution on hold.
    */
    pause() {
        this._isPaused = true;
    }
    /**
    Clear the queue.
    */
    clear() {
        this._queue = new this._queueClass();
    }
    /**
    Can be called multiple times. Useful if you for example add additional items at a later time.

    @returns A promise that settles when the queue becomes empty.
    */
    async onEmpty() {
        // Instantly resolve if the queue is empty
        if (this._queue.size === 0) {
            return;
        }
        return new Promise(resolve => {
            const existingResolve = this._resolveEmpty;
            this._resolveEmpty = () => {
                existingResolve();
                resolve();
            };
        });
    }
    /**
    The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.

    @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
    */
    async onIdle() {
        // Instantly resolve if none pending and if nothing else is queued
        if (this._pendingCount === 0 && this._queue.size === 0) {
            return;
        }
        return new Promise(resolve => {
            const existingResolve = this._resolveIdle;
            this._resolveIdle = () => {
                existingResolve();
                resolve();
            };
        });
    }
    /**
    Size of the queue.
    */
    get size() {
        return this._queue.size;
    }
    /**
    Size of the queue, filtered by the given options.

    For example, this can be used to find the number of items remaining in the queue with a specific priority level.
    */
    sizeBy(options) {
        return this._queue.filter(options).length;
    }
    /**
    Number of pending promises.
    */
    get pending() {
        return this._pendingCount;
    }
    /**
    Whether the queue is currently paused.
    */
    get isPaused() {
        return this._isPaused;
    }
    /**
    Set the timeout for future operations.
    */
    set timeout(milliseconds) {
        this._timeout = milliseconds;
    }
    get timeout() {
        return this._timeout;
    }
}
exports.default = PQueue;
});

var PQueue = unwrapExports(dist);

var queue = new PQueue({
  concurrency: 1
});
var requestOptions = {
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  redirect: 'follow',
  referrer: 'no-referrer'
};
var OPTIONS = {
  syncApi: undefined,
  syncUserApi: undefined,
  accessTagsNotes: false
};
var syncChangesLazy = debounce_1(syncChangesQueue, 500);
function syncChangesQueue() {
  queue.clear();
  return queue.add(function () {
    return remoteSyncChanges();
  });
}
function syncChanges$1(renewalOnly) {
  if (renewalOnly === void 0) {
    renewalOnly = false;
  }

  if (OPTIONS.syncApi && OPTIONS.syncUserApi && appStore.canPushChanges()) {
    if (!renewalOnly || renewalOnly && appStore.getLastSyncedAt() > 1) {
      syncChangesLazy();
    }
  } else {
    syncChangesLazy.cancel();
  }
}

function handleVisibilitychange(event) {
  if (document.hidden) {
    clearTimeout(syncChanges$1.retryTimeout);
    syncChanges$1.retryTimeout = 0;
  } else if (!syncChanges$1.retryTimeout) {
    if (event) {
      syncChanges$1.retryCount = 0;
    }

    var timeout = syncChanges$1.retryIntervals[syncChanges$1.retryCount] || syncChanges$1.retryIntervals[syncChanges$1.retryIntervals.length - 1];
    syncChanges$1.retryTimeout = setTimeout(function () {
      syncChanges$1(true);
      syncChanges$1.retryCount++;
      syncChanges$1.retryTimeout = 0;
      handleVisibilitychange();
    }, timeout);
  }
}

syncChanges$1.retryTimeout = 0;
syncChanges$1.retryCount = 0;
syncChanges$1.retryIntervals = [10 * 1000, 60 * 1000, 2 * 60 * 1000];

syncChanges$1.stop = function () {
  document.removeEventListener('visibilitychange', handleVisibilitychange, false);
  clearTimeout(syncChanges$1.retryTimeout);
  syncChanges$1.retryTimeout = 0;
};

syncChanges$1.start = function () {
  syncChanges$1.stop();
  handleVisibilitychange();
  document.addEventListener('visibilitychange', handleVisibilitychange, false);
};

function syncOptions(options) {
  var _options$accessTagsNo;

  OPTIONS.syncApi = options === null || options === void 0 ? void 0 : options.syncApi;
  OPTIONS.syncUserApi = options === null || options === void 0 ? void 0 : options.syncUserApi;
  OPTIONS.accessTagsNotes = (_options$accessTagsNo = options === null || options === void 0 ? void 0 : options.accessTagsNotes) !== null && _options$accessTagsNo !== void 0 ? _options$accessTagsNo : false;
}

function userInit() {
  var userId = localStore.userId();
  return fetch(OPTIONS.syncUserApi + "/" + userId, _objectSpread2({}, requestOptions, {
    method: 'PUT'
  })).then(function (response) {
    return response.ok ? response.json() : Promise.reject();
  });
}

function remoteSyncChanges(updateAfterConflict) {
  if (updateAfterConflict === void 0) {
    updateAfterConflict = true;
  }

  return userInit().then(function (user) {
    var timestamp = appStore.getLastSyncedAt();
    return fetch(OPTIONS.syncApi + "/" + user.idUser + "/" + timestamp, _objectSpread2({}, requestOptions, {
      method: 'GET'
    })).then(function (response) {
      return response.ok ? response.json() : Promise.reject();
    }).then(function (data) {
      return data && Object.hasOwnProperty.call(data, 'lastSyncedAt') ? data : Promise.reject();
    }).then(function (_ref) {
      var lastSyncedAt = _ref.lastSyncedAt,
          changes = _ref.changes;
      lastSyncedAt = lastSyncedAt || 1;

      if (lastSyncedAt < timestamp) {
        boundMarkAllAsDirty();
      }

      boundSyncChanges(changes);
      boundUpdateLastSyncTime(lastSyncedAt);
    }).then(function () {
      if (!appStore.canPushChanges()) {
        return Promise.resolve();
      }

      var localChanges = _objectSpread2({}, OPTIONS.accessTagsNotes && appStore.canSyncTagsAndNotes() ? _objectSpread2({}, userTxsStore.getChanges(), {}, userTagsStore.getChanges(), {}, userAddressesStore.getChanges()) : {});

      if (isEmpty_1(localChanges)) {
        return Promise.resolve();
      }

      var body = JSON.stringify(cloneDeepWith_1(localChanges, function (item) {
        if (typeof item === 'object' && item !== null && !Array.isArray(item) && (item.updatedTime || item.createdTime)) {
          return _objectSpread2({}, omit_1(item, ['updatedTime', 'createdTime']), {
            clientCreatedTime: item.createdTime,
            clientUpdatedTime: item.updatedTime
          });
        }
      }));
      var timestamp = appStore.getLastSyncedAt();
      return fetch(OPTIONS.syncApi + "/" + user.idUser + "/" + timestamp, _objectSpread2({}, requestOptions, {
        method: 'POST',
        body: body
      })).then(function (response) {
        if (response.status === 409) {
          if (updateAfterConflict) {
            return Promise.resolve(response.json()).then(function (data) {
              var _data$info, _data$info$details, _data$info2, _data$info2$details;

              var collection = data === null || data === void 0 ? void 0 : (_data$info = data.info) === null || _data$info === void 0 ? void 0 : (_data$info$details = _data$info.details) === null || _data$info$details === void 0 ? void 0 : _data$info$details.collection;
              var shouldNotExists = data === null || data === void 0 ? void 0 : (_data$info2 = data.info) === null || _data$info2 === void 0 ? void 0 : (_data$info2$details = _data$info2.details) === null || _data$info2$details === void 0 ? void 0 : _data$info2$details.shouldNotExists;

              if (collection && !isEmpty_1(shouldNotExists)) {
                boundUpdateDirtyStatus(1, 2, _objectSpread2({}, collection === 'userAddress' ? {
                  addresses: shouldNotExists
                } : {}, {}, collection === 'userTag' ? {
                  tags: shouldNotExists
                } : {}, {}, collection === 'userTx' ? {
                  txs: shouldNotExists
                } : {}));
              }

              return remoteSyncChanges(false);
            });
          } else {
            return Promise.reject();
          }
        }

        if (response.status === 412) {
          if (updateAfterConflict) {
            boundClearDatabase();
            return remoteSyncChanges(false);
          } else {
            return Promise.reject();
          }
        }

        if (!response.ok) {
          return Promise.reject();
        }

        return response.json();
      }).then(function (data) {
        return data && Object.hasOwnProperty.call(data, 'lastSyncedAt') ? data : Promise.reject();
      }).then(function (_ref2) {
        var lastSyncedAt = _ref2.lastSyncedAt,
            changes = _ref2.changes;
        lastSyncedAt = lastSyncedAt || 1;
        boundSyncChanges(localChanges);
        boundSyncChanges(changes);
        boundUpdateLastSyncTime(lastSyncedAt);
      });
    });
  });
}

var storageBinding;
function initDatabase(namespace, options) {
  return new Promise(function (resolve) {
    var _options$descriptors, _options$descriptors3, _options$descriptors5, _storageBinding;

    if (options) {
      syncOptions(options);
    }

    var prevStore;

    if (options === null || options === void 0 ? void 0 : options.mergeWithCurrent) {
      prevStore = exportStoreToJSON();
    }

    if (options === null || options === void 0 ? void 0 : (_options$descriptors = options.descriptors) === null || _options$descriptors === void 0 ? void 0 : _options$descriptors.userAddresses) {
      var _options$descriptors2;

      userAddressesStore.setDescriptor(options === null || options === void 0 ? void 0 : (_options$descriptors2 = options.descriptors) === null || _options$descriptors2 === void 0 ? void 0 : _options$descriptors2.userAddresses);
    }

    if (options === null || options === void 0 ? void 0 : (_options$descriptors3 = options.descriptors) === null || _options$descriptors3 === void 0 ? void 0 : _options$descriptors3.userTxs) {
      var _options$descriptors4;

      userTxsStore.setDescriptor(options === null || options === void 0 ? void 0 : (_options$descriptors4 = options.descriptors) === null || _options$descriptors4 === void 0 ? void 0 : _options$descriptors4.userTxs);
    }

    if (options === null || options === void 0 ? void 0 : (_options$descriptors5 = options.descriptors) === null || _options$descriptors5 === void 0 ? void 0 : _options$descriptors5.userTags) {
      var _options$descriptors6;

      userTagsStore.setDescriptor(options === null || options === void 0 ? void 0 : (_options$descriptors6 = options.descriptors) === null || _options$descriptors6 === void 0 ? void 0 : _options$descriptors6.userTags);
    }

    localStore["switch"](namespace);
    boundResetFromStore();
    (_storageBinding = storageBinding) === null || _storageBinding === void 0 ? void 0 : _storageBinding.cancel();
    storageBinding = bindStorage();

    if (options === null || options === void 0 ? void 0 : options.mergeWithCurrent) {
      syncChangesQueue().then(function () {
        boundMergeData(prevStore, true);
        resolve();
      });
    } else {
      resolve();
    }
  });
}
function registerStore(store, sync) {
  store.addListener(function () {
    localStore.store(store.key, store.getStoreState());

    if (sync) {
      syncChanges$1();
    }
  });
}
function exportStoreToJSON() {
  return _objectSpread2({}, userTagsStore.getExportJSON(), {}, userAddressesStore.getExportJSON(), {}, userInfoStore.getExportJSON(), {}, userTxsStore.getExportJSON());
}
function importStoreFromJSON(data, isMerge) {
  if (isMerge) {
    boundMergeData(data);
  } else {
    boundResetFromData(data);
  }

  syncChanges$1();
}
registerStore(appStore);
registerStore(userInfoStore, true);
registerStore(userAddressesStore, true);
registerStore(userTagsStore, true);
registerStore(userTxsStore, true);

function bindStorage() {
  var lazy = 0;

  var handleStorage = function handleStorage(event) {
    if (event && event.key === 'ethpuuid' && event.newValue && JSON.parse(event.newValue) !== JSON.parse(event.oldValue)) {
      localStore["switch"](JSON.parse(event.newValue));
    }

    clearTimeout(lazy);
    lazy = setTimeout(function () {
      var _localStore$store$las, _localStore$store;

      if (appStore.getLastSyncedAt() < ((_localStore$store$las = (_localStore$store = localStore.store('app')) === null || _localStore$store === void 0 ? void 0 : _localStore$store.lastSyncedAt) !== null && _localStore$store$las !== void 0 ? _localStore$store$las : 1) || document.visibilityState !== 'visible') {
        boundResetFromStore();
      }
    }, 100);
  };

  window.addEventListener('storage', handleStorage, false);
  return {
    cancel: function cancel() {
      clearTimeout(lazy);
      window.removeEventListener('storage', handleStorage, false);
    }
  };
}

exports.actions = actions;
exports.appStore = appStore;
exports.dispatcher = dispatcher;
exports.exportStoreToJSON = exportStoreToJSON;
exports.importStoreFromJSON = importStoreFromJSON;
exports.initDatabase = initDatabase;
exports.localStore = localStore;
exports.registerStore = registerStore;
exports.syncChanges = syncChanges$1;
exports.syncChangesQueue = syncChangesQueue;
exports.userAddressesStore = userAddressesStore;
exports.userInfoStore = userInfoStore;
exports.userTagsStore = userTagsStore;
exports.userTxsStore = userTxsStore;

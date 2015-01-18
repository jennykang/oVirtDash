/*! oVirtJS 0.0.1 
*Apache License 2.0 http://www.apache.org/licenses/LICENSE-2.0
*/
(function() {
    var undefined;
    var arrayPool = [], objectPool = [];
    var idCounter = 0;
    var keyPrefix = +new Date() + "";
    var largeArraySize = 75;
    var maxPoolSize = 40;
    var whitespace = " 	\f ﻿" + "\n\r\u2028\u2029" + " ᠎             　";
    var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
    var reFlags = /\w*$/;
    var reFuncName = /^\s*function[ \n\r\t]+\w/;
    var reInterpolate = /<%=([\s\S]+?)%>/g;
    var reLeadingSpacesAndZeros = RegExp("^[" + whitespace + "]*0+(?=.$)");
    var reNoMatch = /($^)/;
    var reThis = /\bthis\b/;
    var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;
    var contextProps = [ "Array", "Boolean", "Date", "Function", "Math", "Number", "Object", "RegExp", "String", "_", "attachEvent", "clearTimeout", "isFinite", "isNaN", "parseInt", "setTimeout" ];
    var templateCounter = 0;
    var argsClass = "[object Arguments]", arrayClass = "[object Array]", boolClass = "[object Boolean]", dateClass = "[object Date]", funcClass = "[object Function]", numberClass = "[object Number]", objectClass = "[object Object]", regexpClass = "[object RegExp]", stringClass = "[object String]";
    var cloneableClasses = {};
    cloneableClasses[funcClass] = false;
    cloneableClasses[argsClass] = cloneableClasses[arrayClass] = cloneableClasses[boolClass] = cloneableClasses[dateClass] = cloneableClasses[numberClass] = cloneableClasses[objectClass] = cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;
    var debounceOptions = {
        leading: false,
        maxWait: 0,
        trailing: false
    };
    var descriptor = {
        configurable: false,
        enumerable: false,
        value: null,
        writable: false
    };
    var objectTypes = {
        "boolean": false,
        "function": true,
        object: true,
        number: false,
        string: false,
        undefined: false
    };
    var stringEscapes = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "	": "t",
        "\u2028": "u2028",
        "\u2029": "u2029"
    };
    var root = objectTypes[typeof window] && window || this;
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
    var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
    var freeGlobal = objectTypes[typeof global] && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
        root = freeGlobal;
    }
    function baseIndexOf(array, value, fromIndex) {
        var index = (fromIndex || 0) - 1, length = array ? array.length : 0;
        while (++index < length) {
            if (array[index] === value) {
                return index;
            }
        }
        return -1;
    }
    function cacheIndexOf(cache, value) {
        var type = typeof value;
        cache = cache.cache;
        if (type == "boolean" || value == null) {
            return cache[value] ? 0 : -1;
        }
        if (type != "number" && type != "string") {
            type = "object";
        }
        var key = type == "number" ? value : keyPrefix + value;
        cache = (cache = cache[type]) && cache[key];
        return type == "object" ? cache && baseIndexOf(cache, value) > -1 ? 0 : -1 : cache ? 0 : -1;
    }
    function cachePush(value) {
        var cache = this.cache, type = typeof value;
        if (type == "boolean" || value == null) {
            cache[value] = true;
        } else {
            if (type != "number" && type != "string") {
                type = "object";
            }
            var key = type == "number" ? value : keyPrefix + value, typeCache = cache[type] || (cache[type] = {});
            if (type == "object") {
                (typeCache[key] || (typeCache[key] = [])).push(value);
            } else {
                typeCache[key] = true;
            }
        }
    }
    function charAtCallback(value) {
        return value.charCodeAt(0);
    }
    function compareAscending(a, b) {
        var ac = a.criteria, bc = b.criteria, index = -1, length = ac.length;
        while (++index < length) {
            var value = ac[index], other = bc[index];
            if (value !== other) {
                if (value > other || typeof value == "undefined") {
                    return 1;
                }
                if (value < other || typeof other == "undefined") {
                    return -1;
                }
            }
        }
        return a.index - b.index;
    }
    function createCache(array) {
        var index = -1, length = array.length, first = array[0], mid = array[length / 2 | 0], last = array[length - 1];
        if (first && typeof first == "object" && mid && typeof mid == "object" && last && typeof last == "object") {
            return false;
        }
        var cache = getObject();
        cache["false"] = cache["null"] = cache["true"] = cache["undefined"] = false;
        var result = getObject();
        result.array = array;
        result.cache = cache;
        result.push = cachePush;
        while (++index < length) {
            result.push(array[index]);
        }
        return result;
    }
    function escapeStringChar(match) {
        return "\\" + stringEscapes[match];
    }
    function getArray() {
        return arrayPool.pop() || [];
    }
    function getObject() {
        return objectPool.pop() || {
            array: null,
            cache: null,
            criteria: null,
            "false": false,
            index: 0,
            "null": false,
            number: null,
            object: null,
            push: null,
            string: null,
            "true": false,
            undefined: false,
            value: null
        };
    }
    function releaseArray(array) {
        array.length = 0;
        if (arrayPool.length < maxPoolSize) {
            arrayPool.push(array);
        }
    }
    function releaseObject(object) {
        var cache = object.cache;
        if (cache) {
            releaseObject(cache);
        }
        object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
        if (objectPool.length < maxPoolSize) {
            objectPool.push(object);
        }
    }
    function slice(array, start, end) {
        start || (start = 0);
        if (typeof end == "undefined") {
            end = array ? array.length : 0;
        }
        var index = -1, length = end - start || 0, result = Array(length < 0 ? 0 : length);
        while (++index < length) {
            result[index] = array[start + index];
        }
        return result;
    }
    function runInContext(context) {
        context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;
        var Array = context.Array, Boolean = context.Boolean, Date = context.Date, Function = context.Function, Math = context.Math, Number = context.Number, Object = context.Object, RegExp = context.RegExp, String = context.String, TypeError = context.TypeError;
        var arrayRef = [];
        var objectProto = Object.prototype;
        var oldDash = context._;
        var toString = objectProto.toString;
        var reNative = RegExp("^" + String(toString).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/toString| for [^\]]+/g, ".*?") + "$");
        var ceil = Math.ceil, clearTimeout = context.clearTimeout, floor = Math.floor, fnToString = Function.prototype.toString, getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf, hasOwnProperty = objectProto.hasOwnProperty, push = arrayRef.push, setTimeout = context.setTimeout, splice = arrayRef.splice, unshift = arrayRef.unshift;
        var defineProperty = function() {
            try {
                var o = {}, func = isNative(func = Object.defineProperty) && func, result = func(o, o, o) && func;
            } catch (e) {}
            return result;
        }();
        var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate, nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray, nativeIsFinite = context.isFinite, nativeIsNaN = context.isNaN, nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys, nativeMax = Math.max, nativeMin = Math.min, nativeParseInt = context.parseInt, nativeRandom = Math.random;
        var ctorByClass = {};
        ctorByClass[arrayClass] = Array;
        ctorByClass[boolClass] = Boolean;
        ctorByClass[dateClass] = Date;
        ctorByClass[funcClass] = Function;
        ctorByClass[objectClass] = Object;
        ctorByClass[numberClass] = Number;
        ctorByClass[regexpClass] = RegExp;
        ctorByClass[stringClass] = String;
        function lodash(value) {
            return value && typeof value == "object" && !isArray(value) && hasOwnProperty.call(value, "__wrapped__") ? value : new lodashWrapper(value);
        }
        function lodashWrapper(value, chainAll) {
            this.__chain__ = !!chainAll;
            this.__wrapped__ = value;
        }
        lodashWrapper.prototype = lodash.prototype;
        var support = lodash.support = {};
        support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);
        support.funcNames = typeof Function.name == "string";
        lodash.templateSettings = {
            escape: /<%-([\s\S]+?)%>/g,
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: reInterpolate,
            variable: "",
            imports: {
                _: lodash
            }
        };
        function baseBind(bindData) {
            var func = bindData[0], partialArgs = bindData[2], thisArg = bindData[4];
            function bound() {
                if (partialArgs) {
                    var args = slice(partialArgs);
                    push.apply(args, arguments);
                }
                if (this instanceof bound) {
                    var thisBinding = baseCreate(func.prototype), result = func.apply(thisBinding, args || arguments);
                    return isObject(result) ? result : thisBinding;
                }
                return func.apply(thisArg, args || arguments);
            }
            setBindData(bound, bindData);
            return bound;
        }
        function baseClone(value, isDeep, callback, stackA, stackB) {
            if (callback) {
                var result = callback(value);
                if (typeof result != "undefined") {
                    return result;
                }
            }
            var isObj = isObject(value);
            if (isObj) {
                var className = toString.call(value);
                if (!cloneableClasses[className]) {
                    return value;
                }
                var ctor = ctorByClass[className];
                switch (className) {
                  case boolClass:
                  case dateClass:
                    return new ctor(+value);

                  case numberClass:
                  case stringClass:
                    return new ctor(value);

                  case regexpClass:
                    result = ctor(value.source, reFlags.exec(value));
                    result.lastIndex = value.lastIndex;
                    return result;
                }
            } else {
                return value;
            }
            var isArr = isArray(value);
            if (isDeep) {
                var initedStack = !stackA;
                stackA || (stackA = getArray());
                stackB || (stackB = getArray());
                var length = stackA.length;
                while (length--) {
                    if (stackA[length] == value) {
                        return stackB[length];
                    }
                }
                result = isArr ? ctor(value.length) : {};
            } else {
                result = isArr ? slice(value) : assign({}, value);
            }
            if (isArr) {
                if (hasOwnProperty.call(value, "index")) {
                    result.index = value.index;
                }
                if (hasOwnProperty.call(value, "input")) {
                    result.input = value.input;
                }
            }
            if (!isDeep) {
                return result;
            }
            stackA.push(value);
            stackB.push(result);
            (isArr ? forEach : forOwn)(value, function(objValue, key) {
                result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
            });
            if (initedStack) {
                releaseArray(stackA);
                releaseArray(stackB);
            }
            return result;
        }
        function baseCreate(prototype, properties) {
            return isObject(prototype) ? nativeCreate(prototype) : {};
        }
        if (!nativeCreate) {
            baseCreate = function() {
                function Object() {}
                return function(prototype) {
                    if (isObject(prototype)) {
                        Object.prototype = prototype;
                        var result = new Object();
                        Object.prototype = null;
                    }
                    return result || context.Object();
                };
            }();
        }
        function baseCreateCallback(func, thisArg, argCount) {
            if (typeof func != "function") {
                return identity;
            }
            if (typeof thisArg == "undefined" || !("prototype" in func)) {
                return func;
            }
            var bindData = func.__bindData__;
            if (typeof bindData == "undefined") {
                if (support.funcNames) {
                    bindData = !func.name;
                }
                bindData = bindData || !support.funcDecomp;
                if (!bindData) {
                    var source = fnToString.call(func);
                    if (!support.funcNames) {
                        bindData = !reFuncName.test(source);
                    }
                    if (!bindData) {
                        bindData = reThis.test(source);
                        setBindData(func, bindData);
                    }
                }
            }
            if (bindData === false || bindData !== true && bindData[1] & 1) {
                return func;
            }
            switch (argCount) {
              case 1:
                return function(value) {
                    return func.call(thisArg, value);
                };

              case 2:
                return function(a, b) {
                    return func.call(thisArg, a, b);
                };

              case 3:
                return function(value, index, collection) {
                    return func.call(thisArg, value, index, collection);
                };

              case 4:
                return function(accumulator, value, index, collection) {
                    return func.call(thisArg, accumulator, value, index, collection);
                };
            }
            return bind(func, thisArg);
        }
        function baseCreateWrapper(bindData) {
            var func = bindData[0], bitmask = bindData[1], partialArgs = bindData[2], partialRightArgs = bindData[3], thisArg = bindData[4], arity = bindData[5];
            var isBind = bitmask & 1, isBindKey = bitmask & 2, isCurry = bitmask & 4, isCurryBound = bitmask & 8, key = func;
            function bound() {
                var thisBinding = isBind ? thisArg : this;
                if (partialArgs) {
                    var args = slice(partialArgs);
                    push.apply(args, arguments);
                }
                if (partialRightArgs || isCurry) {
                    args || (args = slice(arguments));
                    if (partialRightArgs) {
                        push.apply(args, partialRightArgs);
                    }
                    if (isCurry && args.length < arity) {
                        bitmask |= 16 & ~32;
                        return baseCreateWrapper([ func, isCurryBound ? bitmask : bitmask & ~3, args, null, thisArg, arity ]);
                    }
                }
                args || (args = arguments);
                if (isBindKey) {
                    func = thisBinding[key];
                }
                if (this instanceof bound) {
                    thisBinding = baseCreate(func.prototype);
                    var result = func.apply(thisBinding, args);
                    return isObject(result) ? result : thisBinding;
                }
                return func.apply(thisBinding, args);
            }
            setBindData(bound, bindData);
            return bound;
        }
        function baseDifference(array, values) {
            var index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, isLarge = length >= largeArraySize && indexOf === baseIndexOf, result = [];
            if (isLarge) {
                var cache = createCache(values);
                if (cache) {
                    indexOf = cacheIndexOf;
                    values = cache;
                } else {
                    isLarge = false;
                }
            }
            while (++index < length) {
                var value = array[index];
                if (indexOf(values, value) < 0) {
                    result.push(value);
                }
            }
            if (isLarge) {
                releaseObject(values);
            }
            return result;
        }
        function baseFlatten(array, isShallow, isStrict, fromIndex) {
            var index = (fromIndex || 0) - 1, length = array ? array.length : 0, result = [];
            while (++index < length) {
                var value = array[index];
                if (value && typeof value == "object" && typeof value.length == "number" && (isArray(value) || isArguments(value))) {
                    if (!isShallow) {
                        value = baseFlatten(value, isShallow, isStrict);
                    }
                    var valIndex = -1, valLength = value.length, resIndex = result.length;
                    result.length += valLength;
                    while (++valIndex < valLength) {
                        result[resIndex++] = value[valIndex];
                    }
                } else if (!isStrict) {
                    result.push(value);
                }
            }
            return result;
        }
        function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
            if (callback) {
                var result = callback(a, b);
                if (typeof result != "undefined") {
                    return !!result;
                }
            }
            if (a === b) {
                return a !== 0 || 1 / a == 1 / b;
            }
            var type = typeof a, otherType = typeof b;
            if (a === a && !(a && objectTypes[type]) && !(b && objectTypes[otherType])) {
                return false;
            }
            if (a == null || b == null) {
                return a === b;
            }
            var className = toString.call(a), otherClass = toString.call(b);
            if (className == argsClass) {
                className = objectClass;
            }
            if (otherClass == argsClass) {
                otherClass = objectClass;
            }
            if (className != otherClass) {
                return false;
            }
            switch (className) {
              case boolClass:
              case dateClass:
                return +a == +b;

              case numberClass:
                return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;

              case regexpClass:
              case stringClass:
                return a == String(b);
            }
            var isArr = className == arrayClass;
            if (!isArr) {
                var aWrapped = hasOwnProperty.call(a, "__wrapped__"), bWrapped = hasOwnProperty.call(b, "__wrapped__");
                if (aWrapped || bWrapped) {
                    return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
                }
                if (className != objectClass) {
                    return false;
                }
                var ctorA = a.constructor, ctorB = b.constructor;
                if (ctorA != ctorB && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ("constructor" in a && "constructor" in b)) {
                    return false;
                }
            }
            var initedStack = !stackA;
            stackA || (stackA = getArray());
            stackB || (stackB = getArray());
            var length = stackA.length;
            while (length--) {
                if (stackA[length] == a) {
                    return stackB[length] == b;
                }
            }
            var size = 0;
            result = true;
            stackA.push(a);
            stackB.push(b);
            if (isArr) {
                length = a.length;
                size = b.length;
                result = size == length;
                if (result || isWhere) {
                    while (size--) {
                        var index = length, value = b[size];
                        if (isWhere) {
                            while (index--) {
                                if (result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB)) {
                                    break;
                                }
                            }
                        } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
                            break;
                        }
                    }
                }
            } else {
                forIn(b, function(value, key, b) {
                    if (hasOwnProperty.call(b, key)) {
                        size++;
                        return result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB);
                    }
                });
                if (result && !isWhere) {
                    forIn(a, function(value, key, a) {
                        if (hasOwnProperty.call(a, key)) {
                            return result = --size > -1;
                        }
                    });
                }
            }
            stackA.pop();
            stackB.pop();
            if (initedStack) {
                releaseArray(stackA);
                releaseArray(stackB);
            }
            return result;
        }
        function baseMerge(object, source, callback, stackA, stackB) {
            (isArray(source) ? forEach : forOwn)(source, function(source, key) {
                var found, isArr, result = source, value = object[key];
                if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
                    var stackLength = stackA.length;
                    while (stackLength--) {
                        if (found = stackA[stackLength] == source) {
                            value = stackB[stackLength];
                            break;
                        }
                    }
                    if (!found) {
                        var isShallow;
                        if (callback) {
                            result = callback(value, source);
                            if (isShallow = typeof result != "undefined") {
                                value = result;
                            }
                        }
                        if (!isShallow) {
                            value = isArr ? isArray(value) ? value : [] : isPlainObject(value) ? value : {};
                        }
                        stackA.push(source);
                        stackB.push(value);
                        if (!isShallow) {
                            baseMerge(value, source, callback, stackA, stackB);
                        }
                    }
                } else {
                    if (callback) {
                        result = callback(value, source);
                        if (typeof result == "undefined") {
                            result = source;
                        }
                    }
                    if (typeof result != "undefined") {
                        value = result;
                    }
                }
                object[key] = value;
            });
        }
        function baseRandom(min, max) {
            return min + floor(nativeRandom() * (max - min + 1));
        }
        function baseUniq(array, isSorted, callback) {
            var index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, result = [];
            var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf, seen = callback || isLarge ? getArray() : result;
            if (isLarge) {
                var cache = createCache(seen);
                indexOf = cacheIndexOf;
                seen = cache;
            }
            while (++index < length) {
                var value = array[index], computed = callback ? callback(value, index, array) : value;
                if (isSorted ? !index || seen[seen.length - 1] !== computed : indexOf(seen, computed) < 0) {
                    if (callback || isLarge) {
                        seen.push(computed);
                    }
                    result.push(value);
                }
            }
            if (isLarge) {
                releaseArray(seen.array);
                releaseObject(seen);
            } else if (callback) {
                releaseArray(seen);
            }
            return result;
        }
        function createAggregator(setter) {
            return function(collection, callback, thisArg) {
                var result = {};
                callback = lodash.createCallback(callback, thisArg, 3);
                var index = -1, length = collection ? collection.length : 0;
                if (typeof length == "number") {
                    while (++index < length) {
                        var value = collection[index];
                        setter(result, value, callback(value, index, collection), collection);
                    }
                } else {
                    forOwn(collection, function(value, key, collection) {
                        setter(result, value, callback(value, key, collection), collection);
                    });
                }
                return result;
            };
        }
        function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
            var isBind = bitmask & 1, isBindKey = bitmask & 2, isCurry = bitmask & 4, isCurryBound = bitmask & 8, isPartial = bitmask & 16, isPartialRight = bitmask & 32;
            if (!isBindKey && !isFunction(func)) {
                throw new TypeError();
            }
            if (isPartial && !partialArgs.length) {
                bitmask &= ~16;
                isPartial = partialArgs = false;
            }
            if (isPartialRight && !partialRightArgs.length) {
                bitmask &= ~32;
                isPartialRight = partialRightArgs = false;
            }
            var bindData = func && func.__bindData__;
            if (bindData && bindData !== true) {
                bindData = slice(bindData);
                if (bindData[2]) {
                    bindData[2] = slice(bindData[2]);
                }
                if (bindData[3]) {
                    bindData[3] = slice(bindData[3]);
                }
                if (isBind && !(bindData[1] & 1)) {
                    bindData[4] = thisArg;
                }
                if (!isBind && bindData[1] & 1) {
                    bitmask |= 8;
                }
                if (isCurry && !(bindData[1] & 4)) {
                    bindData[5] = arity;
                }
                if (isPartial) {
                    push.apply(bindData[2] || (bindData[2] = []), partialArgs);
                }
                if (isPartialRight) {
                    unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
                }
                bindData[1] |= bitmask;
                return createWrapper.apply(null, bindData);
            }
            var creater = bitmask == 1 || bitmask === 17 ? baseBind : baseCreateWrapper;
            return creater([ func, bitmask, partialArgs, partialRightArgs, thisArg, arity ]);
        }
        function escapeHtmlChar(match) {
            return htmlEscapes[match];
        }
        function getIndexOf() {
            var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
            return result;
        }
        function isNative(value) {
            return typeof value == "function" && reNative.test(value);
        }
        var setBindData = !defineProperty ? noop : function(func, value) {
            descriptor.value = value;
            defineProperty(func, "__bindData__", descriptor);
        };
        function shimIsPlainObject(value) {
            var ctor, result;
            if (!(value && toString.call(value) == objectClass) || (ctor = value.constructor, 
            isFunction(ctor) && !(ctor instanceof ctor))) {
                return false;
            }
            forIn(value, function(value, key) {
                result = key;
            });
            return typeof result == "undefined" || hasOwnProperty.call(value, result);
        }
        function unescapeHtmlChar(match) {
            return htmlUnescapes[match];
        }
        function isArguments(value) {
            return value && typeof value == "object" && typeof value.length == "number" && toString.call(value) == argsClass || false;
        }
        var isArray = nativeIsArray || function(value) {
            return value && typeof value == "object" && typeof value.length == "number" && toString.call(value) == arrayClass || false;
        };
        var shimKeys = function(object) {
            var index, iterable = object, result = [];
            if (!iterable) return result;
            if (!objectTypes[typeof object]) return result;
            for (index in iterable) {
                if (hasOwnProperty.call(iterable, index)) {
                    result.push(index);
                }
            }
            return result;
        };
        var keys = !nativeKeys ? shimKeys : function(object) {
            if (!isObject(object)) {
                return [];
            }
            return nativeKeys(object);
        };
        var htmlEscapes = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        var htmlUnescapes = invert(htmlEscapes);
        var reEscapedHtml = RegExp("(" + keys(htmlUnescapes).join("|") + ")", "g"), reUnescapedHtml = RegExp("[" + keys(htmlEscapes).join("") + "]", "g");
        var assign = function(object, source, guard) {
            var index, iterable = object, result = iterable;
            if (!iterable) return result;
            var args = arguments, argsIndex = 0, argsLength = typeof guard == "number" ? 2 : args.length;
            if (argsLength > 3 && typeof args[argsLength - 2] == "function") {
                var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
            } else if (argsLength > 2 && typeof args[argsLength - 1] == "function") {
                callback = args[--argsLength];
            }
            while (++argsIndex < argsLength) {
                iterable = args[argsIndex];
                if (iterable && objectTypes[typeof iterable]) {
                    var ownIndex = -1, ownProps = objectTypes[typeof iterable] && keys(iterable), length = ownProps ? ownProps.length : 0;
                    while (++ownIndex < length) {
                        index = ownProps[ownIndex];
                        result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
                    }
                }
            }
            return result;
        };
        function clone(value, isDeep, callback, thisArg) {
            if (typeof isDeep != "boolean" && isDeep != null) {
                thisArg = callback;
                callback = isDeep;
                isDeep = false;
            }
            return baseClone(value, isDeep, typeof callback == "function" && baseCreateCallback(callback, thisArg, 1));
        }
        function cloneDeep(value, callback, thisArg) {
            return baseClone(value, true, typeof callback == "function" && baseCreateCallback(callback, thisArg, 1));
        }
        function create(prototype, properties) {
            var result = baseCreate(prototype);
            return properties ? assign(result, properties) : result;
        }
        var defaults = function(object, source, guard) {
            var index, iterable = object, result = iterable;
            if (!iterable) return result;
            var args = arguments, argsIndex = 0, argsLength = typeof guard == "number" ? 2 : args.length;
            while (++argsIndex < argsLength) {
                iterable = args[argsIndex];
                if (iterable && objectTypes[typeof iterable]) {
                    var ownIndex = -1, ownProps = objectTypes[typeof iterable] && keys(iterable), length = ownProps ? ownProps.length : 0;
                    while (++ownIndex < length) {
                        index = ownProps[ownIndex];
                        if (typeof result[index] == "undefined") result[index] = iterable[index];
                    }
                }
            }
            return result;
        };
        function findKey(object, callback, thisArg) {
            var result;
            callback = lodash.createCallback(callback, thisArg, 3);
            forOwn(object, function(value, key, object) {
                if (callback(value, key, object)) {
                    result = key;
                    return false;
                }
            });
            return result;
        }
        function findLastKey(object, callback, thisArg) {
            var result;
            callback = lodash.createCallback(callback, thisArg, 3);
            forOwnRight(object, function(value, key, object) {
                if (callback(value, key, object)) {
                    result = key;
                    return false;
                }
            });
            return result;
        }
        var forIn = function(collection, callback, thisArg) {
            var index, iterable = collection, result = iterable;
            if (!iterable) return result;
            if (!objectTypes[typeof iterable]) return result;
            callback = callback && typeof thisArg == "undefined" ? callback : baseCreateCallback(callback, thisArg, 3);
            for (index in iterable) {
                if (callback(iterable[index], index, collection) === false) return result;
            }
            return result;
        };
        function forInRight(object, callback, thisArg) {
            var pairs = [];
            forIn(object, function(value, key) {
                pairs.push(key, value);
            });
            var length = pairs.length;
            callback = baseCreateCallback(callback, thisArg, 3);
            while (length--) {
                if (callback(pairs[length--], pairs[length], object) === false) {
                    break;
                }
            }
            return object;
        }
        var forOwn = function(collection, callback, thisArg) {
            var index, iterable = collection, result = iterable;
            if (!iterable) return result;
            if (!objectTypes[typeof iterable]) return result;
            callback = callback && typeof thisArg == "undefined" ? callback : baseCreateCallback(callback, thisArg, 3);
            var ownIndex = -1, ownProps = objectTypes[typeof iterable] && keys(iterable), length = ownProps ? ownProps.length : 0;
            while (++ownIndex < length) {
                index = ownProps[ownIndex];
                if (callback(iterable[index], index, collection) === false) return result;
            }
            return result;
        };
        function forOwnRight(object, callback, thisArg) {
            var props = keys(object), length = props.length;
            callback = baseCreateCallback(callback, thisArg, 3);
            while (length--) {
                var key = props[length];
                if (callback(object[key], key, object) === false) {
                    break;
                }
            }
            return object;
        }
        function functions(object) {
            var result = [];
            forIn(object, function(value, key) {
                if (isFunction(value)) {
                    result.push(key);
                }
            });
            return result.sort();
        }
        function has(object, key) {
            return object ? hasOwnProperty.call(object, key) : false;
        }
        function invert(object) {
            var index = -1, props = keys(object), length = props.length, result = {};
            while (++index < length) {
                var key = props[index];
                result[object[key]] = key;
            }
            return result;
        }
        function isBoolean(value) {
            return value === true || value === false || value && typeof value == "object" && toString.call(value) == boolClass || false;
        }
        function isDate(value) {
            return value && typeof value == "object" && toString.call(value) == dateClass || false;
        }
        function isElement(value) {
            return value && value.nodeType === 1 || false;
        }
        function isEmpty(value) {
            var result = true;
            if (!value) {
                return result;
            }
            var className = toString.call(value), length = value.length;
            if (className == arrayClass || className == stringClass || className == argsClass || className == objectClass && typeof length == "number" && isFunction(value.splice)) {
                return !length;
            }
            forOwn(value, function() {
                return result = false;
            });
            return result;
        }
        function isEqual(a, b, callback, thisArg) {
            return baseIsEqual(a, b, typeof callback == "function" && baseCreateCallback(callback, thisArg, 2));
        }
        function isFinite(value) {
            return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
        }
        function isFunction(value) {
            return typeof value == "function";
        }
        function isObject(value) {
            return !!(value && objectTypes[typeof value]);
        }
        function isNaN(value) {
            return isNumber(value) && value != +value;
        }
        function isNull(value) {
            return value === null;
        }
        function isNumber(value) {
            return typeof value == "number" || value && typeof value == "object" && toString.call(value) == numberClass || false;
        }
        var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
            if (!(value && toString.call(value) == objectClass)) {
                return false;
            }
            var valueOf = value.valueOf, objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);
            return objProto ? value == objProto || getPrototypeOf(value) == objProto : shimIsPlainObject(value);
        };
        function isRegExp(value) {
            return value && typeof value == "object" && toString.call(value) == regexpClass || false;
        }
        function isString(value) {
            return typeof value == "string" || value && typeof value == "object" && toString.call(value) == stringClass || false;
        }
        function isUndefined(value) {
            return typeof value == "undefined";
        }
        function mapValues(object, callback, thisArg) {
            var result = {};
            callback = lodash.createCallback(callback, thisArg, 3);
            forOwn(object, function(value, key, object) {
                result[key] = callback(value, key, object);
            });
            return result;
        }
        function merge(object) {
            var args = arguments, length = 2;
            if (!isObject(object)) {
                return object;
            }
            if (typeof args[2] != "number") {
                length = args.length;
            }
            if (length > 3 && typeof args[length - 2] == "function") {
                var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
            } else if (length > 2 && typeof args[length - 1] == "function") {
                callback = args[--length];
            }
            var sources = slice(arguments, 1, length), index = -1, stackA = getArray(), stackB = getArray();
            while (++index < length) {
                baseMerge(object, sources[index], callback, stackA, stackB);
            }
            releaseArray(stackA);
            releaseArray(stackB);
            return object;
        }
        function omit(object, callback, thisArg) {
            var result = {};
            if (typeof callback != "function") {
                var props = [];
                forIn(object, function(value, key) {
                    props.push(key);
                });
                props = baseDifference(props, baseFlatten(arguments, true, false, 1));
                var index = -1, length = props.length;
                while (++index < length) {
                    var key = props[index];
                    result[key] = object[key];
                }
            } else {
                callback = lodash.createCallback(callback, thisArg, 3);
                forIn(object, function(value, key, object) {
                    if (!callback(value, key, object)) {
                        result[key] = value;
                    }
                });
            }
            return result;
        }
        function pairs(object) {
            var index = -1, props = keys(object), length = props.length, result = Array(length);
            while (++index < length) {
                var key = props[index];
                result[index] = [ key, object[key] ];
            }
            return result;
        }
        function pick(object, callback, thisArg) {
            var result = {};
            if (typeof callback != "function") {
                var index = -1, props = baseFlatten(arguments, true, false, 1), length = isObject(object) ? props.length : 0;
                while (++index < length) {
                    var key = props[index];
                    if (key in object) {
                        result[key] = object[key];
                    }
                }
            } else {
                callback = lodash.createCallback(callback, thisArg, 3);
                forIn(object, function(value, key, object) {
                    if (callback(value, key, object)) {
                        result[key] = value;
                    }
                });
            }
            return result;
        }
        function transform(object, callback, accumulator, thisArg) {
            var isArr = isArray(object);
            if (accumulator == null) {
                if (isArr) {
                    accumulator = [];
                } else {
                    var ctor = object && object.constructor, proto = ctor && ctor.prototype;
                    accumulator = baseCreate(proto);
                }
            }
            if (callback) {
                callback = lodash.createCallback(callback, thisArg, 4);
                (isArr ? forEach : forOwn)(object, function(value, index, object) {
                    return callback(accumulator, value, index, object);
                });
            }
            return accumulator;
        }
        function values(object) {
            var index = -1, props = keys(object), length = props.length, result = Array(length);
            while (++index < length) {
                result[index] = object[props[index]];
            }
            return result;
        }
        function at(collection) {
            var args = arguments, index = -1, props = baseFlatten(args, true, false, 1), length = args[2] && args[2][args[1]] === collection ? 1 : props.length, result = Array(length);
            while (++index < length) {
                result[index] = collection[props[index]];
            }
            return result;
        }
        function contains(collection, target, fromIndex) {
            var index = -1, indexOf = getIndexOf(), length = collection ? collection.length : 0, result = false;
            fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
            if (isArray(collection)) {
                result = indexOf(collection, target, fromIndex) > -1;
            } else if (typeof length == "number") {
                result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
            } else {
                forOwn(collection, function(value) {
                    if (++index >= fromIndex) {
                        return !(result = value === target);
                    }
                });
            }
            return result;
        }
        var countBy = createAggregator(function(result, value, key) {
            hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1;
        });
        function every(collection, callback, thisArg) {
            var result = true;
            callback = lodash.createCallback(callback, thisArg, 3);
            var index = -1, length = collection ? collection.length : 0;
            if (typeof length == "number") {
                while (++index < length) {
                    if (!(result = !!callback(collection[index], index, collection))) {
                        break;
                    }
                }
            } else {
                forOwn(collection, function(value, index, collection) {
                    return result = !!callback(value, index, collection);
                });
            }
            return result;
        }
        function filter(collection, callback, thisArg) {
            var result = [];
            callback = lodash.createCallback(callback, thisArg, 3);
            var index = -1, length = collection ? collection.length : 0;
            if (typeof length == "number") {
                while (++index < length) {
                    var value = collection[index];
                    if (callback(value, index, collection)) {
                        result.push(value);
                    }
                }
            } else {
                forOwn(collection, function(value, index, collection) {
                    if (callback(value, index, collection)) {
                        result.push(value);
                    }
                });
            }
            return result;
        }
        function find(collection, callback, thisArg) {
            callback = lodash.createCallback(callback, thisArg, 3);
            var index = -1, length = collection ? collection.length : 0;
            if (typeof length == "number") {
                while (++index < length) {
                    var value = collection[index];
                    if (callback(value, index, collection)) {
                        return value;
                    }
                }
            } else {
                var result;
                forOwn(collection, function(value, index, collection) {
                    if (callback(value, index, collection)) {
                        result = value;
                        return false;
                    }
                });
                return result;
            }
        }
        function findLast(collection, callback, thisArg) {
            var result;
            callback = lodash.createCallback(callback, thisArg, 3);
            forEachRight(collection, function(value, index, collection) {
                if (callback(value, index, collection)) {
                    result = value;
                    return false;
                }
            });
            return result;
        }
        function forEach(collection, callback, thisArg) {
            var index = -1, length = collection ? collection.length : 0;
            callback = callback && typeof thisArg == "undefined" ? callback : baseCreateCallback(callback, thisArg, 3);
            if (typeof length == "number") {
                while (++index < length) {
                    if (callback(collection[index], index, collection) === false) {
                        break;
                    }
                }
            } else {
                forOwn(collection, callback);
            }
            return collection;
        }
        function forEachRight(collection, callback, thisArg) {
            var length = collection ? collection.length : 0;
            callback = callback && typeof thisArg == "undefined" ? callback : baseCreateCallback(callback, thisArg, 3);
            if (typeof length == "number") {
                while (length--) {
                    if (callback(collection[length], length, collection) === false) {
                        break;
                    }
                }
            } else {
                var props = keys(collection);
                length = props.length;
                forOwn(collection, function(value, key, collection) {
                    key = props ? props[--length] : --length;
                    return callback(collection[key], key, collection);
                });
            }
            return collection;
        }
        var groupBy = createAggregator(function(result, value, key) {
            (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
        });
        var indexBy = createAggregator(function(result, value, key) {
            result[key] = value;
        });
        function invoke(collection, methodName) {
            var args = slice(arguments, 2), index = -1, isFunc = typeof methodName == "function", length = collection ? collection.length : 0, result = Array(typeof length == "number" ? length : 0);
            forEach(collection, function(value) {
                result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
            });
            return result;
        }
        function map(collection, callback, thisArg) {
            var index = -1, length = collection ? collection.length : 0;
            callback = lodash.createCallback(callback, thisArg, 3);
            if (typeof length == "number") {
                var result = Array(length);
                while (++index < length) {
                    result[index] = callback(collection[index], index, collection);
                }
            } else {
                result = [];
                forOwn(collection, function(value, key, collection) {
                    result[++index] = callback(value, key, collection);
                });
            }
            return result;
        }
        function max(collection, callback, thisArg) {
            var computed = -Infinity, result = computed;
            if (typeof callback != "function" && thisArg && thisArg[callback] === collection) {
                callback = null;
            }
            if (callback == null && isArray(collection)) {
                var index = -1, length = collection.length;
                while (++index < length) {
                    var value = collection[index];
                    if (value > result) {
                        result = value;
                    }
                }
            } else {
                callback = callback == null && isString(collection) ? charAtCallback : lodash.createCallback(callback, thisArg, 3);
                forEach(collection, function(value, index, collection) {
                    var current = callback(value, index, collection);
                    if (current > computed) {
                        computed = current;
                        result = value;
                    }
                });
            }
            return result;
        }
        function min(collection, callback, thisArg) {
            var computed = Infinity, result = computed;
            if (typeof callback != "function" && thisArg && thisArg[callback] === collection) {
                callback = null;
            }
            if (callback == null && isArray(collection)) {
                var index = -1, length = collection.length;
                while (++index < length) {
                    var value = collection[index];
                    if (value < result) {
                        result = value;
                    }
                }
            } else {
                callback = callback == null && isString(collection) ? charAtCallback : lodash.createCallback(callback, thisArg, 3);
                forEach(collection, function(value, index, collection) {
                    var current = callback(value, index, collection);
                    if (current < computed) {
                        computed = current;
                        result = value;
                    }
                });
            }
            return result;
        }
        var pluck = map;
        function reduce(collection, callback, accumulator, thisArg) {
            if (!collection) return accumulator;
            var noaccum = arguments.length < 3;
            callback = lodash.createCallback(callback, thisArg, 4);
            var index = -1, length = collection.length;
            if (typeof length == "number") {
                if (noaccum) {
                    accumulator = collection[++index];
                }
                while (++index < length) {
                    accumulator = callback(accumulator, collection[index], index, collection);
                }
            } else {
                forOwn(collection, function(value, index, collection) {
                    accumulator = noaccum ? (noaccum = false, value) : callback(accumulator, value, index, collection);
                });
            }
            return accumulator;
        }
        function reduceRight(collection, callback, accumulator, thisArg) {
            var noaccum = arguments.length < 3;
            callback = lodash.createCallback(callback, thisArg, 4);
            forEachRight(collection, function(value, index, collection) {
                accumulator = noaccum ? (noaccum = false, value) : callback(accumulator, value, index, collection);
            });
            return accumulator;
        }
        function reject(collection, callback, thisArg) {
            callback = lodash.createCallback(callback, thisArg, 3);
            return filter(collection, function(value, index, collection) {
                return !callback(value, index, collection);
            });
        }
        function sample(collection, n, guard) {
            if (collection && typeof collection.length != "number") {
                collection = values(collection);
            }
            if (n == null || guard) {
                return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
            }
            var result = shuffle(collection);
            result.length = nativeMin(nativeMax(0, n), result.length);
            return result;
        }
        function shuffle(collection) {
            var index = -1, length = collection ? collection.length : 0, result = Array(typeof length == "number" ? length : 0);
            forEach(collection, function(value) {
                var rand = baseRandom(0, ++index);
                result[index] = result[rand];
                result[rand] = value;
            });
            return result;
        }
        function size(collection) {
            var length = collection ? collection.length : 0;
            return typeof length == "number" ? length : keys(collection).length;
        }
        function some(collection, callback, thisArg) {
            var result;
            callback = lodash.createCallback(callback, thisArg, 3);
            var index = -1, length = collection ? collection.length : 0;
            if (typeof length == "number") {
                while (++index < length) {
                    if (result = callback(collection[index], index, collection)) {
                        break;
                    }
                }
            } else {
                forOwn(collection, function(value, index, collection) {
                    return !(result = callback(value, index, collection));
                });
            }
            return !!result;
        }
        function sortBy(collection, callback, thisArg) {
            var index = -1, isArr = isArray(callback), length = collection ? collection.length : 0, result = Array(typeof length == "number" ? length : 0);
            if (!isArr) {
                callback = lodash.createCallback(callback, thisArg, 3);
            }
            forEach(collection, function(value, key, collection) {
                var object = result[++index] = getObject();
                if (isArr) {
                    object.criteria = map(callback, function(key) {
                        return value[key];
                    });
                } else {
                    (object.criteria = getArray())[0] = callback(value, key, collection);
                }
                object.index = index;
                object.value = value;
            });
            length = result.length;
            result.sort(compareAscending);
            while (length--) {
                var object = result[length];
                result[length] = object.value;
                if (!isArr) {
                    releaseArray(object.criteria);
                }
                releaseObject(object);
            }
            return result;
        }
        function toArray(collection) {
            if (collection && typeof collection.length == "number") {
                return slice(collection);
            }
            return values(collection);
        }
        var where = filter;
        function compact(array) {
            var index = -1, length = array ? array.length : 0, result = [];
            while (++index < length) {
                var value = array[index];
                if (value) {
                    result.push(value);
                }
            }
            return result;
        }
        function difference(array) {
            return baseDifference(array, baseFlatten(arguments, true, true, 1));
        }
        function findIndex(array, callback, thisArg) {
            var index = -1, length = array ? array.length : 0;
            callback = lodash.createCallback(callback, thisArg, 3);
            while (++index < length) {
                if (callback(array[index], index, array)) {
                    return index;
                }
            }
            return -1;
        }
        function findLastIndex(array, callback, thisArg) {
            var length = array ? array.length : 0;
            callback = lodash.createCallback(callback, thisArg, 3);
            while (length--) {
                if (callback(array[length], length, array)) {
                    return length;
                }
            }
            return -1;
        }
        function first(array, callback, thisArg) {
            var n = 0, length = array ? array.length : 0;
            if (typeof callback != "number" && callback != null) {
                var index = -1;
                callback = lodash.createCallback(callback, thisArg, 3);
                while (++index < length && callback(array[index], index, array)) {
                    n++;
                }
            } else {
                n = callback;
                if (n == null || thisArg) {
                    return array ? array[0] : undefined;
                }
            }
            return slice(array, 0, nativeMin(nativeMax(0, n), length));
        }
        function flatten(array, isShallow, callback, thisArg) {
            if (typeof isShallow != "boolean" && isShallow != null) {
                thisArg = callback;
                callback = typeof isShallow != "function" && thisArg && thisArg[isShallow] === array ? null : isShallow;
                isShallow = false;
            }
            if (callback != null) {
                array = map(array, callback, thisArg);
            }
            return baseFlatten(array, isShallow);
        }
        function indexOf(array, value, fromIndex) {
            if (typeof fromIndex == "number") {
                var length = array ? array.length : 0;
                fromIndex = fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0;
            } else if (fromIndex) {
                var index = sortedIndex(array, value);
                return array[index] === value ? index : -1;
            }
            return baseIndexOf(array, value, fromIndex);
        }
        function initial(array, callback, thisArg) {
            var n = 0, length = array ? array.length : 0;
            if (typeof callback != "number" && callback != null) {
                var index = length;
                callback = lodash.createCallback(callback, thisArg, 3);
                while (index-- && callback(array[index], index, array)) {
                    n++;
                }
            } else {
                n = callback == null || thisArg ? 1 : callback || n;
            }
            return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
        }
        function intersection() {
            var args = [], argsIndex = -1, argsLength = arguments.length, caches = getArray(), indexOf = getIndexOf(), trustIndexOf = indexOf === baseIndexOf, seen = getArray();
            while (++argsIndex < argsLength) {
                var value = arguments[argsIndex];
                if (isArray(value) || isArguments(value)) {
                    args.push(value);
                    caches.push(trustIndexOf && value.length >= largeArraySize && createCache(argsIndex ? args[argsIndex] : seen));
                }
            }
            var array = args[0], index = -1, length = array ? array.length : 0, result = [];
            outer: while (++index < length) {
                var cache = caches[0];
                value = array[index];
                if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
                    argsIndex = argsLength;
                    (cache || seen).push(value);
                    while (--argsIndex) {
                        cache = caches[argsIndex];
                        if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
                            continue outer;
                        }
                    }
                    result.push(value);
                }
            }
            while (argsLength--) {
                cache = caches[argsLength];
                if (cache) {
                    releaseObject(cache);
                }
            }
            releaseArray(caches);
            releaseArray(seen);
            return result;
        }
        function last(array, callback, thisArg) {
            var n = 0, length = array ? array.length : 0;
            if (typeof callback != "number" && callback != null) {
                var index = length;
                callback = lodash.createCallback(callback, thisArg, 3);
                while (index-- && callback(array[index], index, array)) {
                    n++;
                }
            } else {
                n = callback;
                if (n == null || thisArg) {
                    return array ? array[length - 1] : undefined;
                }
            }
            return slice(array, nativeMax(0, length - n));
        }
        function lastIndexOf(array, value, fromIndex) {
            var index = array ? array.length : 0;
            if (typeof fromIndex == "number") {
                index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
            }
            while (index--) {
                if (array[index] === value) {
                    return index;
                }
            }
            return -1;
        }
        function pull(array) {
            var args = arguments, argsIndex = 0, argsLength = args.length, length = array ? array.length : 0;
            while (++argsIndex < argsLength) {
                var index = -1, value = args[argsIndex];
                while (++index < length) {
                    if (array[index] === value) {
                        splice.call(array, index--, 1);
                        length--;
                    }
                }
            }
            return array;
        }
        function range(start, end, step) {
            start = +start || 0;
            step = typeof step == "number" ? step : +step || 1;
            if (end == null) {
                end = start;
                start = 0;
            }
            var index = -1, length = nativeMax(0, ceil((end - start) / (step || 1))), result = Array(length);
            while (++index < length) {
                result[index] = start;
                start += step;
            }
            return result;
        }
        function remove(array, callback, thisArg) {
            var index = -1, length = array ? array.length : 0, result = [];
            callback = lodash.createCallback(callback, thisArg, 3);
            while (++index < length) {
                var value = array[index];
                if (callback(value, index, array)) {
                    result.push(value);
                    splice.call(array, index--, 1);
                    length--;
                }
            }
            return result;
        }
        function rest(array, callback, thisArg) {
            if (typeof callback != "number" && callback != null) {
                var n = 0, index = -1, length = array ? array.length : 0;
                callback = lodash.createCallback(callback, thisArg, 3);
                while (++index < length && callback(array[index], index, array)) {
                    n++;
                }
            } else {
                n = callback == null || thisArg ? 1 : nativeMax(0, callback);
            }
            return slice(array, n);
        }
        function sortedIndex(array, value, callback, thisArg) {
            var low = 0, high = array ? array.length : low;
            callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
            value = callback(value);
            while (low < high) {
                var mid = low + high >>> 1;
                callback(array[mid]) < value ? low = mid + 1 : high = mid;
            }
            return low;
        }
        function union() {
            return baseUniq(baseFlatten(arguments, true, true));
        }
        function uniq(array, isSorted, callback, thisArg) {
            if (typeof isSorted != "boolean" && isSorted != null) {
                thisArg = callback;
                callback = typeof isSorted != "function" && thisArg && thisArg[isSorted] === array ? null : isSorted;
                isSorted = false;
            }
            if (callback != null) {
                callback = lodash.createCallback(callback, thisArg, 3);
            }
            return baseUniq(array, isSorted, callback);
        }
        function without(array) {
            return baseDifference(array, slice(arguments, 1));
        }
        function xor() {
            var index = -1, length = arguments.length;
            while (++index < length) {
                var array = arguments[index];
                if (isArray(array) || isArguments(array)) {
                    var result = result ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result))) : array;
                }
            }
            return result || [];
        }
        function zip() {
            var array = arguments.length > 1 ? arguments : arguments[0], index = -1, length = array ? max(pluck(array, "length")) : 0, result = Array(length < 0 ? 0 : length);
            while (++index < length) {
                result[index] = pluck(array, index);
            }
            return result;
        }
        function zipObject(keys, values) {
            var index = -1, length = keys ? keys.length : 0, result = {};
            if (!values && length && !isArray(keys[0])) {
                values = [];
            }
            while (++index < length) {
                var key = keys[index];
                if (values) {
                    result[key] = values[index];
                } else if (key) {
                    result[key[0]] = key[1];
                }
            }
            return result;
        }
        function after(n, func) {
            if (!isFunction(func)) {
                throw new TypeError();
            }
            return function() {
                if (--n < 1) {
                    return func.apply(this, arguments);
                }
            };
        }
        function bind(func, thisArg) {
            return arguments.length > 2 ? createWrapper(func, 17, slice(arguments, 2), null, thisArg) : createWrapper(func, 1, null, null, thisArg);
        }
        function bindAll(object) {
            var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object), index = -1, length = funcs.length;
            while (++index < length) {
                var key = funcs[index];
                object[key] = createWrapper(object[key], 1, null, null, object);
            }
            return object;
        }
        function bindKey(object, key) {
            return arguments.length > 2 ? createWrapper(key, 19, slice(arguments, 2), null, object) : createWrapper(key, 3, null, null, object);
        }
        function compose() {
            var funcs = arguments, length = funcs.length;
            while (length--) {
                if (!isFunction(funcs[length])) {
                    throw new TypeError();
                }
            }
            return function() {
                var args = arguments, length = funcs.length;
                while (length--) {
                    args = [ funcs[length].apply(this, args) ];
                }
                return args[0];
            };
        }
        function curry(func, arity) {
            arity = typeof arity == "number" ? arity : +arity || func.length;
            return createWrapper(func, 4, null, null, null, arity);
        }
        function debounce(func, wait, options) {
            var args, maxTimeoutId, result, stamp, thisArg, timeoutId, trailingCall, lastCalled = 0, maxWait = false, trailing = true;
            if (!isFunction(func)) {
                throw new TypeError();
            }
            wait = nativeMax(0, wait) || 0;
            if (options === true) {
                var leading = true;
                trailing = false;
            } else if (isObject(options)) {
                leading = options.leading;
                maxWait = "maxWait" in options && (nativeMax(wait, options.maxWait) || 0);
                trailing = "trailing" in options ? options.trailing : trailing;
            }
            var delayed = function() {
                var remaining = wait - (now() - stamp);
                if (remaining <= 0) {
                    if (maxTimeoutId) {
                        clearTimeout(maxTimeoutId);
                    }
                    var isCalled = trailingCall;
                    maxTimeoutId = timeoutId = trailingCall = undefined;
                    if (isCalled) {
                        lastCalled = now();
                        result = func.apply(thisArg, args);
                        if (!timeoutId && !maxTimeoutId) {
                            args = thisArg = null;
                        }
                    }
                } else {
                    timeoutId = setTimeout(delayed, remaining);
                }
            };
            var maxDelayed = function() {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                maxTimeoutId = timeoutId = trailingCall = undefined;
                if (trailing || maxWait !== wait) {
                    lastCalled = now();
                    result = func.apply(thisArg, args);
                    if (!timeoutId && !maxTimeoutId) {
                        args = thisArg = null;
                    }
                }
            };
            return function() {
                args = arguments;
                stamp = now();
                thisArg = this;
                trailingCall = trailing && (timeoutId || !leading);
                if (maxWait === false) {
                    var leadingCall = leading && !timeoutId;
                } else {
                    if (!maxTimeoutId && !leading) {
                        lastCalled = stamp;
                    }
                    var remaining = maxWait - (stamp - lastCalled), isCalled = remaining <= 0;
                    if (isCalled) {
                        if (maxTimeoutId) {
                            maxTimeoutId = clearTimeout(maxTimeoutId);
                        }
                        lastCalled = stamp;
                        result = func.apply(thisArg, args);
                    } else if (!maxTimeoutId) {
                        maxTimeoutId = setTimeout(maxDelayed, remaining);
                    }
                }
                if (isCalled && timeoutId) {
                    timeoutId = clearTimeout(timeoutId);
                } else if (!timeoutId && wait !== maxWait) {
                    timeoutId = setTimeout(delayed, wait);
                }
                if (leadingCall) {
                    isCalled = true;
                    result = func.apply(thisArg, args);
                }
                if (isCalled && !timeoutId && !maxTimeoutId) {
                    args = thisArg = null;
                }
                return result;
            };
        }
        function defer(func) {
            if (!isFunction(func)) {
                throw new TypeError();
            }
            var args = slice(arguments, 1);
            return setTimeout(function() {
                func.apply(undefined, args);
            }, 1);
        }
        function delay(func, wait) {
            if (!isFunction(func)) {
                throw new TypeError();
            }
            var args = slice(arguments, 2);
            return setTimeout(function() {
                func.apply(undefined, args);
            }, wait);
        }
        function memoize(func, resolver) {
            if (!isFunction(func)) {
                throw new TypeError();
            }
            var memoized = function() {
                var cache = memoized.cache, key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];
                return hasOwnProperty.call(cache, key) ? cache[key] : cache[key] = func.apply(this, arguments);
            };
            memoized.cache = {};
            return memoized;
        }
        function once(func) {
            var ran, result;
            if (!isFunction(func)) {
                throw new TypeError();
            }
            return function() {
                if (ran) {
                    return result;
                }
                ran = true;
                result = func.apply(this, arguments);
                func = null;
                return result;
            };
        }
        function partial(func) {
            return createWrapper(func, 16, slice(arguments, 1));
        }
        function partialRight(func) {
            return createWrapper(func, 32, null, slice(arguments, 1));
        }
        function throttle(func, wait, options) {
            var leading = true, trailing = true;
            if (!isFunction(func)) {
                throw new TypeError();
            }
            if (options === false) {
                leading = false;
            } else if (isObject(options)) {
                leading = "leading" in options ? options.leading : leading;
                trailing = "trailing" in options ? options.trailing : trailing;
            }
            debounceOptions.leading = leading;
            debounceOptions.maxWait = wait;
            debounceOptions.trailing = trailing;
            return debounce(func, wait, debounceOptions);
        }
        function wrap(value, wrapper) {
            return createWrapper(wrapper, 16, [ value ]);
        }
        function constant(value) {
            return function() {
                return value;
            };
        }
        function createCallback(func, thisArg, argCount) {
            var type = typeof func;
            if (func == null || type == "function") {
                return baseCreateCallback(func, thisArg, argCount);
            }
            if (type != "object") {
                return property(func);
            }
            var props = keys(func), key = props[0], a = func[key];
            if (props.length == 1 && a === a && !isObject(a)) {
                return function(object) {
                    var b = object[key];
                    return a === b && (a !== 0 || 1 / a == 1 / b);
                };
            }
            return function(object) {
                var length = props.length, result = false;
                while (length--) {
                    if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
                        break;
                    }
                }
                return result;
            };
        }
        function escape(string) {
            return string == null ? "" : String(string).replace(reUnescapedHtml, escapeHtmlChar);
        }
        function identity(value) {
            return value;
        }
        function mixin(object, source, options) {
            var chain = true, methodNames = source && functions(source);
            if (!source || !options && !methodNames.length) {
                if (options == null) {
                    options = source;
                }
                ctor = lodashWrapper;
                source = object;
                object = lodash;
                methodNames = functions(source);
            }
            if (options === false) {
                chain = false;
            } else if (isObject(options) && "chain" in options) {
                chain = options.chain;
            }
            var ctor = object, isFunc = isFunction(ctor);
            forEach(methodNames, function(methodName) {
                var func = object[methodName] = source[methodName];
                if (isFunc) {
                    ctor.prototype[methodName] = function() {
                        var chainAll = this.__chain__, value = this.__wrapped__, args = [ value ];
                        push.apply(args, arguments);
                        var result = func.apply(object, args);
                        if (chain || chainAll) {
                            if (value === result && isObject(result)) {
                                return this;
                            }
                            result = new ctor(result);
                            result.__chain__ = chainAll;
                        }
                        return result;
                    };
                }
            });
        }
        function noConflict() {
            context._ = oldDash;
            return this;
        }
        function noop() {}
        var now = isNative(now = Date.now) && now || function() {
            return new Date().getTime();
        };
        var parseInt = nativeParseInt(whitespace + "08") == 8 ? nativeParseInt : function(value, radix) {
            return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, "") : value, radix || 0);
        };
        function property(key) {
            return function(object) {
                return object[key];
            };
        }
        function random(min, max, floating) {
            var noMin = min == null, noMax = max == null;
            if (floating == null) {
                if (typeof min == "boolean" && noMax) {
                    floating = min;
                    min = 1;
                } else if (!noMax && typeof max == "boolean") {
                    floating = max;
                    noMax = true;
                }
            }
            if (noMin && noMax) {
                max = 1;
            }
            min = +min || 0;
            if (noMax) {
                max = min;
                min = 0;
            } else {
                max = +max || 0;
            }
            if (floating || min % 1 || max % 1) {
                var rand = nativeRandom();
                return nativeMin(min + rand * (max - min + parseFloat("1e-" + ((rand + "").length - 1))), max);
            }
            return baseRandom(min, max);
        }
        function result(object, key) {
            if (object) {
                var value = object[key];
                return isFunction(value) ? object[key]() : value;
            }
        }
        function template(text, data, options) {
            var settings = lodash.templateSettings;
            text = String(text || "");
            options = defaults({}, options, settings);
            var imports = defaults({}, options.imports, settings.imports), importsKeys = keys(imports), importsValues = values(imports);
            var isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
            var reDelimiters = RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");
            text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
                interpolateValue || (interpolateValue = esTemplateValue);
                source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);
                if (escapeValue) {
                    source += "' +\n__e(" + escapeValue + ") +\n'";
                }
                if (evaluateValue) {
                    isEvaluating = true;
                    source += "';\n" + evaluateValue + ";\n__p += '";
                }
                if (interpolateValue) {
                    source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
                }
                index = offset + match.length;
                return match;
            });
            source += "';\n";
            var variable = options.variable, hasVariable = variable;
            if (!hasVariable) {
                variable = "obj";
                source = "with (" + variable + ") {\n" + source + "\n}\n";
            }
            source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
            source = "function(" + variable + ") {\n" + (hasVariable ? "" : variable + " || (" + variable + " = {});\n") + "var __t, __p = '', __e = _.escape" + (isEvaluating ? ", __j = Array.prototype.join;\n" + "function print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
            var sourceURL = "\n/*\n//# sourceURL=" + (options.sourceURL || "/lodash/template/source[" + templateCounter++ + "]") + "\n*/";
            try {
                var result = Function(importsKeys, "return " + source + sourceURL).apply(undefined, importsValues);
            } catch (e) {
                e.source = source;
                throw e;
            }
            if (data) {
                return result(data);
            }
            result.source = source;
            return result;
        }
        function times(n, callback, thisArg) {
            n = (n = +n) > -1 ? n : 0;
            var index = -1, result = Array(n);
            callback = baseCreateCallback(callback, thisArg, 1);
            while (++index < n) {
                result[index] = callback(index);
            }
            return result;
        }
        function unescape(string) {
            return string == null ? "" : String(string).replace(reEscapedHtml, unescapeHtmlChar);
        }
        function uniqueId(prefix) {
            var id = ++idCounter;
            return String(prefix == null ? "" : prefix) + id;
        }
        function chain(value) {
            value = new lodashWrapper(value);
            value.__chain__ = true;
            return value;
        }
        function tap(value, interceptor) {
            interceptor(value);
            return value;
        }
        function wrapperChain() {
            this.__chain__ = true;
            return this;
        }
        function wrapperToString() {
            return String(this.__wrapped__);
        }
        function wrapperValueOf() {
            return this.__wrapped__;
        }
        lodash.after = after;
        lodash.assign = assign;
        lodash.at = at;
        lodash.bind = bind;
        lodash.bindAll = bindAll;
        lodash.bindKey = bindKey;
        lodash.chain = chain;
        lodash.compact = compact;
        lodash.compose = compose;
        lodash.constant = constant;
        lodash.countBy = countBy;
        lodash.create = create;
        lodash.createCallback = createCallback;
        lodash.curry = curry;
        lodash.debounce = debounce;
        lodash.defaults = defaults;
        lodash.defer = defer;
        lodash.delay = delay;
        lodash.difference = difference;
        lodash.filter = filter;
        lodash.flatten = flatten;
        lodash.forEach = forEach;
        lodash.forEachRight = forEachRight;
        lodash.forIn = forIn;
        lodash.forInRight = forInRight;
        lodash.forOwn = forOwn;
        lodash.forOwnRight = forOwnRight;
        lodash.functions = functions;
        lodash.groupBy = groupBy;
        lodash.indexBy = indexBy;
        lodash.initial = initial;
        lodash.intersection = intersection;
        lodash.invert = invert;
        lodash.invoke = invoke;
        lodash.keys = keys;
        lodash.map = map;
        lodash.mapValues = mapValues;
        lodash.max = max;
        lodash.memoize = memoize;
        lodash.merge = merge;
        lodash.min = min;
        lodash.omit = omit;
        lodash.once = once;
        lodash.pairs = pairs;
        lodash.partial = partial;
        lodash.partialRight = partialRight;
        lodash.pick = pick;
        lodash.pluck = pluck;
        lodash.property = property;
        lodash.pull = pull;
        lodash.range = range;
        lodash.reject = reject;
        lodash.remove = remove;
        lodash.rest = rest;
        lodash.shuffle = shuffle;
        lodash.sortBy = sortBy;
        lodash.tap = tap;
        lodash.throttle = throttle;
        lodash.times = times;
        lodash.toArray = toArray;
        lodash.transform = transform;
        lodash.union = union;
        lodash.uniq = uniq;
        lodash.values = values;
        lodash.where = where;
        lodash.without = without;
        lodash.wrap = wrap;
        lodash.xor = xor;
        lodash.zip = zip;
        lodash.zipObject = zipObject;
        lodash.collect = map;
        lodash.drop = rest;
        lodash.each = forEach;
        lodash.eachRight = forEachRight;
        lodash.extend = assign;
        lodash.methods = functions;
        lodash.object = zipObject;
        lodash.select = filter;
        lodash.tail = rest;
        lodash.unique = uniq;
        lodash.unzip = zip;
        mixin(lodash);
        lodash.clone = clone;
        lodash.cloneDeep = cloneDeep;
        lodash.contains = contains;
        lodash.escape = escape;
        lodash.every = every;
        lodash.find = find;
        lodash.findIndex = findIndex;
        lodash.findKey = findKey;
        lodash.findLast = findLast;
        lodash.findLastIndex = findLastIndex;
        lodash.findLastKey = findLastKey;
        lodash.has = has;
        lodash.identity = identity;
        lodash.indexOf = indexOf;
        lodash.isArguments = isArguments;
        lodash.isArray = isArray;
        lodash.isBoolean = isBoolean;
        lodash.isDate = isDate;
        lodash.isElement = isElement;
        lodash.isEmpty = isEmpty;
        lodash.isEqual = isEqual;
        lodash.isFinite = isFinite;
        lodash.isFunction = isFunction;
        lodash.isNaN = isNaN;
        lodash.isNull = isNull;
        lodash.isNumber = isNumber;
        lodash.isObject = isObject;
        lodash.isPlainObject = isPlainObject;
        lodash.isRegExp = isRegExp;
        lodash.isString = isString;
        lodash.isUndefined = isUndefined;
        lodash.lastIndexOf = lastIndexOf;
        lodash.mixin = mixin;
        lodash.noConflict = noConflict;
        lodash.noop = noop;
        lodash.now = now;
        lodash.parseInt = parseInt;
        lodash.random = random;
        lodash.reduce = reduce;
        lodash.reduceRight = reduceRight;
        lodash.result = result;
        lodash.runInContext = runInContext;
        lodash.size = size;
        lodash.some = some;
        lodash.sortedIndex = sortedIndex;
        lodash.template = template;
        lodash.unescape = unescape;
        lodash.uniqueId = uniqueId;
        lodash.all = every;
        lodash.any = some;
        lodash.detect = find;
        lodash.findWhere = find;
        lodash.foldl = reduce;
        lodash.foldr = reduceRight;
        lodash.include = contains;
        lodash.inject = reduce;
        mixin(function() {
            var source = {};
            forOwn(lodash, function(func, methodName) {
                if (!lodash.prototype[methodName]) {
                    source[methodName] = func;
                }
            });
            return source;
        }(), false);
        lodash.first = first;
        lodash.last = last;
        lodash.sample = sample;
        lodash.take = first;
        lodash.head = first;
        forOwn(lodash, function(func, methodName) {
            var callbackable = methodName !== "sample";
            if (!lodash.prototype[methodName]) {
                lodash.prototype[methodName] = function(n, guard) {
                    var chainAll = this.__chain__, result = func(this.__wrapped__, n, guard);
                    return !chainAll && (n == null || guard && !(callbackable && typeof n == "function")) ? result : new lodashWrapper(result, chainAll);
                };
            }
        });
        lodash.VERSION = "2.4.1";
        lodash.prototype.chain = wrapperChain;
        lodash.prototype.toString = wrapperToString;
        lodash.prototype.value = wrapperValueOf;
        lodash.prototype.valueOf = wrapperValueOf;
        forEach([ "join", "pop", "shift" ], function(methodName) {
            var func = arrayRef[methodName];
            lodash.prototype[methodName] = function() {
                var chainAll = this.__chain__, result = func.apply(this.__wrapped__, arguments);
                return chainAll ? new lodashWrapper(result, chainAll) : result;
            };
        });
        forEach([ "push", "reverse", "sort", "unshift" ], function(methodName) {
            var func = arrayRef[methodName];
            lodash.prototype[methodName] = function() {
                func.apply(this.__wrapped__, arguments);
                return this;
            };
        });
        forEach([ "concat", "slice", "splice" ], function(methodName) {
            var func = arrayRef[methodName];
            lodash.prototype[methodName] = function() {
                return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
            };
        });
        return lodash;
    }
    var _ = runInContext();
    if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        root._ = _;
        define(function() {
            return _;
        });
    } else if (freeExports && freeModule) {
        if (moduleExports) {
            (freeModule.exports = _)._ = _;
        } else {
            freeExports._ = _;
        }
    } else {
        root._ = _;
    }
}).call(this);

(function(global) {
    "use strict";
    if (global.$traceurRuntime) {
        return;
    }
    var $Object = Object;
    var $TypeError = TypeError;
    var $create = $Object.create;
    var $defineProperties = $Object.defineProperties;
    var $defineProperty = $Object.defineProperty;
    var $freeze = $Object.freeze;
    var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
    var $getOwnPropertyNames = $Object.getOwnPropertyNames;
    var $keys = $Object.keys;
    var $hasOwnProperty = $Object.prototype.hasOwnProperty;
    var $toString = $Object.prototype.toString;
    var $preventExtensions = Object.preventExtensions;
    var $seal = Object.seal;
    var $isExtensible = Object.isExtensible;
    function nonEnum(value) {
        return {
            configurable: true,
            enumerable: false,
            value: value,
            writable: true
        };
    }
    var method = nonEnum;
    var counter = 0;
    function newUniqueString() {
        return "__$" + Math.floor(Math.random() * 1e9) + "$" + ++counter + "$__";
    }
    var symbolInternalProperty = newUniqueString();
    var symbolDescriptionProperty = newUniqueString();
    var symbolDataProperty = newUniqueString();
    var symbolValues = $create(null);
    var privateNames = $create(null);
    function isPrivateName(s) {
        return privateNames[s];
    }
    function createPrivateName() {
        var s = newUniqueString();
        privateNames[s] = true;
        return s;
    }
    function isShimSymbol(symbol) {
        return typeof symbol === "object" && symbol instanceof SymbolValue;
    }
    function typeOf(v) {
        if (isShimSymbol(v)) return "symbol";
        return typeof v;
    }
    function Symbol(description) {
        var value = new SymbolValue(description);
        if (!(this instanceof Symbol)) return value;
        throw new TypeError("Symbol cannot be new'ed");
    }
    $defineProperty(Symbol.prototype, "constructor", nonEnum(Symbol));
    $defineProperty(Symbol.prototype, "toString", method(function() {
        var symbolValue = this[symbolDataProperty];
        if (!getOption("symbols")) return symbolValue[symbolInternalProperty];
        if (!symbolValue) throw TypeError("Conversion from symbol to string");
        var desc = symbolValue[symbolDescriptionProperty];
        if (desc === undefined) desc = "";
        return "Symbol(" + desc + ")";
    }));
    $defineProperty(Symbol.prototype, "valueOf", method(function() {
        var symbolValue = this[symbolDataProperty];
        if (!symbolValue) throw TypeError("Conversion from symbol to string");
        if (!getOption("symbols")) return symbolValue[symbolInternalProperty];
        return symbolValue;
    }));
    function SymbolValue(description) {
        var key = newUniqueString();
        $defineProperty(this, symbolDataProperty, {
            value: this
        });
        $defineProperty(this, symbolInternalProperty, {
            value: key
        });
        $defineProperty(this, symbolDescriptionProperty, {
            value: description
        });
        freeze(this);
        symbolValues[key] = this;
    }
    $defineProperty(SymbolValue.prototype, "constructor", nonEnum(Symbol));
    $defineProperty(SymbolValue.prototype, "toString", {
        value: Symbol.prototype.toString,
        enumerable: false
    });
    $defineProperty(SymbolValue.prototype, "valueOf", {
        value: Symbol.prototype.valueOf,
        enumerable: false
    });
    var hashProperty = createPrivateName();
    var hashPropertyDescriptor = {
        value: undefined
    };
    var hashObjectProperties = {
        hash: {
            value: undefined
        },
        self: {
            value: undefined
        }
    };
    var hashCounter = 0;
    function getOwnHashObject(object) {
        var hashObject = object[hashProperty];
        if (hashObject && hashObject.self === object) return hashObject;
        if ($isExtensible(object)) {
            hashObjectProperties.hash.value = hashCounter++;
            hashObjectProperties.self.value = object;
            hashPropertyDescriptor.value = $create(null, hashObjectProperties);
            $defineProperty(object, hashProperty, hashPropertyDescriptor);
            return hashPropertyDescriptor.value;
        }
        return undefined;
    }
    function freeze(object) {
        getOwnHashObject(object);
        return $freeze.apply(this, arguments);
    }
    function preventExtensions(object) {
        getOwnHashObject(object);
        return $preventExtensions.apply(this, arguments);
    }
    function seal(object) {
        getOwnHashObject(object);
        return $seal.apply(this, arguments);
    }
    freeze(SymbolValue.prototype);
    function isSymbolString(s) {
        return symbolValues[s] || privateNames[s];
    }
    function toProperty(name) {
        if (isShimSymbol(name)) return name[symbolInternalProperty];
        return name;
    }
    function removeSymbolKeys(array) {
        var rv = [];
        for (var i = 0; i < array.length; i++) {
            if (!isSymbolString(array[i])) {
                rv.push(array[i]);
            }
        }
        return rv;
    }
    function getOwnPropertyNames(object) {
        return removeSymbolKeys($getOwnPropertyNames(object));
    }
    function keys(object) {
        return removeSymbolKeys($keys(object));
    }
    function getOwnPropertySymbols(object) {
        var rv = [];
        var names = $getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
            var symbol = symbolValues[names[i]];
            if (symbol) {
                rv.push(symbol);
            }
        }
        return rv;
    }
    function getOwnPropertyDescriptor(object, name) {
        return $getOwnPropertyDescriptor(object, toProperty(name));
    }
    function hasOwnProperty(name) {
        return $hasOwnProperty.call(this, toProperty(name));
    }
    function getOption(name) {
        return global.traceur && global.traceur.options[name];
    }
    function defineProperty(object, name, descriptor) {
        if (isShimSymbol(name)) {
            name = name[symbolInternalProperty];
        }
        $defineProperty(object, name, descriptor);
        return object;
    }
    function polyfillObject(Object) {
        $defineProperty(Object, "defineProperty", {
            value: defineProperty
        });
        $defineProperty(Object, "getOwnPropertyNames", {
            value: getOwnPropertyNames
        });
        $defineProperty(Object, "getOwnPropertyDescriptor", {
            value: getOwnPropertyDescriptor
        });
        $defineProperty(Object.prototype, "hasOwnProperty", {
            value: hasOwnProperty
        });
        $defineProperty(Object, "freeze", {
            value: freeze
        });
        $defineProperty(Object, "preventExtensions", {
            value: preventExtensions
        });
        $defineProperty(Object, "seal", {
            value: seal
        });
        $defineProperty(Object, "keys", {
            value: keys
        });
    }
    function exportStar(object) {
        for (var i = 1; i < arguments.length; i++) {
            var names = $getOwnPropertyNames(arguments[i]);
            for (var j = 0; j < names.length; j++) {
                var name = names[j];
                if (isSymbolString(name)) continue;
                (function(mod, name) {
                    $defineProperty(object, name, {
                        get: function() {
                            return mod[name];
                        },
                        enumerable: true
                    });
                })(arguments[i], names[j]);
            }
        }
        return object;
    }
    function isObject(x) {
        return x != null && (typeof x === "object" || typeof x === "function");
    }
    function toObject(x) {
        if (x == null) throw $TypeError();
        return $Object(x);
    }
    function checkObjectCoercible(argument) {
        if (argument == null) {
            throw new TypeError("Value cannot be converted to an Object");
        }
        return argument;
    }
    function polyfillSymbol(global, Symbol) {
        if (!global.Symbol) {
            global.Symbol = Symbol;
            Object.getOwnPropertySymbols = getOwnPropertySymbols;
        }
        if (!global.Symbol.iterator) {
            global.Symbol.iterator = Symbol("Symbol.iterator");
        }
    }
    function setupGlobals(global) {
        polyfillSymbol(global, Symbol);
        global.Reflect = global.Reflect || {};
        global.Reflect.global = global.Reflect.global || global;
        polyfillObject(global.Object);
    }
    setupGlobals(global);
    global.$traceurRuntime = {
        checkObjectCoercible: checkObjectCoercible,
        createPrivateName: createPrivateName,
        defineProperties: $defineProperties,
        defineProperty: $defineProperty,
        exportStar: exportStar,
        getOwnHashObject: getOwnHashObject,
        getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
        getOwnPropertyNames: $getOwnPropertyNames,
        isObject: isObject,
        isPrivateName: isPrivateName,
        isSymbolString: isSymbolString,
        keys: $keys,
        setupGlobals: setupGlobals,
        toObject: toObject,
        toProperty: toProperty,
        "typeof": typeOf
    };
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : this);

(function() {
    "use strict";
    var path;
    function relativeRequire(callerPath, requiredPath) {
        path = path || typeof require !== "undefined" && require("path");
        function isDirectory(path) {
            return path.slice(-1) === "/";
        }
        function isAbsolute(path) {
            return path[0] === "/";
        }
        function isRelative(path) {
            return path[0] === ".";
        }
        if (isDirectory(requiredPath) || isAbsolute(requiredPath)) return;
        return isRelative(requiredPath) ? require(path.resolve(path.dirname(callerPath), requiredPath)) : require(requiredPath);
    }
    $traceurRuntime.require = relativeRequire;
})();

(function() {
    "use strict";
    function spread() {
        var rv = [], j = 0, iterResult;
        for (var i = 0; i < arguments.length; i++) {
            var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
            if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== "function") {
                throw new TypeError("Cannot spread non-iterable object.");
            }
            var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
            while (!(iterResult = iter.next()).done) {
                rv[j++] = iterResult.value;
            }
        }
        return rv;
    }
    $traceurRuntime.spread = spread;
})();

(function() {
    "use strict";
    function iteratorToArray(iter) {
        var rv = [];
        var i = 0;
        var tmp;
        while (!(tmp = iter.next()).done) {
            rv[i++] = tmp.value;
        }
        return rv;
    }
    $traceurRuntime.iteratorToArray = iteratorToArray;
})();

(function() {
    "use strict";
    var $Object = Object;
    var $TypeError = TypeError;
    var $create = $Object.create;
    var $defineProperties = $traceurRuntime.defineProperties;
    var $defineProperty = $traceurRuntime.defineProperty;
    var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
    var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
    var $getPrototypeOf = Object.getPrototypeOf;
    var $__0 = Object, getOwnPropertyNames = $__0.getOwnPropertyNames, getOwnPropertySymbols = $__0.getOwnPropertySymbols;
    function superDescriptor(homeObject, name) {
        var proto = $getPrototypeOf(homeObject);
        do {
            var result = $getOwnPropertyDescriptor(proto, name);
            if (result) return result;
            proto = $getPrototypeOf(proto);
        } while (proto);
        return undefined;
    }
    function superConstructor(ctor) {
        return ctor.__proto__;
    }
    function superCall(self, homeObject, name, args) {
        return superGet(self, homeObject, name).apply(self, args);
    }
    function superGet(self, homeObject, name) {
        var descriptor = superDescriptor(homeObject, name);
        if (descriptor) {
            if (!descriptor.get) return descriptor.value;
            return descriptor.get.call(self);
        }
        return undefined;
    }
    function superSet(self, homeObject, name, value) {
        var descriptor = superDescriptor(homeObject, name);
        if (descriptor && descriptor.set) {
            descriptor.set.call(self, value);
            return value;
        }
        throw $TypeError("super has no setter '" + name + "'.");
    }
    function getDescriptors(object) {
        var descriptors = {};
        var names = getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            descriptors[name] = $getOwnPropertyDescriptor(object, name);
        }
        var symbols = getOwnPropertySymbols(object);
        for (var i = 0; i < symbols.length; i++) {
            var symbol = symbols[i];
            descriptors[$traceurRuntime.toProperty(symbol)] = $getOwnPropertyDescriptor(object, $traceurRuntime.toProperty(symbol));
        }
        return descriptors;
    }
    function createClass(ctor, object, staticObject, superClass) {
        $defineProperty(object, "constructor", {
            value: ctor,
            configurable: true,
            enumerable: false,
            writable: true
        });
        if (arguments.length > 3) {
            if (typeof superClass === "function") ctor.__proto__ = superClass;
            ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
        } else {
            ctor.prototype = object;
        }
        $defineProperty(ctor, "prototype", {
            configurable: false,
            writable: false
        });
        return $defineProperties(ctor, getDescriptors(staticObject));
    }
    function getProtoParent(superClass) {
        if (typeof superClass === "function") {
            var prototype = superClass.prototype;
            if ($Object(prototype) === prototype || prototype === null) return superClass.prototype;
            throw new $TypeError("super prototype must be an Object or null");
        }
        if (superClass === null) return null;
        throw new $TypeError("Super expression must either be null or a function, not " + typeof superClass + ".");
    }
    function defaultSuperCall(self, homeObject, args) {
        if ($getPrototypeOf(homeObject) !== null) superCall(self, homeObject, "constructor", args);
    }
    $traceurRuntime.createClass = createClass;
    $traceurRuntime.defaultSuperCall = defaultSuperCall;
    $traceurRuntime.superCall = superCall;
    $traceurRuntime.superConstructor = superConstructor;
    $traceurRuntime.superGet = superGet;
    $traceurRuntime.superSet = superSet;
})();

(function() {
    "use strict";
    if (typeof $traceurRuntime !== "object") {
        throw new Error("traceur runtime not found.");
    }
    var createPrivateName = $traceurRuntime.createPrivateName;
    var $defineProperties = $traceurRuntime.defineProperties;
    var $defineProperty = $traceurRuntime.defineProperty;
    var $create = Object.create;
    var $TypeError = TypeError;
    function nonEnum(value) {
        return {
            configurable: true,
            enumerable: false,
            value: value,
            writable: true
        };
    }
    var ST_NEWBORN = 0;
    var ST_EXECUTING = 1;
    var ST_SUSPENDED = 2;
    var ST_CLOSED = 3;
    var END_STATE = -2;
    var RETHROW_STATE = -3;
    function getInternalError(state) {
        return new Error("Traceur compiler bug: invalid state in state machine: " + state);
    }
    function GeneratorContext() {
        this.state = 0;
        this.GState = ST_NEWBORN;
        this.storedException = undefined;
        this.finallyFallThrough = undefined;
        this.sent_ = undefined;
        this.returnValue = undefined;
        this.tryStack_ = [];
    }
    GeneratorContext.prototype = {
        pushTry: function(catchState, finallyState) {
            if (finallyState !== null) {
                var finallyFallThrough = null;
                for (var i = this.tryStack_.length - 1; i >= 0; i--) {
                    if (this.tryStack_[i].catch !== undefined) {
                        finallyFallThrough = this.tryStack_[i].catch;
                        break;
                    }
                }
                if (finallyFallThrough === null) finallyFallThrough = RETHROW_STATE;
                this.tryStack_.push({
                    "finally": finallyState,
                    finallyFallThrough: finallyFallThrough
                });
            }
            if (catchState !== null) {
                this.tryStack_.push({
                    "catch": catchState
                });
            }
        },
        popTry: function() {
            this.tryStack_.pop();
        },
        get sent() {
            this.maybeThrow();
            return this.sent_;
        },
        set sent(v) {
            this.sent_ = v;
        },
        get sentIgnoreThrow() {
            return this.sent_;
        },
        maybeThrow: function() {
            if (this.action === "throw") {
                this.action = "next";
                throw this.sent_;
            }
        },
        end: function() {
            switch (this.state) {
              case END_STATE:
                return this;

              case RETHROW_STATE:
                throw this.storedException;

              default:
                throw getInternalError(this.state);
            }
        },
        handleException: function(ex) {
            this.GState = ST_CLOSED;
            this.state = END_STATE;
            throw ex;
        }
    };
    function nextOrThrow(ctx, moveNext, action, x) {
        switch (ctx.GState) {
          case ST_EXECUTING:
            throw new Error('"' + action + '" on executing generator');

          case ST_CLOSED:
            if (action == "next") {
                return {
                    value: undefined,
                    done: true
                };
            }
            throw x;

          case ST_NEWBORN:
            if (action === "throw") {
                ctx.GState = ST_CLOSED;
                throw x;
            }
            if (x !== undefined) throw $TypeError("Sent value to newborn generator");

          case ST_SUSPENDED:
            ctx.GState = ST_EXECUTING;
            ctx.action = action;
            ctx.sent = x;
            var value = moveNext(ctx);
            var done = value === ctx;
            if (done) value = ctx.returnValue;
            ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
            return {
                value: value,
                done: done
            };
        }
    }
    var ctxName = createPrivateName();
    var moveNextName = createPrivateName();
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    GeneratorFunction.prototype = GeneratorFunctionPrototype;
    $defineProperty(GeneratorFunctionPrototype, "constructor", nonEnum(GeneratorFunction));
    GeneratorFunctionPrototype.prototype = {
        constructor: GeneratorFunctionPrototype,
        next: function(v) {
            return nextOrThrow(this[ctxName], this[moveNextName], "next", v);
        },
        "throw": function(v) {
            return nextOrThrow(this[ctxName], this[moveNextName], "throw", v);
        }
    };
    $defineProperties(GeneratorFunctionPrototype.prototype, {
        constructor: {
            enumerable: false
        },
        next: {
            enumerable: false
        },
        "throw": {
            enumerable: false
        }
    });
    Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
        return this;
    }));
    function createGeneratorInstance(innerFunction, functionObject, self) {
        var moveNext = getMoveNext(innerFunction, self);
        var ctx = new GeneratorContext();
        var object = $create(functionObject.prototype);
        object[ctxName] = ctx;
        object[moveNextName] = moveNext;
        return object;
    }
    function initGeneratorFunction(functionObject) {
        functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
        functionObject.__proto__ = GeneratorFunctionPrototype;
        return functionObject;
    }
    function AsyncFunctionContext() {
        GeneratorContext.call(this);
        this.err = undefined;
        var ctx = this;
        ctx.result = new Promise(function(resolve, reject) {
            ctx.resolve = resolve;
            ctx.reject = reject;
        });
    }
    AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
    AsyncFunctionContext.prototype.end = function() {
        switch (this.state) {
          case END_STATE:
            this.resolve(this.returnValue);
            break;

          case RETHROW_STATE:
            this.reject(this.storedException);
            break;

          default:
            this.reject(getInternalError(this.state));
        }
    };
    AsyncFunctionContext.prototype.handleException = function() {
        this.state = RETHROW_STATE;
    };
    function asyncWrap(innerFunction, self) {
        var moveNext = getMoveNext(innerFunction, self);
        var ctx = new AsyncFunctionContext();
        ctx.createCallback = function(newState) {
            return function(value) {
                ctx.state = newState;
                ctx.value = value;
                moveNext(ctx);
            };
        };
        ctx.errback = function(err) {
            handleCatch(ctx, err);
            moveNext(ctx);
        };
        moveNext(ctx);
        return ctx.result;
    }
    function getMoveNext(innerFunction, self) {
        return function(ctx) {
            while (true) {
                try {
                    return innerFunction.call(self, ctx);
                } catch (ex) {
                    handleCatch(ctx, ex);
                }
            }
        };
    }
    function handleCatch(ctx, ex) {
        ctx.storedException = ex;
        var last = ctx.tryStack_[ctx.tryStack_.length - 1];
        if (!last) {
            ctx.handleException(ex);
            return;
        }
        ctx.state = last.catch !== undefined ? last.catch : last.finally;
        if (last.finallyFallThrough !== undefined) ctx.finallyFallThrough = last.finallyFallThrough;
    }
    $traceurRuntime.asyncWrap = asyncWrap;
    $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
    $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
})();

(function() {
    function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
        var out = [];
        if (opt_scheme) {
            out.push(opt_scheme, ":");
        }
        if (opt_domain) {
            out.push("//");
            if (opt_userInfo) {
                out.push(opt_userInfo, "@");
            }
            out.push(opt_domain);
            if (opt_port) {
                out.push(":", opt_port);
            }
        }
        if (opt_path) {
            out.push(opt_path);
        }
        if (opt_queryData) {
            out.push("?", opt_queryData);
        }
        if (opt_fragment) {
            out.push("#", opt_fragment);
        }
        return out.join("");
    }
    var splitRe = new RegExp("^" + "(?:" + "([^:/?#.]+)" + ":)?" + "(?://" + "(?:([^/?#]*)@)?" + "([\\w\\d\\-\\u0100-\\uffff.%]*)" + "(?::([0-9]+))?" + ")?" + "([^?#]+)?" + "(?:\\?([^#]*))?" + "(?:#(.*))?" + "$");
    var ComponentIndex = {
        SCHEME: 1,
        USER_INFO: 2,
        DOMAIN: 3,
        PORT: 4,
        PATH: 5,
        QUERY_DATA: 6,
        FRAGMENT: 7
    };
    function split(uri) {
        return uri.match(splitRe);
    }
    function removeDotSegments(path) {
        if (path === "/") return "/";
        var leadingSlash = path[0] === "/" ? "/" : "";
        var trailingSlash = path.slice(-1) === "/" ? "/" : "";
        var segments = path.split("/");
        var out = [];
        var up = 0;
        for (var pos = 0; pos < segments.length; pos++) {
            var segment = segments[pos];
            switch (segment) {
              case "":
              case ".":
                break;

              case "..":
                if (out.length) out.pop(); else up++;
                break;

              default:
                out.push(segment);
            }
        }
        if (!leadingSlash) {
            while (up-- > 0) {
                out.unshift("..");
            }
            if (out.length === 0) out.push(".");
        }
        return leadingSlash + out.join("/") + trailingSlash;
    }
    function joinAndCanonicalizePath(parts) {
        var path = parts[ComponentIndex.PATH] || "";
        path = removeDotSegments(path);
        parts[ComponentIndex.PATH] = path;
        return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
    }
    function canonicalizeUrl(url) {
        var parts = split(url);
        return joinAndCanonicalizePath(parts);
    }
    function resolveUrl(base, url) {
        var parts = split(url);
        var baseParts = split(base);
        if (parts[ComponentIndex.SCHEME]) {
            return joinAndCanonicalizePath(parts);
        } else {
            parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
        }
        for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
            if (!parts[i]) {
                parts[i] = baseParts[i];
            }
        }
        if (parts[ComponentIndex.PATH][0] == "/") {
            return joinAndCanonicalizePath(parts);
        }
        var path = baseParts[ComponentIndex.PATH];
        var index = path.lastIndexOf("/");
        path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
        parts[ComponentIndex.PATH] = path;
        return joinAndCanonicalizePath(parts);
    }
    function isAbsolute(name) {
        if (!name) return false;
        if (name[0] === "/") return true;
        var parts = split(name);
        if (parts[ComponentIndex.SCHEME]) return true;
        return false;
    }
    $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
    $traceurRuntime.isAbsolute = isAbsolute;
    $traceurRuntime.removeDotSegments = removeDotSegments;
    $traceurRuntime.resolveUrl = resolveUrl;
})();

(function() {
    "use strict";
    var types = {
        any: {
            name: "any"
        },
        "boolean": {
            name: "boolean"
        },
        number: {
            name: "number"
        },
        string: {
            name: "string"
        },
        symbol: {
            name: "symbol"
        },
        "void": {
            name: "void"
        }
    };
    var GenericType = function GenericType(type, argumentTypes) {
        this.type = type;
        this.argumentTypes = argumentTypes;
    };
    $traceurRuntime.createClass(GenericType, {}, {});
    var typeRegister = Object.create(null);
    function genericType(type) {
        for (var argumentTypes = [], $__1 = 1; $__1 < arguments.length; $__1++) argumentTypes[$__1 - 1] = arguments[$__1];
        var typeMap = typeRegister;
        var key = $traceurRuntime.getOwnHashObject(type).hash;
        if (!typeMap[key]) {
            typeMap[key] = Object.create(null);
        }
        typeMap = typeMap[key];
        for (var i = 0; i < argumentTypes.length - 1; i++) {
            key = $traceurRuntime.getOwnHashObject(argumentTypes[i]).hash;
            if (!typeMap[key]) {
                typeMap[key] = Object.create(null);
            }
            typeMap = typeMap[key];
        }
        var tail = argumentTypes[argumentTypes.length - 1];
        key = $traceurRuntime.getOwnHashObject(tail).hash;
        if (!typeMap[key]) {
            typeMap[key] = new GenericType(type, argumentTypes);
        }
        return typeMap[key];
    }
    $traceurRuntime.GenericType = GenericType;
    $traceurRuntime.genericType = genericType;
    $traceurRuntime.type = types;
})();

(function(global) {
    "use strict";
    var $__2 = $traceurRuntime, canonicalizeUrl = $__2.canonicalizeUrl, resolveUrl = $__2.resolveUrl, isAbsolute = $__2.isAbsolute;
    var moduleInstantiators = Object.create(null);
    var baseURL;
    if (global.location && global.location.href) baseURL = resolveUrl(global.location.href, "./"); else baseURL = "";
    var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
        this.url = url;
        this.value_ = uncoatedModule;
    };
    $traceurRuntime.createClass(UncoatedModuleEntry, {}, {});
    var ModuleEvaluationError = function ModuleEvaluationError(erroneousModuleName, cause) {
        this.message = this.constructor.name + ": " + this.stripCause(cause) + " in " + erroneousModuleName;
        if (!(cause instanceof $ModuleEvaluationError) && cause.stack) this.stack = this.stripStack(cause.stack); else this.stack = "";
    };
    var $ModuleEvaluationError = ModuleEvaluationError;
    $traceurRuntime.createClass(ModuleEvaluationError, {
        stripError: function(message) {
            return message.replace(/.*Error:/, this.constructor.name + ":");
        },
        stripCause: function(cause) {
            if (!cause) return "";
            if (!cause.message) return cause + "";
            return this.stripError(cause.message);
        },
        loadedBy: function(moduleName) {
            this.stack += "\n loaded by " + moduleName;
        },
        stripStack: function(causeStack) {
            var stack = [];
            causeStack.split("\n").some(function(frame) {
                if (/UncoatedModuleInstantiator/.test(frame)) return true;
                stack.push(frame);
            });
            stack[0] = this.stripError(stack[0]);
            return stack.join("\n");
        }
    }, {}, Error);
    function beforeLines(lines, number) {
        var result = [];
        var first = number - 3;
        if (first < 0) first = 0;
        for (var i = first; i < number; i++) {
            result.push(lines[i]);
        }
        return result;
    }
    function afterLines(lines, number) {
        var last = number + 1;
        if (last > lines.length - 1) last = lines.length - 1;
        var result = [];
        for (var i = number; i <= last; i++) {
            result.push(lines[i]);
        }
        return result;
    }
    function columnSpacing(columns) {
        var result = "";
        for (var i = 0; i < columns - 1; i++) {
            result += "-";
        }
        return result;
    }
    var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
        $traceurRuntime.superConstructor($UncoatedModuleInstantiator).call(this, url, null);
        this.func = func;
    };
    var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
    $traceurRuntime.createClass(UncoatedModuleInstantiator, {
        getUncoatedModule: function() {
            if (this.value_) return this.value_;
            try {
                var relativeRequire;
                if (typeof $traceurRuntime !== undefined) {
                    relativeRequire = $traceurRuntime.require.bind(null, this.url);
                }
                return this.value_ = this.func.call(global, relativeRequire);
            } catch (ex) {
                if (ex instanceof ModuleEvaluationError) {
                    ex.loadedBy(this.url);
                    throw ex;
                }
                if (ex.stack) {
                    var lines = this.func.toString().split("\n");
                    var evaled = [];
                    ex.stack.split("\n").some(function(frame) {
                        if (frame.indexOf("UncoatedModuleInstantiator.getUncoatedModule") > 0) return true;
                        var m = /(at\s[^\s]*\s).*>:(\d*):(\d*)\)/.exec(frame);
                        if (m) {
                            var line = parseInt(m[2], 10);
                            evaled = evaled.concat(beforeLines(lines, line));
                            evaled.push(columnSpacing(m[3]) + "^");
                            evaled = evaled.concat(afterLines(lines, line));
                            evaled.push("= = = = = = = = =");
                        } else {
                            evaled.push(frame);
                        }
                    });
                    ex.stack = evaled.join("\n");
                }
                throw new ModuleEvaluationError(this.url, ex);
            }
        }
    }, {}, UncoatedModuleEntry);
    function getUncoatedModuleInstantiator(name) {
        if (!name) return;
        var url = ModuleStore.normalize(name);
        return moduleInstantiators[url];
    }
    var moduleInstances = Object.create(null);
    var liveModuleSentinel = {};
    function Module(uncoatedModule) {
        var isLive = arguments[1];
        var coatedModule = Object.create(null);
        Object.getOwnPropertyNames(uncoatedModule).forEach(function(name) {
            var getter, value;
            if (isLive === liveModuleSentinel) {
                var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
                if (descr.get) getter = descr.get;
            }
            if (!getter) {
                value = uncoatedModule[name];
                getter = function() {
                    return value;
                };
            }
            Object.defineProperty(coatedModule, name, {
                get: getter,
                enumerable: true
            });
        });
        Object.preventExtensions(coatedModule);
        return coatedModule;
    }
    var ModuleStore = {
        normalize: function(name, refererName, refererAddress) {
            if (typeof name !== "string") throw new TypeError("module name must be a string, not " + typeof name);
            if (isAbsolute(name)) return canonicalizeUrl(name);
            if (/[^\.]\/\.\.\//.test(name)) {
                throw new Error("module name embeds /../: " + name);
            }
            if (name[0] === "." && refererName) return resolveUrl(refererName, name);
            return canonicalizeUrl(name);
        },
        get: function(normalizedName) {
            var m = getUncoatedModuleInstantiator(normalizedName);
            if (!m) return undefined;
            var moduleInstance = moduleInstances[m.url];
            if (moduleInstance) return moduleInstance;
            moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
            return moduleInstances[m.url] = moduleInstance;
        },
        set: function(normalizedName, module) {
            normalizedName = String(normalizedName);
            moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, function() {
                return module;
            });
            moduleInstances[normalizedName] = module;
        },
        get baseURL() {
            return baseURL;
        },
        set baseURL(v) {
            baseURL = String(v);
        },
        registerModule: function(name, deps, func) {
            var normalizedName = ModuleStore.normalize(name);
            if (moduleInstantiators[normalizedName]) throw new Error("duplicate module named " + normalizedName);
            moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
        },
        bundleStore: Object.create(null),
        register: function(name, deps, func) {
            if (!deps || !deps.length && !func.length) {
                this.registerModule(name, deps, func);
            } else {
                this.bundleStore[name] = {
                    deps: deps,
                    execute: function() {
                        var $__0 = arguments;
                        var depMap = {};
                        deps.forEach(function(dep, index) {
                            return depMap[dep] = $__0[index];
                        });
                        var registryEntry = func.call(this, depMap);
                        registryEntry.execute.call(this);
                        return registryEntry.exports;
                    }
                };
            }
        },
        getAnonymousModule: function(func) {
            return new Module(func.call(global), liveModuleSentinel);
        },
        getForTesting: function(name) {
            var $__0 = this;
            if (!this.testingPrefix_) {
                Object.keys(moduleInstances).some(function(key) {
                    var m = /(traceur@[^\/]*\/)/.exec(key);
                    if (m) {
                        $__0.testingPrefix_ = m[1];
                        return true;
                    }
                });
            }
            return this.get(this.testingPrefix_ + name);
        }
    };
    var moduleStoreModule = new Module({
        ModuleStore: ModuleStore
    });
    ModuleStore.set("@traceur/src/runtime/ModuleStore", moduleStoreModule);
    ModuleStore.set("@traceur/src/runtime/ModuleStore.js", moduleStoreModule);
    var setupGlobals = $traceurRuntime.setupGlobals;
    $traceurRuntime.setupGlobals = function(global) {
        setupGlobals(global);
    };
    $traceurRuntime.ModuleStore = ModuleStore;
    global.System = {
        register: ModuleStore.register.bind(ModuleStore),
        registerModule: ModuleStore.registerModule.bind(ModuleStore),
        get: ModuleStore.get,
        set: ModuleStore.set,
        normalize: ModuleStore.normalize
    };
    $traceurRuntime.getModuleImpl = function(name) {
        var instantiator = getUncoatedModuleInstantiator(name);
        return instantiator && instantiator.getUncoatedModule();
    };
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : this);

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/utils.js";
    var $ceil = Math.ceil;
    var $floor = Math.floor;
    var $isFinite = isFinite;
    var $isNaN = isNaN;
    var $pow = Math.pow;
    var $min = Math.min;
    var toObject = $traceurRuntime.toObject;
    function toUint32(x) {
        return x >>> 0;
    }
    function isObject(x) {
        return x && (typeof x === "object" || typeof x === "function");
    }
    function isCallable(x) {
        return typeof x === "function";
    }
    function isNumber(x) {
        return typeof x === "number";
    }
    function toInteger(x) {
        x = +x;
        if ($isNaN(x)) return 0;
        if (x === 0 || !$isFinite(x)) return x;
        return x > 0 ? $floor(x) : $ceil(x);
    }
    var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
    function toLength(x) {
        var len = toInteger(x);
        return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
    }
    function checkIterable(x) {
        return !isObject(x) ? undefined : x[Symbol.iterator];
    }
    function isConstructor(x) {
        return isCallable(x);
    }
    function createIteratorResultObject(value, done) {
        return {
            value: value,
            done: done
        };
    }
    function maybeDefine(object, name, descr) {
        if (!(name in object)) {
            Object.defineProperty(object, name, descr);
        }
    }
    function maybeDefineMethod(object, name, value) {
        maybeDefine(object, name, {
            value: value,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    function maybeDefineConst(object, name, value) {
        maybeDefine(object, name, {
            value: value,
            configurable: false,
            enumerable: false,
            writable: false
        });
    }
    function maybeAddFunctions(object, functions) {
        for (var i = 0; i < functions.length; i += 2) {
            var name = functions[i];
            var value = functions[i + 1];
            maybeDefineMethod(object, name, value);
        }
    }
    function maybeAddConsts(object, consts) {
        for (var i = 0; i < consts.length; i += 2) {
            var name = consts[i];
            var value = consts[i + 1];
            maybeDefineConst(object, name, value);
        }
    }
    function maybeAddIterator(object, func, Symbol) {
        if (!Symbol || !Symbol.iterator || object[Symbol.iterator]) return;
        if (object["@@iterator"]) func = object["@@iterator"];
        Object.defineProperty(object, Symbol.iterator, {
            value: func,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    var polyfills = [];
    function registerPolyfill(func) {
        polyfills.push(func);
    }
    function polyfillAll(global) {
        polyfills.forEach(function(f) {
            return f(global);
        });
    }
    return {
        get toObject() {
            return toObject;
        },
        get toUint32() {
            return toUint32;
        },
        get isObject() {
            return isObject;
        },
        get isCallable() {
            return isCallable;
        },
        get isNumber() {
            return isNumber;
        },
        get toInteger() {
            return toInteger;
        },
        get toLength() {
            return toLength;
        },
        get checkIterable() {
            return checkIterable;
        },
        get isConstructor() {
            return isConstructor;
        },
        get createIteratorResultObject() {
            return createIteratorResultObject;
        },
        get maybeDefine() {
            return maybeDefine;
        },
        get maybeDefineMethod() {
            return maybeDefineMethod;
        },
        get maybeDefineConst() {
            return maybeDefineConst;
        },
        get maybeAddFunctions() {
            return maybeAddFunctions;
        },
        get maybeAddConsts() {
            return maybeAddConsts;
        },
        get maybeAddIterator() {
            return maybeAddIterator;
        },
        get registerPolyfill() {
            return registerPolyfill;
        },
        get polyfillAll() {
            return polyfillAll;
        }
    };
});

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/Map.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/Map.js";
    var $__0 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js"), isObject = $__0.isObject, maybeAddIterator = $__0.maybeAddIterator, registerPolyfill = $__0.registerPolyfill;
    var getOwnHashObject = $traceurRuntime.getOwnHashObject;
    var $hasOwnProperty = Object.prototype.hasOwnProperty;
    var deletedSentinel = {};
    function lookupIndex(map, key) {
        if (isObject(key)) {
            var hashObject = getOwnHashObject(key);
            return hashObject && map.objectIndex_[hashObject.hash];
        }
        if (typeof key === "string") return map.stringIndex_[key];
        return map.primitiveIndex_[key];
    }
    function initMap(map) {
        map.entries_ = [];
        map.objectIndex_ = Object.create(null);
        map.stringIndex_ = Object.create(null);
        map.primitiveIndex_ = Object.create(null);
        map.deletedCount_ = 0;
    }
    var Map = function Map() {
        var $__5, $__6;
        var iterable = arguments[0];
        if (!isObject(this)) throw new TypeError("Map called on incompatible type");
        if ($hasOwnProperty.call(this, "entries_")) {
            throw new TypeError("Map can not be reentrantly initialised");
        }
        initMap(this);
        if (iterable !== null && iterable !== undefined) {
            for (var $__2 = iterable[$traceurRuntime.toProperty(Symbol.iterator)](), $__3 = void 0; !($__3 = $__2.next()).done; ) {
                var $__4 = $__3.value, key = ($__5 = $__4[$traceurRuntime.toProperty(Symbol.iterator)](), 
                ($__6 = $__5.next()).done ? void 0 : $__6.value), value = ($__6 = $__5.next()).done ? void 0 : $__6.value;
                {
                    this.set(key, value);
                }
            }
        }
    };
    $traceurRuntime.createClass(Map, {
        get size() {
            return this.entries_.length / 2 - this.deletedCount_;
        },
        get: function(key) {
            var index = lookupIndex(this, key);
            if (index !== undefined) return this.entries_[index + 1];
        },
        set: function(key, value) {
            var objectMode = isObject(key);
            var stringMode = typeof key === "string";
            var index = lookupIndex(this, key);
            if (index !== undefined) {
                this.entries_[index + 1] = value;
            } else {
                index = this.entries_.length;
                this.entries_[index] = key;
                this.entries_[index + 1] = value;
                if (objectMode) {
                    var hashObject = getOwnHashObject(key);
                    var hash = hashObject.hash;
                    this.objectIndex_[hash] = index;
                } else if (stringMode) {
                    this.stringIndex_[key] = index;
                } else {
                    this.primitiveIndex_[key] = index;
                }
            }
            return this;
        },
        has: function(key) {
            return lookupIndex(this, key) !== undefined;
        },
        "delete": function(key) {
            var objectMode = isObject(key);
            var stringMode = typeof key === "string";
            var index;
            var hash;
            if (objectMode) {
                var hashObject = getOwnHashObject(key);
                if (hashObject) {
                    index = this.objectIndex_[hash = hashObject.hash];
                    delete this.objectIndex_[hash];
                }
            } else if (stringMode) {
                index = this.stringIndex_[key];
                delete this.stringIndex_[key];
            } else {
                index = this.primitiveIndex_[key];
                delete this.primitiveIndex_[key];
            }
            if (index !== undefined) {
                this.entries_[index] = deletedSentinel;
                this.entries_[index + 1] = undefined;
                this.deletedCount_++;
                return true;
            }
            return false;
        },
        clear: function() {
            initMap(this);
        },
        forEach: function(callbackFn) {
            var thisArg = arguments[1];
            for (var i = 0; i < this.entries_.length; i += 2) {
                var key = this.entries_[i];
                var value = this.entries_[i + 1];
                if (key === deletedSentinel) continue;
                callbackFn.call(thisArg, value, key, this);
            }
        },
        entries: $traceurRuntime.initGeneratorFunction(function $__7() {
            var i, key, value;
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
                while (true) switch ($ctx.state) {
                  case 0:
                    i = 0;
                    $ctx.state = 12;
                    break;

                  case 12:
                    $ctx.state = i < this.entries_.length ? 8 : -2;
                    break;

                  case 4:
                    i += 2;
                    $ctx.state = 12;
                    break;

                  case 8:
                    key = this.entries_[i];
                    value = this.entries_[i + 1];
                    $ctx.state = 9;
                    break;

                  case 9:
                    $ctx.state = key === deletedSentinel ? 4 : 6;
                    break;

                  case 6:
                    $ctx.state = 2;
                    return [ key, value ];

                  case 2:
                    $ctx.maybeThrow();
                    $ctx.state = 4;
                    break;

                  default:
                    return $ctx.end();
                }
            }, $__7, this);
        }),
        keys: $traceurRuntime.initGeneratorFunction(function $__8() {
            var i, key, value;
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
                while (true) switch ($ctx.state) {
                  case 0:
                    i = 0;
                    $ctx.state = 12;
                    break;

                  case 12:
                    $ctx.state = i < this.entries_.length ? 8 : -2;
                    break;

                  case 4:
                    i += 2;
                    $ctx.state = 12;
                    break;

                  case 8:
                    key = this.entries_[i];
                    value = this.entries_[i + 1];
                    $ctx.state = 9;
                    break;

                  case 9:
                    $ctx.state = key === deletedSentinel ? 4 : 6;
                    break;

                  case 6:
                    $ctx.state = 2;
                    return key;

                  case 2:
                    $ctx.maybeThrow();
                    $ctx.state = 4;
                    break;

                  default:
                    return $ctx.end();
                }
            }, $__8, this);
        }),
        values: $traceurRuntime.initGeneratorFunction(function $__9() {
            var i, key, value;
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
                while (true) switch ($ctx.state) {
                  case 0:
                    i = 0;
                    $ctx.state = 12;
                    break;

                  case 12:
                    $ctx.state = i < this.entries_.length ? 8 : -2;
                    break;

                  case 4:
                    i += 2;
                    $ctx.state = 12;
                    break;

                  case 8:
                    key = this.entries_[i];
                    value = this.entries_[i + 1];
                    $ctx.state = 9;
                    break;

                  case 9:
                    $ctx.state = key === deletedSentinel ? 4 : 6;
                    break;

                  case 6:
                    $ctx.state = 2;
                    return value;

                  case 2:
                    $ctx.maybeThrow();
                    $ctx.state = 4;
                    break;

                  default:
                    return $ctx.end();
                }
            }, $__9, this);
        })
    }, {});
    Object.defineProperty(Map.prototype, Symbol.iterator, {
        configurable: true,
        writable: true,
        value: Map.prototype.entries
    });
    function polyfillMap(global) {
        var $__4 = global, Object = $__4.Object, Symbol = $__4.Symbol;
        if (!global.Map) global.Map = Map;
        var mapPrototype = global.Map.prototype;
        if (mapPrototype.entries === undefined) global.Map = Map;
        if (mapPrototype.entries) {
            maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
            maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
                return this;
            }, Symbol);
        }
    }
    registerPolyfill(polyfillMap);
    return {
        get Map() {
            return Map;
        },
        get polyfillMap() {
            return polyfillMap;
        }
    };
});

System.get("traceur-runtime@0.0.81/src/runtime/polyfills/Map.js" + "");

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/Set.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/Set.js";
    var $__0 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js"), isObject = $__0.isObject, maybeAddIterator = $__0.maybeAddIterator, registerPolyfill = $__0.registerPolyfill;
    var Map = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/Map.js").Map;
    var getOwnHashObject = $traceurRuntime.getOwnHashObject;
    var $hasOwnProperty = Object.prototype.hasOwnProperty;
    function initSet(set) {
        set.map_ = new Map();
    }
    var Set = function Set() {
        var iterable = arguments[0];
        if (!isObject(this)) throw new TypeError("Set called on incompatible type");
        if ($hasOwnProperty.call(this, "map_")) {
            throw new TypeError("Set can not be reentrantly initialised");
        }
        initSet(this);
        if (iterable !== null && iterable !== undefined) {
            for (var $__4 = iterable[$traceurRuntime.toProperty(Symbol.iterator)](), $__5 = void 0; !($__5 = $__4.next()).done; ) {
                var item = $__5.value;
                {
                    this.add(item);
                }
            }
        }
    };
    $traceurRuntime.createClass(Set, {
        get size() {
            return this.map_.size;
        },
        has: function(key) {
            return this.map_.has(key);
        },
        add: function(key) {
            this.map_.set(key, key);
            return this;
        },
        "delete": function(key) {
            return this.map_.delete(key);
        },
        clear: function() {
            return this.map_.clear();
        },
        forEach: function(callbackFn) {
            var thisArg = arguments[1];
            var $__2 = this;
            return this.map_.forEach(function(value, key) {
                callbackFn.call(thisArg, key, key, $__2);
            });
        },
        values: $traceurRuntime.initGeneratorFunction(function $__7() {
            var $__8, $__9;
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
                while (true) switch ($ctx.state) {
                  case 0:
                    $__8 = this.map_.keys()[Symbol.iterator]();
                    $ctx.sent = void 0;
                    $ctx.action = "next";
                    $ctx.state = 12;
                    break;

                  case 12:
                    $__9 = $__8[$ctx.action]($ctx.sentIgnoreThrow);
                    $ctx.state = 9;
                    break;

                  case 9:
                    $ctx.state = $__9.done ? 3 : 2;
                    break;

                  case 3:
                    $ctx.sent = $__9.value;
                    $ctx.state = -2;
                    break;

                  case 2:
                    $ctx.state = 12;
                    return $__9.value;

                  default:
                    return $ctx.end();
                }
            }, $__7, this);
        }),
        entries: $traceurRuntime.initGeneratorFunction(function $__10() {
            var $__11, $__12;
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
                while (true) switch ($ctx.state) {
                  case 0:
                    $__11 = this.map_.entries()[Symbol.iterator]();
                    $ctx.sent = void 0;
                    $ctx.action = "next";
                    $ctx.state = 12;
                    break;

                  case 12:
                    $__12 = $__11[$ctx.action]($ctx.sentIgnoreThrow);
                    $ctx.state = 9;
                    break;

                  case 9:
                    $ctx.state = $__12.done ? 3 : 2;
                    break;

                  case 3:
                    $ctx.sent = $__12.value;
                    $ctx.state = -2;
                    break;

                  case 2:
                    $ctx.state = 12;
                    return $__12.value;

                  default:
                    return $ctx.end();
                }
            }, $__10, this);
        })
    }, {});
    Object.defineProperty(Set.prototype, Symbol.iterator, {
        configurable: true,
        writable: true,
        value: Set.prototype.values
    });
    Object.defineProperty(Set.prototype, "keys", {
        configurable: true,
        writable: true,
        value: Set.prototype.values
    });
    function polyfillSet(global) {
        var $__6 = global, Object = $__6.Object, Symbol = $__6.Symbol;
        if (!global.Set) global.Set = Set;
        var setPrototype = global.Set.prototype;
        if (setPrototype.values) {
            maybeAddIterator(setPrototype, setPrototype.values, Symbol);
            maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
                return this;
            }, Symbol);
        }
    }
    registerPolyfill(polyfillSet);
    return {
        get Set() {
            return Set;
        },
        get polyfillSet() {
            return polyfillSet;
        }
    };
});

System.get("traceur-runtime@0.0.81/src/runtime/polyfills/Set.js" + "");

System.registerModule("traceur-runtime@0.0.81/node_modules/rsvp/lib/rsvp/asap.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/node_modules/rsvp/lib/rsvp/asap.js";
    var len = 0;
    function asap(callback, arg) {
        queue[len] = callback;
        queue[len + 1] = arg;
        len += 2;
        if (len === 2) {
            scheduleFlush();
        }
    }
    var $__default = asap;
    var browserGlobal = typeof window !== "undefined" ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var isWorker = typeof Uint8ClampedArray !== "undefined" && typeof importScripts !== "undefined" && typeof MessageChannel !== "undefined";
    function useNextTick() {
        return function() {
            process.nextTick(flush);
        };
    }
    function useMutationObserver() {
        var iterations = 0;
        var observer = new BrowserMutationObserver(flush);
        var node = document.createTextNode("");
        observer.observe(node, {
            characterData: true
        });
        return function() {
            node.data = iterations = ++iterations % 2;
        };
    }
    function useMessageChannel() {
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        return function() {
            channel.port2.postMessage(0);
        };
    }
    function useSetTimeout() {
        return function() {
            setTimeout(flush, 1);
        };
    }
    var queue = new Array(1e3);
    function flush() {
        for (var i = 0; i < len; i += 2) {
            var callback = queue[i];
            var arg = queue[i + 1];
            callback(arg);
            queue[i] = undefined;
            queue[i + 1] = undefined;
        }
        len = 0;
    }
    var scheduleFlush;
    if (typeof process !== "undefined" && {}.toString.call(process) === "[object process]") {
        scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
        scheduleFlush = useMutationObserver();
    } else if (isWorker) {
        scheduleFlush = useMessageChannel();
    } else {
        scheduleFlush = useSetTimeout();
    }
    return {
        get default() {
            return $__default;
        }
    };
});

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/Promise.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/Promise.js";
    var async = System.get("traceur-runtime@0.0.81/node_modules/rsvp/lib/rsvp/asap.js").default;
    var registerPolyfill = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js").registerPolyfill;
    var promiseRaw = {};
    function isPromise(x) {
        return x && typeof x === "object" && x.status_ !== undefined;
    }
    function idResolveHandler(x) {
        return x;
    }
    function idRejectHandler(x) {
        throw x;
    }
    function chain(promise) {
        var onResolve = arguments[1] !== void 0 ? arguments[1] : idResolveHandler;
        var onReject = arguments[2] !== void 0 ? arguments[2] : idRejectHandler;
        var deferred = getDeferred(promise.constructor);
        switch (promise.status_) {
          case undefined:
            throw TypeError;

          case 0:
            promise.onResolve_.push(onResolve, deferred);
            promise.onReject_.push(onReject, deferred);
            break;

          case +1:
            promiseEnqueue(promise.value_, [ onResolve, deferred ]);
            break;

          case -1:
            promiseEnqueue(promise.value_, [ onReject, deferred ]);
            break;
        }
        return deferred.promise;
    }
    function getDeferred(C) {
        if (this === $Promise) {
            var promise = promiseInit(new $Promise(promiseRaw));
            return {
                promise: promise,
                resolve: function(x) {
                    promiseResolve(promise, x);
                },
                reject: function(r) {
                    promiseReject(promise, r);
                }
            };
        } else {
            var result = {};
            result.promise = new C(function(resolve, reject) {
                result.resolve = resolve;
                result.reject = reject;
            });
            return result;
        }
    }
    function promiseSet(promise, status, value, onResolve, onReject) {
        promise.status_ = status;
        promise.value_ = value;
        promise.onResolve_ = onResolve;
        promise.onReject_ = onReject;
        return promise;
    }
    function promiseInit(promise) {
        return promiseSet(promise, 0, undefined, [], []);
    }
    var Promise = function Promise(resolver) {
        if (resolver === promiseRaw) return;
        if (typeof resolver !== "function") throw new TypeError();
        var promise = promiseInit(this);
        try {
            resolver(function(x) {
                promiseResolve(promise, x);
            }, function(r) {
                promiseReject(promise, r);
            });
        } catch (e) {
            promiseReject(promise, e);
        }
    };
    $traceurRuntime.createClass(Promise, {
        "catch": function(onReject) {
            return this.then(undefined, onReject);
        },
        then: function(onResolve, onReject) {
            if (typeof onResolve !== "function") onResolve = idResolveHandler;
            if (typeof onReject !== "function") onReject = idRejectHandler;
            var that = this;
            var constructor = this.constructor;
            return chain(this, function(x) {
                x = promiseCoerce(constructor, x);
                return x === that ? onReject(new TypeError()) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
            }, onReject);
        }
    }, {
        resolve: function(x) {
            if (this === $Promise) {
                if (isPromise(x)) {
                    return x;
                }
                return promiseSet(new $Promise(promiseRaw), +1, x);
            } else {
                return new this(function(resolve, reject) {
                    resolve(x);
                });
            }
        },
        reject: function(r) {
            if (this === $Promise) {
                return promiseSet(new $Promise(promiseRaw), -1, r);
            } else {
                return new this(function(resolve, reject) {
                    reject(r);
                });
            }
        },
        all: function(values) {
            var deferred = getDeferred(this);
            var resolutions = [];
            try {
                var makeCountdownFunction = function(i) {
                    return function(x) {
                        resolutions[i] = x;
                        if (--count === 0) deferred.resolve(resolutions);
                    };
                };
                var count = 0;
                var i = 0;
                for (var $__3 = values[$traceurRuntime.toProperty(Symbol.iterator)](), $__4 = void 0; !($__4 = $__3.next()).done; ) {
                    var value = $__4.value;
                    {
                        var countdownFunction = makeCountdownFunction(i);
                        this.resolve(value).then(countdownFunction, function(r) {
                            deferred.reject(r);
                        });
                        ++i;
                        ++count;
                    }
                }
                if (count === 0) {
                    deferred.resolve(resolutions);
                }
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        race: function(values) {
            var deferred = getDeferred(this);
            try {
                for (var i = 0; i < values.length; i++) {
                    this.resolve(values[i]).then(function(x) {
                        deferred.resolve(x);
                    }, function(r) {
                        deferred.reject(r);
                    });
                }
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        }
    });
    var $Promise = Promise;
    var $PromiseReject = $Promise.reject;
    function promiseResolve(promise, x) {
        promiseDone(promise, +1, x, promise.onResolve_);
    }
    function promiseReject(promise, r) {
        promiseDone(promise, -1, r, promise.onReject_);
    }
    function promiseDone(promise, status, value, reactions) {
        if (promise.status_ !== 0) return;
        promiseEnqueue(value, reactions);
        promiseSet(promise, status, value);
    }
    function promiseEnqueue(value, tasks) {
        async(function() {
            for (var i = 0; i < tasks.length; i += 2) {
                promiseHandle(value, tasks[i], tasks[i + 1]);
            }
        });
    }
    function promiseHandle(value, handler, deferred) {
        try {
            var result = handler(value);
            if (result === deferred.promise) throw new TypeError(); else if (isPromise(result)) chain(result, deferred.resolve, deferred.reject); else deferred.resolve(result);
        } catch (e) {
            try {
                deferred.reject(e);
            } catch (e) {}
        }
    }
    var thenableSymbol = "@@thenable";
    function isObject(x) {
        return x && (typeof x === "object" || typeof x === "function");
    }
    function promiseCoerce(constructor, x) {
        if (!isPromise(x) && isObject(x)) {
            var then;
            try {
                then = x.then;
            } catch (r) {
                var promise = $PromiseReject.call(constructor, r);
                x[thenableSymbol] = promise;
                return promise;
            }
            if (typeof then === "function") {
                var p = x[thenableSymbol];
                if (p) {
                    return p;
                } else {
                    var deferred = getDeferred(constructor);
                    x[thenableSymbol] = deferred.promise;
                    try {
                        then.call(x, deferred.resolve, deferred.reject);
                    } catch (r) {
                        deferred.reject(r);
                    }
                    return deferred.promise;
                }
            }
        }
        return x;
    }
    function polyfillPromise(global) {
        if (!global.Promise) global.Promise = Promise;
    }
    registerPolyfill(polyfillPromise);
    return {
        get Promise() {
            return Promise;
        },
        get polyfillPromise() {
            return polyfillPromise;
        }
    };
});

System.get("traceur-runtime@0.0.81/src/runtime/polyfills/Promise.js" + "");

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/StringIterator.js", [], function() {
    "use strict";
    var $__2;
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/StringIterator.js";
    var $__0 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js"), createIteratorResultObject = $__0.createIteratorResultObject, isObject = $__0.isObject;
    var toProperty = $traceurRuntime.toProperty;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var iteratedString = Symbol("iteratedString");
    var stringIteratorNextIndex = Symbol("stringIteratorNextIndex");
    var StringIterator = function StringIterator() {};
    $traceurRuntime.createClass(StringIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
        value: function() {
            var o = this;
            if (!isObject(o) || !hasOwnProperty.call(o, iteratedString)) {
                throw new TypeError("this must be a StringIterator object");
            }
            var s = o[toProperty(iteratedString)];
            if (s === undefined) {
                return createIteratorResultObject(undefined, true);
            }
            var position = o[toProperty(stringIteratorNextIndex)];
            var len = s.length;
            if (position >= len) {
                o[toProperty(iteratedString)] = undefined;
                return createIteratorResultObject(undefined, true);
            }
            var first = s.charCodeAt(position);
            var resultString;
            if (first < 55296 || first > 56319 || position + 1 === len) {
                resultString = String.fromCharCode(first);
            } else {
                var second = s.charCodeAt(position + 1);
                if (second < 56320 || second > 57343) {
                    resultString = String.fromCharCode(first);
                } else {
                    resultString = String.fromCharCode(first) + String.fromCharCode(second);
                }
            }
            o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
            return createIteratorResultObject(resultString, false);
        },
        configurable: true,
        enumerable: true,
        writable: true
    }), Object.defineProperty($__2, Symbol.iterator, {
        value: function() {
            return this;
        },
        configurable: true,
        enumerable: true,
        writable: true
    }), $__2), {});
    function createStringIterator(string) {
        var s = String(string);
        var iterator = Object.create(StringIterator.prototype);
        iterator[toProperty(iteratedString)] = s;
        iterator[toProperty(stringIteratorNextIndex)] = 0;
        return iterator;
    }
    return {
        get createStringIterator() {
            return createStringIterator;
        }
    };
});

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/String.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/String.js";
    var createStringIterator = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/StringIterator.js").createStringIterator;
    var $__1 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js"), maybeAddFunctions = $__1.maybeAddFunctions, maybeAddIterator = $__1.maybeAddIterator, registerPolyfill = $__1.registerPolyfill;
    var $toString = Object.prototype.toString;
    var $indexOf = String.prototype.indexOf;
    var $lastIndexOf = String.prototype.lastIndexOf;
    function startsWith(search) {
        var string = String(this);
        if (this == null || $toString.call(search) == "[object RegExp]") {
            throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        var pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
            pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        return $indexOf.call(string, searchString, pos) == start;
    }
    function endsWith(search) {
        var string = String(this);
        if (this == null || $toString.call(search) == "[object RegExp]") {
            throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var pos = stringLength;
        if (arguments.length > 1) {
            var position = arguments[1];
            if (position !== undefined) {
                pos = position ? Number(position) : 0;
                if (isNaN(pos)) {
                    pos = 0;
                }
            }
        }
        var end = Math.min(Math.max(pos, 0), stringLength);
        var start = end - searchLength;
        if (start < 0) {
            return false;
        }
        return $lastIndexOf.call(string, searchString, start) == start;
    }
    function includes(search) {
        if (this == null) {
            throw TypeError();
        }
        var string = String(this);
        if (search && $toString.call(search) == "[object RegExp]") {
            throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        var pos = position ? Number(position) : 0;
        if (pos != pos) {
            pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        if (searchLength + start > stringLength) {
            return false;
        }
        return $indexOf.call(string, searchString, pos) != -1;
    }
    function repeat(count) {
        if (this == null) {
            throw TypeError();
        }
        var string = String(this);
        var n = count ? Number(count) : 0;
        if (isNaN(n)) {
            n = 0;
        }
        if (n < 0 || n == Infinity) {
            throw RangeError();
        }
        if (n == 0) {
            return "";
        }
        var result = "";
        while (n--) {
            result += string;
        }
        return result;
    }
    function codePointAt(position) {
        if (this == null) {
            throw TypeError();
        }
        var string = String(this);
        var size = string.length;
        var index = position ? Number(position) : 0;
        if (isNaN(index)) {
            index = 0;
        }
        if (index < 0 || index >= size) {
            return undefined;
        }
        var first = string.charCodeAt(index);
        var second;
        if (first >= 55296 && first <= 56319 && size > index + 1) {
            second = string.charCodeAt(index + 1);
            if (second >= 56320 && second <= 57343) {
                return (first - 55296) * 1024 + second - 56320 + 65536;
            }
        }
        return first;
    }
    function raw(callsite) {
        var raw = callsite.raw;
        var len = raw.length >>> 0;
        if (len === 0) return "";
        var s = "";
        var i = 0;
        while (true) {
            s += raw[i];
            if (i + 1 === len) return s;
            s += arguments[++i];
        }
    }
    function fromCodePoint() {
        var codeUnits = [];
        var floor = Math.floor;
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
            return "";
        }
        while (++index < length) {
            var codePoint = Number(arguments[index]);
            if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) != codePoint) {
                throw RangeError("Invalid code point: " + codePoint);
            }
            if (codePoint <= 65535) {
                codeUnits.push(codePoint);
            } else {
                codePoint -= 65536;
                highSurrogate = (codePoint >> 10) + 55296;
                lowSurrogate = codePoint % 1024 + 56320;
                codeUnits.push(highSurrogate, lowSurrogate);
            }
        }
        return String.fromCharCode.apply(null, codeUnits);
    }
    function stringPrototypeIterator() {
        var o = $traceurRuntime.checkObjectCoercible(this);
        var s = String(o);
        return createStringIterator(s);
    }
    function polyfillString(global) {
        var String = global.String;
        maybeAddFunctions(String.prototype, [ "codePointAt", codePointAt, "endsWith", endsWith, "includes", includes, "repeat", repeat, "startsWith", startsWith ]);
        maybeAddFunctions(String, [ "fromCodePoint", fromCodePoint, "raw", raw ]);
        maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
    }
    registerPolyfill(polyfillString);
    return {
        get startsWith() {
            return startsWith;
        },
        get endsWith() {
            return endsWith;
        },
        get includes() {
            return includes;
        },
        get repeat() {
            return repeat;
        },
        get codePointAt() {
            return codePointAt;
        },
        get raw() {
            return raw;
        },
        get fromCodePoint() {
            return fromCodePoint;
        },
        get stringPrototypeIterator() {
            return stringPrototypeIterator;
        },
        get polyfillString() {
            return polyfillString;
        }
    };
});

System.get("traceur-runtime@0.0.81/src/runtime/polyfills/String.js" + "");

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/ArrayIterator.js", [], function() {
    "use strict";
    var $__2;
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/ArrayIterator.js";
    var $__0 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js"), toObject = $__0.toObject, toUint32 = $__0.toUint32, createIteratorResultObject = $__0.createIteratorResultObject;
    var ARRAY_ITERATOR_KIND_KEYS = 1;
    var ARRAY_ITERATOR_KIND_VALUES = 2;
    var ARRAY_ITERATOR_KIND_ENTRIES = 3;
    var ArrayIterator = function ArrayIterator() {};
    $traceurRuntime.createClass(ArrayIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
        value: function() {
            var iterator = toObject(this);
            var array = iterator.iteratorObject_;
            if (!array) {
                throw new TypeError("Object is not an ArrayIterator");
            }
            var index = iterator.arrayIteratorNextIndex_;
            var itemKind = iterator.arrayIterationKind_;
            var length = toUint32(array.length);
            if (index >= length) {
                iterator.arrayIteratorNextIndex_ = Infinity;
                return createIteratorResultObject(undefined, true);
            }
            iterator.arrayIteratorNextIndex_ = index + 1;
            if (itemKind == ARRAY_ITERATOR_KIND_VALUES) return createIteratorResultObject(array[index], false);
            if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES) return createIteratorResultObject([ index, array[index] ], false);
            return createIteratorResultObject(index, false);
        },
        configurable: true,
        enumerable: true,
        writable: true
    }), Object.defineProperty($__2, Symbol.iterator, {
        value: function() {
            return this;
        },
        configurable: true,
        enumerable: true,
        writable: true
    }), $__2), {});
    function createArrayIterator(array, kind) {
        var object = toObject(array);
        var iterator = new ArrayIterator();
        iterator.iteratorObject_ = object;
        iterator.arrayIteratorNextIndex_ = 0;
        iterator.arrayIterationKind_ = kind;
        return iterator;
    }
    function entries() {
        return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
    }
    function keys() {
        return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
    }
    function values() {
        return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
    }
    return {
        get entries() {
            return entries;
        },
        get keys() {
            return keys;
        },
        get values() {
            return values;
        }
    };
});

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/Array.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/Array.js";
    var $__0 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/ArrayIterator.js"), entries = $__0.entries, keys = $__0.keys, values = $__0.values;
    var $__1 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js"), checkIterable = $__1.checkIterable, isCallable = $__1.isCallable, isConstructor = $__1.isConstructor, maybeAddFunctions = $__1.maybeAddFunctions, maybeAddIterator = $__1.maybeAddIterator, registerPolyfill = $__1.registerPolyfill, toInteger = $__1.toInteger, toLength = $__1.toLength, toObject = $__1.toObject;
    function from(arrLike) {
        var mapFn = arguments[1];
        var thisArg = arguments[2];
        var C = this;
        var items = toObject(arrLike);
        var mapping = mapFn !== undefined;
        var k = 0;
        var arr, len;
        if (mapping && !isCallable(mapFn)) {
            throw TypeError();
        }
        if (checkIterable(items)) {
            arr = isConstructor(C) ? new C() : [];
            for (var $__2 = items[$traceurRuntime.toProperty(Symbol.iterator)](), $__3 = void 0; !($__3 = $__2.next()).done; ) {
                var item = $__3.value;
                {
                    if (mapping) {
                        arr[k] = mapFn.call(thisArg, item, k);
                    } else {
                        arr[k] = item;
                    }
                    k++;
                }
            }
            arr.length = k;
            return arr;
        }
        len = toLength(items.length);
        arr = isConstructor(C) ? new C(len) : new Array(len);
        for (;k < len; k++) {
            if (mapping) {
                arr[k] = typeof thisArg === "undefined" ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
            } else {
                arr[k] = items[k];
            }
        }
        arr.length = len;
        return arr;
    }
    function of() {
        for (var items = [], $__4 = 0; $__4 < arguments.length; $__4++) items[$__4] = arguments[$__4];
        var C = this;
        var len = items.length;
        var arr = isConstructor(C) ? new C(len) : new Array(len);
        for (var k = 0; k < len; k++) {
            arr[k] = items[k];
        }
        arr.length = len;
        return arr;
    }
    function fill(value) {
        var start = arguments[1] !== void 0 ? arguments[1] : 0;
        var end = arguments[2];
        var object = toObject(this);
        var len = toLength(object.length);
        var fillStart = toInteger(start);
        var fillEnd = end !== undefined ? toInteger(end) : len;
        fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
        fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
        while (fillStart < fillEnd) {
            object[fillStart] = value;
            fillStart++;
        }
        return object;
    }
    function find(predicate) {
        var thisArg = arguments[1];
        return findHelper(this, predicate, thisArg);
    }
    function findIndex(predicate) {
        var thisArg = arguments[1];
        return findHelper(this, predicate, thisArg, true);
    }
    function findHelper(self, predicate) {
        var thisArg = arguments[2];
        var returnIndex = arguments[3] !== void 0 ? arguments[3] : false;
        var object = toObject(self);
        var len = toLength(object.length);
        if (!isCallable(predicate)) {
            throw TypeError();
        }
        for (var i = 0; i < len; i++) {
            var value = object[i];
            if (predicate.call(thisArg, value, i, object)) {
                return returnIndex ? i : value;
            }
        }
        return returnIndex ? -1 : undefined;
    }
    function polyfillArray(global) {
        var $__5 = global, Array = $__5.Array, Object = $__5.Object, Symbol = $__5.Symbol;
        maybeAddFunctions(Array.prototype, [ "entries", entries, "keys", keys, "values", values, "fill", fill, "find", find, "findIndex", findIndex ]);
        maybeAddFunctions(Array, [ "from", from, "of", of ]);
        maybeAddIterator(Array.prototype, values, Symbol);
        maybeAddIterator(Object.getPrototypeOf([].values()), function() {
            return this;
        }, Symbol);
    }
    registerPolyfill(polyfillArray);
    return {
        get from() {
            return from;
        },
        get of() {
            return of;
        },
        get fill() {
            return fill;
        },
        get find() {
            return find;
        },
        get findIndex() {
            return findIndex;
        },
        get polyfillArray() {
            return polyfillArray;
        }
    };
});

System.get("traceur-runtime@0.0.81/src/runtime/polyfills/Array.js" + "");

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/Object.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/Object.js";
    var $__0 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js"), maybeAddFunctions = $__0.maybeAddFunctions, registerPolyfill = $__0.registerPolyfill;
    var $__1 = $traceurRuntime, defineProperty = $__1.defineProperty, getOwnPropertyDescriptor = $__1.getOwnPropertyDescriptor, getOwnPropertyNames = $__1.getOwnPropertyNames, isPrivateName = $__1.isPrivateName, keys = $__1.keys;
    function is(left, right) {
        if (left === right) return left !== 0 || 1 / left === 1 / right;
        return left !== left && right !== right;
    }
    function assign(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            var props = source == null ? [] : keys(source);
            var p = void 0, length = props.length;
            for (p = 0; p < length; p++) {
                var name = props[p];
                if (isPrivateName(name)) continue;
                target[name] = source[name];
            }
        }
        return target;
    }
    function mixin(target, source) {
        var props = getOwnPropertyNames(source);
        var p, descriptor, length = props.length;
        for (p = 0; p < length; p++) {
            var name = props[p];
            if (isPrivateName(name)) continue;
            descriptor = getOwnPropertyDescriptor(source, props[p]);
            defineProperty(target, props[p], descriptor);
        }
        return target;
    }
    function polyfillObject(global) {
        var Object = global.Object;
        maybeAddFunctions(Object, [ "assign", assign, "is", is, "mixin", mixin ]);
    }
    registerPolyfill(polyfillObject);
    return {
        get is() {
            return is;
        },
        get assign() {
            return assign;
        },
        get mixin() {
            return mixin;
        },
        get polyfillObject() {
            return polyfillObject;
        }
    };
});

System.get("traceur-runtime@0.0.81/src/runtime/polyfills/Object.js" + "");

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/Number.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/Number.js";
    var $__0 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js"), isNumber = $__0.isNumber, maybeAddConsts = $__0.maybeAddConsts, maybeAddFunctions = $__0.maybeAddFunctions, registerPolyfill = $__0.registerPolyfill, toInteger = $__0.toInteger;
    var $abs = Math.abs;
    var $isFinite = isFinite;
    var $isNaN = isNaN;
    var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
    var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
    var EPSILON = Math.pow(2, -52);
    function NumberIsFinite(number) {
        return isNumber(number) && $isFinite(number);
    }
    function isInteger(number) {
        return NumberIsFinite(number) && toInteger(number) === number;
    }
    function NumberIsNaN(number) {
        return isNumber(number) && $isNaN(number);
    }
    function isSafeInteger(number) {
        if (NumberIsFinite(number)) {
            var integral = toInteger(number);
            if (integral === number) return $abs(integral) <= MAX_SAFE_INTEGER;
        }
        return false;
    }
    function polyfillNumber(global) {
        var Number = global.Number;
        maybeAddConsts(Number, [ "MAX_SAFE_INTEGER", MAX_SAFE_INTEGER, "MIN_SAFE_INTEGER", MIN_SAFE_INTEGER, "EPSILON", EPSILON ]);
        maybeAddFunctions(Number, [ "isFinite", NumberIsFinite, "isInteger", isInteger, "isNaN", NumberIsNaN, "isSafeInteger", isSafeInteger ]);
    }
    registerPolyfill(polyfillNumber);
    return {
        get MAX_SAFE_INTEGER() {
            return MAX_SAFE_INTEGER;
        },
        get MIN_SAFE_INTEGER() {
            return MIN_SAFE_INTEGER;
        },
        get EPSILON() {
            return EPSILON;
        },
        get isFinite() {
            return NumberIsFinite;
        },
        get isInteger() {
            return isInteger;
        },
        get isNaN() {
            return NumberIsNaN;
        },
        get isSafeInteger() {
            return isSafeInteger;
        },
        get polyfillNumber() {
            return polyfillNumber;
        }
    };
});

System.get("traceur-runtime@0.0.81/src/runtime/polyfills/Number.js" + "");

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/Math.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/Math.js";
    var $__0 = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js"), maybeAddFunctions = $__0.maybeAddFunctions, registerPolyfill = $__0.registerPolyfill, toUint32 = $__0.toUint32;
    var $isFinite = isFinite;
    var $isNaN = isNaN;
    var $__1 = Math, abs = $__1.abs, ceil = $__1.ceil, exp = $__1.exp, floor = $__1.floor, log = $__1.log, pow = $__1.pow, sqrt = $__1.sqrt;
    function clz32(x) {
        x = toUint32(+x);
        if (x == 0) return 32;
        var result = 0;
        if ((x & 4294901760) === 0) {
            x <<= 16;
            result += 16;
        }
        if ((x & 4278190080) === 0) {
            x <<= 8;
            result += 8;
        }
        if ((x & 4026531840) === 0) {
            x <<= 4;
            result += 4;
        }
        if ((x & 3221225472) === 0) {
            x <<= 2;
            result += 2;
        }
        if ((x & 2147483648) === 0) {
            x <<= 1;
            result += 1;
        }
        return result;
    }
    function imul(x, y) {
        x = toUint32(+x);
        y = toUint32(+y);
        var xh = x >>> 16 & 65535;
        var xl = x & 65535;
        var yh = y >>> 16 & 65535;
        var yl = y & 65535;
        return xl * yl + (xh * yl + xl * yh << 16 >>> 0) | 0;
    }
    function sign(x) {
        x = +x;
        if (x > 0) return 1;
        if (x < 0) return -1;
        return x;
    }
    function log10(x) {
        return log(x) * .4342944819032518;
    }
    function log2(x) {
        return log(x) * 1.4426950408889634;
    }
    function log1p(x) {
        x = +x;
        if (x < -1 || $isNaN(x)) {
            return NaN;
        }
        if (x === 0 || x === Infinity) {
            return x;
        }
        if (x === -1) {
            return -Infinity;
        }
        var result = 0;
        var n = 50;
        if (x < 0 || x > 1) {
            return log(1 + x);
        }
        for (var i = 1; i < n; i++) {
            if (i % 2 === 0) {
                result -= pow(x, i) / i;
            } else {
                result += pow(x, i) / i;
            }
        }
        return result;
    }
    function expm1(x) {
        x = +x;
        if (x === -Infinity) {
            return -1;
        }
        if (!$isFinite(x) || x === 0) {
            return x;
        }
        return exp(x) - 1;
    }
    function cosh(x) {
        x = +x;
        if (x === 0) {
            return 1;
        }
        if ($isNaN(x)) {
            return NaN;
        }
        if (!$isFinite(x)) {
            return Infinity;
        }
        if (x < 0) {
            x = -x;
        }
        if (x > 21) {
            return exp(x) / 2;
        }
        return (exp(x) + exp(-x)) / 2;
    }
    function sinh(x) {
        x = +x;
        if (!$isFinite(x) || x === 0) {
            return x;
        }
        return (exp(x) - exp(-x)) / 2;
    }
    function tanh(x) {
        x = +x;
        if (x === 0) return x;
        if (!$isFinite(x)) return sign(x);
        var exp1 = exp(x);
        var exp2 = exp(-x);
        return (exp1 - exp2) / (exp1 + exp2);
    }
    function acosh(x) {
        x = +x;
        if (x < 1) return NaN;
        if (!$isFinite(x)) return x;
        return log(x + sqrt(x + 1) * sqrt(x - 1));
    }
    function asinh(x) {
        x = +x;
        if (x === 0 || !$isFinite(x)) return x;
        if (x > 0) return log(x + sqrt(x * x + 1));
        return -log(-x + sqrt(x * x + 1));
    }
    function atanh(x) {
        x = +x;
        if (x === -1) {
            return -Infinity;
        }
        if (x === 1) {
            return Infinity;
        }
        if (x === 0) {
            return x;
        }
        if ($isNaN(x) || x < -1 || x > 1) {
            return NaN;
        }
        return .5 * log((1 + x) / (1 - x));
    }
    function hypot(x, y) {
        var length = arguments.length;
        var args = new Array(length);
        var max = 0;
        for (var i = 0; i < length; i++) {
            var n = arguments[i];
            n = +n;
            if (n === Infinity || n === -Infinity) return Infinity;
            n = abs(n);
            if (n > max) max = n;
            args[i] = n;
        }
        if (max === 0) max = 1;
        var sum = 0;
        var compensation = 0;
        for (var i = 0; i < length; i++) {
            var n = args[i] / max;
            var summand = n * n - compensation;
            var preliminary = sum + summand;
            compensation = preliminary - sum - summand;
            sum = preliminary;
        }
        return sqrt(sum) * max;
    }
    function trunc(x) {
        x = +x;
        if (x > 0) return floor(x);
        if (x < 0) return ceil(x);
        return x;
    }
    var f32 = new Float32Array(1);
    function fround(x) {
        f32[0] = +x;
        return f32[0];
    }
    function cbrt(x) {
        x = +x;
        if (x === 0) return x;
        var negate = x < 0;
        if (negate) x = -x;
        var result = pow(x, 1 / 3);
        return negate ? -result : result;
    }
    function polyfillMath(global) {
        var Math = global.Math;
        maybeAddFunctions(Math, [ "acosh", acosh, "asinh", asinh, "atanh", atanh, "cbrt", cbrt, "clz32", clz32, "cosh", cosh, "expm1", expm1, "fround", fround, "hypot", hypot, "imul", imul, "log10", log10, "log1p", log1p, "log2", log2, "sign", sign, "sinh", sinh, "tanh", tanh, "trunc", trunc ]);
    }
    registerPolyfill(polyfillMath);
    return {
        get clz32() {
            return clz32;
        },
        get imul() {
            return imul;
        },
        get sign() {
            return sign;
        },
        get log10() {
            return log10;
        },
        get log2() {
            return log2;
        },
        get log1p() {
            return log1p;
        },
        get expm1() {
            return expm1;
        },
        get cosh() {
            return cosh;
        },
        get sinh() {
            return sinh;
        },
        get tanh() {
            return tanh;
        },
        get acosh() {
            return acosh;
        },
        get asinh() {
            return asinh;
        },
        get atanh() {
            return atanh;
        },
        get hypot() {
            return hypot;
        },
        get trunc() {
            return trunc;
        },
        get fround() {
            return fround;
        },
        get cbrt() {
            return cbrt;
        },
        get polyfillMath() {
            return polyfillMath;
        }
    };
});

System.get("traceur-runtime@0.0.81/src/runtime/polyfills/Math.js" + "");

System.registerModule("traceur-runtime@0.0.81/src/runtime/polyfills/polyfills.js", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.81/src/runtime/polyfills/polyfills.js";
    var polyfillAll = System.get("traceur-runtime@0.0.81/src/runtime/polyfills/utils.js").polyfillAll;
    polyfillAll(Reflect.global);
    var setupGlobals = $traceurRuntime.setupGlobals;
    $traceurRuntime.setupGlobals = function(global) {
        setupGlobals(global);
        polyfillAll(global);
    };
    return {};
});

System.get("traceur-runtime@0.0.81/src/runtime/polyfills/polyfills.js" + "");

System.registerModule("../../src/main/utils", [], function() {
    "use strict";
    var __moduleName = "../../src/main/utils";
    var ObjectUtil = function ObjectUtil() {};
    var $ObjectUtil = ObjectUtil;
    $traceurRuntime.createClass(ObjectUtil, {}, {
        computeDiff: function(original, modified) {
            var diff = {};
            if (_.isPlainObject(original) && _.isPlainObject(modified)) {
                Object.keys(modified).forEach(function(key) {
                    var propertyDiff;
                    if (!original.hasOwnProperty(key)) {
                        diff[key] = modified[key];
                    } else {
                        propertyDiff = $ObjectUtil.computeDiff(original[key], modified[key]);
                        if (propertyDiff) {
                            diff[key] = propertyDiff;
                        }
                    }
                });
                return _.isEqual(diff, {}) ? null : diff;
            } else {
                return _.isEqual(original, modified) ? null : modified;
            }
        },
        defineReadOnlyDataProperty: function(target, propName, propValue) {
            return Object.defineProperty(target, propName, {
                value: _.isUndefined(propValue) ? target[propName] : propValue,
                writable: false,
                configurable: true,
                enumerable: true
            });
        },
        defineAccessorProperty: function(target, propName, initialValue, validator) {
            var value = initialValue;
            validator = _.isFunction(validator) ? validator : function() {
                return true;
            };
            return Object.defineProperty(target, propName, {
                get: function() {
                    return value;
                },
                set: function(newValue) {
                    if (!validator(newValue)) {
                        throw new Error("Trying to set invalid value " + newValue + " for property " + propName);
                    }
                    value = newValue;
                },
                configurable: true,
                enumerable: true
            });
        },
        reduceApiLinks: function(linkArray) {
            return linkArray.reduce(function(result, link) {
                if (link.hasOwnProperty("rel")) {
                    result[link.rel] = link.href;
                }
                return result;
            }, {});
        }
    });
    return {
        get ObjectUtil() {
            return ObjectUtil;
        }
    };
});

System.registerModule("../../src/main/apiOptions", [], function() {
    "use strict";
    var __moduleName = "../../src/main/apiOptions";
    var ObjectUtil = System.get("../../src/main/utils").ObjectUtil;
    var options = {
        engineBaseUrl: [ "http://127.0.0.1:8080", "string" ],
        filterResults: [ true, "boolean" ]
    };
    Object.keys(options).forEach(function(name) {
        var initialValue = options[name][0];
        var validator = options[name][1];
        ObjectUtil.defineAccessorProperty(options, name, initialValue, function(value) {
            if (_.isString(validator)) {
                return typeof value === validator;
            } else if (_.isFunction(validator)) {
                return validator(value);
            }
            return true;
        });
    });
    var $__default = options;
    return {
        get default() {
            return $__default;
        }
    };
});

System.registerModule("../../src/main/constants", [], function() {
    "use strict";
    var __moduleName = "../../src/main/constants";
    var $__default = {
        http: {
            requestHeaders: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            xhr: {
                readyStateDone: 4
            }
        }
    };
    return {
        get default() {
            return $__default;
        }
    };
});

System.registerModule("../../src/main/services", [], function() {
    "use strict";
    var __moduleName = "../../src/main/services";
    var constants = System.get("../../src/main/constants").default;
    var Http = function Http() {};
    $traceurRuntime.createClass(Http, {}, {
        send: function($__2) {
            var $__3 = $__2, method = $__3.method, url = $__3.url, headers = $__3.headers, body = $__3.body;
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                method = method || "GET";
                url = url || "";
                headers = headers || {};
                body = body || null;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === constants.http.xhr.readyStateDone) {
                        if (xhr.status === 200) {
                            resolve(xhr.responseText);
                        } else {
                            reject(new Error("Request failed: " + xhr.statusText));
                        }
                    }
                };
                xhr.open(method, url, true);
                xhr.withCredentials = true;
                Object.keys(headers).forEach(function(name) {
                    var value = headers[name] && headers[name].toString();
                    xhr.setRequestHeader(name, value || "");
                });
                xhr.send(body);
            });
        }
    });
    return {
        get Http() {
            return Http;
        }
    };
});

System.registerModule("../../src/main/resources", [], function() {
    "use strict";
    var __moduleName = "../../src/main/resources";
    var apiOptions = System.get("../../src/main/apiOptions").default;
    var constants = System.get("../../src/main/constants").default;
    var Http = System.get("../../src/main/services").Http;
    var ObjectUtil = System.get("../../src/main/utils").ObjectUtil;
    function extractResourceData(rawData) {
        var resourceData = _.assign({}, rawData);
        ObjectUtil.defineReadOnlyDataProperty(resourceData, "id");
        ObjectUtil.defineReadOnlyDataProperty(resourceData, "href");
        var subCollections = ObjectUtil.reduceApiLinks(resourceData.link || []);
        delete resourceData.link;
        var actions = ObjectUtil.reduceApiLinks(resourceData.actions && resourceData.actions.link || []);
        delete resourceData.actions;
        return {
            resourceData: resourceData,
            subCollections: subCollections,
            actions: actions
        };
    }
    var Resource = function Resource($__6) {
        var rawData = $__6.rawData;
        var $__4 = this;
        var $__8 = extractResourceData(rawData), resourceData = $__8.resourceData, subCollections = $__8.subCollections, actions = $__8.actions;
        this.data = resourceData || {};
        this.originalData = _.cloneDeep(this.data);
        this.apiContextPath = this.data.href;
        Object.keys(subCollections).forEach(function(name) {
            $__4[name] = new ResourceCollection({
                apiContextPath: subCollections[name]
            });
        });
        Object.keys(actions).forEach(function(name) {
            $__4[name] = function(actionData) {
                return new ResourceOperation({
                    httpMethod: "POST",
                    httpBody: actionData,
                    apiContextPath: actions[name]
                });
            };
        });
    };
    var $Resource = Resource;
    $traceurRuntime.createClass(Resource, {
        update: function() {
            return new ResourceOperation({
                httpMethod: "PUT",
                httpBody: ObjectUtil.computeDiff(this.originalData, this.data),
                apiContextPath: this.apiContextPath,
                transformResult: $Resource.fromData
            });
        },
        "delete": function() {
            return new ResourceOperation({
                httpMethod: "DELETE",
                apiContextPath: this.apiContextPath
            });
        }
    }, {
        fromData: function(rawData) {
            return new $Resource({
                rawData: rawData
            });
        },
        arrayFromData: function(rawCollectionData) {
            var keys = Object.keys(rawCollectionData);
            var dataArray = keys.length === 1 ? rawCollectionData[keys[0]] : [];
            dataArray = Array.isArray(dataArray) ? dataArray : [];
            return dataArray.map($Resource.fromData);
        }
    });
    var ResourceCollection = function ResourceCollection($__6) {
        var apiContextPath = $__6.apiContextPath;
        this.apiContextPath = apiContextPath;
    };
    $traceurRuntime.createClass(ResourceCollection, {
        get: function(id) {
            return new ResourceOperation({
                httpMethod: "GET",
                apiContextPath: this.apiContextPath + "/" + id,
                transformResult: Resource.fromData
            });
        },
        list: function() {
            return new ResourceOperation({
                httpMethod: "GET",
                apiContextPath: this.apiContextPath,
                transformResult: Resource.arrayFromData
            });
        },
        add: function(data) {
            return new ResourceOperation({
                httpMethod: "POST",
                httpBody: data,
                apiContextPath: this.apiContextPath,
                transformResult: Resource.fromData
            });
        },
        "delete": function(id) {
            return new ResourceOperation({
                httpMethod: "DELETE",
                apiContextPath: this.apiContextPath + "/" + id
            });
        }
    }, {});
    function transformHttpBody(value) {
        if (_.isString(value)) {
            return value;
        } else if (_.isPlainObject(value)) {
            return JSON.stringify(value);
        }
        return null;
    }
    var ResourceOperation = function ResourceOperation($__6) {
        var $__7 = $__6, httpMethod = $__7.httpMethod, httpBody = $__7.httpBody, apiContextPath = $__7.apiContextPath, transformResult = $__7.transformResult;
        this.apiContextPath = apiContextPath;
        this.httpParams = {
            method: httpMethod,
            url: "" + apiOptions.engineBaseUrl + apiContextPath,
            headers: _.assign({
                Filter: apiOptions.filterResults
            }, constants.http.requestHeaders),
            body: transformHttpBody(httpBody)
        };
        this.transformResult = _.isFunction(transformResult) ? transformResult : _.identity;
    };
    $traceurRuntime.createClass(ResourceOperation, {
        run: function() {
            var $__4 = this;
            return Http.send(this.httpParams).then(function(responseText) {
                try {
                    var result = JSON.parse(responseText);
                    result = $__4.transformResult(result);
                    return result;
                } catch (e) {
                    throw new Error("Error while processing response", e);
                }
            });
        }
    }, {});
    return {
        get Resource() {
            return Resource;
        },
        get ResourceCollection() {
            return ResourceCollection;
        },
        get ResourceOperation() {
            return ResourceOperation;
        }
    };
});

System.registerModule("../../src/main/main.js", [], function() {
    "use strict";
    var __moduleName = "../../src/main/main.js";
    var apiOptions = System.get("../../src/main/apiOptions").default;
    var $__1 = System.get("../../src/main/resources"), ResourceCollection = $__1.ResourceCollection, ResourceOperation = $__1.ResourceOperation;
    var services = System.get("../../src/main/services");
    var ObjectUtil = System.get("../../src/main/utils").ObjectUtil;
    function initApi(rawData) {
        var linkArray = (rawData.link || []).filter(function(link) {
            return _.isString(link.rel) && !link.rel.endsWith("/search");
        });
        var topCollections = ObjectUtil.reduceApiLinks(linkArray);
        Object.keys(topCollections).forEach(function(name) {
            ovirt.api[name] = new ResourceCollection({
                apiContextPath: topCollections[name]
            });
        });
    }
    var ovirt = {
        svc: services,
        api: {
            options: apiOptions,
            init: function() {
                return new ResourceOperation({
                    httpMethod: "GET",
                    apiContextPath: "/ovirt-engine/api"
                }).run().then(initApi);
            }
        }
    };
    if (typeof window === "object") {
        window.ovirt = ovirt;
    }
    return {};
});

System.get("../../src/main/main.js" + "");
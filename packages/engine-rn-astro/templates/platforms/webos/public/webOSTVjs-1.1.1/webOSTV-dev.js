window.webOSDev = (function (e) {
    var r = {};
    function t(n) {
        if (r[n]) return r[n].exports;
        var i = (r[n] = { i: n, l: !1, exports: {} });
        return e[n].call(i.exports, i, i.exports, t), (i.l = !0), i.exports;
    }
    return (
        (t.m = e),
        (t.c = r),
        (t.d = function (e, r, n) {
            t.o(e, r) || Object.defineProperty(e, r, { enumerable: !0, get: n });
        }),
        (t.r = function (e) {
            'undefined' != typeof Symbol &&
                Symbol.toStringTag &&
                Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
                Object.defineProperty(e, '__esModule', { value: !0 });
        }),
        (t.t = function (e, r) {
            if ((1 & r && (e = t(e)), 8 & r)) return e;
            if (4 & r && 'object' == typeof e && e && e.__esModule) return e;
            var n = Object.create(null);
            if (
                (t.r(n),
                Object.defineProperty(n, 'default', { enumerable: !0, value: e }),
                2 & r && 'string' != typeof e)
            )
                for (var i in e)
                    t.d(
                        n,
                        i,
                        function (r) {
                            return e[r];
                        }.bind(null, i)
                    );
            return n;
        }),
        (t.n = function (e) {
            var r =
                e && e.__esModule
                    ? function () {
                          return e.default;
                      }
                    : function () {
                          return e;
                      };
            return t.d(r, 'a', r), r;
        }),
        (t.o = function (e, r) {
            return Object.prototype.hasOwnProperty.call(e, r);
        }),
        (t.p = ''),
        t((t.s = 0))
    );
})([
    function (e, r, t) {
        'use strict';
        function n(e, r) {
            var t = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                r &&
                    (n = n.filter(function (r) {
                        return Object.getOwnPropertyDescriptor(e, r).enumerable;
                    })),
                    t.push.apply(t, n);
            }
            return t;
        }
        function i(e) {
            for (var r = 1; r < arguments.length; r++) {
                var t = null != arguments[r] ? arguments[r] : {};
                r % 2
                    ? n(t, !0).forEach(function (r) {
                          o(e, r, t[r]);
                      })
                    : Object.getOwnPropertyDescriptors
                    ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
                    : n(t).forEach(function (r) {
                          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
                      });
            }
            return e;
        }
        function o(e, r, t) {
            return (
                r in e
                    ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[r] = t),
                e
            );
        }
        function u(e, r) {
            for (var t = 0; t < r.length; t++) {
                var n = r[t];
                (n.enumerable = n.enumerable || !1),
                    (n.configurable = !0),
                    'value' in n && (n.writable = !0),
                    Object.defineProperty(e, n.key, n);
            }
        }
        t.r(r);
        var c = {},
            a = (function () {
                function e() {
                    !(function (e, r) {
                        if (!(e instanceof r)) throw new TypeError('Cannot call a class as a function');
                    })(this, e),
                        (this.bridge = null),
                        (this.cancelled = !1),
                        (this.subscribe = !1);
                }
                var r, t, n;
                return (
                    (r = e),
                    (t = [
                        {
                            key: 'send',
                            value: function (e) {
                                var r = e.service,
                                    t = void 0 === r ? '' : r,
                                    n = e.method,
                                    o = void 0 === n ? '' : n,
                                    u = e.parameters,
                                    a = void 0 === u ? {} : u,
                                    s = e.onSuccess,
                                    l = void 0 === s ? function () {} : s,
                                    d = e.onFailure,
                                    f = void 0 === d ? function () {} : d,
                                    v = e.onComplete,
                                    p = void 0 === v ? function () {} : v,
                                    b = e.subscribe,
                                    m = void 0 !== b && b;
                                if (!window.PalmServiceBridge) {
                                    var h = {
                                        errorCode: -1,
                                        errorText: 'PalmServiceBridge is not found.',
                                        returnValue: !1,
                                    };
                                    return f(h), p(h), console.error('PalmServiceBridge is not found.'), this;
                                }
                                this.ts && c[this.ts] && delete c[this.ts];
                                var O,
                                    y = i({}, a);
                                return (
                                    (this.subscribe = m),
                                    this.subscribe && (y.subscribe = this.subscribe),
                                    y.subscribe && (this.subscribe = y.subscribe),
                                    (this.ts = Date.now()),
                                    (c[this.ts] = this),
                                    (this.bridge = new PalmServiceBridge()),
                                    (this.bridge.onservicecallback = this.callback.bind(this, l, f, p)),
                                    this.bridge.call(
                                        ('/' !== (O = t).slice(-1) && (O += '/'), O + o),
                                        JSON.stringify(y)
                                    ),
                                    this
                                );
                            },
                        },
                        {
                            key: 'callback',
                            value: function () {
                                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {},
                                    r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : function () {},
                                    t = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : function () {},
                                    n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : '';
                                if (!this.cancelled) {
                                    var i = {};
                                    try {
                                        i = JSON.parse(n);
                                    } catch (e) {
                                        i = { errorCode: -1, errorText: n, returnValue: !1 };
                                    }
                                    var o = i,
                                        u = o.errorCode,
                                        c = o.returnValue;
                                    u || !1 === c ? ((i.returnValue = !1), r(i)) : ((i.returnValue = !0), e(i)),
                                        t(i),
                                        this.subscribe || this.cancel();
                                }
                            },
                        },
                        {
                            key: 'cancel',
                            value: function () {
                                (this.cancelled = !0),
                                    null !== this.bridge && (this.bridge.cancel(), (this.bridge = null)),
                                    this.ts && c[this.ts] && delete c[this.ts];
                            },
                        },
                    ]) && u(r.prototype, t),
                    n && u(r, n),
                    e
                );
            })(),
            s = { BROWSER: 'APP_BROWSER' },
            l = function (e) {
                var r = e.id,
                    t = void 0 === r ? '' : r,
                    n = e.params,
                    i = void 0 === n ? {} : n,
                    o = e.onSuccess,
                    u = void 0 === o ? function () {} : o,
                    c = e.onFailure,
                    l = void 0 === c ? function () {} : c,
                    d = { id: t, params: i };
                s.BROWSER === t &&
                    ((d.params.target = i.target || ''), (d.params.fullMode = !0), (d.id = 'com.webos.app.browser')),
                    (function (e) {
                        var r = e.parameters,
                            t = e.onSuccess,
                            n = e.onFailure;
                        new a().send({
                            service: 'luna://com.webos.applicationManager',
                            method: 'launch',
                            parameters: r,
                            onComplete: function (e) {
                                var r = e.returnValue,
                                    i = e.errorCode,
                                    o = e.errorText;
                                return !0 === r ? t() : n({ errorCode: i, errorText: o });
                            },
                        });
                    })({ parameters: d, onSuccess: u, onFailure: l });
            },
            d = function () {
                var e = {};
                if (window.PalmSystem && '' !== window.PalmSystem.launchParams)
                    try {
                        e = JSON.parse(window.PalmSystem.launchParams);
                    } catch (e) {
                        console.error('JSON parsing error');
                    }
                return e;
            },
            f = function () {
                return window.PalmSystem && window.PalmSystem.identifier
                    ? window.PalmSystem.identifier.split(' ')[0]
                    : '';
            };
        function v(e, r) {
            var t = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                r &&
                    (n = n.filter(function (r) {
                        return Object.getOwnPropertyDescriptor(e, r).enumerable;
                    })),
                    t.push.apply(t, n);
            }
            return t;
        }
        function p(e) {
            for (var r = 1; r < arguments.length; r++) {
                var t = null != arguments[r] ? arguments[r] : {};
                r % 2
                    ? v(t, !0).forEach(function (r) {
                          b(e, r, t[r]);
                      })
                    : Object.getOwnPropertyDescriptors
                    ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
                    : v(t).forEach(function (r) {
                          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
                      });
            }
            return e;
        }
        function b(e, r, t) {
            return (
                r in e
                    ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[r] = t),
                e
            );
        }
        function m(e, r) {
            for (var t = 0; t < r.length; t++) {
                var n = r[t];
                (n.enumerable = n.enumerable || !1),
                    (n.configurable = !0),
                    'value' in n && (n.writable = !0),
                    Object.defineProperty(e, n.key, n);
            }
        }
        var h = {
                NOT_ERROR: -1,
                CLIENT_NOT_LOADED: 0,
                VENDOR_ERROR: 500,
                API_NOT_SUPPORTED: 501,
                WRONG_CLIENT_ID: 502,
                KEY_NOT_FOUND: 503,
                INVALID_PARAMS: 504,
                UNSUPPORTED_DRM_TYPE: 505,
                INVALID_KEY_FORMAT: 506,
                INVALID_TIME_INFO: 507,
                UNKNOWN_ERROR: 599,
            },
            O = { PLAYREADY: 'playready', WIDEVINE: 'widevine' },
            y = { UNLOADED: 0, LOADING: 1, LOADED: 2, UNLOADING: 3 },
            g = function (e) {
                var r = e.method,
                    t = e.parameters,
                    n = e.onComplete;
                new a().send({ service: 'luna://com.webos.service.drm', onComplete: n, method: r, parameters: t });
            },
            D = function () {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function () {},
                    r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                setTimeout(function () {
                    return e(r);
                }, 0);
            },
            w = function (e) {
                return e.state === y.LOADED && '' !== e.getClientId();
            },
            P = function (e, r) {
                var t = r.errorCode,
                    n = void 0 === t ? h.UNKNOWN_ERROR : t,
                    i = r.errorText,
                    o = { errorCode: n, errorText: void 0 === i ? 'Unknown error.' : i };
                return e.setError(o), o;
            },
            E = { errorCode: h.CLIENT_NOT_LOADED, errorText: 'DRM client is not loaded.' },
            S = (function () {
                function e(r) {
                    !(function (e, r) {
                        if (!(e instanceof r)) throw new TypeError('Cannot call a class as a function');
                    })(this, e),
                        (this.clientId = ''),
                        (this.drmType = r),
                        (this.errorCode = h.NOT_ERROR),
                        (this.errorText = ''),
                        (this.state = y.UNLOADED);
                }
                var r, t, n;
                return (
                    (r = e),
                    (t = [
                        {
                            key: 'getClientId',
                            value: function () {
                                return this.clientId;
                            },
                        },
                        {
                            key: 'getDrmType',
                            value: function () {
                                return this.drmType;
                            },
                        },
                        {
                            key: 'getErrorCode',
                            value: function () {
                                return this.errorCode;
                            },
                        },
                        {
                            key: 'getErrorText',
                            value: function () {
                                return this.errorText;
                            },
                        },
                        {
                            key: 'setError',
                            value: function (e) {
                                var r = e.errorCode,
                                    t = e.errorText;
                                (this.errorCode = r), (this.errorText = t);
                            },
                        },
                        {
                            key: 'isLoaded',
                            value: function (e) {
                                var r = this,
                                    t = e.onSuccess,
                                    n = void 0 === t ? function () {} : t,
                                    i = e.onFailure,
                                    o = void 0 === i ? function () {} : i;
                                g({
                                    method: 'isLoaded',
                                    parameters: { appId: f() },
                                    onComplete: function (e) {
                                        if (!0 === e.returnValue) {
                                            if (
                                                ((r.clientId = e.clientId || ''),
                                                (r.state = e.loadStatus ? y.LOADED : y.UNLOADED),
                                                !0 === e.loadStatus && e.drmType !== r.drmType)
                                            ) {
                                                var t = {
                                                    errorCode: h.UNKNOWN_ERROR,
                                                    errorText: 'DRM types of set and loaded are not matched.',
                                                };
                                                return o(P(r, t));
                                            }
                                            var i = p({}, e);
                                            return delete i.returnValue, n(i);
                                        }
                                        return o(P(r, e));
                                    },
                                });
                            },
                        },
                        {
                            key: 'load',
                            value: function (e) {
                                var r = this,
                                    t = e.onSuccess,
                                    n = void 0 === t ? function () {} : t,
                                    i = e.onFailure,
                                    o = void 0 === i ? function () {} : i;
                                if (this.state !== y.LOADING && this.state !== y.LOADED) {
                                    var u = { appId: f(), drmType: this.drmType };
                                    (this.state = y.LOADING),
                                        g({
                                            method: 'load',
                                            onComplete: function (e) {
                                                return !0 === e.returnValue
                                                    ? ((r.clientId = e.clientId),
                                                      (r.state = y.LOADED),
                                                      n({ clientId: r.clientId }))
                                                    : o(P(r, e));
                                            },
                                            parameters: u,
                                        });
                                } else D(n, { isLoaded: !0, clientId: this.clientId });
                            },
                        },
                        {
                            key: 'unload',
                            value: function (e) {
                                var r = this,
                                    t = e.onSuccess,
                                    n = void 0 === t ? function () {} : t,
                                    i = e.onFailure,
                                    o = void 0 === i ? function () {} : i;
                                if (w(this)) {
                                    var u = { clientId: this.clientId };
                                    (this.state = y.UNLOADING),
                                        g({
                                            method: 'unload',
                                            onComplete: function (e) {
                                                return !0 === e.returnValue
                                                    ? ((r.clientId = ''), (r.state = y.UNLOADED), n())
                                                    : o(P(r, e));
                                            },
                                            parameters: u,
                                        });
                                } else D(o, P(this, E));
                            },
                        },
                        {
                            key: 'getRightsError',
                            value: function (e) {
                                var r = this,
                                    t = e.onSuccess,
                                    n = void 0 === t ? function () {} : t,
                                    i = e.onFailure,
                                    o = void 0 === i ? function () {} : i;
                                w(this)
                                    ? g({
                                          method: 'getRightsError',
                                          parameters: { clientId: this.clientId, subscribe: !0 },
                                          onComplete: function (e) {
                                              if (!0 === e.returnValue) {
                                                  var t = p({}, e);
                                                  return delete t.returnValue, n(t);
                                              }
                                              return o(P(r, e));
                                          },
                                      })
                                    : D(o, P(this, E));
                            },
                        },
                        {
                            key: 'sendDrmMessage',
                            value: function (e) {
                                var r = this,
                                    t = e.msg,
                                    n = void 0 === t ? '' : t,
                                    i = e.onSuccess,
                                    o = void 0 === i ? function () {} : i,
                                    u = e.onFailure,
                                    c = void 0 === u ? function () {} : u;
                                if (w(this)) {
                                    var a = (function (e) {
                                            var r = '',
                                                t = '';
                                            switch (e) {
                                                case O.PLAYREADY:
                                                    (r = 'application/vnd.ms-playready.initiator+xml'),
                                                        (t = 'urn:dvb:casystemid:19219');
                                                    break;
                                                case O.WIDEVINE:
                                                    (r = 'application/widevine+xml'), (t = 'urn:dvb:casystemid:19156');
                                            }
                                            return { msgType: r, drmSystemId: t };
                                        })(this.drmType),
                                        s = p({ clientId: this.clientId, msg: n }, a);
                                    g({
                                        method: 'sendDrmMessage',
                                        onComplete: function (e) {
                                            if (!0 === e.returnValue) {
                                                var t = p({}, e);
                                                return delete t.returnValue, o(t);
                                            }
                                            return c(P(r, e));
                                        },
                                        parameters: s,
                                    });
                                } else D(c, P(this, E));
                            },
                        },
                    ]) && m(r.prototype, t),
                    n && m(r, n),
                    e
                );
            })(),
            I = { Error: h, Type: O },
            T = function () {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '';
                return '' === e ? null : new S(e);
            };
        function N(e, r) {
            var t = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                r &&
                    (n = n.filter(function (r) {
                        return Object.getOwnPropertyDescriptor(e, r).enumerable;
                    })),
                    t.push.apply(t, n);
            }
            return t;
        }
        function R(e, r, t) {
            return (
                r in e
                    ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[r] = t),
                e
            );
        }
        var j = function (e) {
                var r = e.service,
                    t = e.subscribe,
                    n = e.onSuccess,
                    i = e.onFailure;
                new a().send({
                    service: r,
                    method: 'getStatus',
                    parameters: { subscribe: t },
                    onComplete: function (e) {
                        var r = (function (e) {
                            for (var r = 1; r < arguments.length; r++) {
                                var t = null != arguments[r] ? arguments[r] : {};
                                r % 2
                                    ? N(t, !0).forEach(function (r) {
                                          R(e, r, t[r]);
                                      })
                                    : Object.getOwnPropertyDescriptors
                                    ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
                                    : N(t).forEach(function (r) {
                                          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
                                      });
                            }
                            return e;
                        })({}, e);
                        if ((delete r.returnValue, !0 === e.returnValue)) return delete r.subscribe, void n(r);
                        delete r.returnValue, i(r);
                    },
                });
            },
            C = {
                getStatus: function (e) {
                    var r = e.onSuccess,
                        t = void 0 === r ? function () {} : r,
                        n = e.onFailure,
                        i = void 0 === n ? function () {} : n,
                        o = e.subscribe,
                        u = void 0 !== o && o,
                        c = 'webos.service';
                    navigator.userAgent.indexOf('537.41') > -1 && (c = 'palm'),
                        j({
                            service: 'luna://com.'.concat(c, '.connectionmanager'),
                            subscribe: u,
                            onSuccess: t,
                            onFailure: i,
                        });
                },
            },
            A = function (e) {
                var r = e.onSuccess,
                    t = void 0 === r ? function () {} : r,
                    n = e.onFailure,
                    i = void 0 === n ? function () {} : n;
                -1 !== navigator.userAgent.indexOf('Chrome')
                    ? new a().send({
                          service: 'luna://com.webos.service.sm',
                          method: 'deviceid/getIDs',
                          parameters: { idType: ['LGUDID'] },
                          onComplete: function (e) {
                              if (!0 !== e.returnValue) i({ errorCode: e.errorCode, errorText: e.errorText });
                              else {
                                  var r = e.idList.filter(function (e) {
                                      return 'LGUDID' === e.idType;
                                  })[0].idValue;
                                  t({ id: r });
                              }
                          },
                      })
                    : setTimeout(function () {
                          return i({ errorCode: 'ERROR.000', errorText: 'Not supported.' });
                      }, 0);
            };
        t.d(r, 'APP', function () {
            return s;
        }),
            t.d(r, 'connection', function () {
                return C;
            }),
            t.d(r, 'DRM', function () {
                return I;
            }),
            t.d(r, 'drmAgent', function () {
                return T;
            }),
            t.d(r, 'launch', function () {
                return l;
            }),
            t.d(r, 'launchParams', function () {
                return d;
            }),
            t.d(r, 'LGUDID', function () {
                return A;
            });
    },
]);

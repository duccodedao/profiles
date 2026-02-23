(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[3], {
    9171: function(e, t, n) {
        "use strict";
        let r;
        n.d(t, {
            I8: function() {
                return a
            },
            Sn: function() {
                return r
            },
            xS: function() {
                return c.xS
            }
        });
        var s = n(5236)
          , o = n(5186)
          , c = n(6314);
        let i = (0,
        s.ZF)({
            apiKey: "AIzaSyDC9e3zt2UCR71oQATpyy6rNe6n_a7JTPM",
            authDomain: "app.unich.com",
            projectId: "unich-7e874",
            messagingSenderId: "361374750236",
            appId: "1:361374750236:web:be89b0735d3d7e8f30f1d9",
            measurementId: "G-5PK8EJTE8Z"
        })
          , a = (0,
        o.v0)(i);
        r = (0,
        c.sN)(i),
        (r = (0,
        c.sN)(i)).settings.minimumFetchIntervalMillis = 0,
        r.settings.fetchTimeoutMillis = 6e4
    },
    2375: function(e, t, n) {
        "use strict";
        n.d(t, {
            $y: function() {
                return f
            },
            Cm: function() {
                return d
            },
            OZ: function() {
                return c
            },
            Zj: function() {
                return l
            },
            jv: function() {
                return h
            },
            oL: function() {
                return s
            },
            pF: function() {
                return u
            },
            uN: function() {
                return m
            },
            uV: function() {
                return o
            },
            x6: function() {
                return a
            },
            zW: function() {
                return i
            }
        });
        var r = n(1449);
        let s = e => {
            switch (e > 0) {
            case e < 1e6:
                return .25;
            case e >= 1e6 && e < 2e6:
                return .3;
            case e >= 2e6 && e < 5e6:
                return .35;
            case e >= 5e6 && e < 1e7:
                return .4;
            case e >= 1e7:
                return .5;
            default:
                return 0
            }
        }
          , o = e => e <= 10 ? 5 * e : e <= 20 ? 50 + (e - 10) * 5 : e <= 30 ? 100 + (e - 20) * 40 : e <= 40 ? 500 + (e - 30) * 450 : e <= 50 ? 5e3 + (e - 40) * 4500 : 5e4
          , c = e => e <= 50 ? e / 5 : e <= 100 ? 10 + (e - 50) / 5 : e <= 500 ? 20 + (e - 100) / 40 : e <= 5e3 ? 30 + (e - 500) / 450 : e <= 5e4 ? 40 + (e - 5e3) / 4500 : 50
          , i = new Intl.NumberFormat("en-US")
          , a = e => e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          , u = e => {
            let t = e => e.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return Math.abs(e) >= 1e15 ? t((e / 1e15).toFixed(1).replace(/\.0$/, "")) + "G" : Math.abs(e) >= 1e12 ? t((e / 1e12).toFixed(1).replace(/\.0$/, "")) + "T" : Math.abs(e) >= 1e9 ? t((e / 1e9).toFixed(1).replace(/\.0$/, "")) + "B" : Math.abs(e) >= 1e6 ? t((e / 1e6).toFixed(1).replace(/\.0$/, "")) + "M" : e.toLocaleString("en-US", {})
        }
          , l = ["gmail.com", "qq.com", "163.com", "126.com", "sina.cn", "sina.com", "mail.ru", "yandex.ru", "rambler.ru", "vk.com", "naver.com", "daum.net", "nate.com", "kakao.com", "skype.com", "outlook.com", "hotmail.com", "yahoo.com"]
          , d = e => {
            let[t,n,r] = e.split("/").map(Number)
              , s = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return r === new Date().getFullYear() ? "".concat(t, " ").concat(s[n - 1]) : "".concat(t, " ").concat(s[n - 1], " ").concat(r)
        }
          , f = e => {
            !["Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete", "Tab"].includes(e.key) && isNaN(Number(e.key)) && e.preventDefault()
        }
          , m = e => {
            document.cookie = r.serialize("AIRDROP_token", e.accessToken, {
                maxAge: e.accessTokenExpireAt,
                path: "/"
            }),
            document.cookie = r.serialize("AIRDROP_accessTokenExpireAt", e.accessTokenExpireAt, {
                maxAge: e.accessTokenExpireAt,
                path: "/"
            }),
            document.cookie = r.serialize("AIRDROP_refreshToken", e.refreshToken, {
                maxAge: e.refreshTokenExpireAt,
                path: "/"
            }),
            document.cookie = r.serialize("AIRDROP_refreshTokenExpireAt", e.refreshTokenExpireAt, {
                maxAge: e.refreshTokenExpireAt,
                path: "/"
            })
        }
          , h = () => {
            document.cookie = r.serialize("AIRDROP_token", "", {
                maxAge: -1,
                path: "/"
            }),
            document.cookie = r.serialize("AIRDROP_refreshToken", "", {
                maxAge: -1,
                path: "/"
            }),
            document.cookie = r.serialize("AIRDROP_accessTokenExpireAt", "", {
                maxAge: -1,
                path: "/"
            }),
            document.cookie = r.serialize("AIRDROP_refreshTokenExpireAt", "", {
                maxAge: -1,
                path: "/"
            })
        }
    },
    5990: function(e, t, n) {
        "use strict";
        n.d(t, {
            $y: function() {
                return r.$y
            },
            Cm: function() {
                return r.Cm
            },
            OZ: function() {
                return r.OZ
            },
            Zj: function() {
                return r.Zj
            },
            jv: function() {
                return r.jv
            },
            oL: function() {
                return r.oL
            },
            pF: function() {
                return r.pF
            },
            uN: function() {
                return r.uN
            },
            uV: function() {
                return r.uV
            },
            x6: function() {
                return r.x6
            },
            zW: function() {
                return r.zW
            }
        });
        var r = n(2375)
    },
    8378: function(e, t, n) {
        "use strict";
        n.d(t, {
            u: function() {
                return i
            }
        });
        var r = n(5990)
          , s = n(481)
          , o = n(8472)
          , c = n(1449);
        o.Z.create({
            baseURL: "https://api.unich.com/airdrop/user/v1",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let i = o.Z.create({
            baseURL: "https://api.unich.com/airdrop/user/v1",
            headers: {
                "Content-Type": "application/json"
            }
        });
        i.interceptors.request.use(e => {
            {
                let t = c.parse(document.cookie).AIRDROP_token;
                t && (e.headers.Authorization = "Bearer ".concat(t))
            }
            return e
        }
        , e => Promise.reject(e)),
        i.interceptors.response.use(e => e, e => {
            var t, n, o, c, i;
            return (null === (t = e.response) || void 0 === t ? void 0 : t.data.code) === "UNAUTHORIZED" && ((0,
            r.jv)(),
            localStorage.clear(),
            window.location.href = "/airdrop/sign-in?isClear=true"),
            (null === (n = e.response) || void 0 === n ? void 0 : n.status) === 503 && (0,
            s.l)({
                message: "Service Unavailable",
                state: "error"
            }),
            (null === (o = e.response) || void 0 === o ? void 0 : o.status) && (null === (c = e.response) || void 0 === c ? void 0 : c.status) >= 500 && (0,
            s.l)({
                message: "Something went wrong",
                state: "error"
            }),
            Promise.reject({
                ...null === (i = e.response) || void 0 === i ? void 0 : i.data
            })
        }
        )
    },
    9303: function(e, t, n) {
        "use strict";
        n.d(t, {
            e: function() {
                return i
            }
        });
        var r = n(6059)
          , s = n(9099)
          , o = n(9291)
          , c = n(8378);
        let i = (0,
        s.Ue)()((0,
        o.mW)((0,
        o.tJ)(e => ({
            userInfo: null,
            setUserInfo: () => {
                let t = async () => {
                    let t = await c.u.get("/info/my-info");
                    e( () => ({
                        userInfo: t.data.data
                    }))
                }
                ;
                (0,
                r.e)("AIRDROP_token") && t()
            }
            ,
            setRemoveUserInfo: () => {
                e( () => ({
                    userInfo: null
                }))
            }
        }), {
            name: "user-info-storage"
        })))
    },
    1838: function(e, t, n) {
        "use strict";
        n.d(t, {
            BreadcumbsPage: function() {
                return o
            }
        });
        var r = n(7437)
          , s = n(7138);
        n(2265);
        let o = e => {
            let {title: t} = e;
            return (0,
            r.jsx)("div", {
                className: "text-sm breadcrumbs",
                children: (0,
                r.jsx)("ul", {
                    children: t.map(e => (0,
                    r.jsx)("li", {
                        children: (0,
                        r.jsx)(s.default, {
                            href: e.href,
                            children: e.name
                        })
                    }, e.href))
                })
            })
        }
    },
    8773: function(e, t, n) {
        "use strict";
        n.d(t, {
            Button: function() {
                return o
            }
        });
        var r = n(7437);
        n(2265);
        var s = n(7138);
        n(4279);
        let o = e => {
            let {className: t="btn btn-primary", size: n="btn-xs", href: o, children: c, type: i, loading: a, id: u, onClick: l, ...d} = e
              , f = "".concat("btn-".concat(n), " ").concat(t, " relative h-auto inline-flex items-center justify-center transition-colors ") + function() {
                let e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                return e ? "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0" : "focus:outline-none"
            }(!0);
            return o ? (0,
            r.jsx)(s.default, {
                href: o,
                className: f,
                onClick: l,
                children: c || "This is Link"
            }) : (0,
            r.jsxs)("button", {
                className: f,
                type: i,
                id: u,
                onClick: l,
                ...d,
                children: [a && (0,
                r.jsx)("span", {
                    className: "loading loading-spinner loading-xs"
                }), c || "This is Button"]
            })
        }
    },
    9878: function(e, t, n) {
        "use strict";
        n.d(t, {
            I: function() {
                return o
            }
        });
        var r = n(7437)
          , s = n(2265);
        n(8502);
        let o = (0,
        s.forwardRef)( (e, t) => {
            let {label: n={}, suffix: s=null, className: o="", ...c} = e;
            return (0,
            r.jsxs)("div", {
                children: [(0,
                r.jsxs)("div", {
                    className: "label",
                    children: [(0,
                    r.jsx)("span", {
                        className: "font-medium label-text color-neutral-100 text-body4",
                        children: n.topLeft
                    }), (0,
                    r.jsx)("span", {
                        className: "label-text-alt color-neutral-100 text-body4",
                        children: n.topRight
                    })]
                }), (0,
                r.jsxs)("label", {
                    className: "".concat(o, " input flex items-center gap-2"),
                    children: [c.prefix, (0,
                    r.jsx)("input", {
                        ref: t,
                        className: o ? "w-full color-neutral-100 " + o : "w-full color-neutral-100",
                        autoComplete: "off",
                        ...c
                    }), s]
                }), (0,
                r.jsxs)("div", {
                    className: "label",
                    children: [(0,
                    r.jsx)("span", {
                        className: "label-text-alt text-body5 color-error-default",
                        children: n.botLeft
                    }), (0,
                    r.jsx)("span", {
                        className: "label-text-alt color-neutral-100",
                        children: n.botRight
                    })]
                })]
            })
        }
        );
        o.displayName = "Input"
    },
    9886: function(e, t, n) {
        "use strict";
        n.d(t, {
            Popup: function() {
                return a
            }
        });
        var r = n(7437)
          , s = n(9834)
          , o = n(481)
          , c = n(1348)
          , i = n(6648);
        n(7891);
        let a = e => {
            let {onCloseDialog: t, children: n} = e;
            return (0,
            r.jsx)("div", {
                className: "bg-backdrop h-screen w-screen",
                children: (0,
                r.jsx)(c.Vq, {
                    open: !0,
                    onClose: () => t(),
                    className: "relative z-50",
                    children: (0,
                    r.jsx)("div", {
                        className: "fixed inset-0 flex items-center justify-center p-4",
                        children: (0,
                        r.jsxs)(c.EM, {
                            className: "relative *:max-w-[520px] space-y-4 bg-popup-success",
                            children: [(0,
                            r.jsx)(o.zx, {
                                className: "btn btn-ghost right-4 top-4 btn-circle !absolute",
                                children: (0,
                                r.jsx)(i.default, {
                                    className: "pointer-events-none",
                                    src: s.Z,
                                    alt: "icon-close"
                                })
                            }), n]
                        })
                    })
                })
            })
        }
    },
    635: function(e, t, n) {
        "use strict";
        n.d(t, {
            l: function() {
                return l
            },
            yt: function() {
                return d
            }
        });
        var r = n(7437)
          , s = n(4902)
          , o = n(7415)
          , c = n(9688)
          , i = n(6648)
          , a = n(6592);
        n(7945);
        let u = e => {
            let {message: t, state: n, title: a} = e;
            return (0,
            r.jsxs)("div", {
                className: "flex flex-row gap-4 px-4 py-3 rounded-sm justify-between items-center\n      ".concat("success" === n ? "bg-toast-success" : "warning" === n ? "bg-toast-warning" : "bg-toast-error"),
                children: [(0,
                r.jsx)("div", {
                    children: "success" === n ? (0,
                    r.jsx)(i.default, {
                        className: "pointer-events-none",
                        src: o.default,
                        alt: "toast-success"
                    }) : "warning" === n ? (0,
                    r.jsx)(i.default, {
                        className: "pointer-events-none",
                        src: c.default,
                        alt: "toast-warning"
                    }) : (0,
                    r.jsx)(i.default, {
                        className: "pointer-events-none",
                        src: s.default,
                        alt: "toast-error"
                    })
                }), (0,
                r.jsxs)("div", {
                    className: "flex flex-col",
                    children: [(0,
                    r.jsx)("p", {
                        className: "font-semibold color-neutral-100 text-body3",
                        children: a || ("success" === n ? " Successfully" : "warning" === n ? " Warning" : " Error")
                    }), (0,
                    r.jsx)("p", {
                        className: "font-normal color-neutral-100 text-body4",
                        children: t
                    })]
                })]
            })
        }
          , l = e => {
            let {message: t, state: n, title: s} = e;
            t && a.toast.custom((0,
            r.jsx)(u, {
                message: t,
                state: n,
                title: s
            }), {
                duration: 5e3
            })
        }
          , d = () => (0,
        r.jsx)(a.Toaster, {
            position: "bottom-right",
            reverseOrder: !0
        })
    },
    481: function(e, t, n) {
        "use strict";
        n.d(t, {
            zx: function() {
                return r.Button
            },
            yt: function() {
                return l.yt
            },
            II: function() {
                return o.I
            },
            TR: function() {
                return u
            },
            l: function() {
                return l.l
            }
        }),
        n(1838);
        var r = n(8773)
          , s = n(7437);
        n(2265).forwardRef( (e, t) => {
            let {className: n, ...r} = e;
            return (0,
            s.jsx)("input", {
                type: "checkbox",
                className: "".concat(n, " checkbox border-[#40475C] checked:bg-[#FF9A0D] [--chkbg:#FF9A0D] [--chkfg:white]"),
                ref: t,
                ...r
            })
        }
        ).displayName = "Checkbox";
        var o = n(9878)
          , c = n(9329)
          , i = n(7138)
          , a = n(6648);
        let u = e => {
            let {img: t=c.default, className: n="flex-shrink-0"} = e;
            return (0,
            s.jsx)(i.default, {
                href: "/",
                className: "inline-block text-slate-600 ".concat(n),
                children: (0,
                s.jsx)(a.default, {
                    className: "pointer-events-none block h-8 ",
                    src: t,
                    alt: "Logo",
                    priority: !0
                })
            })
        }
        ;
        n(9886);
        var l = n(635)
    },
    6059: function(e, t, n) {
        "use strict";
        n.d(t, {
            e: function() {
                return r
            }
        });
        let r = e => {
            let t = document.cookie;
            if (!t)
                return null;
            let n = "".concat(e, "=");
            for (let e of t.split("; "))
                if (e.startsWith(n))
                    return e.substring(n.length);
            return null
        }
    },
    762: function(e, t, n) {
        "use strict";
        n.d(t, {
            cn: function() {
                return o
            },
            t: function() {
                return c
            }
        });
        var r = n(4839)
          , s = n(6164);
        function o() {
            for (var e = arguments.length, t = Array(e), n = 0; n < e; n++)
                t[n] = arguments[n];
            return (0,
            s.m6)((0,
            r.W)(t))
        }
        function c(e) {
            return "https://".concat("cdn-v2.unichwallet.com", "/images/airdrop/").concat(e)
        }
    },
    4279: function() {},
    8502: function() {},
    7891: function() {},
    7945: function() {},
    9329: function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = {
            src: "https://cdn-v2.unichwallet.com/runtime/airdrop/_next/static/media/logo-unich.e26cd63c.svg",
            height: 24,
            width: 96,
            blurWidth: 0,
            blurHeight: 0
        }
    },
    9834: function(e, t) {
        "use strict";
        t.Z = {
            src: "https://cdn-v2.unichwallet.com/runtime/airdrop/_next/static/media/close-popup-button.d03aa8d8.svg",
            height: 24,
            width: 24,
            blurWidth: 0,
            blurHeight: 0
        }
    },
    4902: function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = {
            src: "https://cdn-v2.unichwallet.com/runtime/airdrop/_next/static/media/toast-error.5b324792.svg",
            height: 24,
            width: 24,
            blurWidth: 0,
            blurHeight: 0
        }
    },
    7415: function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = {
            src: "https://cdn-v2.unichwallet.com/runtime/airdrop/_next/static/media/toast-success.719ebc3a.svg",
            height: 24,
            width: 24,
            blurWidth: 0,
            blurHeight: 0
        }
    },
    9688: function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = {
            src: "https://cdn-v2.unichwallet.com/runtime/airdrop/_next/static/media/toast-warning.91713b45.svg",
            height: 24,
            width: 24,
            blurWidth: 0,
            blurHeight: 0
        }
    }
}]);

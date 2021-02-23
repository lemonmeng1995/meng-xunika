const pages = [
    {
        path: "/v3/login",
        name: "v3Login",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v3/Index.vue")
    },
    {
        path: "/v3/index",
        name: "v3CardList",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v3/cardList.vue")
    },
    {
        path: "/v3/My",
        name: "v3My",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v3/My.vue")
    },
    {
        path: "/v3/CardDetails",
        name: "v3CardDetails",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v3/cardDetails.vue")
    },
    {
        path: "/v3/QRcode",
        name: "v3QRcode",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v3/QRcode.vue")
    },
    {
        path: '/v3/result',
        name: 'Result',
        component: () => import(/* webpackChunkName: "err" */ '../../views/v3/Result.vue')
    },
    {
        path: '/v3/explain',
        name: 'v3Explain',
        component: () => import(/* webpackChunkName: "err" */ '../../views/v3/Explain.vue')
    },
    {
        path: '/v3/activityAnnounc',
        name: 'v3ActivityAnnounc',
        component: () => import(/* webpackChunkName: "err" */ '../../views/v3/ActivityAnnounc.vue')
    }
]

export default pages
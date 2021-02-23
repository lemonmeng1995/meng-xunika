var pages = [
    {
        path: "/v2/login",
        name: "V2Login",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v2/Login.vue")
    },
    {
        path: "/v2/index",
        name: "V2Index",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v2/Index.vue")
    },
    {
        path: "/v2/activation",
        name: "V2Activation",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v2/Activation.vue")
    },
    {
        path: "/v2/cardDetails",
        name: "V2CardDetails",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v2/cardDetails.vue")
    },
    {
        path: "/v2/my",
        name: "V2My",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v2/My.vue")
    },
    {
        path: "/v2/loading",
        name: "V2Loading",
        component: () =>
            import(/* webpackChunkName: "about" */ "../../views/v2/Loading.vue")
    },
    {
        path: '/v2/result',
        name: 'Result',
        component: () => import(/* webpackChunkName: "err" */ '../../views/v2/Result.vue')
    }
]

export default pages
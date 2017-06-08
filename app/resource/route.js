const makeRoute = (...args) => {
    let route = args.join('/');
    return route[0] == '/' ? route : `/${route}`;
};

export default {
    $: makeRoute,

    home: '/home',
    about: '/about',

    $default: () => {
        return '/home';
    }
};

import Susanin from 'susanin';

export function create(routes) {
    const susanin = new Susanin();
    /*
    routes.forEach((reactRoute) => {
        const susaninRoute = susaninRoutes(reactRoute);

        susaninRoute.forEach(function(sRoute) {
            console.log('susanin.addRoute', sRoute);
            susanin.addRoute(sRoute);
        })

    });
    */
    const result = [];
    reactRoutesToSusanin(result, routes);
    result.forEach((route) => susanin.addRoute(route));

    return susanin;
}

export function locationToState(susanin, location) {
    const route = susanin.findFirst(location.pathname);
    if (route) {
        return {
            routes: getRouteDataFromSusanin(route[0]),
            params: route[1]
        };
    }
}

function getRouteDataFromSusanin(route) {
    const data = route.getData();
    const result = [
        ...collectParents(data)
    ];
    result.push(data.route);
    if (data.route.indexRoute) {
        result.push(data.route.indexRoute);
    }

    return result;
}

function collectParents(route, result = []) {
    if (route.parentRoute) {
        result.unshift(route.parentRoute);
        return collectParents(route.parentRoute, result);
    }
    return result;
}

function reactRoutesToSusanin(result, routes, parentRoute) {
    routes.forEach(function(route) {
        if (route.childRoutes) {
            result.push(...reactRoutesToSusanin(result, route.childRoutes, Object.assign({}, route, {parentRoute: parentRoute})));
        }

        if (parentRoute) {
            const parentPath = parentRoute.path || '/';
            result.push({
                name: route.name,
                pattern: preparePattern(parentPath + '/' + route.path),
                data: {
                    ...route.data,
                    route,
                    parentRoute
                }
            });
        }

        const indexRoute = route.indexRoute;
        if (indexRoute) {
            result.push({
                name: indexRoute.name,
                pattern: preparePattern(indexRoute.path || route.path),
                data: {
                    route: indexRoute,
                    parentRoute: route
                }
            })
        }
    });
}

function preparePattern(reactPath) {
    return reactParamsToSusanin(removeDoubleSlash(reactPath));
}

const REACT_PARAM_RE = /:([-_a-z]+)/ig;

function reactParamsToSusanin(string) {
    return string.replace(REACT_PARAM_RE, '<$1>')
}

function removeDoubleSlash(string) {
    const newString = string.replace('//', '/');
    if (newString !== string) {
        return removeDoubleSlash(newString);
    }
    return newString;
}

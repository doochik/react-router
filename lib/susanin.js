'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.create = create;
exports.locationToState = locationToState;

var _susanin = require('susanin');

var _susanin2 = _interopRequireDefault(_susanin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function create(routes) {
    var susanin = new _susanin2.default();
    /*
    routes.forEach((reactRoute) => {
        const susaninRoute = susaninRoutes(reactRoute);
         susaninRoute.forEach(function(sRoute) {
            console.log('susanin.addRoute', sRoute);
            susanin.addRoute(sRoute);
        })
     });
    */
    var result = [];
    reactRoutesToSusanin(result, routes);
    result.forEach(function (route) {
        return susanin.addRoute(route);
    });

    return susanin;
}

function locationToState(susanin, location) {
    var route = susanin.findFirst(location.pathname);
    if (route) {
        return {
            routes: getRouteDataFromSusanin(route[0]),
            params: route[1]
        };
    }
}

function getRouteDataFromSusanin(route) {
    var data = route.getData();
    var result = [].concat(collectParents(data));
    result.push(data.route);
    if (data.route.indexRoute) {
        result.push(data.route.indexRoute);
    }

    return result;
}

function collectParents(route) {
    var result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (route.parentRoute) {
        result.unshift(route.parentRoute);
        return collectParents(route.parentRoute, result);
    }
    return result;
}

function reactRoutesToSusanin(result, routes, parentRoute) {
    routes.forEach(function (route) {
        if (route.childRoutes) {
            result.push.apply(result, reactRoutesToSusanin(result, route.childRoutes, Object.assign({}, route, { parentRoute: parentRoute })));
        }

        if (parentRoute) {
            var parentPath = parentRoute.path || '/';
            result.push({
                name: route.name,
                pattern: preparePattern(parentPath + '/' + route.path),
                data: _extends({}, route.data, {
                    route: route,
                    parentRoute: parentRoute
                })
            });
        }

        var indexRoute = route.indexRoute;
        if (indexRoute) {
            result.push({
                name: indexRoute.name,
                pattern: preparePattern(indexRoute.path || route.path),
                data: {
                    route: indexRoute,
                    parentRoute: route
                }
            });
        }
    });
}

function preparePattern(reactPath) {
    return reactParamsToSusanin(removeDoubleSlash(reactPath));
}

var REACT_PARAM_RE = /:([-_a-z]+)/ig;

function reactParamsToSusanin(string) {
    return string.replace(REACT_PARAM_RE, '<$1>');
}

function removeDoubleSlash(string) {
    var newString = string.replace('//', '/');
    if (newString !== string) {
        return removeDoubleSlash(newString);
    }
    return newString;
}
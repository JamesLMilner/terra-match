!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("@turf/turf")):"function"==typeof define&&define.amd?define(["exports","@turf/turf"],e):e((t||self).terraMatch={},t.turf)}(this,function(t,e){function n(t){if(t&&t.__esModule)return t;var e=Object.create(null);return t&&Object.keys(t).forEach(function(n){if("default"!==n){var r=Object.getOwnPropertyDescriptor(t,n);Object.defineProperty(e,n,r.get?r:{enumerable:!0,get:function(){return t[n]}})}}),e.default=t,e}var r=/*#__PURE__*/n(e);function o(t,e){var n=t[0],r=e[0],o=n*Math.PI/180,a=r*Math.PI/180,i=(r-n)*Math.PI/180,c=(e[1]-t[1])*Math.PI/180,u=Math.sin(i/2)*Math.sin(i/2)+Math.cos(o)*Math.cos(a)*Math.sin(c/2)*Math.sin(c/2);return 2*Math.atan2(Math.sqrt(u),Math.sqrt(1-u))*6371e3}function a(t,e,n){void 0===n&&(n={distanceMetric:o});var r=n.distanceMetric,a="Polygon"===t.type?t.coordinates[0]:t.coordinates,i="Polygon"===e.type?e.coordinates[0]:e.coordinates,c=a.length,u=i.length,s=Array.from({length:c},function(){return Array(u).fill(-1)});return function t(e,n){return-1!==s[e][n]||(s[e][n]=0===e&&0===n?r(a[0],i[0]):e>0&&0===n?Math.max(t(e-1,0),r(a[e],i[0])):0===e&&n>0?Math.max(t(0,n-1),r(a[0],i[n])):e>0&&n>0?Math.max(Math.min(t(e-1,n),t(e-1,n-1),t(e,n-1)),r(a[e],i[n])):Infinity),s[e][n]}(c-1,u-1)}function i(t,e){var n=-Math.log(.005)/e;return Math.exp(-n*t)}function c(t,e){return 1-Math.min(t,e)/e}function u(t){if(!t.coordinates||0===t.coordinates.length)return[];for(var e="Polygon"===t.type?t.coordinates[0].slice(0,-1):t.coordinates.slice(0),n=e.length,r=[],o=0;o<n;o++){var a=[].concat(e.slice(o),e.slice(0,o));"Polygon"===t.type&&a.push(a[0]),"LineString"!==t.type&&0===o||r.push({type:t.type,coordinates:"Polygon"===t.type?[a]:a});var i=[].concat(a).reverse();r.push({type:t.type,coordinates:"Polygon"===t.type?[i]:i})}return r}t.exponentialDecayFunction=i,t.frechetDistance=a,t.generateGeometryCoordinatePermutations=u,t.linearDecayFunction=c,t.terraMatch=function(t,e,n){void 0===n&&(n={});var s=n.distanceMetric,f=void 0===s?o:s,l=n.checkPermutations,d=void 0===l||l,h=n.cleanRedundant,y=void 0===h||h,p=n.decay,M=void 0===p?"exponential":p,g=r.bbox({type:"FeatureCollection",features:[{type:"Feature",geometry:t,properties:{}},{type:"Feature",geometry:e,properties:{}}]});y&&r.cleanCoords(e,{mutate:!0});for(var v=d?u(e):[e],m=[e].concat(v),P=Infinity;m.length>0;){var b=a(t,m.pop(),{distanceMetric:f});b<P&&(P=b)}var x=f([g[0],g[1]],[g[2],g[3]]);return"linear"===M?c(P,x):i(P,x)}});
//# sourceMappingURL=terra-match.umd.js.map

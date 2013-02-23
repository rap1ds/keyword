function isPlainObject(obj) {
    return typeof obj === "object" && !Array.isArray(obj);
}


function splitBy(arr, iterator) {
    var group = [], groups = [];
    arr.forEach(function(val) {
        if(iterator(val) && group.length) {
            groups.push(group);
            group = [];
        }
        group.push(val);
    });
    if(group.length) {
        groups.push(group);
    }
    return groups;
}

// Expose for testing purposes
var helpers = Object.freeze({
    isPlainObject: isPlainObject,
    splitBy: splitBy
});

module.exports = helpers;
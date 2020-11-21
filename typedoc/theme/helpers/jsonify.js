module.exports = {
  jsonify(value) {
    const cache = [];
    return JSON.stringify(value, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.includes(value)) {
          return;
        }

        cache.push(value);
      }
      return value;
    });
  },
};

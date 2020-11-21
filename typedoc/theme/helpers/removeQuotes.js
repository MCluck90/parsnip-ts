module.exports = {
  removeQuotes(value, options) {
    return value.replace(/'|"/g, '');
  },
};

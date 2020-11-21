module.exports = {
  isLib(value, options) {
    const libNode = value.parent.children.find(
      (child) => child.title === '"lib"'
    );
    if (libNode.isInPath) {
      return options.fn(this);
    }
  },
};

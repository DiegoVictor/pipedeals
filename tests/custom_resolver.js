module.exports = (request, options) => {
  if (request.search(/axios/gi) > -1) {
    return `${options.rootDir}/mocks/axios.js`;
  }
  return options.defaultResolver(request, options);
};

export default (array, fields) => {
  if (Array.isArray(array)) {
    return array.map(item => {
      Object.keys(fields).forEach(key => {
        if (typeof fields[key] === 'object') {
          item[key] = {};
          Object.keys(fields[key]).forEach(subkey => {
            item[key][subkey] = fields[key][subkey].replace(':id', item._id);
          });
        } else {
          item[key] = fields[key].replace(':id', item._id);
        }
      });

      return item;
    });
  }

  Object.keys(fields).forEach(key => {
    if (typeof fields[key] === 'object') {
      array[key] = {};
      Object.keys(fields[key]).forEach(subkey => {
        array[key][subkey] = fields[key][subkey].replace(':id', array._id);
      });
    } else {
      array[key] = fields[key].replace(':id', array._id);
    }
  });

  return array;
};

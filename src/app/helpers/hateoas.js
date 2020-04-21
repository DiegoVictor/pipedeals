export default function hateoas(array, fields) {
  if (Array.isArray(array)) {
    return array.map(item => {
      Object.keys(fields).forEach(key => {
        if (typeof fields[key] === 'object') {
          item[key] = hateoas(item, fields[key]);
        } else {
          fields[key] = fields[key].replace(':id', item._id);
        }
      });
      return {
        ...item,
        ...fields,
      };
    });
  }

  Object.keys(fields).forEach(key => {
    if (typeof fields[key] === 'object') {
      array[key] = hateoas(array, fields[key]);
    } else {
      fields[key] = fields[key].replace(':id', array._id);
    }
  });
  return {
    ...array,
    ...fields,
  };
}

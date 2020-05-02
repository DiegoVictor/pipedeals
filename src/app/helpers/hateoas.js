export default function hateoas(data, fields) {
  if (Array.isArray(data)) {
    const result = [...data];

    return result.map(item => {
      return hateoas(item, fields);
    });
  }

  const result = { ...data };
  Object.keys(fields).forEach(name => {
    if (typeof fields[name] === 'object') {
      result[name] = result[name] || {};
      Object.keys(fields[name]).forEach(key => {
        result[name][key] = fields[name][key].replace(':id', result._id);
      });
    } else {
      result[name] = fields[name].replace(':id', result._id);
    }
  });

  return result;
}

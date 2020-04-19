export default (req, _, next) => {
  const { protocol, hostname, originalUrl } = req;
  req.base_url = `${protocol}://${hostname}:${process.env.APP_PORT}`;
  req.resource_url = `${req.base_url + originalUrl.split('?').shift()}`;
  next();
};

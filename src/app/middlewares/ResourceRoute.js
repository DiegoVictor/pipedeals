export default (req, _, next) => {
  const { protocol, hostname, originalUrl } = req;
  req.resource_url = `${protocol}://${hostname}:${
    process.env.APP_PORT
  }${originalUrl.split('?').shift()}`;
  next();
};

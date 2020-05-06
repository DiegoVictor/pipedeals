export default (req, _, next) => {
  const { protocol, hostname, originalUrl } = req;
  const host_url = `${protocol}://${hostname}:${process.env.APP_PORT}`;

  req.host_url = host_url;
  req.current_url = `${host_url + originalUrl.split('?').shift()}`;

  next();
};

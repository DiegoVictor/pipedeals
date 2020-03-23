import atob from 'atob';

export default (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json({
      error: {
        message: 'Missing authorization',
      },
    });
  }

  const [user, pass] = atob(authorization.split(' ').pop()).split(':');

  if (
    user !== process.env.PIPEDRIVE_USER ||
    pass !== process.env.PIPEDRIVE_PWD
  ) {
    return res.status(401).json({
      error: {
        message: 'You are not authorized!',
      },
    });
  }

  return next();
};

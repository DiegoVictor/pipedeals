export const axios = {
  base_url: '',

  sent: {},
  replies: {},
};

function Unauthorized(statusText) {
  this.response = {
    status: 401,
    statusText,
  };
}

const verb = (path, data) =>
  new Promise((resolve) => {
    const reply = axios.replies[path.replace(axios.base_url, '')];

    switch (reply.code) {
      case 401: {
        throw new Unauthorized(reply.data);
      }
    }

    if (data) {
      axios.sent[path] = data;
    }
    resolve(reply);
  });

const listener = (path) => ({
  reply: (code, data) => {
    const reply = {
      code,
    };

    if (data) {
      reply.data = data;
    }

    axios.replies[path] = reply;
    return axios;
  },
});

axios.get = jest.fn(verb);
axios.post = jest.fn(verb);

axios.onGet = listener;
axios.onPost = listener;

axios.setBaseUrl = (url) => {
  axios.base_url = url;
  return axios;
};

const exportable = {
  get: jest.fn(verb),
  post: jest.fn(verb),
};

export default {
  create: () => exportable,
  ...exportable,
};

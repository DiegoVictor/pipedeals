export default (page, pagesTotal, resourceUrl) => {
  const url = `${resourceUrl}?page=`;
  const links = {};

  if (pagesTotal > 1) {
    if (page < pagesTotal) {
      links.last = url + pagesTotal;
      links.next = url + (page + 1);
    }

    if (page > 1) {
      links.first = `${url}1`;
      links.prev = url + (page - 1);
    }
  }

  return links;
};

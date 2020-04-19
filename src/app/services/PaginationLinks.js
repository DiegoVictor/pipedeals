class PaginationLinks {
  run({ resource_url, page, pages_total }) {
    const url = `${resource_url}?page=`;

    const links = {};
    if (page < pages_total) {
      links.last = url + pages_total;
      links.next = url + (page + 1);
    }

    if (page > 1) {
      links.first = `${url}1`;
      links.prev = url + (page - 1);
    }

    return links;
  }
}

export default new PaginationLinks();

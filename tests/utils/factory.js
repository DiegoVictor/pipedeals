import factory from 'factory-girl';
import faker from 'faker';

import Report from '../../src/app/models/Report';
import User from '../../src/app/models/User';
import Opportunity from '../../src/app/models/Opportunity';

factory.define(
  'Deal',
  {},
  {
    id: faker.random.number,
    '6427f011f186d62449eb8caf53edb2a52cf959a4': () =>
      faker.random.number({ min: 1, max: 3 }),
    '6866136a4bc7b12a75897df3d7ae168b46497b10': faker.company.companyName,
    '4275aa493fbf4aeeefb0d918cd90df6273655368': () =>
      faker.random.arrayElement([12, 26]),
    person_id: {
      name: faker.name.findName,
    },
  }
);

factory.define(
  'Payment',
  {},
  {
    retorno: {
      formaspagamento: [
        {
          formapagamento: {
            id: faker.random.number,
            codigoFiscal: faker.random.arrayElement([15, 3, 1]),
          },
        },
      ],
    },
  }
);

factory.define(
  'Product',
  {},
  {
    name: faker.commerce.productName,
    quantity: () => faker.random.number({ min: 1, max: 5 }),
    item_price: faker.finance.amount,
  }
);

factory.define('Opportunity', Opportunity, () => {
  const quantity = faker.random.number({ min: 1, max: 3 });
  const unitary_value = faker.finance.amount();

  return {
    client: {
      pipedrive_id: faker.random.number,
      name: faker.name.findName,
    },
    supplier: {
      name: faker.company.companyName,
    },
    items: [
      {
        description: faker.commerce.productName,
        quantity,
        unitary_value,
      },
    ],
    parcels: [
      {
        payment_term_in_days: 30,
        value: faker.finance.amount,
      },
    ],
    payment_method_id: () => faker.random.arrayElement([12, 26, 27]),
    amount: quantity * unitary_value,
  };
});

factory.define('Report', Report, {
  date: () => {
    const future = faker.random.boolean();
    if (future) {
      return faker.date.future();
    }
    return faker.date.past();
  },
  amount: faker.finance.amount,
});

factory.define('User', User, {
  email: faker.internet.email,
  password: faker.internet.password,
});

export default factory;

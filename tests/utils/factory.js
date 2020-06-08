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
    parcels: () => faker.random.number({ min: 2, max: 5 }),
    supplier: faker.company.companyName,
    payment_method: faker.random.word,
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
    quantity: () => faker.random.number({ min: 2, max: 5 }),
    item_price: () =>
      Number(Math.floor(faker.finance.amount()) + Math.random()).toFixed(2),
  }
);

factory.define('Opportunity', Opportunity, () => {
  const quantity = faker.random.number({ min: 2, max: 5 });
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
    payment_method: faker.random.word,
    amount: quantity * unitary_value,
    createdAt: faker.date.past,
  };
});

factory.define('Report', Report, {
  date: faker.date.future,
  amount: 0,
});

factory.define('User', User, {
  email: faker.internet.email,
  password: faker.internet.password,
});

export default factory;

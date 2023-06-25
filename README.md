# Pipedeals
[![AppVeyor](https://img.shields.io/appveyor/build/diegovictor/pipedeals?logo=appveyor&style=flat-square)](https://ci.appveyor.com/project/DiegoVictor/pipedeals)
[![nodemon](https://img.shields.io/badge/nodemon-2.0.22-76d04b?style=flat-square&logo=nodemon)](https://nodemon.io/)
[![eslint](https://img.shields.io/badge/eslint-8.43.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-29.5.3-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/pipedeals?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/pipedeals)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Pipedeals&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fpipedeals%2Fmain%2FInsomnia_2021-09-06.json)

The main purpose of Pipedeals is listen to [Pipedrive](https://www.pipedrive.com) deal's `won` update event, prepare buy order data, save it on a database and finally send it to [Bling](https://www.bling.com.br)'s API. Also expose two resources, `opportunities` that are buy orders sent to Bling and `reports` that aggregates opportunities by day and amount (sum of products' prices in that day).

# Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [MongoDB](#mongodb)
    * [.env](#env)
    * [Pipedrive](#pipedrive)
      * [Webhook](#webhook)
      * [Custom Fields](#custom-fields)
      * [Product](#product)
    * [Bling's API Key](#blings-api-key)
      * [Permissions](#permissions)
* [Usage](#usage)
  * [Error Handling](#error-handling)
    * [Errors Reference](#errors-reference)
  * [Pagination](#pagination)
    * [Link Header](#link-header)
    * [X-Total-Count](#x-total-count)
  * [Bearer Token](#bearer-token)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

# Installing
Easy peasy lemon squeezy:
```
$ yarn
```
Or:
```
$ npm install
```
> Was installed and configured the [`eslint`](https://eslint.org) and [`prettier`](https://prettier.io) to keep the code clean and patterned.

## Configuring
The application uses just one database: [MongoDB](https://www.mongodb.com). For the fastest setup is recommended to use [docker-compose](https://docs.docker.com/compose/), you just need to up all services:
```
$ docker-compose up -d
```

### MongoDB
Store opportunities sent to Bling, reports and the users utilized by application. If for any reason you would like to create a MongoDB container instead of use `docker-compose`, you can do it by running the following command:
```
$ docker run --name pipedeals-mongo -d -p 27017:27017 mongo
```

### .env
In this file you may configure your MongoDB and Redis database connection, JWT settings, the environment, app's port, url to documentation (this will be returned with error responses, see [error section](#error-handling)) and Pipedrive and Bling's keys. Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|APP_PORT|Port number where the app will run.|`3333`
|NODE_ENV|App environment.|`development`
|JWT_SECRET|An alphanumeric random string. Used to create signed tokens.| -
|JWT_EXPIRATION_TIME|How long time will be the token valid. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#usage) repo for more information.|`7d`
|MONGO_URL|MongoDB's server url.|`mongodb://mongo:27017/pipedeals`
|PIPEDRIVE_API_TOKEN|Pipedrive API's token. See [How to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) for more information.| -
|PIPEDRIVE_DOMAIN_NAME|Pipedrive domain name (company name), see [How to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain).| -
|PIPEDRIVE_USER and PIPEDRIVE_PWD|Basic auth's user and password (respectively). Used to ensure that the deal's event is coming from Pipedrive webhook, see [Webhook](#webhook) for more information about it.| -
|BLING_API_KEY|Bling's api key. See [Bling's API key](#blings-api-key) section.| -
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/pipedeals#errors-reference`

### Pipedrive
Instructions to configure the Pipedrive's webhook, custom fields and products.

#### Webhook
Create a webhook to listen `updated.deal` event, remember to set a user (`PIPEDRIVE_USER`) and password (`PIPEDRIVE_PWD`), for more information see:
* [Guide for Webhooks](https://pipedrive.readme.io/docs/guide-for-webhooks)

The webhook's url should be something like:
```
https://<your-domain>/v1/pipedrive/events
```
> If you are running the application local I recommend you to use [ngrok](https://ngrok.com) to export a url to access the application. (e.g. `https://25752eff.ngrok.io/v1/pipedrive/events`)

![webhook](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/webhook.png)

#### Custom Fields
Bling make some fields mandatory, they are: [`Payment Method`](#payment-method) and [`Supplier`](#supplier), this application makes [`Parcels`](#parcels) mandatory too. To create custom fields to deal on Pipedrive see [Adding Custom Fields](https://support.pipedrive.com/hc/en-us/articles/207228075-Custom-Fields#C1).

![custom fields](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/custom_fields.png)

##### Parcels
Just create a field named Parcels, must be a number.

![parcels](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/parcels.png)

##### Supplier
Supplier, must be free text field.

![supplier](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/supplier.png)

##### Payment Method
Payment Method, must be unique option field.

![payment method](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/payment_method.png)
> Payments methods that not exists in Bling will be created before the opportunity be sent to it.

#### Product
Also you need to create a product and attach to deal, fill only the mandatory fields is enough (`Product name` and `Unit price`). For more information see [Adding New Products](https://support.pipedrive.com/hc/en-us/articles/206759569-Products#C2).

![create product](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/create_product.png)

Remember to link the product to deals, see how to do it in this article [How can I link products to a deal?](https://support.pipedrive.com/hc/en-us/articles/115001109169-How-can-I-link-products-to-a-deal-).

![add deal product](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/add_deal_product.png)

### Bling's API Key
To get a Bling's API key, go to user list:
* [Users](https://www.bling.com.br/b/usuarios.php#list)

Then create a new user, select `USUÁRIO API`, copy the `API key` (maybe be necessary click on `GERAR`), [configure the permissions](#permissions), save the user, paste the `API key` in the `BLING_API_KEY` key in the `.env` file.

![Bling user](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/bling_user.png)

#### Permissions
The following permissions are necessary to the API user:

|permissions|menu|description
|---|---|---
|`Contas Contábeis`, `Notas Fiscais`, `NFCe` and `Pedidos de Venda`|Vendas|Enable just one is enough. Allow to get lists and create payment methods.
|`Pedidos de Compra`|Suprimentos|Allow to create new buy orders.

![permissions buy order](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/permissions_buy_order.png)<br>
![permissions sales](https://raw.githubusercontent.com/DiegoVictor/pipedeals/main/screenshots/permissions_sales.png)

# Usage
To start up the app run:
```
$ yarn start
```
Or:
```
$ npm run start
```
Then create new deals, make it pass through your funnel, etc, when you mark that deal as `won` the magic will happens :)

## Error Handling
Instead of only throw a simple message and HTTP Status Code this API return friendly errors:
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "You are not authorized!",
  "code": 741,
  "docs": "https://github.com/DiegoVictor/pipedeals#errors-reference"
}
```
> Errors are implemented with [@hapi/boom](https://github.com/hapijs/boom).
> As you can see a url to errors docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|531|An error occurred while trying to retrieve the deal from Pipedrive|An error occurred during the request to get the deal in Pipedrive API, look the `details` key for more information.
|532|An error occurred while trying to retrieve the deal's custom fields from Pipedrive|The request to get custom fields from Pipedrive API throw an error. Look the `details` key for more information.
|533|An error occurred while trying to retrieve the deal's products from Pipedrive|Occurred an error while trying to retrieve deal's products, in `details` key will be more information about the error.
|534|An error occurred while trying to save the order at Bling|Something goes wrong when tried to send the opportunity to Bling. There are two steps here: payment method verification and buy order creation. For more information see the `details` key in the response.
|244|Report not found|The `id` sent not references an existing report in the database.
|344|Opportunity not found|The `id` sent not references an existing opportunity in the database.
|440|User not exists|The `email` sent not references an existing user in the database.
|450|User and/or password not match|User and/or password is incorrect.
|140|Email already in use|Already exists an user with the same email.
|640|Missing authorization|Pipedrive's webhook is not sending the Basic auth's user and password.
|641|You are not authorized!|Pipedrive's webhook is sending wrong Basic credentials.
|740|Missing authorization token|The Bearer Token was not sent.
|741|You are not authorized!|The Bearer Token provided is invalid or expired.

## Pagination
All the routes with pagination returns 10 records per page, to navigate to other pages just send the `page` query parameter with the number of the page.

* To get the third page of opportunities:
```
GET http://localhost:3333/v1/opportunities?page=3
```

### Link Header
Also in the headers of every route with pagination the `Link` header is returned with links to `first`, `last`, `next` and `prev` (previous) page.
```
<http://localhost:3333/v1/opportunities?page=7>; rel="last",
<http://localhost:3333/v1/opportunities?page=4>; rel="next",
<http://localhost:3333/v1/opportunities?page=1>; rel="first",
<http://localhost:3333/v1/opportunities?page=2>; rel="prev"
```
> See more about this header in this MDN doc: [Link - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link).

### X-Total-Count
Another header returned in routes with pagination, this bring the total records amount.

## Bearer Token
All reports and oppotunities routes expect a Bearer Token in an `Authorization` header.
> You can see these routes in the [routes](#routes) section.
```
GET http://localhost:3333/v1/reports?page=1 Authorization: Bearer <token>
```
> To achieve this token you just need authenticate through the `/sessions` route and it will return the `token` key with a valid Bearer Token.

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
GET http://localhost:3333/v1/reports
```

## Routes
|route|HTTP Method|pagination|params|description|auth method
|:---|:---:|:---:|:---:|:---|:---:
|`/sessions`|POST|:x:|Body with user's `email` and `password`.|Authenticates user, return a Bearer Token and user's id and email.|:x:
|`/users`|POST|:x:|Body with user's `email` and `password`.|Create new users.|:x:
|`/pipedrive/events`|POST|:x:|Body with event's `event`, `current.id` and `current.status`.|Receive Piedrive deal's won event.|Basic
|`/reports`|GET|:heavy_check_mark:|`page` query parameter.|List reports.|Bearer
|`/reports/:id`|GET|:x:|`:id` of the report.|Return one report.|Bearer
|`/reports/:id/opportunities`|GET|:heavy_check_mark:|`:id` of the report and `page` query parameter.|List report's opportunities.|Bearer
|`/reports/:report_id/opportunities/:id`|GET|:x:|`:report_id` of the report and `:id` of the opportunity.|Return one report's opportunity.|Bearer

> Routes with `Bearer` as auth method expect an `Authorization` header. See [Bearer Token](#bearer-token) section for more information. `Basic` authentication is a base64 encoding of `PIPEDRIVE_USER` and `PIPEDRIVE_PWD` joined by a `:`, but you should not make manual requests to this endpoint (this will be responsability of the Pipedrive's [webhook](#webhook)).

### Requests
* `POST /session`

Request body:
```json
{
  "email": "diegovictorgonzaga@gmail.com",
  "password": "123456"
}
```

* `POST /users`

Request body:
```json
{
  "email": "diegovictorgonzaga@gmail.com",
  "password": "123456"
}
```

* `POST /pipedrive/events`

Request body:
```json
{
  "current": {
    "id": 1,
    "status": "won"
  },
  "event": "updated.deal"
}
```

# Running the tests
[Jest](https://jestjs.io) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.

# Install
```
$ yarn
```

# Dependencies
Was installed and configured the `eslint` and `prettier` to keep the code clean and patterned.

# Database
The application use just one database: MongoDB. For the fastest setup is recommended to use docker, see how to do it below.

## MongoDB
```
$ docker run --name pipedeals-mongo -d -p 27017:27017 mongo
$ docker start pipedeals-mongo
```

# .env
Rename the `.env.example` to `.env` then just update with yours settings.

# Configuration
Instructions to how to configure Pipedrive and Bling.

## Pipedrive API Token & Domain Name
First of all you will need a API token, to get it see:
*  [How to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token)

Then save it in `PIPEDRIVE_API_TOKEN` key in your `.env`. Make the same to the domain name (`PIPEDRIVE_DOMAIN_NAME`):
* [How to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain)

## Pipedrive Webhook
Nice, now just create a webhook to listen `updated.deal`, remember to set a user and password (also save it in your `env`: `PIPEDRIVE_USER`, `PIPEDRIVE_PWD` respectively), for more information see:
* [Guide for Webhooks](https://pipedrive.readme.io/docs/guide-for-webhooks)

The webhook's url should be something like:
```
https://<your-domain>/pipedrive/events
```
> If you are running local I recommend you to use [ngrok](https://ngrok.com) to export a url to access the application. (e.g. https://25752eff.ngrok.io/pipedrive/events)

## Pipedrive Deals Fields
Bling make some fields mandatory, they are: Payment Method and Supplier, and I recommend you to create a Parcels fields too.

### Parcels (Optional)
Just create a field named Parcels, should be number.<br>
<img src="https://raw.githubusercontent.com/DiegoVictor/pipedeals/master/screenshots/parcels.PNG"><br>

### Supplier
Supplier, should be free text field.<br>
<img src="https://raw.githubusercontent.com/DiegoVictor/pipedeals/master/screenshots/supplier.PNG"><br>

### Payment Method
Payment Method, should be unique option field.<br>
<img src="https://raw.githubusercontent.com/DiegoVictor/pipedeals/master/screenshots/payment_method.PNG"><br>

Remember to add the payments to `src/config/payment_methods.js` (Rename `payment_methods.example.js`), the key must be the payment method name that you save in Pipedrive, the value must be the `id` from Bling:
```
export default {
  Boleto: 947451
};
```
> To see how to get the Bling payment methods' ids or to create new ones see [Formas de Pagamento](https://manuais.bling.com.br/manual/?item=formas-de-pagamento)

## Bling API Key
Now you need to get a Bling's api key, go to user list:
* [Users](https://www.bling.com.br/b/usuarios.php#list)

Then create a new user, select `USUÁRIO API`, copy the `API key`, save the user, save the key in your `env` file in the key `BLING_API_KEY`.

# Start Up
```
$ yarn dev
```

Then create new deals, make it pass through your funnel, etc, when you mark that deal as won the magic will happens :)

# Tests
```
$ yarn test
```

# Insomnia
In the root directory you can find an [Insomnia](https://insomnia.rest/) file, it has some useful requests to configure and test the app.

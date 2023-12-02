# Sample NodeJS AMQP Project with Fanout Exchange

This project uses the [amqplib](https://www.npmjs.com/package/amqplib) package to
setup a microservice architecture.

The project utilises the `fanout` exchange to send messages to multiple queues.

3 queues have been declared:

- `processorA`
- `processorB`
- `logger`

3 exchanges are declared in the `api-gateway` channel:

- `all`: This exchange sends all 3 queues.
- `processorA`: This exchanges sends to the `processorA` queue and the `logger` queue.
- `processorB`: This exchanges sends to the `processorB` queue and the `logger` queue.

## Pre Requisites

You will need to have a AMQP server running.

In this project I tested out with [RabbitMQ](https://www.rabbitmq.com), follow their installation
process and run your own instance before running this project.

## Setting up the project environment

1. Use the preferred package manager to install the NPM packages:

```bash
pnpm install # pnpm
npm install # npm
yarn install # yarn
```

2. Setup the env variables.

In the given `.env.example` file. Make a copy in the same location, with the name `.env`.

Replace the ENV variables from the example file with your own values.

## Running the Services

For each individual services they can be called with the respective NPM scripts declared
in `package.json`:

`Processor A`

```bash
pnpm run start:processorA
npm run start:processorA
yarn run start:processorA
```

`Processor B`

```bash
pnpm run start:processorB
npm run start:processorB
yarn run start:processorB
```

`Logger`

```bash
pnpm run start:logger
npm run start:logger
yarn run start:logger
```

`API Gateway`

```bash
pnpm run start:server
npm run start:server
yarn run start:server
```

## Sending Data

As this project, is built mainly just to create a sample project for the `amqplib`,
so no validation is put in place for the JSON body.

The JSON body should follow the following TypeScript interfaces:

```ts
type Exchange = "all" | "processorA" | "processorB";

interface RequestBody {
  exchange: Exchange;
  data: Data;
}

interface Data {
  durationInMs: number;
  returnMsg: string;
}
```

To send the data just use any HTTP client to POST to `http://localhost:{PORT}`.

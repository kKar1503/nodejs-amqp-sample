import amqp from "amqplib";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const QUEUE = "logger";
const EXCHANGE_ALL = "all";
const EXCHANGE_A = "processorA";
const EXCHANGE_B = "processorB";
const AMQP_URL = process.env["AMQP_CONN_URL"];

async function main() {
  if (!AMQP_URL) {
    console.log("AMQP_URL cannot be empty!");
    process.exit(1);
  }

  // using amqp.connect creates a connection directly to the amqp
  const conn = await amqp.connect(AMQP_URL);

  // channel is the way to connect to the queues to receive / send messages
  const channel = await conn.createChannel();
  // asserting a queue will indicate where the messages will come from
  // as a microservice u will only need to care about which queue ur messages come from
  // ideally, you should imagine each microservice has 1 queue.
  // when expanding, we can create more instances of the same microservice and
  // consume from the same queue
  await channel.assertQueue(QUEUE);

  // binds the queue to any exchanges it want to be part of
  await channel.bindQueue(QUEUE, EXCHANGE_ALL, "");
  await channel.bindQueue(QUEUE, EXCHANGE_A, "");
  await channel.bindQueue(QUEUE, EXCHANGE_B, "");

  // Listener
  channel.consume(QUEUE, async (msg) => {
    if (msg !== null) {
      console.log(
        "[%s] API Gateway server received a task: %s",
        new Date().toISOString(),
        msg.content.toString(),
      );
      channel.ack(msg);
    } else {
      console.log(
        "[%s] Consumer cancelled by server",
        new Date().toISOString(),
      );
    }
  });
}

main();

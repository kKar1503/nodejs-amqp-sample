import amqp from "amqplib";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.logger") });

const QUEUE = "logger";
const AMQP_URL = process.env["AMQP_CONN_URL"];

async function main() {
  if (!AMQP_URL) {
    console.log("AMQP_URL cannot be empty!");
    process.exit(1);
  }

  // using amqp.connect creates a connection directly to the amqp
  const conn = await amqp.connect(AMQP_URL);

  // channel is the way to connect to the queues to receive / send messages
  const ch1 = await conn.createChannel();
  // asserting a queue will indicate where the messages will come from
  // as a microservice u will only need to care about which queue ur messages come from
  // ideally, you should imagine each microservice has 1 queue.
  // when expanding, we can create more instances of the same microservice and
  // consume from the same queue
  await ch1.assertQueue(QUEUE);

  // Listener
  ch1.consume(QUEUE, async (msg) => {
    if (msg !== null) {
      console.log(
        "[%s] API Gateway server received a task: %s",
        new Date().toLocaleTimeString(),
        msg.content.toString(),
      );
      ch1.ack(msg);
    } else {
      console.log(
        "[%s] Consumer cancelled by server",
        new Date().toTimeString(),
      );
    }
  });
}

main();

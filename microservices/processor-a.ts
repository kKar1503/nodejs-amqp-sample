import amqp from "amqplib";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.processor-A") });

const QUEUE = "processorA";
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
      // msg.content gives the buffer that is passed over by the amqp
      await handleTask(msg.content);
      // ack will clear the task from the queue
      // in the case where something goes wrong in this service, use nack
      // nack basically means no acknowledge and will put the task back into the queue
      ch1.ack(msg);
    } else {
      console.log("Consumer cancelled by server");
    }
  });
}

main();

interface Data {
  durationInMs: number;
  returnMsg: string;
}

async function handleTask(task: Buffer) {
  // First we have to parse the buffer back to string
  const json = task.toString();
  // Then we can gracefully parse it back to whatever object
  const obj: Data = JSON.parse(json);

  return new Promise<string>((res) => {
    setTimeout(() => {
      res(obj.returnMsg);
    }, obj.durationInMs);
  });
}

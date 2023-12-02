import amqp from "amqplib";
import http from "http";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const AMQP_URL = process.env["AMQP_CONN_URL"];
const PORT = process.env["PORT"];
const EXCHANGE_ALL = "all";
const EXCHANGE_A = "processorA";
const EXCHANGE_B = "processorB";

async function main() {
  if (!PORT) {
    console.log("PORT cannot be empty!");
    process.exit(1);
  }

  if (!AMQP_URL) {
    console.log("AMQP_URL cannot be empty!");
    process.exit(1);
  }

  const conn = await amqp.connect(AMQP_URL);
  const channel = await conn.createChannel();

  // Setup channel for "all"
  channel.assertExchange(EXCHANGE_ALL, "fanout", { durable: true });
  channel.assertExchange(EXCHANGE_A, "fanout", { durable: true });
  channel.assertExchange(EXCHANGE_B, "fanout", { durable: true });

  const server = http.createServer(requestHandler(channel));

  server.listen(parseInt(PORT), () => {
    console.log("server is up at port: %s", PORT);
  });
}

main();

type Req = http.IncomingMessage;
type Res = http.ServerResponse<Req> & { req: Req };
type Exchange = "all" | "processorA" | "processorB";
interface RequestBody {
  exchange: Exchange;
  data: any;
}

function requestHandler(channel: amqp.Channel) {
  return function (req: Req, res: Res) {
    const { url, method } = req;
    console.log(
      "[%s] Received a request: %s %s",
      new Date().toLocaleTimeString(),
      method,
      url,
    );

    if (method !== "POST" && url !== "/") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Route not found" }));
      return;
    }

    let requestBody = "";
    req.on("data", (chunk) => {
      requestBody += chunk.toString();
    });

    req.on("end", () => {
      const requestData: RequestBody = JSON.parse(requestBody);

      channel.publish(
        requestData.exchange,
        "",
        Buffer.from(JSON.stringify(requestData.data)),
        { persistent: true },
      );
      console.log(
        "[%s] Data published to %s: %s",
        new Date().toLocaleTimeString(),
        requestData.exchange,
        JSON.stringify(requestData.data),
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: `Data send to ${requestData.exchange} exchange.`,
          data: requestData,
        }),
      );
    });
  };
}

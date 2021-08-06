const express = require("express");
const amqp = require("amqplib");
const app = express();

app.use(express.urlencoded({ extended: true }));
// To parse the incoming requests with JSON payloads
app.use(express.json());

let channel;
let connection;

async function connect() {
  try {
    const amqpServer = "amqp://localhost:5672";
    // make a connection - a TCP connection between your application and the RabbitMQ broker.
    connection = await amqp.connect(amqpServer);
    // create a new channel - a virtual connection inside a connection
    channel = await connection.createChannel();
    //  create a new queue for a channel
    await channel.assertQueue("rabbit");
  } catch (err) {
    console.log(err);
  }
}

connect();

app.get("/send", async (req, res) => {
  const data = {
    name: "Ruby",
    age: 18,
  };

  // convert data object to Buffer before sending to rabbit queue
  await channel.sendToQueue("rabbit", Buffer.from(JSON.stringify(data)));
  // await channel.close();
  // await connection.close();
  res.send("Done!");
});

app.post("/post", async (req, res) => {
  const data = req.body;
  await channel.sendToQueue("rabbit", Buffer.from(JSON.stringify(data)));
  // await channel.close();
  // await connection.close();;
  res.send("Done!");
});

app.listen(5001, () => {
  console.log("Listening on port 5001");
});

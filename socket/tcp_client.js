const net = require("net");

const client = net.createConnection({ port: 3000 }, (res) => {
  console.log("connected to server on 3000");
  client.write("hello world");
});

client.on("data", (buf) => {
  console.log(buf.toString());
  client.end();
});

client.on("close", () => {
  console.log("client close");
});

client.on("end", () => {
  console.log("conect end");
});
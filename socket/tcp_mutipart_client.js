const net = require("net");

const client1 = net.createConnection({ port: 3000 }, (res) => {
  console.log("connected to server on 3000");
  client1.write("I'm client1");
});

client1.on("data", (buf) => {
  console.log(buf.toString());
  client1.end();
});

client1.on("close", () => {
  console.log("client close");
});

client1.on("end", () => {
  console.log("conect end");
});

const client2 = net.createConnection({ port: 3000 }, (res) => {
  console.log("connected to server on 3000");
  client2.write("i'm client2");
});

client2.on("data", (buf) => {
  console.log(buf.toString());
  client2.end();
});

client2.on("close", () => {
  console.log("client close");
});

client2.on("end", () => {
  console.log("conect end");
});

const client3 = net.createConnection({ port: 3000 }, (res) => {
  console.log("connected to server on 3000");
  client3.write("i'm client3");
});

client3.on("data", (buf) => {
  console.log(buf.toString());
  client3.end();
});

client3.on("close", () => {
  console.log("client close");
});

client3.on("end", () => {
  console.log("conect end");
});
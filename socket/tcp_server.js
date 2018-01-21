const net = require("net");
// TODO: 搞多进程来控制响应
const server = net.createServer((socket) => {
  socket.on("data", (buf) => {
    console.log(buf.toString());
    socket.write("hi");
  });

  socket.on("end", (msg) => {
    console.log("socket end:", msg);
  });

  socket.on("close", (msg) => {
    console.log("socket close:", msg);
  });

  socket.on("error", (msg) => {
    console.log(msg);
  });
});

server.listen(3000, () => {
  console.log("tcp server listening on 3000");
});
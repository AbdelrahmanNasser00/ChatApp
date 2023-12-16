const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);
const mysql = require("mysql2");
const { error } = require("console");
app.use(express.static("public"));

app.get("/", (request, response, next) => {
  response.sendFile(path.join(__dirname, "/views/index.html"));
});

const db = {
  host: "bgio7txvhtajhbzdc9qr-mysql.services.clever-cloud.com",
  user: "udy8rbgnevygcpjh",
  password: "yPw7LYfLVD65Jq1nHVDY",
  database: "bgio7txvhtajhbzdc9qr",
};
// const db = {
//   host: "localhost",
//   user: "root",
//   password: "password",
//   database: "db",
// };

const connection = mysql.createConnection(db);
const pool = mysql.createPool(db);
const promisePool = pool.promise();

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to database:", error);
    return;
  }
  console.log("connected to database successfully");
});

let socketsConnected = new Map();
console.log(socketsConnected);
let onlineUsers = new Set();
let users = [];

io.on("connect", async (socket) => {
  console.log(socketsConnected);

  io.emit("clients-number", socketsConnected.size);

  socket.on("new-user", (data) => {
    const uniqueId = `${socket.id}-${socket.handshake.address}`;
    socketsConnected.set(uniqueId, data.name);
    onlineUsers.add(data.name);

    // Emit new user data to the client
    io.emit("new-user-data", { socketId: uniqueId, name: data.name });

    // Convert Map to array of objects and send it to the client
    const socketsArray = Array.from(socketsConnected.entries()).map(
      ([id, name]) => ({ socketId: id, name })
    );
    io.emit("online-users", socketsArray);
  });

  // Add old messages to chat
  try {
    const [rows] = await promisePool.execute(
      "select* from messages order by timestamp ASC LIMIT 10"
    );
    socket.emit("chat-history", rows);
  } catch (error) {
    console.error("Error fetching chat history from the database:", error);
  }

  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
    const disconnectedUniqueId = `${socket.id}-${socket.handshake.address}`;

    // Remove the disconnected user from the set of online users
    const disconnectedUserName = socketsConnected.get(disconnectedUniqueId);
    onlineUsers.delete(disconnectedUserName);
    socketsConnected.delete(disconnectedUniqueId);

    // Convert Map to array of objects and send it to the client
    const socketsArray = Array.from(socketsConnected.entries()).map(
      ([id, name]) => ({ socketId: id, name })
    );
    io.emit("online-users", socketsArray);
  });

  socket.on("message", async (data) => {
    // Store messages in database
    const insertQuery = "insert into messages(sender_name,content) values(?,?)";
    try {
      const [results] = await promisePool.execute(
        "insert into messages(sender_name,content) values(?,?)",
        [data.sender, data.message]
      );
      socket.broadcast.emit("chat-message", data);
    } catch (error) {
      console.error("Error inserting message into the database:", error);
    }
  });
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`listen to server with port ${port}`);
});

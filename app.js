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
  response.sendFile(path.join(__dirname, "index.html"));
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

let socketsConnected = new Set();

io.on("connect", async (socket) => {
  console.log(socket.id);
  socketsConnected.add(socket.id);
  // send number of clients
  io.emit("clients-number", socketsConnected.size);

  // Add old messages to chat
  try {
    const [rows] = await promisePool.execute(
      "select* from messages order by timestamp ASC LIMIT 10"
    );
    console.log(rows);
    socket.emit("chat-history", rows);
  } catch (error) {
    console.error("Error fetching chat history from the database:", error);
  }

  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
    socketsConnected.delete(socket.id);
    io.emit("clients-number", socketsConnected.size);
  });

  socket.on("message", async (data) => {
    console.log(data);
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

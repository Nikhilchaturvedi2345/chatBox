import http from "http";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { Server } from "socket.io";
import SocketController from "./controllers/socket.io.js";
import UserController from "./controllers/controller.js";
import { connect } from "./config/mongodb.js";

dotenv.config();

const currentDir = path.join(path.dirname(path.resolve()), "client", "dist");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "defaultSecret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
});

app.use(sessionMiddleware);
app.set("view engine", "ejs");
app.set("views", currentDir);

app.use(express.static(currentDir));

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.on("connection", (socket) => {
  console.log("Connection made");

  socket.on("newConnection", async (user) => {
    const session = socket.request.session;
    await SocketController.newUserJoins(user, socket,io);
    // await SocketController.membersData(io, session);
  });

  socket.on("message", (user) => {
    const session = socket.request.session;
    SocketController.newMessage(user, io, session);
  });

  socket.on("disconnect", async () => {
    const session = socket.request.session;
    if (session && session.passCode) {
      const code = session.passCode;
      socket.leave(code); // Ensure the socket leaves the room on disconnect
      await SocketController.removeUser(session);
      socket
          .to(session.passCode)
          .emit("greeting", `${session.username} left the chat`);
      await SocketController.membersData(socket, session); // Update members list
      console.log("Client disconnected");
    }
  });
});

app.use(express.urlencoded({ extended: false }));

// Home page route
app.get("/", UserController.home);

// Route to create a new room
app.post("/createRoom", async (req, res) => {
  if (req.session.passCode) {
    res.end(await UserController.chackReloadroom(req, res))
  }else{
    await UserController.createRoom(req, res);
  }
});

// Route to join a room
app.post("/chat", async (req, res) => {
  if (req.session.passCode) {
    await UserController.chackReloadchat(req, res);
  }else{
    await UserController.gotoChatbox(req, res);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
  connect();
});

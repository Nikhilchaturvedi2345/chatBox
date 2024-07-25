import http from "http";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { Server } from "socket.io";
import SocketController from "./controllers/socket.io.js";
import UserController from "./controllers/controller.js";

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
  cookie: { secure: false },
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

  socket.on("newConnection", (user) => {
    const session = socket.request.session;
    SocketController.newUserJoins(user, socket);
    SocketController.membersData(io, session);
  });

  socket.on("message", (user) => {
    SocketController.newMessage(user, io);
  });

  socket.on("disconnect", () => {
    const session = socket.request.session;
    if (session && session.passCode) {
      const code = session.passCode;
      socket.leave(code); // Ensure the socket leaves the room on disconnect
      SocketController.removeUser(session);
      SocketController.membersData(socket, session); // Update members list
      console.log("Client disconnected");
    }
  });
  
});

app.use(express.urlencoded({ extended: false }));

app.get("/", UserController.home);
app.post("/chat", UserController.gotoChatbox);
app.post("/createRoom", UserController.createRoom);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});

import buildMessage from "../utils/msgformat.js";
import UserModel from "../model/userModel.js";

export default class Socket {
  // Handle new user joining the chat
  static newUserJoins(userinfo, socket) {
    try {
      const { name, code } = userinfo;
      const session = socket.request.session;

      // Join the user to the specified room
      socket.join(code);
      console.log(`${name} joined room ${code}`);

      // Broadcast greeting only to other members in the same room
      socket.to(code).emit(
        "greeting",
        buildMessage(`${name} joins the chat`).message
      );

      // Emit members data for the room
      Socket.membersData(socket, session);

    } catch (error) {
      console.error("Error broadcasting greeting:", error.message);
    }
  }

  // Handle new message sent by user
  static newMessage(userinfo, io) {
    try {
      let { name, message, date, code } = userinfo;
   
      // Emit new message only to users in the same room
      io.to(code).emit("newMessage", {
        name,
        message,
        date,
      });

    } catch (error) {
      console.error("Error emitting new message:", error.message);
    }
  }

  // Emit members data for a specific room
  static membersData(socket, session, io) {
    try {
      if (session && session.passCode) {
        const code = session.passCode;
        const members = UserModel.getAllPersons(code);
        socket.to(code).emit("membersdata", {
          data: members
        });
      } else {
        console.error("Session or passCode not available");
      }
    } catch (error) {
      console.error("Error emitting members data:", error.message);
    }
  }

  // Function to remove user from chat on disconnect
  static removeUser(session) {
    try {
      if (session && session.passCode && session.username) {
        const name = session.username;
        const passCode = session.passCode;

        if (UserModel.isAlreadyUser(name, passCode)) {
          UserModel.removeUser(name, passCode);
          console.log(`${name} removed from chat.`);
        }
      } else {
        console.error("Session or user not available to remove.");
      }
    } catch (error) {
      console.error("Error removing user from chat:", error.message);
    }
  }
}

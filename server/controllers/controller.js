import UserModel from "../model/userModel.js";
import generateRoomCode from "../utils/generateRoomCode.js";

export default class UserController {
  // Render the home page
  static home(req, res) {
    res.render("index", { err: null });
  }

  // Handle navigation to the chatbox
  static gotoChatbox(req, res) {
    const { name, code } = req.body;

    // Validate code format
    // if (!/^[a-zA-Z0-9]{9}$/.test(code)) {
    //   return res.render("index", { err: "Invalid Code Format" });
    // }

    // Check if code is valid
    const isValidCode = UserModel.validCode(code);
    if (!isValidCode) {
      return res.render("index", { err: "Invalid Code" });
    }

    // Check if user already exists for the given code
    const isAlreadyUser = UserModel.isAlreadyUser(name, code);
    if (!isAlreadyUser) {
      UserModel.addUser(name, code);
      req.session.username = name;
      req.session.passCode = code; // Store code in session
    }

    // Retrieve members for the code
    const members = UserModel.getAllPersons(code);

    // Render chatbox view with username, members, and room
    res.render("message", { username: name, members, room: code });
  }

  // Handle room creation
  static createRoom(req, res) {
    const { name } = req.body;
    const code = generateRoomCode();

    // Create the room first
    const roomCreated = UserModel.createRoom(code);
    if (!roomCreated) {
      return res.render("index", { err: "Failed to create room. Please try again." });
    }

    // Add the user to the newly created room
    UserModel.addUser(name, code);
    req.session.username = name;
    req.session.passCode = code; // Store code in session

    // Retrieve members for the code
    const members = UserModel.getAllPersons(code);

    // Render chatbox view with username, members, and room
    res.render("message", { username: name, members, room: code });
  }
}

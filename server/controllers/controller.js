import userRepository from "../repository/userRepository.js";
import generateRoomCode from "../utils/generateRoomCode.js";
import { sanitizeInput } from "../utils/sanitize.js";

const UserRepository = new userRepository();

export default class UserController {
  // Render the home page
  static async home(req, res) {
    try {
      // Reset session when user visits the home page
      if(req.session & req.passCode){
        await UserRepository.removeUser(req.session.username , req.session.passCode);
      }
      req.session.passCode = null;
      req.session.username = null;

      res.render("index", { err: null, request: false });
    } catch (error) {
      console.error("Error rendering home page:", error);
      res.status(500).render("error", { message: "Internal Server Error" });
    }
  }

  // Handle navigation to the chatbox
  static async gotoChatbox(req, res) {
    try {
      const { name, code } = req.body;

      // Input validation
      if (!name || !code) {
        return res.status(400).render("index", {
          err: "Name and Code are required.",
          request: false,
        });
      }

      // Sanitize inputs
      const sanitizedName = sanitizeInput(name);
      const sanitizedCode = sanitizeInput(code);

      // Validate code format (assuming code should be numeric and of specific length)
      if (sanitizedCode.length !== 4) {
        return res
          .status(400)
          .render("index", { err: "Invalid Code Format.", request: false });
      }

      // Check if code is valid
      const isValidCode = await UserRepository.validCode(sanitizedCode);
      if (!isValidCode) {
        return res
          .status(404)
          .render("index", { err: "Room not found.", request: false });
      }

      // Check if user already exists in the room
      const isAlreadyUser = await UserRepository.isAlreadyUser(
        sanitizedName,
        sanitizedCode
      );
      if (!isAlreadyUser) {
        const userAdded = await UserRepository.addUser(
          sanitizedName,
          sanitizedCode
        );
        if (!userAdded) {
          return res.status(500).render("index", {
            err: "Failed to join the room. Please try again.",
            request: false,
          });
        }
      }

      // Set session variables
      req.session.username = sanitizedName;
      req.session.passCode = sanitizedCode;

      // Retrieve members for the room
      const members = await UserRepository.getAllPersons(sanitizedCode);
      // Render chatbox view with username, members, and room code
      res.render("message", {
        username: sanitizedName,
        members,
        room: sanitizedCode,
      });
    } catch (error) {
      console.error("Error navigating to chatbox:", error);
      res.status(500).render("error", { message: "Internal Server Error" });
    }
  }

  // Handle room creation
  static async createRoom(req, res) {
    try {
      const { name } = req.body;
      // Input validation
      if (!name) {
        return res
          .status(400)
          .render("index", { err: "Name is required.", request: false });
      }

      // Sanitize name
      const sanitizedName = sanitizeInput(name);

      // Generate a unique room code
      let code;
      let isUnique = false;
      const maxAttempts = 5;
      let attempts = 0;

      while (!isUnique && attempts < maxAttempts) {
        code = generateRoomCode(); // Assumes this generates a 4-digit numeric code
        const exists = await UserRepository.validCode(code);
        if (!exists) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).render("index", {
          err: "Could not generate a unique room code. Please try again.",
          request: false,
        });
      }

      // Create the room
      const roomCreated = await UserRepository.createRoom(code);
      if (!roomCreated) {
        return res.status(500).render("index", {
          err: "Failed to create room. Please try again.",
          request: false,
        });
      }

      // Add the user to the newly created room
      const userAdded = await UserRepository.addUser(sanitizedName, code);
      if (!userAdded) {
        // Clean up by deleting the room if user addition fails
        await UserRepository.deleteRoom(code);
        return res.status(500).render("index", {
          err: "Failed to join the room. Please try again.",
          request: false,
        });
      }
      // Set session variables
      req.session.username = sanitizedName;
      req.session.passCode = code;


      // Retrieve members for the room
      const members = await UserRepository.getAllPersons(code);

      // Render chatbox view with username, members, and room code
      res.render("message", { username: sanitizedName, members, room: code });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).render("error", { message: "Internal Server Error" });
    }
  }

  static async chackReloadroom(req, res) {
    // Check if a room code already exists in the session
    const name = req.session.username;
    const code = req.session.passCode;
    const result = await UserRepository.isAlreadyUser(name, code);
    const onlyAdmin = await UserRepository.onlyAdmin(code);
    // Room already exists, redirect to the chatbox
    if (result && !onlyAdmin) {
      return res.status(204).send();
    }else{
      await this.createRoom(req, res);
    }
  }
  static async chackReloadchat(req, res) {
    // Check if a room code already exists in the session
    const name = req.session.username;
    const code = req.session.passCode;
    const result = await UserRepository.isAlreadyUser(name, code);
    const onlyAdmin = await UserRepository.onlyAdmin(code);
    // Room already exists, redirect to the chatbox
    if (result && !onlyAdmin) {
      return res.status(204).send();
    }else{
      await this.gotoChatbox(req, res);
    }
  }
}

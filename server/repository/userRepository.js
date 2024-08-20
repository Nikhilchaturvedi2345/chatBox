import { getDatabase } from "../config/mongodb.js";

class UserRepository {
  // Create a new room
  async createRoom(code) {
    try {
      const db = getDatabase();
      // Check if the room already exists
      if (await this.validCode(code)) {
        console.log(`Room with code ${code} already exists.`);
        return false;
      }

      // Create a new room
      await db.collection("rooms").insertOne({ code: Number(code), persons: [] });
      console.log(`Room ${code} created successfully.`);
      return true;
    } catch (error) {
      console.error(`Error creating room ${code}:`, error);
      return false;
    }
  }

  // Add a user to the chat group
  async addUser(name, code) {
    try {
      const db = getDatabase();
      if (!(await this.validCode(code))) {
        console.log(`Room with code ${code} does not exist.`);
        return false;
      }

      if (await this.isAlreadyUser(name, code)) {
        console.log(`${name} is already in the room.`);
        return false;
      }

      // Add user to the room
      await db
        .collection("rooms")
        .updateOne({ code: Number(code) }, { $push: { persons: name } });
      console.log(`${name} added to room ${code}.`);
      return true;
    } catch (error) {
      console.error(`Error adding ${name} to room ${code}:`, error);
      return false;
    }
  }

  // Get all persons in the chat room
  async getAllPersons(code) {
    try {
      const db = getDatabase();
      const room = await db.collection("rooms").findOne({ code: Number(code) });
      return room ? room.persons : [];
    } catch (error) {
      console.error(`Error retrieving persons for room ${code}:`, error);
      return [];
    }
  }

  // Check if a room with the given code exists
  async validCode(code) {
    try {
      const db = getDatabase();
      const room = await db.collection("rooms").findOne({ code: Number(code) });
      return !!room;
    } catch (error) {
      console.error(`Error validating room code ${code}:`, error);
      return false;
    }
  }

  // Check if a user is already in the room
  async isAlreadyUser(name, code) {
    try {
      const db = getDatabase();
      const room = await db
        .collection("rooms")
        .findOne({ code: Number(code), persons: name });
      return !!room;
    } catch (error) {
      console.error(`Error checking if ${name} is in room ${code}:`, error);
      return false;
    }
  }

  // Remove a user from the chat group
  async removeUser(name, code) {
    try {
      const db = getDatabase();

      if (!(await this.validCode(code))) {
        console.log(`Room with code ${code} does not exist.`);
        return false;
      }

      if (!(await this.isAlreadyUser(name, code))) {
        console.log(`${name} not found in room ${code}.`);
        return false;
      }

      // Remove user from the room
      await db
        .collection("rooms")
        .updateOne({ code: Number(code) }, { $pull: { persons: name } });

      // If the room is empty, delete the room
      const room = await db
        .collection("rooms")
        .findOne({ code: Number(code), persons: { $size: 0 } });
      if (room) {
        await db.collection("rooms").deleteOne({ code: Number(code) });
        console.log(`Room ${code} deleted as it became empty.`);
      }

      console.log(`${name} removed from room ${code}.`);
      return true;
    } catch (error) {
      console.error(`Error removing ${name} from room ${code}:`, error);
      return false;
    }
  }

async deleteRoom(code) {
  try {
    const db = getDatabase();
    await db.collection("rooms").deleteOne({ code: Number(code) });
    console.log(`Room ${code} deleted successfully.`);
    return true;
  } catch (error) {
    console.error(`Error deleting room ${code}:`, error);
    return false;
  }
}

}

export default UserRepository;

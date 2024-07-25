// Sample data (for demonstration purposes)
const users = []; // Users will be added dynamically
const rooms = []; // Rooms will be added dynamically

export default class UserModel {
  constructor(name, code) {
    this.name = name;
    this.code = code;
  }

  // Create a new room with a unique code
  static createRoom(code) {
    let codevalue = Number(code);
    console.log(`Attempting to create room with code: ${codevalue}`);

    // Check if the room already exists
    if (rooms.some((room) => room.code === codevalue)) {
      console.log(`Room with code ${codevalue} already exists.`);
      return false;
    }

    // Create a new room
    rooms.push({ code: codevalue, persons: [] });
    console.log(`Room ${codevalue} created successfully.`);
    return true;
  }

  // Add a user to the chat group
  static addUser(name, code) {
    let codevalue = Number(code);
    console.log(`Attempting to add user ${name} to room ${codevalue}`);

    let room = rooms.find((room) => room.code === codevalue);

    if (!room) {
      console.log(`Room with code ${codevalue} does not exist.`);
      return false;
    }

    // Check if user already exists in the room
    if (room.persons.includes(name)) {
      console.log(`${name} is already in the room.`);
      return false;
    }

    // Add user to the room
    room.persons.push(name);
    console.log(`${name} added to room ${codevalue}.`);
    console.log(`Current state of rooms:`, rooms);
    return true;
  }

  // Check if a user is already in the room
  static isAlreadyUser(name, code) {
    let codevalue = Number(code);
    const room = rooms.find((room) => room.code === codevalue);
    return room && room.persons.includes(name);
  }

  // Get all persons in the chat room
  static getAllPersons(code) {
    let codevalue = Number(code);
    const room = rooms.find((room) => room.code === codevalue);
    return room ? room.persons : []; // Return empty array if room not found
  }

  // Validate if the room code is correct
  static validCode(code) {
    let codevalue = Number(code);
    console.log(`Validating code: ${codevalue}`);
    console.log(`Current state of rooms:`, rooms);
    return rooms.some((room) => room.code === codevalue);
  }

  // Remove a user from the room
  static removeUser(name, code) {
    let codevalue = Number(code);
    console.log(`Attempting to remove user ${name} from room ${codevalue}`);

    const room = rooms.find((room) => room.code === codevalue);

    if (room) {
      const index = room.persons.indexOf(name);
      if (index !== -1) {
        room.persons.splice(index, 1);
        console.log(`${name} removed from room ${codevalue}.`);
        return true;
      }
    }

    console.log(`${name} not found in room ${codevalue}.`);
    return false;
  }
}

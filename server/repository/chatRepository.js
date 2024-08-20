import { getDatabase } from "../config/mongodb.js";
class ChatRepository {
  async newChat(name, code, text, time) {
    try {
      const db = await getDatabase();
      await db.collection("chats").updateOne(
        {
          name: name,
          code: code,
        },
        {
          $push: {
            text: {text,time}       
          },
        },
        {
          upsert: true
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
}


export default ChatRepository;
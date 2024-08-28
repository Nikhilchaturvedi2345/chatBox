      // Copy room code to clipboard
      document.getElementById("copyCode").addEventListener("click", () => {
        navigator.clipboard.writeText(roomCode).then(
          () => {
            alert("Room code copied to clipboard!");
          },
          (err) => {
            console.error("Failed to copy: ", err);
          }
        );
      });

      // Establish socket connection
      const socket = io.connect(window.location.origin);

      // Emit a new connection event with user information
      socket.emit("newConnection", {
        name: username,
        date: "Hello to everyone",
        code: roomCode,
      });

      // Join the room
      socket.emit("joinRoom", { name: username, code: roomCode });

      // Handle connection event
      socket.on("connect", () => {
        appendServerMessage("Connected to the server");
      });

      // Handle greeting event from the server
      socket.on("greeting", (data) => {
        appendServerMessage(data);
      });

      // Handle members data event from the server
      socket.on("membersdata", (data) => {
        appendMembersData(data);
      });

      // Handle new message event from the server
      socket.on("newMessage", (message) => {
        appendMessage(message);
      });

      // Handle disconnect event
      socket.on("disconnect", () => {
        appendServerMessage("Disconnected from the server");
      });

      // Error handling
      socket.on("connect_error", (err) => {
        console.error(`Connection error: ${err.message}`);
        appendServerMessage("Connection error");
      });

      socket.on("error", (err) => {
        console.error(`Socket error: ${err.message}`);
        appendServerMessage("Socket error");
      });
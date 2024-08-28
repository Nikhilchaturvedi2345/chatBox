const hamberger = document.getElementById("hamberger");
const member = document.getElementById("membersBox");
hamberger.addEventListener("click", () => {
  if (member.className.includes("-ml-96")) {
    member.classList.remove("-ml-96");
  } else {
    member.classList.add("-ml-96");
    hamberger.blur();
  }
});
hamberger.addEventListener("blur", () => {
  member.classList.add("-ml-96");
});

// Handle sending messages by mouse event
document.getElementById("submitbtn").addEventListener("click", sendMessage);

function sendMessage() {
  let textvalue = document.getElementById("inputMessage").value;
  const date = moment().format("h:mm a");
  if (textvalue) {
    socket.emit("message", {
      name: username,
      message: textvalue,
      date: new Date().getTime(),
      code: roomCode,
    });
    document.getElementById("inputMessage").value = "";
  }
}

// Handle sending messages by keyboard Event
document.onkeydown = function (evt) {
  var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
  if (keyCode == 13) {
    sendMessage();
  }
};

// Functions for appending messages and members
function appendMessage(message) {
  let messages = document.getElementById("messages");
  const isOwnMessage = message.name === username;
  const messageAlignClass = isOwnMessage ? "justify-end" : "justify-start";
  const messageBgClass = isOwnMessage ? "bg-green-200" : "bg-white";

  // Add the new message to the messages container
  messages.innerHTML += `<div class="flex ${messageAlignClass} w-full items-center">
        <div class="${messageBgClass} rounded-md min-w-60 max-w-96 w-auto px-4 pt-1 my-2">
          <h1 id="username" class="text-xs font-semibold text-left">${
            message.name
          }</h1>
          <p class="text-sm">${message.message}</p>
          <p class="text-xs text-right">${moment(message.date).format("LT")}</p>
        </div>
      </div>`;

  // Scroll to the bottom of the message container
  messages.scrollTop = messages.scrollHeight;
}

function appendServerMessage(message) {
  let messages = document.getElementById("messages");
  messages.innerHTML += `<div class=" flex justify-center w-full items-center">
              <p class="bg-white rounded-md min-w-60 max-w-96 w-auto px-4 my-2 text-sm text-center">${message}</p>
            </div>`;

  // Scroll to the bottom of the message container
  messages.scrollTop = messages.scrollHeight;
}

function appendMembersData(data) {
  let members = document.getElementById("memberList");
  members.innerHTML = "";
  data.data.forEach((element) => {
    members.innerHTML += `<div class="flex items-center justify-start gap-3 px-2 py-2 text-white">
          <div class="grid h-8 w-8 place-items-center rounded-full text-center ring-2 ring-orange-500">${element
            .substring(0, 1)
            .toUpperCase()}</div>
          ${element}
        </div>
    <div class="text-white px-10 py-2">
  </div>`;
  });
}

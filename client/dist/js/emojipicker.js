import { EmojiButton } from "https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@4.6.4/dist/index.min.js";

const picker = new EmojiButton({
    autoHide: false, // Prevent the picker from closing automatically
    position: "top-start",
  });
  const trigger = document.getElementById("emoji_picker");

  picker.on("emoji", (selection) => {
    let textvalue = document.getElementById("inputMessage");
    textvalue.value = textvalue.value + selection.emoji;
  });

  trigger.addEventListener("click", () => picker.togglePicker(trigger));
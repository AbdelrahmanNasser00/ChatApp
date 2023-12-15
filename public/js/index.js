const socket = io();
const clientsNumber = document.getElementById("Clients-Number");
const messageContainer = document.getElementById("messages-container");
// const nameInput = document.getElementById("name-Input");

const nameInput = prompt("please enter your name");
senderName = nameInput;

const messageInput = document.getElementById("message-input");
const form = document.getElementById("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

socket.on("clients-number", (data) => {
  clientsNumber.innerText = `Total clients: ${data}`;
});

function sendMessage() {
  console.log(messageInput.value);
  const data = {
    sender: senderName,
    message: messageInput.value,
    dataTime: new Date(),
  };
  socket.emit("message", data);
  addMessageToUI(true, data);
  messageInput.value = "";
}

socket.on("chat-message", (data) => {
  console.log(data);
  addMessageToUI(false, data);
});

socket.on("chat-history", (history) => {
  history.forEach((message) => {
    if (message.sender_name === senderName) {
      console.log("message has been added");
      addMessagesHistory(true, message);
    } else {
      addMessagesHistory(false, message);
    }
  });
});
function addMessagesHistory(isOwnMessage, message) {
  const myMessageName = isOwnMessage ? "You" : message.sender_name;
  const element = `
            <div class="${isOwnMessage ? "message-right" : "message-left"}">
                <div class="message-top">
                    <h2 class="name" id="name">${myMessageName}</h2>
                    <div class="date" id="date">${moment(
                      message.timestamp
                    ).fromNow()}</div>
                </div>    
                <p id="message">${message.content}</p>  
            </div>
    `;
  messageContainer.innerHTML += element;
}
function addMessageToUI(isOwnMessage, data) {
  const myMessageName = isOwnMessage ? "You" : data.sender;
  const element = `
    <div class="${isOwnMessage ? "message-right" : "message-left"}">
        <div class="message-top">
            <h2 class="name" id="name">${myMessageName}</h2>
            <div class="date" id="date">${moment(data.dataTime).fromNow()}</div>
        </div>    
        <p id="message">${data.message}</p>                           
    </div>`;
  messageContainer.innerHTML += element;
}
function isValidName(nameInput) {
  // Use a regular expression to check for valid name characters
  if (nameInput === null) {
    return false;
  }
}

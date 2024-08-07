const socket = io();
const clientsNumber = document.getElementById("Clients-Number");
const messageContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const onlineUsersContainer = document.getElementById("online-users-container");
const form = document.getElementById("form");
let nameInput = prompt("please enter your name");

// Check user name validation
while (!isValidName(nameInput)) {
  let name = prompt("please enter valid name");
  nameInput = name;
}

senderName = nameInput;
const senderData = {
  socketId: null,
  name: senderName,
};
socket.emit("new-user", senderData);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

// Add user's message to message's container
socket.on("add-message-to-left", (data) => {
  console.log(data);
  addMessageToUI(false, data);
});

// Retreive old chat when new user login
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

// When new user connected, his name added to online user section
socket.on("online-users", (socketsArray) => {
  updateOnlineUsersUI(socketsArray);
});

// Add message to others that a new user joined the chat
socket.on("new-user-joined", (data) => {
  newUserJoinedMessage(data);
});

//
socket.on("user-leave-chat", (data) => {
  userLeaveMessage(data);
});
// send my own message to other users and show it in message container
function sendMessage() {
  const data = {
    sender: senderName,
    message: messageInput.value,
    dataTime: new Date(),
  };
  socket.emit("message", data);
  addMessageToUI(true, data);
  messageInput.value = "";

  scrollMessageContainer();
}

// Add old messages to message container
function addMessagesHistory(isOwnMessage, message) {
  const myMessageName = isOwnMessage ? "" : message.sender_name;
  const element = `
            <div class="${isOwnMessage ? "message-right" : "message-left"}">
                <div class="message-top">
                    <h2 class="name" id="name">${myMessageName}</h2>                   
                </div>    
                <p class="message" id="message">${message.content}</p>  
                <div class="date" id="date">${moment(
                  message.timestamp
                ).fromNow()}</div>
            </div>
    `;
  messageContainer.innerHTML += element;
  scrollMessageContainer();
}

// When user send message it add it to message container
function addMessageToUI(isOwnMessage, data) {
  const myMessageName = isOwnMessage ? "" : data.sender;
  const element = `
    <div class="${isOwnMessage ? "message-right" : "message-left"}">
        <div class="message-top">
            <h2 class="name" id="name">${myMessageName}</h2>
        </div>    
            <p class="message" id="message">${data.message}</p>  
            <div class="date" id="date">${moment(
              data.dataTime
            ).fromNow()}</div>                   
    </div>`;
  messageContainer.innerHTML += element;
}

// Check user name is valid or not
function isValidName(nameInput) {
  if (nameInput === null || nameInput === "") {
    return false;
  }
  return true;
}

// When any signin it add him to Online users section
function updateOnlineUsersUI(userList) {
  onlineUsersContainer.innerHTML = "";
  userList.forEach((user) => {
    const element = `
      <div class="user">
        <div class="user-left">
          <i class="fa-solid fa-user" id="user-icon"></i>
          <h3 class="online-user-name">${user.name}</h3>
        </div>
        <div class="user-right">
          <i class="fa-solid fa-circle" id="online-icon"></i>
        </div>
      </div>`;
    onlineUsersContainer.innerHTML += element;
  });
}

// Make scroll bar scrolled down when any message sended
function scrollMessageContainer() {
  const messageContainer = document.getElementById("messages-container");
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function newUserJoinedMessage(data) {
  const element = `
      <div class="user-joined-message">
            <p>${data} has joined the chat</p>
      </div>
  `;
  messageContainer.innerHTML += element;
}

function userLeaveMessage(data) {
  const element = `
      <div class="user-joined-message">
          <p>${data} has leaved the chat</p>
      </div>
  `;
  messageContainer.innerHTML += element;
}

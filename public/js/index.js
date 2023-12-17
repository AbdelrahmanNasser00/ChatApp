const socket = io();
const clientsNumber = document.getElementById("Clients-Number");
const messageContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const onlineUsersContainer = document.getElementById("online-users-container");
const form = document.getElementById("form");
const nameInput = prompt("please enter your name");
// do {
//   console.log(nameInput);

//   nameInput = prompt("Please enter your name");
// } while (!isValidName(nameInput));
console.log(nameInput);
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

// socket.on("new-user-name", (data) => {
//   addOnlineUserToUi(data);
// });

// Add user's message to message's container
socket.on("chat-message", (data) => {
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
  console.log(socketsArray);
  updateOnlineUsersUI(socketsArray);
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

function addMessagesHistory(isOwnMessage, message) {
  const myMessageName = isOwnMessage ? "" : message.sender_name;
  const element = `
            <div class="${isOwnMessage ? "message-right" : "message-left"}">
                <div class="message-top">
                    <h2 class="name" id="name">${myMessageName}</h2>                   
                </div>    
                <p id="message">${message.content}</p>  
                <div class="date" id="date">${moment(
                  message.timestamp
                ).fromNow()}</div>
            </div>
    `;
  messageContainer.innerHTML += element;
}

function addMessageToUI(isOwnMessage, data) {
  const myMessageName = isOwnMessage ? "" : data.sender;
  const element = `
    <div class="${isOwnMessage ? "message-right" : "message-left"}">
        <div class="message-top">
            <h2 class="name" id="name">${myMessageName}</h2>
        </div>    
            <p id="message">${data.message}</p>  
            <div class="date" id="date">${moment(
              data.dataTime
            ).fromNow()}</div>                   
    </div>`;
  messageContainer.innerHTML += element;
}

function isValidName(nameInput) {
  // Use a regular expression to check for valid name characters
  if (nameInput == null) {
    return false;
  }
  return true;
}

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

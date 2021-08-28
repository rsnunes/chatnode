const socket = io();
let username = '';
let userlist = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginName');
let chatInput = document.querySelector('#chatText');

loginPage.style.display = 'flex';
loginInput.focus();
chatPage.style.display = 'none';

function renderUserList(){
    let ul = document.querySelector('.userList');

    ul.innerHTML = '';
    userlist.forEach(i => {
        ul.innerHTML += '<li>'+i+'</li>';
    });
}

function addMessage(type, user, msg){
    let ul = document.querySelector('.chatList');

    switch(type){
        case 'status':
            ul.innerHTML += "<li class='m-status'>"+msg+"</li>";
        break;
        case 'msg':
            if(username == user){
                ul.innerHTML += "<li class='m-txt'><span class='me'>"+user+"</span> "+msg+"</li>";
            } else {
                ul.innerHTML += "<li class='m-txt'><span>"+user+"</span> "+msg+"</li>";
            }
    }

    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        let name = loginInput.value.trim();
        if(name != ''){
            username = name;
            document.title = 'Chatnode ('+username+')';

            socket.emit('join-request', username);
        }
    }
});

chatInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        let txt = chatInput.value.trim();
        chatInput.value = '';

        if(txt != ''){
            addMessage('msg', username, txt); //envio msg user local
            socket.emit('send-msg', txt);
        }
    }
});

socket.on('user-ok', (list)=>{
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    chatInput.focus();

    addMessage('status', null, 'Conectado!');

    userlist = list;
    renderUserList();
});

socket.on('list-update', (data)=>{
    if(data.joined){
        addMessage('status', null, data.joined+" entrou no chat.");
    }
    if(data.left){
        addMessage('status', null, data.left+" saiu do chat.");
    }

    userlist = data.list;
    renderUserList();
});

socket.on('show-msg', (data)=>{
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', ()=>{
    addMessage('status', null, 'Você foi desconectado.');
    userlist = [];
    renderUserList();
});

socket.on('connect_error', ()=>{
    addMessage('status', null, 'Tentando reonectar...');
});

socket.on('reconnect', ()=>{
    addMessage('status', null, 'Reconectado.');
    
    if(username != ''){
        socket.emit('user-join', username);
    }
});
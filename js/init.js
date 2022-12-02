//parse iso date str to readable date format
function parseDateStr(isoDateStr) {
    const d = new Date();
    const msgDate = new Date(isoDateStr);

    let day = '';
    if(d.getDate() === msgDate.getDate()) {
        day = 'Today';
    }
    else if(d.getDate() - 1 === msgDate.getDate()) {
        day = 'Yesterday';
    }
    else day = msgDate.toLocaleDateString();

    let hours = parseInt(msgDate.getHours());
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const mins = msgDate.getMinutes();

    return hours + ':' + mins + ampm + ' ' + day;
}

//add new message item element to chat history list
function appendNewMessage(from, datetime, message) {
    const alignRightText =  from === 'Visitor' ? 'align-right' : '';
    const floatRightText = from === 'Visitor' ? 'other-message float-right' : 'my-message';

    var spinner_elem = document.getElementById('typing');

    var list_item_elem = document.createElement('li');
    list_item_elem.className = 'clearfix message-item';
    list_item_elem.innerHTML = 
        `<div class="message-data ${alignRightText} ">
            <span class="message-data-time" >${parseDateStr(datetime)}</span> &nbsp; &nbsp;
            <span class="message-data-name" >${from}</span> <i class="fa fa-circle me"></i>
        </div>
        <div class="message ${floatRightText}">${message}</div>`;

    spinner_elem.parentNode.insertBefore(list_item_elem, spinner_elem);
}

//move historybox scroll to bottom whenever message is added to history
function scrollToBottom() {
    document.getElementById("historyBox").scroll({
        behavior: 'smooth',
        left: 0,
        top: document.getElementById("historyBox").scrollHeight
    });
}

function onChatReceivedCallback(event) {
    const { datetime, message, from } = event?.detail || {};
    
    appendNewMessage(from, datetime, message);
    
    //chat-history scroll to bottom
    scrollToBottom();
    
    chat.getChatHistory(function(chats) {
        document.getElementById("message_cnt").innerHTML = `already ${chats.length.toLocaleString()} messages`;
    });
};

function loadData(chats){
    chats?.forEach(({ from, datetime, message } = {}) => {
        appendNewMessage(from, datetime, message);
    });

    //chat-history scroll to bottom
    scrollToBottom();

    document.getElementById('message_cnt').innerHTML = `already ${chats.length} messages`;
}

function onLoad() {
    //fetch message history data from local storage when page loaded
    chat.getChatHistory(loadData);

    chat.addListener("chatreceived", onChatReceivedCallback);

    //to show spinner until receive other's message
    chat.addListener("typingstarted", function(isFull) {
        if(isFull) {
            document.getElementById("typing").style.display = 'block';
            scrollToBottom();
        } 
    });

    chat.addListener("typingended", function(isFull) {
        if(!isFull) document.getElementById("typing").style.display = 'none';
    });

    //when click send button
    document.getElementById("chatSubmit").onclick  = function() {
        const text = document.getElementById('chatInput').value;
        if(text !== ''){
            chat.sendChat(text);
            document.getElementById('chatInput').value = '';
        } 
    };

    //ctrl+Enter event
    document.getElementById("chatInput").onkeydown = function(e) {
        if(e.ctrlKey && e.key === 'Enter'){
            const text = document.getElementById('chatInput').value;
            if(text !== ''){
                chat.sendChat(text);
                document.getElementById('chatInput').value = '';
            }
        }
    }
}
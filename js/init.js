function parseDateStr(isoDateStr) {
    const d = new Date();
    const msgDate = new Date(isoDateStr.slice(0, -1));

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
    chat.getChatHistory(loadData);

    chat.addListener("chatreceived", onChatReceivedCallback);

    chat.addListener("typingstarted", function(isFull) {
        if(isFull) {
            document.getElementById("typing").style.display = 'block';
            scrollToBottom();
        } 
    });

    chat.addListener("typingended", function(isFull) {
        if(!isFull) document.getElementById("typing").style.display = 'none';
    });

    document.getElementById("chatSubmit").onclick  = function() {
        chat.sendChat(document.getElementById('chatInput').value);
        document.getElementById('chatInput').value = '';
    };

    //ctrl+Enter event
    document.getElementById("chatInput").onkeydown = function(e) {
        if(e.ctrlKey && e.key === 'Enter') chat.sendChat(document.getElementById('chatInput').value);
    }
}
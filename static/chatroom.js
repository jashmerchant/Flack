document.addEventListener("DOMContentLoaded", function() {
    if(!localStorage.getItem("arr_channelList")) {
        let arr_channelList = ["# general"]; 
        localStorage.setItem("arr_channelList", JSON.stringify(arr_channelList));
    }
    var arr_channelList = JSON.parse(localStorage.getItem("arr_channelList"));
    for(let i=0; i<arr_channelList.length; i++) {
        let li = document.createElement("li");
        li.innerHTML = "<span class='channel'>" + arr_channelList[i] + "</span>";
        document.querySelector("#channel-list").append(li);;
    }
    let recentChannel = localStorage.getItem("recentChannel");
    var allChannels = document.getElementsByClassName("channel");
    for (var i = 0; i < allChannels.length; i++) {
        if (allChannels[i].textContent == recentChannel) {
            console.log(allChannels[i]);
            allChannels[i].classList.add("active");
            doSomething();
        }
    }
});

// Connect to websocket
var socket = io.connect('http://' + document.domain + ':' + location.port);
var clients = [];

// When connected;
socket.on('connect', function() {   

    // Add client to clients array on connecting
    socket.on('connect', function(client) {
        clients.push(client); 
    
        client.on('disconnect', function() {
            clients.splice(clients.indexOf(client), 1);
        });
    });
    
    //EVENT: Adding channel by clicking plus-icon
    var plus = document.querySelector(".fa-plus");
    plus.addEventListener("click", function() {
        var channel = prompt("Channel Name?");
        var cl = document.querySelector("#channel-list").textContent;
        if (channel.trim() !== "" && !cl.includes(channel)) {
            socket.emit('plus clicked', {'newchannel': "# " + channel});
        } else {
            alert("Channel already exists!");
        }
    });  

    //EVENT: Message is sent
    $("input").on("keypress", function(event) {
        if(event.which === 13) {
            var inputBox = $(this).val();
            $(this).val("");
            let username = JSON.parse(document.getElementById("username").dataset.username);
            let activeChannel = document.getElementsByClassName("active")[0].innerHTML;
            socket.emit('message sent', {'newmessage': inputBox, 'username': username, 'channel': activeChannel});
        }
    });
});

//--------------------------------------------------------------------------------//

//// Broadcasted Socket.io Events

//EVENT 1: New channel is added
socket.on('addnewchannel', function(data) {
    let li = document.createElement('li');
    li.innerHTML = "<span class='channel'>" + data.newchannel + "</span>";
    let arr_channelList = JSON.parse(localStorage.getItem("arr_channelList"));
    arr_channelList.push(data.newchannel);
    localStorage.setItem("arr_channelList", JSON.stringify(arr_channelList));
    document.querySelector("#channel-list").append(li);
});

//EVENT 2: New message is received
socket.on('addnewmessage', function(data) {
    // get a new date (locale machine date time)
    var date = new Date();
    // get the date as a string
    var d = date.toDateString();
    // get the time as a string
    var time = date.toLocaleTimeString();

    var channelL = data.channel;
    if(!localStorage.getItem(channelL)) {
        localStorage.setItem(channelL, JSON.stringify([]));
    } 
    let allmessages = JSON.parse(localStorage.getItem(channelL));
    //Check if the message count reached 100
    if(allmessages.length <= 100) {
        $("ul#message-box").append('<li><strong>' + data.username + '</strong>' + '&nbsp &nbsp &nbsp <em>' + d + " " + time + '</em><br>' + data.newmessage + '</li>');
    } else {
        //If message-count > 100, delete top-most message from the list
        $("ul#message-box li:first-child").remove();
        $("ul#message-box").append('<li><strong>' + data.username + '</strong>' + '&nbsp &nbsp &nbsp <em>' + d + " " + time + '</em><br>' + data.newmessage + '</li>');
    }
    
    //Fetch the latest message and store it in localStorage w.r.t the channel in which it's sent
    let latestMessage = $('ul#message-box li:last-child');
    allmessages.push(latestMessage[0].innerHTML);
    localStorage.setItem(channelL, JSON.stringify(allmessages));
});

//---------------------------------------------------------------------------------//

//// JS Events

//EVENT 1: Channel is selected
var channelList = document.querySelector("#channel-list");
$(document).on('click','.channel',function(){
    if($(".channel").hasClass("active")) { $(".channel").removeClass("active"); }
    $(this).addClass("active");
    document.querySelector("#channelName").innerHTML = "<strong>" + this.textContent + "</strong>";
    $('input').attr('placeholder', 'Message ' + this.textContent.replace(/\s/g, ""));
    localStorage.setItem("recentChannel", this.innerHTML);
    doSomething(); 
});

//----------------------------------------------------------------------------------//

// Reusable functions:
function doSomething() {
    $("ul#message-box").empty();
    var activeChannel = document.getElementsByClassName("active")[0].innerHTML;
    let allmessages = JSON.parse(localStorage.getItem(activeChannel));
    for(var i=0; i<allmessages.length; i++) {
        let li = document.createElement("li");
        li.innerHTML = allmessages[i];
        document.querySelector("#message-box").append(li);
    }
}

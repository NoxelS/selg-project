
function httpSendAsync(theUrl, data, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            callback(xmlHttp.responseText, theUrl);
            console.log('Data was sent');
        }
    }

    xmlHttp.open("POST", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xmlHttp.send(data);
}

// Callback
function sendCall(res, theUrl){
    const respond = JSON.parse(res);
    document.getElementById('info').innerHTML = (respond.text + " @"+theUrl+"<br>Token: "+respond.token);
    if(respond.token.length >= 1){
        sessionStorage.setItem('token', respond.token);
        console.log("Hello "+ JSON.stringify(respond.activeUser.username));
        sessionStorage.setItem('username', respond.activeUser.username);
        window.location = "http://127.0.0.1:5500/panel.html";
    }
}

function login(){
    var input_username = document.getElementById('username').value;
    var input_password = document.getElementById('password').value;
    httpSendAsync('http://192.168.178.37:3000/post', JSON.stringify({username: input_username, password: input_password}), sendCall)
}
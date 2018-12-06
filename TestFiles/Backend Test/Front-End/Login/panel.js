var startTime;
var endTime;
function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            endTime = (new Date()).getTime();
            callback(xmlHttp.responseText, theUrl);
            document.getElementById('requestStatus').innerHTML = xmlHttp.status;
            document.getElementById('readsState').innerHTML = xmlHttp.readyState;
            document.getElementById('responseTime').innerHTML = (endTime - startTime) + "ms";
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    startTime = (new Date()).getTime();
    xmlHttp.send("HELLO");
}

function getCall(res, theUrl){
    document.getElementById('connectionTo').innerHTML = theUrl;
    const Students = JSON.parse(res);
    console.log(Students);
    document.getElementById('data').innerHTML = JSON.stringify(Students);
}

function getData(){
    httpGetAsync('http://192.168.178.37:3000/', getCall);
}

function sendData(){
    var data = document.getElementById('name').value;
    httpSendAsync('http://192.168.178.37:3000/post', data, sendCall)
}

var loginData = {
    login: "test",
    password: "password"
};

function httpSendAsync(theUrl, data, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            endTime = (new Date()).getTime();
            document.getElementById('requestStatus').innerHTML = xmlHttp.status;
            document.getElementById('readsState').innerHTML = xmlHttp.readyState;
            document.getElementById('responseTime').innerHTML = (endTime - startTime) + "ms";  
            callback(xmlHttp.responseText, theUrl);
            console.log('Data was sent');
        }
    }

    xmlHttp.open("POST", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    startTime = (new Date()).getTime();
    xmlHttp.send(JSON.stringify({login: data, password: 'password'}));
}

function sendCall(res, theUrl){
    document.getElementById('connectionTo').innerHTML = theUrl;
    console.log('recived: '+res+' at '+theUrl);
}

function checkSession(){

    // @TODO -> Validate Token via Server 

    console.log("Session Token: "+sessionStorage.getItem('token'));

    if(!sessionStorage.getItem('token')){
       // sessionStorage.clear(); 
       // window.location = "http://127.0.0.1:5500/login.html";
    }else{
        setTimeout(function() {
            document.write("<h1>Hello "+sessionStorage.getItem('username')+"</h1>");
        }, 2000);
    }
}
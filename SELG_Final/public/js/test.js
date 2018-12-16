function login(){
    if(document.getElementById("inputPassword").value == "passwort" && document.getElementById("inputEmail").value == "admin"){
        console.log("Success");
        window.location.href = "index.html"
        
    }
}
function onLoad(){
    if(localStorage.getItem('selg_username')){
        document.getElementById('username_check').checked = true;
        document.getElementById('username').value = localStorage.getItem('selg_username');;
    }
}

function onSave(){
    // Wenn der Haken entfernt wird
    if(!document.getElementById('username_check').checked){
        localStorage.removeItem('selg_username');
    }else{
        localStorage.setItem('selg_username', document.getElementById('username').value);
    }
}

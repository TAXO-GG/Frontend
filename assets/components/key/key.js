
class Key {
    constructor(data){
        this.initKey();
        this.initContent();
    }

    init(){
        loadHtml(body, "components/key/key.html");
    }

    initContent(){

    }
}

var key = new Key();
session.setKey(key);

class Preloader{

    constructor(){

    }

    init(){
    }

    close(){
        document.getElementById("Preloader").classList.add("none");
    }

}

window.Preloader = Preloader;
session.setPreloader(new Preloader());
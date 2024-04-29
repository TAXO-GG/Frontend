class Modal{

    modal;
    close;
    container;

    active;
    parentBuffer;

    constructor(){
        this.active = false;
    }

    init(){
        this.parentBuffer = null;
        this.window = document.getElementById("modal");
        this.modal = document.getElementById("modal");
        this.close = document.getElementById("close-modal");
        this.container = document.getElementById("modal-content");
        
        this.close.addEventListener("click", this.closeModal.bind(this));
        this.window.addEventListener("click", function(e){
            if (e.target !== this.window) return;
            this.closeModal();
        }.bind(this));
    }

    loadContent(element){
        this.container.innerHTML = element.innerHTML;
        this.showModal();
    }

    swapContent(element){
        this.parentBuffer = element;
        this.container.innerHTML = element.innerHTML;
        this.parentBuffer.innerHTML = "";
        this.showModal();
    }

    showModal(){
        this.active = true;
        this.modal.classList.remove("none");
    }

    emptyModal(){
        if(!(this.parentBuffer == undefined || this.parentBuffer == null)){
            this.parentBuffer.innerHTML = this.container.innerHTML;
            this.parentBuffer = null;
        }
        this.container.innerHTML = "";
    }

    loadAlert(message){
        if(this.active){
            this.emptyModal();
        } else {
            this.showModal();
        }
        this.container.innerHTML = `<img id="AlertIcon" src="assets/img/alert.svg">\n<p id="AlertMessage">${message}</p>`;
    }

    async closeModal(){
       // this.modal.style.opacity = 0;
        //setTimeout(function() {
            this.modal.classList.add("none");
            this.emptyModal();
       //     this.modal.opacity = 1;
        //}.bind(this), 500);
        this.active = false;
    }

}

window.Modal = Modal;
session.setModal(new Modal());
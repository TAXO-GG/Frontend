class Modal{

    modal;
    close;
    container;

    active;
    parentBuffer;

    closeModalHandler;

    constructor(){
        this.active = false;
        this.closeModalHandler = null;
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

    askForConfirmation(message) {
        return new Promise((resolve, reject) => {
            if (this.active) {
                this.emptyModal();
            } else {
                this.showModal();
            }
            this.container.innerHTML = `
                <img id="AlertIcon" src="assets/img/question.svg">
                <p id="AlertMessage">${message}</p>
            `;

            let buttons = document.createElement("p");

            let confirmationButton = document.createElement("a");
            confirmationButton.id = "confirmation-button lng btn btn-primary";
            confirmationButton.setAttribute('lng', 27);
            confirmationButton.innerText = "Confirmar";
            confirmationButton.classList.add();
            buttons.appendChild(confirmationButton);

            let cancelButton = document.createElement("a");
            cancelButton.id = "cancel-button lng btn btn-primary";
            cancelButton.setAttribute('lng', 28);
            cancelButton.innerText = "Confirmar";
            cancelButton.classList.add();
            buttons.appendChild(cancelButton);

            this.container.appendChild(buttons);

            confirmationButton.onclick = () => {
                this.closeModal().then(() => resolve(true));
            };

            cancelButton.onclick = () => {
                this.closeModal().then(() => resolve(false));
            };

            this.closeModalHandler = () => resolve(false);
        });
    }

    async closeModal() {
        this.modal.classList.add("none");
        this.emptyModal();
        this.active = false;
        if (this.closeModalHandler) {
            this.closeModalHandler();
            this.closeModalHandler = null;
        }
    }

}

window.Modal = Modal;
session.setModal(new Modal());
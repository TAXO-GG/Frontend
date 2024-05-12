class Menu {

  active;

  selector;
  burger;
  buttons;

  constructor(){
  }
  
  init(){
    this.selector = document.getElementById("lang-selector");
    this.burger = document.getElementById("menu-burger");
    this.buttons = document.getElementById("menu-buttons");
    this.initLangSelector();
    this.initBurger();
    var buttons = this.buttons.getElementsByClassName("button");

    for (var button of buttons) {
      button.addEventListener("click", function (e) {
        var button = e.target;
        if (e.target instanceof HTMLParagraphElement) {
          button = button.closest(".button");
        }
        if (!button.classList.contains("active")) {
          var active = document.getElementById("menu-buttons").querySelector(".active");
          if (active !== null) active.classList.remove("active");
          button.classList.add("active");
        }
      }.bind(this));
    }

    var window = Router.getInstance().getParam('window');
    var buttonRelatedToTheUrl = this.buttons.querySelector(`[data-tab="${window}"]`);
    if(buttonRelatedToTheUrl==null) return;
    buttonRelatedToTheUrl.classList.add("active")
  }

  initLangSelector(){
    const languages = Array.from(langs.keys());

    languages.forEach(language => {
      const lngName = langNames.get(language);

      var option = document.createElement("option");
      option.value = language;
      option.text = language.toUpperCase();
      option.title = lngName;
      this.selector.appendChild(option);
    });

    this.selector.addEventListener("change", function() {
      setLang(this.selector.value);
    }.bind(this));
  }

  initBurger() {
    this.burger.addEventListener("click", function() {
        session.modal.swapContent(this.buttons);
    }.bind(this));
  }

}

window.Menu = Menu;
session.setMenu(new Menu);
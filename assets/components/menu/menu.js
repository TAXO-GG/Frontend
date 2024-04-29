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
    for (var element of buttons) {
      element.addEventListener("click", function (e) {
        var element = e.target;
        if (e.target instanceof HTMLParagraphElement) {
          element = element.closest(".button");
        }
        if (!element.classList.contains("active")) {
          var active = document.getElementById("menu-buttons").querySelector(".active");
          if (active !== null) active.classList.remove("active");
          element.classList.add("active");
        }
      }.bind(this));
    }
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
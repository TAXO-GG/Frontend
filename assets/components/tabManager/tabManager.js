class Tab{

    tamManager;
    tab;
    title;

    content;

    constructor(title, tabManager){
        this.tabManager = tabManager;
        this.title = title;
        this.content = document.createElement("div");
        this.init();
    }

    init(){
      this.tabManager.tabReferences.push(this);
      // Crear un nuevo elemento div
      this.tab  = document.createElement("div");
      this.tab.className = "tab";

      // Crear un elemento p para el título
      var p = document.createElement("p");
      p.textContent = this.title;

      // Crear un elemento a para el botón de cierre (x)
      var a = document.createElement("a");
      a.className = "closeTab";
      a.textContent = "x";

      this.tab.appendChild(p);
      this.tab.appendChild(a);

      this.tabManager.tabList.appendChild(this.tab);

      this.tab = this.tabManager.tabList.lastChild;
      this.setActive(true);
      this.tab.addEventListener("click", function(e){
          if (e.target.classList.contains("closeTab") || this.tab.classList.contains("active")) return;
          this.setActive();
      }.bind(this));
      this.tab.getElementsByClassName("closeTab")[0].addEventListener("click", function(e){
          this.close();
      }.bind(this));
    }

    setActive(justCreated){
      if(this.tabManager.active != null) this.tabManager.active.removeActive();
      this.tabManager.active = this;
      this.tab.classList.add("active");

      this.extendsSetActive(justCreated);

      this.loadContent(this.content);
    } extendsSetActive(justCreated){}
    

    removeActive(){
      this.tab.classList.remove("active");
    }

    close(){
      while (this.tabManager.tabDisplay.firstChild) {
        this.content.appendChild(this.tabManager.tabDisplay.firstChild);
      }
      this.removeActive();
      deleteFromArray(this.tabManager.tabReferences, this);
      this.tabManager.tabList.removeChild(this.tab);
      if(this.tabManager.active == this){
        var lastTab = this.tabManager.getLast();
        if(lastTab!=null) lastTab.setActive();
      }
      this.extendsClose();
    }

    loadContent(container){
      while (container.firstChild) {
        this.tabManager.tabDisplay.appendChild(container.firstChild);
      }
    }

    extendsClose(){}

}

class Keys_Tab extends Tab{
  static keys_Tab = null;
  static visible = false;
  constructor(){
    super(getText(4), session.tabManager);
  }
  static getInstance(){
    console.log(Keys_Tab.keys_Tab);
    if(Keys_Tab.keys_Tab == null){
      Keys_Tab.keys_Tab = new Keys_Tab();
    } else {
      session.tabManager.tabList.appendChild(Keys_Tab.keys_Tab.tab);
      Keys_Tab.keys_Tab.setActive(true);
    }
    Keys_Tab.visible = true;
    return Keys_Tab.keys_Tab;
  }
  extendsSetActive(justCreated){
    if(justCreated || Keys_Tab.visible) return;
    Keys_Tab.visible = true;
    session.paramManager.setParam("window","keys");
  }
  extendsClose(){
    Keys_Tab.visible = false;
  }
}

class Home_Tab extends Tab{
  static home_Tab = null;
  static visible = false;
  constructor(){
    super(getText(2), session.tabManager);
  }
  static getInstance(){
    console.log(Home_Tab.home_Tab);
    if(Home_Tab.home_Tab == null){
      Home_Tab.home_Tab = new Home_Tab();
    } else {
      session.tabManager.tabList.appendChild(Home_Tab.home_Tab.tab);
      Home_Tab.home_Tab.setActive(true);
    }
    Home_Tab.visible = true;
    return Home_Tab.home_Tab;
  }
  extendsSetActive(justCreated){
    
    if(justCreated || Home_Tab.visible) return;
    Home_Tab.visible = true;
    session.paramManager.setParam("window","home");
  }
  extendsClose(){
    Home_Tab.visible = false;
  }
}

class UpdateLimit {
    lastUpdateTime = 0;
    frameRate;

    constructor(limitPerSecond){
        this.frameRate = 1000 / limitPerSecond;
    }

    update = async (e, updateFunction) => {
        const currentTime = performance.now();
        if (currentTime - this.lastUpdateTime >= 1000 / this.frameRate) {
            updateFunction(e);
            this.lastUpdateTime = currentTime;
        }
    }
}

class Slider {
    slider;
    isMoving = false;
    xStartPosition;
    scrollLeft;
    
    updateLimit;
  
    constructor(sliderElement) {
      this.slider = sliderElement;
      this.addListeners();
      this.updateLimit = new UpdateLimit(30);
    }
  
    end = () => {
      this.slider.classList.remove('moving');
      this.isMoving = false;
    }
  
    start = (e) => {
      if (e.touches) {
        e = e.touches[0];
      }
      this.isMoving = true;
      this.slider.classList.add('moving');
      this.xStartPosition = e.pageX - this.slider.offsetLeft;
      this.scrollLeft = this.slider.scrollLeft;
      this.lastUpdateTime = performance.now();
    }
  
    move = (e) => {
      if (!this.isMoving) return;
      e.preventDefault();
      if (e.touches) {
        e = e.touches[0];
      }
      this.updateLimit.update(e, this.updatePosition);
    }
  
    updatePosition = (e) => {
      if (this.isMoving) {
        const x = e.pageX - this.slider.offsetLeft;
        const dist = x - this.xStartPosition;
        this.slider.scrollLeft = this.scrollLeft - dist;
      }
    }
  
    addListeners() {
      this.slider.addEventListener('mousedown', this.start);
      this.slider.addEventListener('touchstart', this.start);
  
      this.slider.addEventListener('mousemove', this.move);
      this.slider.addEventListener('touchmove', this.move);
  
      this.slider.addEventListener('mouseleave', this.end);
      this.slider.addEventListener('mouseup', this.end);
      this.slider.addEventListener('touchend', this.end);
    }
  }

class TabManager{

    tabReferences;
    active;

    tabList;
    container;
    slider;
    tabDisplay;

    getLast(){
      if(this.tabReferences == null) return null;
      var length = this.tabReferences.length;
      if(length > 0) return this.tabReferences[length - 1];
      return null;
    }

    constructor(container){
        this.container = container;
        this.tabReferences = new Array();
    }
    
    init(){
      const tabManager = document.createElement("div");
      tabManager.className = "TabManager";

      this.tabList = document.createElement("div");
      this.tabList.className = "TabList";
      this.slider = new Slider(this.tabList);

      this.tabDisplay = document.createElement("div");
      this.tabDisplay.className = "tabDisplay";

      tabManager.appendChild(this.tabList);
      tabManager.appendChild(this.tabDisplay);

      this.container.appendChild(tabManager);
    }

    initTab(title){
        return new Tab(title, this);
    }

    initKeys(){
      return Keys_Tab.getInstance();
    }

    initHome(){
      return Home_Tab.getInstance();
    }

}

window.TabManager = TabManager;
session.setTabManager(new TabManager(document.body));
session.tabManager.initTab("Pestaña 1");
session.tabManager.initTab("Pestaña 2");
session.tabManager.initTab("Pestaña 3");
session.tabManager.initTab("Pestaña 4");
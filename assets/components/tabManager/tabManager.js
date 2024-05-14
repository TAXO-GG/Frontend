class Tab{
    id;
    url;
    title;
    
    tabReference; // div en la barra de pestañas
    tabContentContainerReference; // div que contendrá el contenido de la tab

    tabsContainerReference;
    tabsContentContainerReference;

    createContentFunction;

    constructor(id, url, title, tabsContainerReference, tabsContentContainerReference, createContentFunction){
        this.id = id;
        this.url = url;
        this.title = title;
        this.tabsContainerReference = tabsContainerReference;
        this.tabsContentContainerReference = tabsContentContainerReference;
        this.createContentFunction = createContentFunction;
    }

    async init(){

        // Tab element innit
        this.tabReference  = document.createElement("div");
        this.tabReference.className = "tab";
        this.tabReference.id = this.id;
        var p = document.createElement("p");

        if(Number.isInteger(this.title)){
            p.textContent = getText(this.title);
            p.classList.add("lng");
            p.setAttribute("lng", this.title);
        } else{
            p.textContent = this.title;
        }
        
        var a = document.createElement("a");
        a.className = "closeTab";
        a.textContent = "x";
        this.tabReference.appendChild(p);
        this.tabReference.appendChild(a);
        this.tabsContainerReference.appendChild(this.tabReference);

        // Tab content innit
        this.tabContentContainerReference = document.createElement("div");
        this.tabContentContainerReference.className = "tabContent";
        this.tabsContentContainerReference.appendChild(this.tabContentContainerReference);
        this.initTabContent();

        this.setActive();

        this.tabReference = this.tabsContainerReference.lastChild;

        this.tabReference.addEventListener("click", function(e){
            if (e.target.classList.contains("closeTab") || this.tabReference.classList.contains("active")) return;
            Router.getInstance().setParams(this.url); // Object params key:value
        }.bind(this));
        this.tabReference.getElementsByClassName("closeTab")[0].addEventListener("click", function(e){
            this.close();
        }.bind(this));

        if(this.createContentFunction && this.createContentFunction instanceof Function && this.tabContentContainerReference){
            await createContentFunction(this.tabContentContainerReference);
        }
    }

    initTabContent(){
        let p = document.createElement("h2");
        if(Number.isInteger(this.title)){
            p.textContent = getText(this.title);
            p.classList.add("lng");
            p.setAttribute("lng", this.title);
        } else{
            p.textContent = this.title;
        }
        this.tabContentContainerReference.appendChild(p);
    }

    setActive(){
        if(TabManager.getInstance().activeTab != null) TabManager.getInstance().getActiveTab().removeActive();
        TabManager.getInstance().setActiveTab(this);
        this.tabReference.classList.add("active");
        this.tabContentContainerReference.classList.remove("none");

        var buttons = document.getElementById("menu-buttons");
        if (buttons == null) return;
        var buttonsActive = buttons.querySelectorAll(".active");
        if (buttonsActive == null) return;
        for(var i = 0; i < buttonsActive.length; i++) {
            buttonsActive[i].classList.remove("active");
        }

        var thisRelatedButton = buttons.querySelector(`[data-tab="${this.id}"]`);
        if(thisRelatedButton==null) return;
        thisRelatedButton.classList.add("active")
    }

    removeActive(){
        this.tabReference.classList.remove("active");
        this.tabContentContainerReference.classList.add("none");
    }

    updateUrl(url){
        this.url = url;
        Router.getInstance().setParams(this.url);
    }

    close(){
        let activeTab = TabManager.getInstance().getActiveTab();
        if(activeTab != null){
            if(this.id == activeTab.id){
                var lastTab = TabManager.getInstance().getLastTab();
                if(lastTab!=null) lastTab.setActive();
            }
        }
        this.tabsContainerReference.removeChild(this.tabReference);
        this.tabsContentContainerReference.removeChild(this.tabContentContainerReference);
        delete session.tabManager.tabReferences[this.id];
    }
}

class TabManager{

    static instance;

    tabManagercontainerReference;

    tabsContainerReference;
    tabsContentContainerReference;

    tabReferences;
    activeTab;

    constructor(tabManagercontainerReference, tabsContentContainerReference){
        this.tabManagercontainerReference = tabManagercontainerReference;
        this.tabsContentContainerReference = tabsContentContainerReference;
        this.tabReferences = {};
        this.activeTab = null;
    }

    init(){
        const tabManagerMainDiv = document.createElement("div");
        tabManagerMainDiv.className = "TabManager";

        this.tabsContainerReference = document.createElement("div");
        this.tabsContainerReference.className = "TabList";
        this.slider = new Slider(this.tabsContainerReference);

        this.tabDisplay = document.createElement("div");
        this.tabDisplay.className = "tabDisplay";

        tabManagerMainDiv.appendChild(this.tabsContainerReference);
        tabManagerMainDiv.appendChild(this.tabDisplay);

        this.tabManagercontainerReference.appendChild(tabManagerMainDiv);
    }

    static getInstance(){
        if(TabManager.instance == null){
            TabManager.instance = new TabManager(document.body, document.body);
            TabManager.instance.init();
        }
        return TabManager.instance;
    }

    setActiveTab(tab){
        this.activeTab = tab;
    }

    getActiveTab(){
        return this.activeTab;
    }

    getTab(id){
        return this.tabReferences[id];
    }

    async createTab(id, title, url, createContentFunction){
        var tab = this.getTab(id);
        if(tab != null){
            tab.setActive();
            return tab;
        }
        tab = new Tab(id, url, title, this.tabsContainerReference, this.tabsContentContainerReference, createContentFunction);
        await tab.init();
        this.tabReferences[id] = tab;
        return tab;
    }

    getLastTab(){
        return this.tabReferences[this.tabReferences.length - 1];
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

window.TabManager = TabManager.getInstance();
session.setTabManager(TabManager.getInstance());
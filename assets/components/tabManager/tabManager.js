class Tab{
    id;
    url;
    title;
    
    tabReference; // div en la barra de pestañas
    tabContentContainerReference; // div que contendrá el contenido de la tab

    tabsContainerReference;
    tabsContentContainerReference;

    createContentFunction;
    updateContentFunction;

    data;

    constructor(id, url, title, tabsContainerReference, tabsContentContainerReference, createContentFunction, updateContentFunction, data){
        this.id = id;
        this.url = url;
        this.title = title;
        this.tabsContainerReference = tabsContainerReference;
        this.tabsContentContainerReference = tabsContentContainerReference;
        this.createContentFunction = createContentFunction;
        this.updateContentFunction = updateContentFunction;
        this.data = data;
    }

    async init(){
        setLoadingCursor();
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
        this.tabContentContainerReference.classList.add("tabContent", "none");
        this.tabsContentContainerReference.appendChild(this.tabContentContainerReference);
        await this.initTabContent();

        this.tabReference = this.tabsContainerReference.lastChild;

        this.tabReference.addEventListener("click", function(e){
            if (e.target.classList.contains("closeTab") || this.tabReference.classList.contains("active")) return;
            TabManager.getInstance().setActiveTab(this)
        }.bind(this));
        this.tabReference.getElementsByClassName("closeTab")[0].addEventListener("click", async function(e){
            await this.close();
        }.bind(this));
        setNormalCursor();
    }

    async initTabContent(){
        let p = document.createElement("h2");
        if(Number.isInteger(this.title)){
            p.textContent = getText(this.title);
            p.classList.add("lng");
            p.setAttribute("lng", this.title);
        } else{
            p.textContent = this.title;
        }
        this.tabContentContainerReference.appendChild(p);

        if(this.createContentFunction && this.createContentFunction instanceof Function && this.tabContentContainerReference){
            await this.createContentFunction(this.tabContentContainerReference, this.data);
        }

        setLangTo(this.tabContentContainerReference);
    }

    async setActive(){
        this.tabReference.classList.add("active");
        this.tabContentContainerReference.classList.remove("none");

        var activeButtons = document.querySelectorAll(".nav-button.active");
        activeButtons.forEach(button => {
            button.classList.remove("active");
        });

        this.updateUrl();

        var thisRelatedButton = document.querySelector(`[data-tab="${this.id}"]`);
        if(thisRelatedButton==null) return;
        thisRelatedButton.classList.add("active");
        
        if(this.updateContentFunction && this.updateContentFunction instanceof Function){
            await this.updateContentFunction();
        }
    }

    async removeActive(){
        this.tabReference.classList.remove("active");
        this.tabContentContainerReference.classList.add("none");
    }

    updateUrl(){
        Router.getInstance().setParams(this.url, false);
    }

    async close(){
        removeOpenUserTab(this);
        let activeTab = TabManager.getInstance().getActiveTab();
        delete session.tabManager.tabReferences[this.id];
        if(activeTab != null){
            if(this.id == activeTab.id){
                var lastTab = TabManager.getInstance().getLastTab();
                if(lastTab!=null) await lastTab.setActive();
            }
        }
        this.tabsContainerReference.removeChild(this.tabReference);
        this.tabsContentContainerReference.removeChild(this.tabContentContainerReference);
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

    async setActiveTab(tab){
        if(tab == this.activeTab){
            return;
        }
        if(this.activeTab!=null) await this.activeTab.removeActive();
        this.activeTab = tab;
        await tab.setActive();
    }

    getActiveTab(){
        return this.activeTab;
    }

    getTab(id){
        return this.tabReferences[id];
    }

    async createTab(id, title, url, createContentFunction, updateContentFunction, params){
        var tab = this.getTab(id);
        if(tab != null){
            await this.setActiveTab(tab);
            return null;
        }
        tab = new Tab(id, url, title, this.tabsContainerReference, this.tabsContentContainerReference, createContentFunction, updateContentFunction, params);
        await tab.init();
        this.tabReferences[id] = tab;
        this.setActiveTab(tab);
        return tab;
    }

    getLastTab() {
        const keys = Object.keys(this.tabReferences);
        return this.tabReferences[keys[keys.length - 1]];
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
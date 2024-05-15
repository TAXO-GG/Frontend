class Session{
    
    body;
    session;
    langNames;
    key;
    
    preloader;
    tabManager;
    router;
    modal;
    menu;
    cache;

    loaded;

    profile;
    
    
    constructor(){
    }

    //  --- Initialize ---

    async init(){
        await this.initCache();
        await this.initPreloader();
        await this.initTabManager();
        await this.initRouter(); 
        await this.initModal();
        await this.initMenu();
        await getProfileFromApiInBackground();

        this.preloader.close();
    }

    async initPreloader(){
        await loadComponent("app", "preloader");
    }

    async initRouter(){
        await loadDependence('router');
    }

    async initModal(){
        await loadComponent("app", "modal");
    }

    async initMenu(){
        await loadComponent("app", "menu");
    }

    async initTabManager(){
        await loadComponent("app", "tabManager");
    }

    async initCache(){
        await loadDependence('cache');
    }

    // --- Setters ---
    
    setRouter(r){
        this.router = r;
    }

    setPreloader(p){
        this.preloader = p;
        p.init();
    }

    setModal(m){
        this.modal = m;
        m.init();
    }

    setMenu(m){
        this.menu = m;
        m.init();
    }

    setKey(k){
        this.key = k;
        k.init();
    }

    setTabManager(t){
        this.tabManager = t;
    }

    setCache(c){
        this.cache = c;
    }

}

window.Session = Session;
session = new Session();
session.init();

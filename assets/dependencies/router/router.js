class Router {

    static instance;

    url;
    params;
    currentParameters;

    constructor() {
    }

    /**
     * Inicializa la URL y los parámetros al cargar o recargar la página
     */
    initParams() { 
        this.url = new URL(window.location.href);
        this.params = this.url.searchParams;
    }

    static getInstance(){
        if(Router.instance == null){
            Router.instance = new Router();
            Router.instance.initParams();
            Router.instance.init();
        }
        return Router.instance;
    }

    /**
     * Inicializa la ruta de la página basada en los parámetros URL
     */
    init() {
        const params = this.getParams();
        const countParams = Object.keys(params).length;
        if (countParams <= 0) {
            this.setParam('window', 'home');
        } else {
            this.route(params);
        }
    }

    /**
     * Inicializa la ruta de la página basada en los parámetros URL
     * @param {*} params 
     * @returns 
     */
    async route(params) {
        /*
        var tab = TabManager.getInstance().getTab(params.window);
        if (this.currentParameters && this.areParamsEqual(params, this.currentParameters) && tab!=null){
            return;
        }*/
        let currentWindow = this.currentParameters ? this.currentParameters['window'] : null;
        this.setCurrent(params);
        if (params['window'] == null) {
            await this.updateView({window:'home'});
            return;
        }
        await this.updateView(params);
    }

    /**
     * Actualiza la vista basada en la ventana especificada en los parámetros
     * @param {*} view 
     */
    async updateView(params) {
        var view = params['window'];
        switch (view) {
            case "taxons":
                await TabManager.getInstance().createTab('taxons', 3, {window: 'taxons'}, createTaxonsTabContent);
                break;
            case "keys":
                var tab = await TabManager.getInstance().createTab('keys', 4, {window: 'keys'}, createKeysTabContent, updateUserKeys);
                if(tab) addOpenUserTab(tab);
                break;
            case "id":
                break;
            case "community":
                break;
            case "profile":
                if(session.profile != null){
                    var tab = await TabManager.getInstance().createTab('profile', 29, {window: 'profile'}, createProfileTabContent);
                    if(tab) addOpenUserTab(tab);
                } else {
                    loadUserProfileTab();
                }
                break;
            case "key":
                var keyId = params['id'];
                if(keyId == null){
                    return;
                }
                var response = await getKey(keyId);

                if(response == null || response.statusCode != 200){
                    await TabManager.getInstance().createTab('home', 2, {window: 'home'}, createHomeTabContent);
                    return;
                }

                var key = response.data;

                console.log("key: ", key);

                var keyTitle = key.title;
                if(keyTitle == null){
                    keyTitle =keyId;
                }
                var tab = await TabManager.getInstance().createTab(`key-${keyId}`, keyTitle, params);
                if(tab) addOpenUserTab(tab);
                break;
            case "home":
            default:
                await TabManager.getInstance().createTab('home', 2, {window: 'home'}, createHomeTabContent);
        }
    }

    goTo(view){
        this.clearParams();
        this.setParam("window", view);
    }

    goToUrl(url) {
        const fullUrl = new URL(baseUrl+url);
        const params = fullUrl.searchParams;
        console.log(params);
        this.route(params);
    }

    /**
     * Limpia los parámetros de la URL
     */
    clearParams(){
        this.params = new URLSearchParams();
        this.currentParameters = {};
    }

    getURL() {
        return this.url.toString();
    }

    /**
     * Actualiza la URL en la barra de direcciones con los parámetros actuales
     */
    setURL() {
        this.url.search = this.params.toString();
        window.history.pushState({}, '', this.getURL());
    }

    /**
     * Obtiene los parámetros de la URL en un objeto JSON
     * @returns Los parámetros de la URL en un objeto JSON
     */
    getParams() {
        // Convierte los parámetros a un objeto JSON
        const paramsObj = {};
        this.params.forEach((value, key) => {
            paramsObj[key] = value;
        });
        return paramsObj;
    }

    /**
     * Obtiene un parámetro específico de la URL
     * @param {*} param 
     * @returns 
     */
    getParam(param) {
        return this.params.get(param);
    }

    /**
     * Establece un parámetro específico en la URL
     * @param {*} param 
     * @param {*} value 
     */
    setParam(param, value) {
        this.params.set(param, value);
        this.setURL();
        this.route(this.getParams());
    }

    clearParams(){
        this.params.forEach((value, key) => {
            this.params.delete(key);
        });
    }

    /**
     * Establece varios parámetros en la URL
     * @param {*} params 
     */
    setParams(params, redirect = true) {
        this.clearParams();
        Object.entries(params).forEach(([key, value]) => {
            this.params.set(key, value);
        });
        this.setURL();
        if(redirect) {
            this.route(this.getParams());
        }
    }


    setCurrent(params) {
        this.currentParameters = params;
    }

    /**
     * Compara dos conjuntos de parámetros para determinar si son iguales
     * @param {*} params1 
     * @param {*} params2 
     * @returns 
     */
    areParamsEqual(params1, params2) {
        return JSON.stringify(params1) === JSON.stringify(params2);
    }
}


window.Router = Router.getInstance();
session.setRouter(Router.getInstance());
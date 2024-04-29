class ParamManager {

    url;

    params;

    constructor(){
    }

    init(){
        this.url = new URL(window.location.origin + window.location.pathname + window.location.search);
        this.params = this.url.searchParams;
    }

    getURL(){
        return this.url.toString();
    }

    setURL(){
        // Reconstruye la URL con los parámetros actualizados
        this.url.search = this.params.toString();

        // Actualiza la URL en la barra de direcciones sin recargar la página
        window.history.pushState({}, '', this.url.toString());
    }

    getParams() {
        // Convierte los parámetros a un objeto JSON
        const paramsObj = {};
        this.params.forEach((value, key) => {
            paramsObj[key] = value;
        });
        return paramsObj;
    }

    getParam(param){
        this.params.get(param);
    }

    setParam(param, value) {
        // Actualiza el valor del parámetro en el objeto searchParams
        this.params.set(param, value);
        this.setURL();
        session.router.route(this.getParams());
    }

    setParams(params){
        params.forEach((value, key) => {
            this.params.set(param, value);
        });
        this.setURL();
        session.router.route(this.getParams());
    }
}

window.ParamManager = ParamManager;
session.setParamManager(new ParamManager());

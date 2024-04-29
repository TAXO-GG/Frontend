class Router{

    current;

    constructor(){
    }

    init(){
        var params = session.paramManager.getParams();
        const countParams = Object.entries(params).length;
        if (countParams <= 0) {
            session.goTo('home');
            this.setCurrent(session.paramManager.getParams());
        } else {
            this.route(params);
        }
    }

    setCurrent(params){
        this.current = params;
    }

    async route(params){

        var current = this.current;

        var isCurrentNull = current == null;

        if(!isCurrentNull){
            if (params === current) return;
        }

        this.current = params;

        var currentWindow;
        if(isCurrentNull) currentWindow = null; else currentWindow = current['window'];

        if(params['window'] != currentWindow){
            switch(params['window']){
                case "home":
                    session.tabManager.initHome();
                    break;
                case "classification":

                    break;
                case "keys":
                    session.tabManager.initKeys();
                    break;
                case "id":

                    break;
                case "community":

                    break;
                default:
                    return;
            }
        }

        
    }

}

window.Router = Router;
session.setRouter(new Router());
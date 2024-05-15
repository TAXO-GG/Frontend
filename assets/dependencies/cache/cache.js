class Cache {

    static instance;

    constructor(){
        this.cache = {
            taxonomicKeys: {},
            taxons: {}
        };
    }

    static getInstance(){
        if(!Cache.instance){
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }

    // Taxonomic keys

    getTaxonomicKeys(){
        return this.cache.taxonomicKeys;
    }

    getTaxonomicKey(key){
        return this.cache.taxonomicKeys[key];
    }

    addTaxonomicKey(key, taxonomicKey){
        this.cache.taxonomicKeys[key] = taxonomicKey;
    }

    // Taxons

    getTaxons(){
        return this.cache.taxons;
    }

    getTaxon(id){
        return this.cache.taxons[id];
    }

    addTaxon(id, taxon){
        this.cache.taxons[id] = taxon;
    }

}

window.Cache = Cache.getInstance();
session.setCache(Cache.getInstance());
class Exception extends Error {
  
  _contextualInfo;

  constructor(error, contextualInfo){
    super(error);
    this._contextualInfo = contextualInfo;
  }

  setContextualInfo(contextualInfo){
    this._contextualInfo = contextualInfo;
  }

  p(){
    console.log("Context : " + this._contextualInfo + "\n" + this.stack);
  }
  
}

window.Exception = Exception;
exceptions.set("Exception", new Exception("Ready to go"));

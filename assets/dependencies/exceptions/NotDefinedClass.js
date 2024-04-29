class NotDefinedClass extends Exception{
  constructor(contextualInfo){
    super("Class is not defined", contextualInfo);
  }
}

window.NotDefinedClass = NotDefinedClass;
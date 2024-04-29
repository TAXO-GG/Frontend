class WrongTypeArg extends Exception{
    constructor(contextualInfo){
        super("The argument is not a valid argument for this function: ", contextualInfo);
    }
}

window.WrongTypeArg = WrongTypeArg;
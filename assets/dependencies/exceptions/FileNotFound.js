class FileNotFound extends Exception{
    constructor(contextualInfo){
        super("The file can not be reached: ", contextualInfo);
    }
}

window.FileNotFound = FileNotFound;
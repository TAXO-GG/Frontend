/* * * * * * * * * * * * *
 *                       *
 *   Useful functions    *
 *                       *
 * * * * * * * * * * * * */

function checkArg(argName, argValue, type){
  if(!(typeof argValue == type)){
    throwException("WrongTypeArg", `The arg '${argName}' must be a '${type}'. '${argValue}' is not a valid ${type}.`);
  }
}

function deleteFromArray(array, obj) {
  const i = array.indexOf(obj);
  if (i !== -1) {
    array.splice(i, 1);
  }
}

// Definición de métodos en el prototipo de String

String.prototype.isBlank = function() {
  console.log(this);
  if (this == null || this == undefined) return true;
  if (this.trim().length == 0) return true;
  return /^[ \t\n\r\x0B\x0C]*$/.test(this);
};

String.prototype.capitalize = function(){
  if(this == null || this == undefined) return null;
  if(this.trim.length == 0) return this;
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/* * * * * * * * * * * * * * * * * *
 *                                 *
 *   Import management functions   *
 *                                 *
 * * * * * * * * * * * * * * * * * */

async function getFileContent(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throwException("FileNotFound", `No se pudo cargar el contenido del archivo"${path}".`);
  }
  const content = await response.text();
  return content;
}

async function loadCSS(path){
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = path;
    link.onload = function () {
        resolve();
    };
    link.onerror = function () {
        // Esto funcionaba bien => // reject(new Error(`Error al cargar la hoja de estilos desde "${path}".`));
        reject();
        throwException("FileNotFound", `Error al cargar la hoja de estilos desde "${path}".`);
    };
    document.head.appendChild(link);
  });
}

async function loadHTML(fatherId, path){
  var father = document.getElementById(fatherId);
  var html = await getFileContent(path);
  father.innerHTML = html;
  setLangTo(father);
}

async function appendHTML(fatherId, path) {
  var father = document.getElementById(fatherId);
  var html = await getFileContent(path);
  father.insertAdjacentHTML('beforeend', html);
  setLangTo(father);
}

async function loadJS(path) {
  return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = path;
      script.onload = function () {
          resolve();
      };
      script.onerror = function () {
          // Esto funcionaba bien => // reject(new Error(`Error al cargar el script desde "${path}".`));
          reject();
          throwException("FileNotFound", `Error al cargar el script desde "${path}".`);
      };
      document.head.appendChild(script);
  });
}

async function loadDependence(name){
  await loadJS(`assets/dependencies/${name}/${name}.js`);
}

async function loadComponent(fatherId, name){
  await appendHTML(fatherId, `assets/components/${name}/${name}.html`);
  await loadJS(`assets/components/${name}/${name}.js`);
}

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 *   Exception management functions    *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

async function loadException(name){
  await loadJS(`assets/dependencies/exceptions/${name}.js`);
}

function instanceDynamicClass(className, ...args) {
  if (typeof window[className] === "function") {
      console.log(className + " is a defined function, an instance of " + className + " will be created!");
      const instance = new window[className](...args); // Crea una instancia de la clase
      return instance;
  } else {
      console.log(className + " is not a defined function! It can't be instantiated!");
      throwException("NotDefinedClass", `The class ${className} does not exist.`);
      // throw new Error(`The class ${className} does not exist.`);
  }
}

async function throwException(exception, contextualInfo){
  checkArg("exception", exception, "string");
  checkArg("contextualInfo", contextualInfo, "string");
  var ex = exceptions.get(exception);
  if(ex === undefined){
      await loadException(exception);
      ex = await instanceDynamicClass(exception, contextualInfo);
      exceptions.set(exception, ex);
  } else {
      ex.setContextualInfo(contextualInfo);
  }
  throw ex;
}

/* * * * * * * * * * * * * * * * * * *
 *                                   *
 *   Languaje management functions   *
 *                                   *
 * * * * * * * * * * * * * * * * * * */

function getText(code, lang){
  var dictionary;
  if (typeof lang === 'undefined') {
    dictionary = langs.get(document.documentElement.getAttribute('lang'));
  } else {
    dictionary = langs.get(lang);
  }
  return dictionary.get(code+"");
}

function setLangTo(parent) {
  const dictionary = langs.get(document.documentElement.getAttribute('lang'));
  const elements = parent.getElementsByClassName('lng');
  Array.from(elements).forEach(element => {
      element.innerHTML = dictionary.get(element.getAttribute("lng"));
  });
}

function setLang(lang){
  var actualLang = document.documentElement.getAttribute('lang');
  if(actualLang != lang){
      document.documentElement.setAttribute('lang', lang);
      var langListed = langs.get(lang);
      if(langListed === undefined){
          
      } else {
          setLangTo(document.body);
      }
  }
}

async function getCSV(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throwException("FileNotFound", `¡No se ha podido cargar el archivo CSV desde ${path}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    throwException("FileNotFound", `¡No se ha podido cargar el archivo CSV desde ${path}`);
  }
}

async function langsFromCSV(path) {
  return new Promise(async (resolve, reject) => {
    try {
      const csv = await getCSV(path);
      const rows = csv.split('\n');

      const colCodes = rows[0].split(';');
      const colNames = rows[1].split(';');
      langNames = new Map();
      const map = new Map();

      const rowsData = [];
      for (let i = 2; i < rows.length; i++) {
        rowsData.push(rows[i].split(';'));
      }

      for (let i = 1; i < colCodes.length; i++) {
        const tempLang = colCodes[i].trim().replace("\r", "");
        const tempName = colNames[i].trim().replace("\r", "");
        langNames.set(tempLang, tempName);

        const col = new Map();
        map.set(tempLang, col);
        for (let f = 0; f < rowsData.length; f++) {
          col.set(rowsData[f][0], rowsData[f][i]);
        }
      }
      resolve(map);
    } catch (error) {
      reject(error);
    }
  });
}

/* * * * * * * * * * *
 *                   *
 *   Main function   *
 *                   *
 * * * * * * * * * * */

// Global variables
const exceptions = new Map();
var langs;
var langNames;
var session;

// Main function
async function main(){
  langs = await langsFromCSV("lang.csv");
  await loadDependence("session");
}

main();





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
    const translation = dictionary.get(element.getAttribute("lng")).trim();
    if (element.tagName.toLowerCase() === 'input') {
        element.setAttribute('placeholder', translation);
    } else {
        element.innerHTML = translation;
    }
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
 *   Mixed functions *
 *                   *
 * * * * * * * * * * */

function hide(querySelector) {
  var elements = document.querySelectorAll(querySelector);
  elements.forEach(element => {
    element.classList.add("none");
  });
}

function show(querySelector) {
  var elements = document.querySelectorAll(querySelector);
  elements.forEach(element => {
    element.classList.remove("none");
  });
}

function shake(querySelector){
  var elements = document.querySelectorAll(querySelector);
  elements.forEach(element => {
    element.classList.add("shake");
    setTimeout(function(){
      element.classList.remove("shake");
    }, 800);
  });
}

function showLogin(){
  var auth = document.getElementById("auth");
  if(auth == null) return;
  var login = auth.querySelector("#login_window");
  if(login == null) return;
  var register = auth.querySelector("#register_window");
  if(register == null) return;
  register.classList.add("none");
  login.classList.remove("none");
  auth.classList.remove("none");
}

function loginFailed(){
  show("#failed_login");
  shake("#login_window");
}

function registerFailed(){
  shake('#register_window');
}

function usernameAlreadyExist(){
  show('#username_already_exists');
}

function emailAlreadyExist(){
  show('#email_already_exists');
}

function unmatchingPasswords(){
  show("#unmatching_passwords");
  shake('#register_window');
}

function showRegister(){
  var auth = document.getElementById("auth");
  if(auth == null) return;
  var login = auth.querySelector("#login_window");
  if(login == null) return;
  var register = auth.querySelector("#register_window");
  if(register == null) return;
  login.classList.add("none");
  register.classList.remove("none");
  auth.classList.remove("none");
}

function closeAuth(){
  var auth = document.getElementById("auth");
  if(auth == null) return;
  var login = auth.querySelector("#login_window");
  if(login == null) return;
  var register = auth.querySelector("#register_window");
  if(register == null) return;
  auth.classList.add("none");
  login.classList.add("none");
  register.classList.add("none");
}

async function handleLogin() {
  var email = document.getElementById('login_email').value;
  var password = document.getElementById('login_password').value;
  var logged = await loginFromApi(email, password);
  if (logged) {
    closeAuth();
  }
}

async function handleRegister() {
  var username = document.getElementById('register_username').value;
  var name = document.getElementById('register_name').value;
  var email = document.getElementById('register_email').value;
  var password = document.getElementById('register_password').value;
  var repeatPassword = document.getElementById('register_repeat_password').value;
  if (password !== repeatPassword) {
    unmatchingPasswords()
    return;
  }
  var registered = await registerInApi(username, name, email, password);
  if (registered == true) {
    closeAuth();
    showLogin();
  }
}

async function loadUserProfileTab(){
  if(session.profile == null){
    var profile = await getProfileFromApi();
    if(profile == null){
      console.error('Error loading profile');
      return;
    }
    Router.getInstance().updateView('profile');
  } else{
    Router.getInstance().updateView('profile');
  }
}

async function logout() {
  localStorage.removeItem('token');
  clearProfile();
  var profileTab = TabManager.getInstance().getTab('profile');
  if (profileTab != null) {
    profileTab.close();
  }
}

function setProfile(profile){
  session.profile = profile;
  hide("#profile-question-mark");
}

function clearProfile(){
  session.profile = null;
  show("#profile-question-mark");
}

/* * * * * * * * * * * *
 *                     *
 *   Http  functions   *
 *                     *
 * * * * * * * * * * * */

const baseApiUrl = 'http://localhost:6969';

async function httpRequest(url, useToken, method, bodyParam = null, callback = null) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': method !== 'GET' ? 'application/json' : undefined
  };
  if (useToken) {
    const token = localStorage.getItem('token');
    if (!token) {
      showLogin();
      return null;
    } else {
      headers['Authorization'] = 'Bearer ' + token;
    }
  }
  const options = {method, headers: new Headers(headers), body: bodyParam && method !== 'GET' ? JSON.stringify(bodyParam) : undefined};
  const response = await fetch(url, options);
  console.log("Base http response: ",response);
  if(response == null){
    return null;
  }
  return await response.json();
}

async function getFromApi(endpoint, useToken){
  const url = baseApiUrl + endpoint;
  return await httpRequest(url, useToken, 'GET');
}

async function postToApi(endpoint, data, useToken) {
  const url = baseApiUrl + endpoint;
  return await httpRequest(url, useToken, 'POST', data);
}

async function registerInApi(username, name, email, password) {
  endpoint = "/register";
  const data = {
      username: username,
      password: password,
      email: email,
      name: name
  };
  try {
      const response = await postToApi(endpoint, data, false);
      if(response==null){
        registerFailed();
        return false;
      }
      if(response.statusCode === 200) {
        return true;
      } else if(response.statusCode === 409){
        if(response.error.type == 'EMAIL_ALREADY_EXIST'){
          emailAlreadyExist();
        } else if(response.error.type == 'USERNAME_ALREADY_EXIST'){
          usernameAlreadyExist();
        }
      }
      registerFailed();
      return false;
  } catch (error) {
      registerFailed()
      console.error('Registration failed:', error);
      throw error;
  }
}

async function loginFromApi(username, password) {
  const endpoint = "/login";
  const data = {
      username: username,
      password: password
  };
  try {
      const response = await postToApi(endpoint, data, false);
      if(response==null){
        registerFailed();
        return false;
      }
      console.log(response);
      if(response.statusCode === 200) {
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            loadUserProfileTab();
            return true;
        }
      }
      loginFailed();
      return false;
  } catch (error) {
      console.error('Login failed e:', error);
      loginFailed();
      throw error;
  }
}



async function getProfileFromApi(){
  const endpoint = "/profile";
  try {
    const response = await getFromApi(endpoint, true);
    console.log("getProfileFromApi", response);
    if(response==null){
      return null;
    }
    if(response.statusCode === 200){
      setProfile(response.data);
      return response.data;
    } else if(response.statusCode == 401){
      localStorage.removeItem('token');
      showLogin();
      return null;
    }
    return null;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getProfileFromApiInBackground(){
  if(localStorage.getItem('token')==null){
    return;
  }
  const endpoint = "/profile";
  try {
    const response = await getFromApi(endpoint, true);
    console.log("getProfileFromApi", response);
    if(response==null){
      return;
    }
    if(response.statusCode === 200){
      session.profile = response.data;
      hide("#profile-question-mark");
    } 
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}

async function getTaxonFromApi(taxon){
  const endpoint = `/taxon/${taxon}`;
  try {
    const response = await getFromApi(endpoint, true);
    if(response==null){
      return null;
    }
    if(response.statusCode === 200){
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error:', error);
  }
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

async function createProfileTabContent(tabContentContainerReference) {
  if(session.profile == null){
    await getProfileFromApi();
    if(session.profile == null){
      console.error('Error loading profile');
      return;
    }
  }

  try {
    var profileData;
    if (typeof session.profile === "string") {
      profileData = JSON.parse(session.profile);
    } else {
      profileData = session.profile;
    }

    var userinfo = document.createElement("p");

    var name = document.createElement("span");
    name.textContent = profileData.name;
    name.classList.add("user-name");
    userinfo.appendChild(name);

    var separator = document.createTextNode(" | ");
    userinfo.appendChild(separator);

    var username = document.createElement("span");
    username.textContent = `@${profileData.username}`;
    username.classList.add("user-username");
    userinfo.appendChild(username);

    var logoutButton = document.createElement("a");
    logoutButton.classList.add("btn","btn-primary", "lng");
    logoutButton.setAttribute("lng","24");
    logoutButton.textContent = "Logout";
    logoutButton.id = "logout-button";
    logoutButton.addEventListener("click", function(){
      logout();
      Router.getInstance().updateView('home');
    });
    userinfo.appendChild(logoutButton);

    tabContentContainerReference.appendChild(userinfo);
    
  } catch (error) {
    console.error("Error parsing profile data:", error);
  }
}

async function createTaxonsTabContent(tabContentContainerReference){

  var searchDiv = document.createElement("div");
  searchDiv.classList.add("search-div");

  var searchBox = document.createElement("input");
  searchBox.type = "text";
  searchBox.id = "taxon-search-box";
  searchBox.classList.add("form-control", "search-box","lng");
  searchBox.setAttribute("lng","25");
  searchDiv.appendChild(searchBox);

  var searchButton = document.createElement("a");
  searchButton.classList.add("btn","btn-primary", "lng");
  searchButton.setAttribute("lng","26");
  searchButton.textContent = "Search";
  searchButton.id = "taxon-search-button";
  searchDiv.appendChild(searchButton);

  tabContentContainerReference.appendChild(searchDiv);

  var resultDiv = document.createElement("div");
  resultDiv.classList.add("result-div");
  resultDiv.id = "taxon-result-div";
  tabContentContainerReference.appendChild(resultDiv);

  searchButton.addEventListener("click", function(){
    searchTaxon(resultDiv, searchBox.value);
  });

  var params = Router.getInstance().getParams();
  var urlTaxon = params['taxon'];
  if(urlTaxon != null){
    searchBox.value = urlTaxon;
    searchTaxon(resultDiv, urlTaxon);
  }
  
}

async function searchTaxon(container, taxon, previousTaxon = null) {
  var searchValue = taxon;
  if (searchValue.isBlank()) {
      return;
  }
  var taxon = Cache.getInstance().getTaxon(searchValue);
  if (taxon == null) {
      taxon = await getTaxonFromApi(searchValue);
  }
  container.innerHTML = "";
  if (taxon == null) {
      container.innerHTML = `<p>Taxon ${searchValue} was not found.<p>`;
      if (previousTaxon) {
          var backLink = document.createElement("a");
          backLink.textContent = `< Volver a ${previousTaxon}`;
          backLink.href = "#";
          backLink.addEventListener("click", function () {
              searchTaxon(container, previousTaxon);
          });
          container.appendChild(backLink);
      }
      return;
  }
  Cache.getInstance().addTaxon(taxon.name, taxon);

  var hierarchy = document.createElement("p");

  let currentTaxon = taxon;
  let hierarchyList = [];

  // Construir la jerarquía a partir del objeto taxon
  while (currentTaxon) {
      hierarchyList.unshift(currentTaxon.name);
      currentTaxon = currentTaxon.hierarchy || null;
  }

  for (let i = 0; i < hierarchyList.length; i++) {
      let tempTaxon = hierarchyList[i];
      var hierarchyElement = document.createElement("a");
      hierarchyElement.textContent = tempTaxon;
      hierarchyElement.href = "#";
      hierarchyElement.addEventListener("click", function () {
          searchTaxon(container, tempTaxon);
      });
      hierarchyElement.classList.add("hierarchy-element");
      hierarchy.appendChild(hierarchyElement);
      if (i < hierarchyList.length - 1) {
          var separator = document.createTextNode(" > ");
          hierarchy.appendChild(separator);
      }
  }
  container.appendChild(hierarchy);

  // Mostrar el nombre del taxón en un h2
  var taxonNameElement = document.createElement("p");
  taxonNameElement.innerHTML = `<span class="taxon-level">${taxon.category.name}</span> - <span class="taxon-name">${taxon.name}</span>`;
  container.appendChild(taxonNameElement);

  var childrensLabel = document.createElement("p");
  childrensLabel.textContent = "Childs:";
  container.appendChild(childrensLabel);

  // Mostrar los hijos del taxón
  if (taxon.children && taxon.children.length > 0) {
      var childrenList = document.createElement("ul");
      taxon.children.forEach(child => {
          var childElement = document.createElement("li");
          var childLink = document.createElement("a");
          childLink.textContent = child.name;
          childLink.href = "#";
          childLink.addEventListener("click", function () {
              searchTaxon(container, child.name, taxon.name);
          });
          childElement.appendChild(childLink);
          childrenList.appendChild(childElement);
      });
      container.appendChild(childrenList);
  }

  /*
  var taxonName = document.createElement("p");
  taxonName.textContent = JSON.stringify(taxon);
  container.appendChild(taxonName);
  */
}
baseUrl = window.location.origin;
let openUserTabs = [];

function addOpenUserTab(tab) {
  if (tab && !openUserTabs.includes(tab)) {
    openUserTabs.push(tab);
  }
}

async function closeAllOpenUserTabs() {
  await Router.getInstance().updateView({window:"home"});
  while (openUserTabs.length > 0) {
    const tab = openUserTabs.pop();
    await tab.close();
  }
}

function removeOpenUserTab(tab) {
  const tabIndex = openUserTabs.indexOf(tab);
  if (tab && tabIndex !== -1) {
    openUserTabs.splice(tabIndex, 1);
  }
}

/* * * * * * * * * * * * *
 *                       *
 *   Useful functions    *
 *                       *
 * * * * * * * * * * * * */

function cloneObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  let newObj = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    newObj[key] = cloneObject(obj[key]);
  }

  return newObj;
}

function generateObjectId() {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const randomPart = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
    return (Math.random() * 16 | 0).toString(16);
  }).toLowerCase();
  return timestamp + randomPart;
}

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

isNullOrEmpty = function(str){
  if (this == null || this == undefined) return true;
  if (this.length == 0) return true;
  return /^[ \t\n\r\x0B\x0C]*$/.test(this);
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
    var translation = dictionary.get(element.getAttribute("lng"));
    if (translation != null){
      translation = translation.trim();
      if (element.tagName.toLowerCase() === 'input') {
          element.setAttribute('placeholder', translation);
      } else {
          element.innerHTML = translation;
      }
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

var inMemoryToken;

function clearToken(){
  inMemoryToken = null;
  localStorage.removeItem('token');
}

function getToken(){
  if (inMemoryToken == null){
    return localStorage.getItem('token');
  }
  return inMemoryToken;
}

function setToken(token, keepLoggedIn = true){
  if(!keepLoggedIn){
    inMemoryToken = token;
    return;
  }
  localStorage.setItem('token', token);
}

function disableClicks(event) {
  event.stopPropagation();
  event.preventDefault();
}


function setLoadingCursor() {
  document.body.style.cursor = 'wait';
  document.addEventListener('click', disableClicks, true);
}

function setNormalCursor() {
  document.body.style.cursor = 'default';
  document.removeEventListener('click', disableClicks, true);
  console.log('setNormalCursor');
}

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
  show("#auth, #login_window");
  hide("#register_window");
}

function showRegister(){
  hide("#login_window");
  show("#auth, #register_window");
}

function closeAuth(){
  hide(".error_message, #auth, #login_window, #register_window");
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
    Router.getInstance().goTo('profile');
  } else{
    Router.getInstance().goTo('profile');
  }
}

async function logout() {
  clearToken();
  clearProfile();
  closeAllOpenUserTabs();
}

function setProfile(profile){
  session.profile = profile;
  hide("#profile-question-mark");
  setProfilePicture(profile)
}

function clearProfile(){
  session.profile = null;
  show("#profile-question-mark");
  var profileButton = document.getElementById("profile-button");
  if(profileButton){
    profileButton.style.backgroundImage = null;
    profileButton.style.backgroundPosition = null;
  }
}

function setProfilePicture(profile){
  var profilePicture = profile.picture;
  var defaultImage = false;

  if(!profilePicture || profilePicture.isBlank()){
    profilePicture = "assets/img/user.svg";
    var defaultImage = true;
  }

  var profileButton = document.getElementById("profile-button");
  if(profileButton){
    profileButton.style.backgroundImage = 'url("' + profilePicture + '")';
    if(!defaultImage) profileButton.style.backgroundPosition = 'center';
  }

  var profileImageDiv = document.getElementById("profile-picture-container");
  if(profileImageDiv){
    profileImageDiv.style.backgroundImage = 'url("' + profilePicture + '")';
  }
}

/* * * * * * * * * * * *
 *                     *
 *   Http  functions   *
 *                     *
 * * * * * * * * * * * */

const baseApiUrl = 'http://localhost:6969';

async function httpRequest(url, useToken, method, bodyParam = null, callback = null) {
  try {
    setLoadingCursor();
    const headers = {
      'Accept': 'application/json',
      'Content-Type': method !== 'GET' ? 'application/json' : undefined
    };
    if (useToken) {
      const token = getToken();
      if (!token) {
        showLogin();
        setNormalCursor();
        return {statusCode:401};
      } else {
        headers['Authorization'] = 'Bearer ' + token;
      }
    }
    const options = {method, headers: new Headers(headers), body: bodyParam && method !== 'GET' ? JSON.stringify(bodyParam) : undefined};
    const response = await fetch(url, options);
    console.log("Base http response: ",response);
    if(response == null){
      setNormalCursor();
      return {statusCode:404};
    } else if (response.status === 401) {
      clearToken();
      showLogin();
    }
    jsonResponse = await response.json();
    setNormalCursor();
    return jsonResponse;
  } catch (error) {
    setNormalCursor();
    return {statusCode:500};
  }
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
            setToken(response.data.token, document.getElementById('stay-logged').checked);
            await loadUserProfileTab();
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
    switch(response.statusCode){
      case 200:
        setProfile(response.data);
        return response.data;
      case 401:
        response.data.token;
        showLogin();
        return null;
      default:
        return null;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getProfileFromApiInBackground(){
  if(getToken()==null){
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
      setProfile(response.data);
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
    switch(response.statusCode){
      case 200:
        return response.data;
      case 404:
        return null;
      case 401:
        return {statusCode:401};
    }
    return null;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function updateProfilePicture(url){
  const endpoint = "/profile/updateProfilePicture";
  const data = {
    picture: url
  };
  try {
    const response = await postToApi(endpoint, data, true);
    if(response==null){
      return;
    }
    if(response.statusCode === 200){
      hide('#update-profile-image-input, #hide-profile-image-input')
      getProfileFromApiInBackground();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getUserKeys(){
  const endpoint = '/key/list';
  try {
    const response = await getFromApi(endpoint, true);
    if(response==null){
      return null;
    }
    switch(response.statusCode){
      case 200:
        return response.data;
      case 404:
        return null;
      case 401:
        return {statusCode:401};
    }
    return null;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getKey(id){
  const endpoint = `/key/${id}`;
  console.log("Getting key from: ", endpoint);
  try {
    const response = await getFromApi(endpoint, true);
    if(response==null){
      return null;
    }
    switch(response.statusCode){
      case 200:
        return response;
      case 404:
        return null;
      case 401:
        return {statusCode:401};
    }
    return null;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function updateKey(taxonomicKey){
  const endpoint = "/key/update";
  var data = {
    key: taxonomicKey
  };
  console.log("Updating key from: ", endpoint, data);
  try {
    const response = await postToApi(endpoint, data, true);
    if(response==null){
      return false;
    }
    if(response.statusCode === 200){
      console.log("Key updated successfully");
      return true;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

async function newKey(keyTitle, startingTaxon, description){
  if(keyTitle == null || startingTaxon == null|| description == null || keyTitle.isBlank() || startingTaxon.isBlank() || description.isBlank()){
    session.modal.loadAlert("Invalid information provided.");
    return;
  }
  const endpoint = "/key/new";
  var data = {
    title: keyTitle,
    startTaxon: startingTaxon,
    description: description
  };
  try {
    const response = await postToApi(endpoint, data, true);
    if(response==null){
      return false;
    }
    if(response.statusCode === 200){
      console.log("Key created successfully");
      return true;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
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

/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 *   Tab content creation functions.   *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

async function createHomeTabContent(tabContentContainerReference){
  var homeDiv = document.createElement("div");
  homeDiv.classList.add("home-div");
  homeDiv.innerHTML = "<h1 class='lng' lng='34'>Welcome to TAXO.GG</h1><p class='lng' lng='35'>This is a simple web application to explore the taxonomy of living beings.</p>";
  tabContentContainerReference.appendChild(homeDiv);
}

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

    var x = document.createElement("div");
    tabContentContainerReference.appendChild(x);
    var userinfo = document.createElement("div");
    userinfo.classList.add("profile");
    var profilePicture = profileData.picture;
    if(!profilePicture || profilePicture.isBlank()){
      profilePicture = "assets/img/user.svg";
    }
    if(profilePicture && !profilePicture.isBlank()) {
      var profilePictureElement = document.createElement("div");
      profilePictureElement.id = "profile-picture-container";
      profilePictureElement.style.backgroundImage = 'url("' + profilePicture + '")';
      userinfo.appendChild(profilePictureElement);
    }
    var userdata = document.createElement("div");
    userdata.classList.add("identity");

    userdata.innerHTML = `<span class="user-name">${profileData.name}</span> <span class="user-username">@${profileData.username}</span>`;
    
    x.appendChild(userinfo);
    userinfo.appendChild(userdata);
    

    var logoutButton = document.createElement("a");
    logoutButton.classList.add("btn","btn-primary", "lng");
    logoutButton.setAttribute("lng","24");
    logoutButton.textContent = "Logout";
    logoutButton.id = "logout-button";
    logoutButton.addEventListener("click", function(){
      logout();
    });
    userdata.appendChild(logoutButton);

    

    var updateProfilePictureDiv = document.createElement("div");
    updateProfilePictureDiv.classList.add("flex","gap-small", "change-picture-div");
    updateProfilePictureDiv.innerHTML = "<a id='hide-profile-image-input' onclick=\"hide('#update-profile-image-input, #hide-profile-image-input')\" class='btn btn-primary button-cancel none'>X</a><input id='update-profile-image-input' class='lng none fit' lng='33' type='text'>";
    var updateProfilePictureButton = document.createElement("a");
    updateProfilePictureButton.classList.add("btn","btn-primary", "lng");
    updateProfilePictureButton.setAttribute("lng","32");
    updateProfilePictureButton.textContent = "Update profile picture";
    updateProfilePictureButton.id = "update-profile-picture-button";
    updateProfilePictureButton.addEventListener("click", function(){
      var input = document.getElementById('update-profile-image-input');
      if(!input){
        return;
      }
      if(input.classList.contains("none")){
        input.classList.remove("none");
        var hideInput = document.getElementById('hide-profile-image-input');
        if(hideInput){
          hideInput.classList.remove("none");
        }
        return;
      }
      var url = input.value;
      if(url.isBlank()){
        return;
      }
      updateProfilePicture(url);
    });
    updateProfilePictureDiv.appendChild(updateProfilePictureButton);
    x.appendChild(updateProfilePictureDiv);
    
    
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

async function updateTaxonSearch(params){
    container = document.getElementById("taxon-result-div");
    var taxon = params.taxon;
    await searchTaxon(container, taxon);
}

async function searchTaxon(container, taxon, previousTaxon = null) {

  if(container == null || taxon == null){
    return;
  }

  var searchValue = taxon;
  if (searchValue.isBlank()) {
      return;
  }
  var taxon = Cache.getInstance().getTaxon(searchValue);
  if (taxon == null) {
      taxon = await getTaxonFromApi(searchValue);
  }
  container.innerHTML = "<br/>";
  if (taxon == null) {
      container.innerHTML = `<hr/><p>Taxon ${searchValue} was not found.<p>`;
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
  Router.getInstance().setParams({window: 'taxons', taxon: taxon.name}, false);
  if(taxon.hierarchy != null) {

    var hierarchyLabel = document.createElement("h3");
    hierarchyLabel.innerHTML = "<span class='lng' lng='30'>Hierarchy</span>:";
    container.appendChild(hierarchyLabel);

    var hierarchy = document.createElement("div");
    hierarchy.classList.add("hierarchy");

    let currentTaxon = taxon;
    let hierarchyList = [];

    // Construir la jerarquía a partir del objeto taxon
    while (currentTaxon) {
        hierarchyList.unshift(currentTaxon);
        currentTaxon = currentTaxon.hierarchy || null;
    }

    for (let i = 0; i < hierarchyList.length - 1; i++) {
        let tempTaxon = hierarchyList[i];
        Cache.getInstance().addTaxon(tempTaxon.name, tempTaxon);
        var arrow = document.createElement("div");
        arrow.classList.add("arrow", "hierarchy-element");
        arrow.title = tempTaxon.category.name;
        hierarchy.appendChild(arrow);
        var hierarchyElement = document.createElement("a");
        hierarchyElement.textContent = tempTaxon.name;
        arrow.addEventListener("click", function () {
            searchTaxon(container, tempTaxon.name);
        });
        arrow.appendChild(hierarchyElement);
    }
    container.appendChild(hierarchy);
  }
  // Mostrar el nombre del taxón en un h2
  var taxonNameElement = document.createElement("p");
  taxonNameElement.innerHTML = `<br/><span class="taxon-name">${taxon.name}</span> - <span class="taxon-level">${taxon.category.name}</span>`;
  container.appendChild(taxonNameElement);

  if(taxon.children && taxon.children.length > 0){
    var childrensLabel = document.createElement("h3");
    childrensLabel.innerHTML = "<span class='lng padding-left' lng='31'>Childs</span>:";
    container.appendChild(childrensLabel);

    // Mostrar los hijos del taxón
    if (taxon.children && taxon.children.length > 0) {
        var childrenList = document.createElement("ul");
        childrenList.classList.add("descendence-list");
        taxon.children.forEach(child => {
            var childElement = document.createElement("li");
            var childLink = document.createElement("a");
            childLink.textContent = child.name;
            childLink.title = child.category.name;
            childLink.href = "#";
            childLink.addEventListener("click", function () {
                searchTaxon(container, child.name, taxon.name);
            });
            childElement.appendChild(childLink);
            childrenList.appendChild(childElement);
        });
        container.appendChild(childrenList);
    }
  }

  if(taxon.description){
    var descriptionContainer = document.createElement("div");
    descriptionContainer.classList.add("description-container");
    descriptionContainer.innerHTML = taxon.description;
    container.appendChild(descriptionContainer);
  }

/*
  var taxonName = document.createElement("p");
  taxonName.textContent = JSON.stringify(taxon);
  container.appendChild(taxonName);
*/
  setLangTo(container);
}

async function createKeysTabContent(tabContentContainerReference){

  var createNewKeyButton = document.createElement("a");
  createNewKeyButton.classList.add("btn","btn-primary", "lng");
  createNewKeyButton.setAttribute("lng","38");
  createNewKeyButton.textContent = "New taxonomic key";
  createNewKeyButton.id = "create-new-key-button";
  createNewKeyButton.addEventListener("click", async function(){
    loadKeyCreationForm();
  });
  tabContentContainerReference.appendChild(createNewKeyButton);

  var keysDiv = document.createElement("div");
  keysDiv.id = "keys-div";
  keysDiv.classList.add("twoColumns");
  tabContentContainerReference.appendChild(keysDiv);

  updateUserKeys();
}

function loadKeyCreationForm(){

  var container = document.createElement("div");
  container.classList.add("key-creation-form");

  var titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = getText(40);
  titleInput.id = "key-title-input";
  container.appendChild(titleInput);

  var startingTaxonInput = document.createElement("input");
  startingTaxonInput.type = "text";
  startingTaxonInput.placeholder = getText(45);
  startingTaxonInput.id = "key-starting-taxon-input";
  container.appendChild(startingTaxonInput);

  var descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.placeholder = getText(44);
  descriptionInput.id = "key-description-input";
  container.appendChild(descriptionInput);

  var createKeyButton = document.createElement("a");
  createKeyButton.classList.add("btn","btn-primary", "lng");
  createKeyButton.setAttribute("lng","38");
  createKeyButton.textContent = "Create key";
  createKeyButton.id = "create-key-button";
  createKeyButton.addEventListener("click", function(){
    createKey(titleInput.value, startingTaxonInput.value, descriptionInput.value);
  });
  container.appendChild(createKeyButton);

  session.modal.loadElement(container);

}

async function createKey(title, startingTaxon, description){
  if(title == null || startingTaxon == null|| description == null || title.isBlank() || startingTaxon.isBlank() || description.isBlank()){
    session.modal.loadAlert("Invalid information provided.");
    return;
  }
  var created = await newKey(title, startingTaxon, description);
  if(created){
    updateUserKeys();
  } else {
    session.modal.loadAlert("Key could not be created.");
  }
  session.modal.closeModal();
}

async function updateUserKeys(){
  var keysDiv = document.getElementById("keys-div");
  if(!keysDiv){
    return;
  }

  var keysResponse = await getUserKeys();

  keysDiv.innerHTML = "";

  console.log(keysResponse);

  if(keysResponse.statusCode != 200){

  }

  switch(keysResponse.statusCode){
    case 401:
      showLogin();
      return;
  }

  if(keysResponse == null || (keysResponse.userKeys.length == 0 && keysResponse.keysSharedWithUser.length == 0)){
    keysDiv.insertAdjacentHTML('beforeend', "<p class='lng' lng='36'>You don't have any taxonomic keys yet</p>");
    return;
  }

  var userKeys = keysResponse.userKeys;

  if(userKeys != null && userKeys.length > 0){
    var userKeysDiv = document.createElement("div");
    userKeysDiv.classList.add("user-keys");
    keysDiv.appendChild(userKeysDiv);
    userKeysDiv.innerHTML = "<h2 class='lng' lng='37'>Your taxonomic keys</h2>";
    userKeys.forEach(key => {
      userKeysDiv.appendChild(createKeyListElement(key));
    });
  }

  var keysSharedWithUser = keysResponse.keysSharedWithUser;

  if(keysSharedWithUser != null && keysSharedWithUser.length > 0){
    var keysSharedWithUserDiv = document.createElement("div");
    keysSharedWithUserDiv.classList.add("shared-keys");
    keysDiv.appendChild(keysSharedWithUserDiv);
    keysSharedWithUserDiv.innerHTML = "<h2 class='lng' lng='39'>Shared with you:</h2>";
    keysSharedWithUser.forEach(key => {
      keysSharedWithUserDiv.appendChild(createKeyListElement(key));
    });
  }

  setLangTo(keysDiv);
  setNormalCursor();
}

function createKeyListElement(keyItem){

  var keyElement = document.createElement("div");
  keyElement.classList.add("key-element");
  
  if(keyItem.title){
    keyElement.innerHTML = `<p><span class='lng' lng='40'>Title</span>: ${keyItem.title}</p>`;
  }
  if(keyItem.author){
    keyElement.insertAdjacentHTML('beforeend', `<p><span class='lng' lng='41'>Author</span>: ${keyItem.author}</p>`);
  }
  if(keyItem.created){
    keyElement.insertAdjacentHTML('beforeend', `<p><span class='lng' lng='42'>Created</span>: ${keyItem.created}`);
  }
  if(keyItem.updated){
    keyElement.insertAdjacentHTML('beforeend', `<span class='lng' lng='43'>Last update</span>: ${keyItem.updated}</p>`);
  }
  if(keyItem.description) {
    keyElement.insertAdjacentHTML('beforeend', `<p><span class='lng' lng='44'>Description</span>: ${keyItem.description}</p>`);
  }
  if(keyItem.startTaxon){
    keyElement.insertAdjacentHTML('beforeend', `<p><span class='lng' lng='45'>Starting taxon</span>: ${keyItem.startTaxon}</p>`);
  }
  if(keyItem.collaborators && keyItem.collaborators.length > 0) {
    keyElement.insertAdjacentHTML('beforeend', `<p><span class='lng' lng='46'>Collaborators</span>: ${keyItem.collaborators.join(", ")}</p>`);
  }

  keyElement.addEventListener('click', function(){
    Router.getInstance().setParams({window:"key",id:keyItem._id},true);
  });

  return keyElement;
}

async function createKeyTabContent(tabContentContainerReference, key){
  if(key == null || tabContentContainerReference == null){
    return;
  }
  KeyEditor.createKeyEditor(tabContentContainerReference, key);
  setNormalCursor();
}

class KeyEditor{

  originalKey;
  key;
  
  container;

  keyChangesBuffer;
  keyContainer;
  nodeContainer;

  editorElements = [];
  nodes = [];
  nodeNumberReferences = [];
  nodeNumberTitleReferences = [];

  constructor(container, key){
    this.updateKeyReferences(key);
    this.container = container;
  }

  updateKeyReferences(key){
    this.originalKey = key;
    this.key = cloneObject(key);
  }

  init(){

    this.loadKeyButtons();

    this.keyContainer = document.createElement("div");
    this.keyContainer.classList.add("key-container");
    this.container.appendChild(this.keyContainer);

    this.loadKey(this.key);

  }

  loadKeyButtons(){
    var saveButtonContainer = document.createElement("div");
    saveButtonContainer.classList.add("save-button-container");
    this.container.appendChild(saveButtonContainer);

    var editButton = document.createElement("a");
    editButton.classList.add("btn","btn-primary","lng");
    editButton.setAttribute("lng","48");
    editButton.textContent = "Edit";

    var cancelEditionButton = document.createElement("a");
    cancelEditionButton.classList.add("btn","btn-primary","lng", "button-cancel", "none");
    cancelEditionButton.setAttribute("lng","49");
    cancelEditionButton.textContent = "Discard changes";

    var saveButton = document.createElement('a');
    saveButton.classList.add("btn","btn-primary","lng", "btn-submit", "none");
    saveButton.setAttribute("lng","47");
    saveButton.textContent = "Save changes";


    saveButton.addEventListener('click', () => {
      if(!this.save()){
        return;
      }
      this.updateKeyReferences(this.Key);
      this.enableEdition(false);
      saveButton.classList.add("none");
      editButton.classList.remove("none");
      cancelEditionButton.classList.add("none");
    });

    editButton.addEventListener('click', () => {
      this.enableEdition(true);
      editButton.classList.add("none");
      saveButton.classList.remove("none");
      cancelEditionButton.classList.remove("none");
    });

    cancelEditionButton.addEventListener('click',async () => {
      var text = getText(50);
      var cancelAction = await session.modal.askForConfirmation(isNullOrEmpty(text) ? "Are you sure you want to discard the changes?" : text);
      if(cancelAction === true) {
        this.updateKeyReferences(this.originalKey);
        this.loadKey(this.key);
        editButton.classList.remove("none");
        saveButton.classList.add("none");
        cancelEditionButton.classList.add("none");
      }
    });
    
    saveButtonContainer.appendChild(editButton);
    saveButtonContainer.appendChild(cancelEditionButton);
    saveButtonContainer.appendChild(saveButton);
  }

  loadKey(key){

    this.keyContainer.innerHTML = "";

    var keyInfoDiv = document.createElement("div");
    keyInfoDiv.classList.add("key-info");
    this.keyContainer.appendChild(keyInfoDiv);

    keyInfoDiv.insertAdjacentHTML('beforeend', "<h5><span class='lng' lng='40'>Title</span>:</h5>");
    this.createEditableElement(document.createElement('h4'), key.title, function(){key.title = this.value}, keyInfoDiv);

    keyInfoDiv.insertAdjacentHTML('beforeend', "<h5><span class='lng' lng='44'>Description</span>:</h5>");
    this.createEditableElement(document.createElement('h4'), key.description, function(){key.description = this.value}, keyInfoDiv);

    keyInfoDiv.insertAdjacentHTML('beforeend', "<h5><span class='lng' lng='45'>Starting taxon</span>:</h5>");
    this.createEditableElement(document.createElement('h4'), key.startTaxon, function(){key.startTaxon = this.value}, keyInfoDiv);


    this.nodeContainer = document.createElement("div");
    var nodeContainer = this.nodeContainer;
    nodeContainer.classList.add("node-container");
    this.keyContainer.appendChild(nodeContainer);

    if (key.nodes == null){
      key.nodes = [];
      var newNodeId = generateObjectId();
      key.startNode = newNodeId;
      var newNode = { _id: newNodeId, paths: [] };
      key.nodes.push(newNode);
    }

    for (var i = 0; i < key.nodes.length; i++) {
      this.createNode(key, i, nodeContainer);
    }
    
  }

  createNode(key, index, container, previousNodeDiv = null, isEnabled){
    var node = key.nodes[index];
    var nodeDiv = document.createElement("div");
    this.nodes.push(nodeDiv);
    nodeDiv.classList.add("node");
    if(isEnabled) {
      nodeDiv.classList.add("enabled");
    }

    var deleteNode = document.createElement("a");
    deleteNode.classList.add("btn","btn-primary","button-cancel", "button-delete-node");
    deleteNode.textContent = "X";
    deleteNode.addEventListener('click', () => {
      if(key.nodes.length >= 1) {
        var text = getText(51);
        session.modal.loadAlert( isNullOrEmpty(text) ? "You can't delete the last node." : text);
        return;
      }
      key.nodes.splice(index, 1);
      nodeDiv.remove();
      this.nodeNumberTitleReferences.remove(nodeDiv);
      this.updateNodeNumberReferences();
      this.reasignNodeNumberTitleReferences();
    });
    nodeDiv.appendChild(deleteNode);

    var nodeNumber = document.createElement("h3");
    this.nodeNumberTitleReferences.push(nodeDiv);
    nodeNumber.textContent = index + 1;
    nodeNumber.id = `node-${node._id}`;
    nodeNumber.classList.add("nodeNumber");
    nodeNumber.setAttribute("node", node._id);
    nodeDiv.appendChild(nodeNumber);

    var pathsDiv = document.createElement("div");
    pathsDiv.classList.add("paths");
    nodeDiv.appendChild(pathsDiv);
    if(node.paths){
      for(var i = 0; i < node.paths.length; i++) {
        this.createPath(key, index, i, pathsDiv);
      }
    }
    var addPathButton = document.createElement("a");
    addPathButton.classList.add("btn","btn-primary","add-path-button", "margin-top");
    addPathButton.textContent = "+";
    addPathButton.addEventListener('click', () => {
      var path = {
        description: "",
        nextNode: null
      };
      if(!node.paths){
        node.paths = [];
      }
      node.paths.push(path);
      this.createPath(key, index, node.paths.length-1, pathsDiv, false, true);
    });
    nodeDiv.appendChild(addPathButton);

    if(previousNodeDiv){
      container.insertBefore(nodeDiv, previousNodeDiv);
    } else {
      container.appendChild(nodeDiv);
    }
  }

  createPath(key, nodeIndex, pathIndex, container, codeAllowed = false, isEditable = false){
    var path = key.nodes[nodeIndex].paths[pathIndex];
    var pathDiv = document.createElement("div");
    container.appendChild(pathDiv);
    pathDiv.classList.add("path");

    var numberDiv = document.createElement("div");
    numberDiv.classList.add("pathNumber");
    pathDiv.appendChild(numberDiv);

    var number = document.createElement("p");
    number.innerHTML = (pathIndex+1) + "  ";
    numberDiv.appendChild(number);

    var deletePath = document.createElement("a");
    deletePath.classList.add("btn","btn-primary","button-cancel", "button-delete-path");
    deletePath.textContent = "X";
    deletePath.addEventListener('click', () => {
      key.nodes[nodeIndex].paths.splice(pathIndex, 1);
      pathDiv.remove();
    });
    number.appendChild(deletePath);

    var pathInfoDiv = document.createElement("div");
    pathInfoDiv.classList.add("pathInfo");
    pathDiv.appendChild(pathInfoDiv);

    var descriptionDiv = document.createElement("div");
    descriptionDiv.classList.add("pathDescription");
    pathInfoDiv.appendChild(descriptionDiv);
    this.createEditableElement(document.createElement('p'), path.description, function(){path.description = this.value}, descriptionDiv, codeAllowed, isEditable);

    var pathButtons = document.createElement("div");
    pathButtons.classList.add("link");
    descriptionDiv.appendChild(pathButtons);

    this.createLinkDivContent(key, nodeIndex, pathIndex, pathButtons);
  }

  createLinkDivContent(key, nodeIndex, pathIndex, pathButtons) {
    pathButtons.innerHTML = "";
    var node = key.nodes[nodeIndex];
    var path = node.paths[pathIndex];

    if (path.node && path.node !== null) {
      console.log("Path node", path.node);
      var goToNodeButton = document.createElement("a");
      goToNodeButton.classList.add("btn", "btn-primary");
      this.setNodeNumber(key, path.node, goToNodeButton);
      this.nodeNumberReferences.push({ key: key, node: path.node, button: goToNodeButton });
      goToNodeButton.addEventListener('click', () => {
        this.goToNode(path.node);
      });
      pathButtons.appendChild(goToNodeButton);
    }

    if(path.taxon){
      var taxonReference = document.createElement('p');
      taxonReference.classList.add("taxon-reference");
      var taxonLink = document.createElement('a');
      taxonLink.classList.add("taxon-link");
      taxonLink.textContent = path.taxon;
      taxonLink.addEventListener('click', () => {
        Router.getInstance().setParams({window:"taxons", taxon: path.taxon});
      });
      taxonReference.appendChild(taxonLink);
      pathButtons.appendChild(taxonReference);
    }

    var linkButton = document.createElement("a");
    linkButton.classList.add("btn","btn-primary", "link-btn");
    linkButton.textContent = "🔗";
    linkButton.addEventListener('click', () => {
      this.linkPath(key, nodeIndex, pathIndex, pathButtons);
    });
    pathButtons.appendChild(linkButton);

  }

  setNodeNumber(key, node, button){
    var nodeIndex = key.nodes.findIndex(n => n._id == node);
    if(nodeIndex != -1){
      button.textContent = nodeIndex + 1;
    }
  }

  updateNodeNumberReferences(){
    this.nodeNumberReferences.forEach(reference => {
      if(reference!=null){
        this.setNodeNumber(reference.key, reference.node, reference.button);
      }
    });
  }

  reasignNodeNumberTitleReferences() {
    this.nodeNumberTitleReferences.forEach(nodeTitle => {
      this.key.forEach(node => {
        if(nodeTitle.getAttribute("node") == node._id){
          nodeTitle.textContent = node._id + 1;
        }
      });
    });
  }

  linkPath(key, nodeIndex, pathIndex, containerDiv){
    var divContainer = document.createElement("div");

    var linkToNodeLabel = document.createElement("p");
    linkToNodeLabel.classList.add("lng");
    linkToNodeLabel.setAttribute("lng","52");
    linkToNodeLabel.textContent = "Link to node:";

    divContainer.appendChild(linkToNodeLabel);

    var comboBox = document.createElement("select");
    comboBox.classList.add("node-combo", "btn");
    console.log(key.nodes);

    var option = document.createElement("option");
    option.value = '';
    option.textContent = '-';
    comboBox.appendChild(option);

    for(var i = 0; i < key.nodes.length; i++){
      var itNode = key.nodes[i]._id;
      var skip = key.nodes[nodeIndex]._id == itNode;
      console.log(skip);
      if(skip){
        continue;
      }
      
      for(var j = 0; j < key.nodes[nodeIndex].paths.length; j++){
        var itPathNode = key.nodes[nodeIndex].paths[j].node;
        console.log(itPathNode, i, itNode, j);
        if(pathIndex != j && itPathNode == itNode){
          skip = true;
          console.log(skip);
          break;
        }
      }
      
      if(skip) {
        continue;
      }

      var option = document.createElement("option");
      option.value = key.nodes[i]._id;
      option.textContent = i + 1;
      comboBox.appendChild(option);
    }

    

    divContainer.appendChild(comboBox);

    var linkButton = document.createElement("a");
    linkButton.classList.add("btn","btn-primary", "margin-left", "lng");
    linkButton.textContent = "Link";
    linkButton.setAttribute("lng","53");
    linkButton.addEventListener('click', () => {
      var selectedNode = comboBox.value;
      console.log("Selected", selectedNode);
      if(selectedNode == null || selectedNode == '') {
        delete key.nodes[nodeIndex].paths[pathIndex].node;
        console.log("path",key.nodes[nodeIndex].paths[pathIndex]);
      } else {
        key.nodes[nodeIndex].paths[pathIndex].node = selectedNode;
      }
      this.createLinkDivContent(key, nodeIndex, pathIndex, containerDiv);
      
    });
    divContainer.appendChild(linkButton);

    divContainer.appendChild(document.createElement("hr"));

    var newNodeLabel = document.createElement("p");
    newNodeLabel.classList.add("lng");
    newNodeLabel.setAttribute("lng","56");
    newNodeLabel.textContent = "Create new node and link it";
    divContainer.appendChild(newNodeLabel);

    var newNodeButton = document.createElement("a");
    newNodeButton.classList.add("btn", "btn-primary");
    newNodeButton.textContent = "New node";
    newNodeButton.classList.add("lng");
    newNodeButton.setAttribute("lng","54");
    newNodeButton.addEventListener('click', () => {
      var newNodeId = generateObjectId(); // Generar nuevo ObjectId
      var newNode = { _id: newNodeId, paths: [] };
      key.nodes.push(newNode);
      key.nodes[nodeIndex].paths[pathIndex].node = newNodeId;

      this.createNode(key, key.nodes.length - 1, this.nodeContainer, null, true);

      this.createLinkDivContent(key, nodeIndex, pathIndex, containerDiv);
      session.modal.closeModal();
    });
    divContainer.appendChild(newNodeButton);

    divContainer.appendChild(document.createElement("hr"));

    var linkToTaxonLabel = document.createElement("p");
    linkToTaxonLabel.textContent = "Reference to taxon";
    linkToTaxonLabel.classList.add("lng");
    linkToTaxonLabel.setAttribute("lng","55");
    divContainer.appendChild(linkToTaxonLabel);

    var taxonInput = document.createElement("input");
    taxonInput.type = "text";
    divContainer.appendChild(taxonInput);

    var linkTaxonButton = document.createElement("a");
    linkTaxonButton.classList.add("btn","btn-primary", "margin-top");
    linkTaxonButton.textContent = "Link";
    linkTaxonButton.classList.add("lng");
    linkTaxonButton.setAttribute("lng","53");
    linkTaxonButton.addEventListener('click', () => {
      var taxon = taxonInput.value;
      if(taxon.isBlank()){
        delete key.nodes[nodeIndex].paths[pathIndex].taxon;
        return;
      } else{
        key.nodes[nodeIndex].paths[pathIndex].taxon = taxon;
      }
      this.createLinkDivContent(key, nodeIndex, pathIndex, containerDiv);
    });
    divContainer.appendChild(linkTaxonButton);

    setLangTo(divContainer);

    session.modal.loadElement(divContainer);
  }

  
  


  goToNode(id){
    var node = document.getElementById(`node-${id}`);
    console.log(id, node);
    if(node){

      var highlighted = document.querySelector(".highlight");
      if(highlighted){
        highlighted.classList.remove("highlight");
      }

      node.scrollIntoView();
      node.classList.add("highlight");
    }
  }

  async save(){
    return await updateKey(this.key);
  }


  createEditableElement(element, value, submitFunction, container = this.container, codeAllowed = false, isEditable = false){
    element.textContent = value;
    container.appendChild(element);
    var editor = TextEditor.associate(element, value, container, submitFunction, codeAllowed, isEditable);
    this.editorElements.push(editor);
    return editor;
  }

  static createKeyEditor(container, key){
    var editor = new KeyEditor(container, key);
    editor.init();
    return editor;
  }

  enableEdition(value){
    this.editorElements.forEach(element => {
      if(element){
        element.enableEdition(value);
      }
    });
    this.nodes.forEach(element => {
      if(element){
        if(value){
          element.classList.add("enabled");
        } else{
          element.classList.remove("enabled");
        }
      }
    });
  }

}


class TextEditor{

  associatedElement;
  submitFunction;
  textBuffer;
  value;
  mainContainerElement;
  codeAllowed;

  editorElement;
  contentContainer;

  isEditable;

  constructor(associatedElement, value, mainContainerElement, submitFunction, codeAllowed, isEditable = false){
    this.associatedElement = associatedElement;
    this.value = value;
    this.mainContainerElement = mainContainerElement;
    this.submitFunction = submitFunction;
    submitFunction = submitFunction.bind(this);
    this.codeAllowed = codeAllowed;
    this.isEditable = isEditable;
  }

  init(){
    this.submitFunction = this.submitFunction.bind(this);
    this.contentContainer = document.createElement("div");
    this.contentContainer.classList.add("none");
    this.mainContainerElement.appendChild(this.contentContainer);
    this.contentContainer.classList.add("text-editor");

    
    
    if(this.codeAllowed){
      this.editorElement = document.createElement("textarea");

      
    } else{
      this.editorElement = document.createElement("input");
      this.editorElement.type = "text";
      this.editorElement.textContent = this.value;
      this.contentContainer.appendChild(this.editorElement);
    }
    this.contentContainer.appendChild(this.editorElement);

    var cancelButton = document.createElement("a");
    cancelButton.classList.add("btn","btn-primary","button-cancel");
    cancelButton.textContent = "X";
    cancelButton.addEventListener("click", () => this.hideEditor());
    this.contentContainer.appendChild(cancelButton);

    var submitButton =  document.createElement("a");
    submitButton.classList.add("btn","btn-primary","btn-submit");
    submitButton.textContent = "V";
    this.contentContainer.appendChild(submitButton);

    if(this.codeAllowed){
      submitButton.addEventListener("click", () => this.submitWithCode());
    } else {
      submitButton.addEventListener("click", () => this.submit());
    }
   
    this.associatedElement.insertAdjacentElement("afterend", this.contentContainer);
    this.mainContainerElement.appendChild(this.contentContainer);

    this.associatedElement.addEventListener("click", () => this.showEditor());
    this.associatedElement.classList.add("editable");
    if(this.isEditable) this.associatedElement.classList.add("enabled");
  }

  submit(){
    this.value = this.editorElement.value;
    this.submitFunction();
    this.associatedElement.textContent = this.value;
    this.hideEditor();
  }

  submitWithCode(){

    this.submitFunction();
  }

  hideEditor(){
    this.contentContainer.classList.add("none");
    this.associatedElement.classList.remove("none");
  }

  showEditor(){

    if(!this.isEditable){
      return;
    }
    this.associatedElement.classList.add("none");
    this.contentContainer.classList.remove("none");

    if(this.codeAllowed) {
      /*
      this.editor = CodeMirror.fromTextArea(this.editorElement, {
        lineNumbers: true,
        mode: "javascript"
      });
      */
    } else {
      this.editorElement.value = this.value;
    }
  }

  static associate(element, value, mainContainerElement, submitFunction, codeAllowed = false, isEditable = false) {
    if(element.associatedEditor != null){
      return null;
    }
    var textEditor = new TextEditor(element, value, mainContainerElement, submitFunction, codeAllowed, isEditable);
    textEditor.init();
    element.associatedEditor = textEditor;
    return textEditor;
  }

  enableEdition(value){
    this.isEditable = value;
    if(value){
      this.associatedElement.classList.add("enabled");
    } else {
      this.associatedElement.classList.remove("enabled");
      if(!this.contentContainer.classList.contains("none")){
        this.hideEditor();
      }
    }
  }

}

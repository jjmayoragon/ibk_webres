//DATA
var api;
let contactsArray = [];
var _id;
var newPhoneCallGuid;


document.onreadystatechange = function () {  
    if (document.readyState == "complete") {  
     getDataParam();  

     getContactsFromApi(_id);

        if(api.length==1){
          openContactForm(api[0].guid);
        }
        else{
          loadDataFromApi(api);
     
          emptyHtmlContainers();
     
          createContactsCards(contactsArray);
          
          LoadEventListeners();
        }
    }  
   } 


//FUNCTIONS
function getDataParam() {       
    var vals = new Array();  
    if (location.search != "") {  
     vals = location.search.substr(1).split("&");  
     for (var i in vals) {  
      vals[i] = vals[i].replace(/\+/g, " ").split("=");  
     }
     //look for the parameter named 'data'
     var found = false;
     for (var i in vals) {
      if (vals[i][0].toLowerCase() == "data") {
       parseDataValue(vals[i][1]);
       found = true;
       break;
      }  
     }  
    }   
   }  
   
   function parseDataValue(datavalue) {  
    if (datavalue != "") {  
     var vals = new Array();  

     vals = decodeURIComponent(datavalue).split("&");  
     for (var i in vals) {  
      vals[i] = vals[i].replace(/\+/g, " ").split("=");  
     }  
   
  
     //Loop through vals and create rows for the table  
     for (var i in vals) {  
       console.log(vals[i][0]);
       _id = vals[i][0];
     }     
    }  
   
   } 


//APIS
function getContactsFromApi(id) {
    var parameters = {};
    parameters.IdPersona = id;
    
    var req = new XMLHttpRequest();
    req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/axx_GetContactsByIdPersona", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function() {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var json = JSON.parse(this.response);
                var results = json.JsonResponse.replaceAll("\\", "").replaceAll(
              /\:null/gi,
              ':"-"'
            );
            api = JSON.parse(results);
            } else {
               console.log(this.statusText);
            }
        }
    };
    req.send(JSON.stringify(parameters));
    }




//MAPPING - MAPEA HTML DIV BLOCKS
function mapHtmlOrderCards(contact) {
  let divBlock = `    
    <div>${contact.fullName}</div>    
    <div style="color: #8b64db"><strong> ${contact.idPersona}</strong></div>
    <div style="display:none">${contact.guid}</div>
    <div class="dropdown">
    <button class="dropbtn"> <i style="color:#333" class="small material-icons">arrow_forward</i></button>
    <div class="dropdown-content">
      <a class="customButton"> <i class="small material-icons">arrow_forward</i></a>
    </div>
    </div>
    </div>
    `;
  return divBlock;
}

function emptyHtmlContainers() {
  document.getElementById('ordersAreaContainer').innerHTML = "";
}



//CREATE HTML ELEMENTS DINAMICALLY
function createContactsCards(contact) {

  for (let i = 0; i < contact.length; i++) {

      let container = document.getElementsByClassName('ordersArea');

      let card = document.createElement('table');

      card.classList.add('card');

      container[0].insertAdjacentElement('beforeend', card);

      //panel Expandible

      //Mapea HTML blocks
      let divHtmlContactsCards = mapHtmlOrderCards(contact[i]);

      //Carga cards y tabla books        


      //Div separator

      loadHtmlOrdersCards(divHtmlContactsCards, card);
  }
}


//Carga cards pedidos
function loadHtmlOrdersCards(divBlock, container) {
  //Carga labels en cada order cards
  let row = document.createElement('div');

  row.classList.add('rowOrdersCard');

  row.innerHTML = divBlock;

  container.insertAdjacentElement('beforeend', row)
}




function loadDataFromApi(apiResults){    
  //El array de Contacts se resetea antes de cargar los datos de la API
  contactsArray = [];
    
  apiResults.forEach(c => {      
      //Cargamos orden
      contactsArray.push({
          fullName : c.fullName,
          idPersona : c.idPersona,
          guid : c.guid
      });
  
              
  });
  //Para cunado sean varias ordenes, cargamos aca una por una
  return contactsArray;
}



//CONSTRUCTORS
function Contact(fullName, idPersona, guid) {

  this.fullName = fullName;

  this.idPersona = idPersona;

  this.guid = guid;
}






function LoadEventListeners() {
  //CLICK BOTON QUE CREA CASO
  var navigateToCase = document.getElementsByClassName("customButton");
  let j;
  for (j = 0; j < navigateToCase.length; j++) {
    navigateToCase[j].addEventListener("click", () => {
      
      let contactGuid = event.target.parentElement
                            .parentElement
                            .parentElement
                            .previousElementSibling
                            .innerHTML;
         
      openContactForm(contactGuid);
    });
  }
}





//ABRIR CONTACT CON GUID ESPECIFICO
function openContactForm(contactGuid) {

  createPhoneCall(contactGuid);
  asociateContactWithPhoneCall(contactGuid,newPhoneCallGuid);

  //AppId
    let appid = "f848d9fd-f218-ea11-a812-000d3ac1779c";

    //Form ID  de Contacto "Vista 360"
    let formid = "1066a381-5857-eb11-a812-000d3ac1b694";
    
    var url =`https://interbankingsadesa.crm2.dynamics.com/main.aspx
?appid=${appid}
&forceUCI=1
&newWindow=false
&pagetype=entityrecord
&etn=contact
&id=${contactGuid}
&formid=${formid}
`;
    
    window.open(url, "_self");
      
}



//CREATE PHONE CALL AND RELATED TO CONTACT
function createPhoneCall(contactGuid){
  //Api creada por CRM Rest Builder
var entity = {};
entity.subject = "Call Center";
//entity.directioncode = true;
//entity["regardingobjectid@odata.bind"] = `/contacts(${contactGuid})`;

var req = new XMLHttpRequest();
req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/phonecalls", false);
req.setRequestHeader("OData-MaxVersion", "4.0");
req.setRequestHeader("OData-Version", "4.0");
req.setRequestHeader("Accept", "application/json");
req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
req.onreadystatechange = function() {
    if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 204) {
            var uri = this.getResponseHeader("OData-EntityId");
            var regExp = /\(([^)]+)\)/;
            var matches = regExp.exec(uri);
            newPhoneCallGuid = matches[1];
            console.log("PhoneCall created successfully");
        } else {
          console.log(this.statusText);
        }
    }
};
req.send(JSON.stringify(entity));
}


//Api creada por CRM REst Builder
function asociateContactWithPhoneCall(contactGuid, phoneCallGuid){
  var association = {"@odata.id": Xrm.Page.context.getClientUrl() + `/api/data/v9.1/phonecalls(${phoneCallGuid})`};

var req = new XMLHttpRequest();
req.open("POST", Xrm.Page.context.getClientUrl() + `/api/data/v9.1/contacts(${contactGuid})/Contact_Phonecalls/$ref`, false);
req.setRequestHeader("Accept", "application/json");
req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
req.setRequestHeader("OData-MaxVersion", "4.0");
req.setRequestHeader("OData-Version", "4.0");
req.onreadystatechange = function() {
    if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 204 || this.status === 1223) {
            //Success - No Return Data - Do Something
            console.log("Relationship between PhoneCall and Contact created successfully");
        } else {
            console.log(this.statusText);
        }
    }
};
req.send(JSON.stringify(association));
}
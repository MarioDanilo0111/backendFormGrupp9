//Funktion för att hämta data från Strapi CMS
async function getDataFromStrapi() {
  //Url till Strapi.js API form sida
  let url = "http://localhost:1337/api/forms";

  //Hämtar JSON från API och konverterar det till JS objekt
  let stringResponse = await fetch(url);
  let myObjekt = await stringResponse.json();

  // console.log(myObjekt);

  let output = "<table>";

  //Checkar om det är ett eller flera objekt som hämtas
  //Kan undvikas genom flera funktioner; en för alla och en för unik
  // en array är definnerad även om det inte finns index, därför ska array vara större en 0 för att kontrollera om det finns något spara, om inte skapas ingen array
  if (Array.isArray(myObjekt.data) && myObjekt.data.length > 0) {
    //Anropa generateRow för att skapa en header-rad
    output += generateRow(myObjekt.data[0].attributes, null, true);

    //Skapar en ForEach loop för varje elemet i Data-arrayen
    myObjekt.data.forEach((element) => {
      //Gör en pekare till attribut objektet
      let obj = element.attributes;

      //skapar en row för varje obj. refererad till id.
      output += generateRow(obj, element.id, false);
    });
  } else {
    // en variabel med en path till attribut i obj
    let obj = myObjekt.data.attributes;

    //Skapa en Header Rad med detta
    output += generateRow(obj, null, true);

    //Skriver Output string
    output += generateRow(obj, myObjekt.data.id, false);
  }
  //Avsluta <table> tag tabelen
  output += "</table>";

  //Skriver ut Output string till div-element
  document.getElementById("productFetched").innerHTML = output;
}

// med dena funktion hämtar vi Token för använda senare
//om Token hämtas så är user/password korrekt skrivet
async function getToken() {
  // boolean initieras som true
  let valid = true;

  //Validera användarnamn och lösenord!
  //misslyckad inloggning på validateLogin function
  if (!validateLogin()) valid = false;

  //Validera producter
  //om inmatad data inte är tillräckligt
  if (!validateProduct()) valid = false;

  //vid misslyckade valideringar avbryta processen
  if (!valid) return null;

  //Url till Strapi.js UserList
  const urlUser = "http://localhost:1337/api/auth/local/";

  // hämtar värden från .html
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  //Skapar ett objekt av det användarnamn och lösenord som user har skrivit in i fält.
  let userObject = {
    identifier: user,
    password: pass,
  };

  //Anropar API med inloggningsdata.
  //Inkluderar Method och Headers
  let userResponse = await fetch(urlUser, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userObject),
  });

  //Konverterar API response JSON string till ett objekt
  let userJson = await userResponse.json();
  console.log(document.getElementById("deletePost"));
  console.log(userJson);

  //Kontrollerar om objektet har Token.
  //Token ligger under attribut jwt
  //Om inloggning är korrekt. Fortsätt till funktion postData med token som parameter.
  if (userJson.jwt) return userJson.jwt;
  else {
    //Inloggningen har misslyckats. Skriv ut errormeddelande från Strapi.js
    let errMessage = userJson.error.message;

    document.getElementById("userError").innerText = errMessage;

    return null;
  }
}

async function postData() {
  //Anropa GetToken() för att få en inloggnings-nyckel.
  //Om detta misslyckas, avbryt funktionen.
  let token = await getToken();
  if (!token) return;

  //URL till Strapi producter collection.
  const urlProduct = "http://localhost:1337/api/forms/";

  // Hämtar data från fält
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const product = document.getElementById("product").value;

  //Skapa ett objekt med data inkluderat.
  let productObjekt = {
    data: {
      title: title,
      description: description,
      price: price,
      product: product,
    },
  };

  //Anropar API med productObjekt
  let productResponse = await fetch(urlProduct, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer" + token, //Inkluderar Token från inloggning tidigare.
    },
    body: JSON.stringify(productObjekt),
  });

  let productJson = await productResponse.json();

  console.log(productJson);
}

//Funktioner för validering
//Validering av User Input
function userValidate(comp) {
  // 1. Fältet måste vara ifyllt

  let valid = true;

  // måste vara störe än 0 för att få true
  if (comp.value.length == 0) {
    //Misslyckad validering
    valid = false;
  }

  //om misslyckad skrivs tex ut
  if (!valid) {
    document.getElementById("userError").innerText = "det är tomt här!";
    return false;
  } else {
    // tömmer fält
    document.getElementById("userError").innerText = "";
    return true;
  }
}

//Validering av Password input
function passValidate(comp) {
  let valid = true;
  // måste vara större än 4 tecken
  if (comp.value.length <= 4) {
    //Misslyckad validering
    valid = false;
  }
  //Check on lyckad validering
  if (!valid) {
    //text skrivs på .html om inte det inte uppfylls
    document.getElementById("passwordError").innerText =
      "minst 5 tecken långt!";
    return false;
  } else {
    // fät töms
    document.getElementById("passwordError").innerText = "";
    return true;
  }
}

//funktion för validering av inloggninfsförsök
function validateLogin() {
  //Variabel för att initiera metod som ture
  let valid = true;

  //Validate Användarnamn inte är korrekt
  if (!userValidate(document.getElementById("user"))) {
    valid = false;
  }

  //Validate Password
  if (!passValidate(document.getElementById("pass"))) {
    valid = false;
  }

  return valid;
}

//Funktion för validering av  Name
function titelValidate(comp) {
  // 1. Fältet måste innehålla ett värde
  // 2. Fältet får inte vara ett nummer

  let valid = true;

  //validera att titlen är större än 0
  if (comp.value.length == 0) {
    //Felaktig validering
    valid = false;
    document.getElementById("titelError").innerText =
      "Titel måste vara ifyllt.";
  }

  //kontrollera att det inte är en string
  if (!isNaN(comp.value) && comp.value.length != 0) {
    //Felaktig validering
    valid = false;
    document.getElementById("titelError").innerText =
      "Namnet får inte vara ett nummer.";
  }

  if (valid) {
    document.getElementById("titelError").innerText = "";
  }

  return valid;
}

//validering av titel
function validateProduct() {
  let valid = true;

  //Validate PokemonName
  if (!titelValidate(document.getElementById("title"))) {
    valid = false;
  }

  //TODO - Skapa validering för Type och Level

  return valid;
}

//Genererat tabellrad med det inkludera objektet. Skapar TH rad om header=true
function generateRow(obj, objId, header) {
  let output = "<tr>";
  // dessa parametrar döljs
  let forbiddenParameters = ["createdAt", "updatedAt", "publishedAt"];

  //For in loop för att gå igenom alla parametrar i obj
  for (x in obj) {
    //Kontrollera att x är en tillåten parameter.
    // Keyword Continue går vidare till nästa parameter i loopen
    //Fungerar också i en ForEach loop.
    if (forbiddenParameters.includes(x)) continue;

    if (header) output += `<th>${x}</th>`;
    else output += `<td> ${obj[x]}</td>`;
  }

  // console.log(obj, objId, header);
  //Skapa update och Delete knapp för TD rad
  // om header och objekt inte är definerade knappar ska inte visas
  if (!header && obj) {
    //URL för den specifika posten
    let postURL = `http://localhost:1337/api/forms/${objId}`;

    output += `<td><button onclick="updatePost('${postURL}');">Update Post</button></td>`;
    output += `<td><button onclick="deletePost('${postURL}');">Delete Post</button></td>`;
  }

  //Stänga <tr> taggen
  output += "</tr>";

  return output;
}

async function updatePost(url) {
  //Hämta Token från GetToken()
  //Om ingen Token returneras, avbryt funktionen
  let token = await getToken();
  if (!token) return;

  // Hämtar data från fält
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const product = document.getElementById("product").value;

  //Skapa ett objekt med data inkluderat.
  let productObjekt = {
    data: {},
  };

  //Fyller upp Data med parameter-värden
  if (title) productObjekt.data["title"] = title;
  if (description) productObjekt.data["description"] = description;
  if (price) productObjekt.data["price"] = price;
  if (product) productObjekt.data["product"] = product;

  //Anropar API med productObjekt
  await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token, //Inkluderar Token från inloggning tidigare.
    },
    body: JSON.stringify(productObjekt),
  });

  //Anropa "GetDataFromStrapi" för att skriva ut ny tabell
  await getDataFromStrapi();
}

async function deletePost(url) {
  //Hämta Token från GetToken()
  //Om ingen Token returneras, avbryt funktionen
  let token = await getToken();
  if (!token) return;

  //Anropar API med inloggningsdata.
  //Inkluderar Method och Headers
  await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token, //Inkluderar Token från inloggning tidigare.
    },
  });

  //Anropa "GetDataFromStrapi" för att skriva ut ny tabell
  await getDataFromStrapi();
}

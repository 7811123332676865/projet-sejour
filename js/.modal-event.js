const API_URL = "https://ton-api.fr/datatourism......
const eventSection = document.querySelector(".eventSection");

function renderEvent (listEvent)={

}

const  cardEvent = document.querySelector (".eventSection");

for (i=0; i<listEvent.length; i++) {
    const event = createElement("div");
    event.className = item.;
  eventSection.appendChild(cardEvent);
  if (listEvent.date ...){
    event.key.add(is-hidden);
  };

  const enventDate = document.createElement ("time");
  enventDate.className = item.date;
  cardEvent.appendChild(enventDate);

  const eventType = document.createElement ("h2");
  eventType.textContent = item.addressLocality;
  cardEvent.appendChild(eventType);

  const eventTitle = document.createElement("h1");
  eventTitle.textContent = item.Title;
  event.appendChild(eventTitle);

const eventDescriptif =document.querySelector ("p")
eventDescriptif.textContent = item.shortDescription;
event.appendChild(eventDescriptif);

const eventdateTime= document.querySelector("time")
eventdateTime.textContent = item.periodeOuverture
event.appendChild(eventdateTime);

const eventPrice = document.querySelector ("price");
eventPrice.textContent = item.price + "€";

const eventDistance = document.querySelector("maps");
eventDistance = item.isLocated
cardEvent.appendChild(eventDistance);
} 
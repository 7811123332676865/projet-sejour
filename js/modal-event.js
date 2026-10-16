//recup' API
async function getEvents() {
const API_URL = "https://api.datatourisme.fr/v1/entertainmentAndEvent?department=37&fields=uuid,label,takesPlaceAt,isLocatedAt&page_size=100";
const API_KEY = "a1eaf35f-0c38-4fd4-8826-2aae9ab316ac";
const today = new Date().setHours(0,0,0,0);
  try {
    const response = await fetch(API_URL,{headers:{"X-API-Key":API_KEY}});
    if (!response.ok) {
      throw new Error("Erreur API : "+ ${response.status});
    }
    const data = await response.json();
        
   const eventList = data.objects;
  } catch (error) {
    console.error(error);
  }
};
for (i=0; i<eventList.length; i++) {
    const cardEvent = document.createElement("div");
    cardEvent.className = "event";
  eventList.appendChild(cardEvent);
  if (objects.endDate>today){
    cardEvent.add(is-hidden);
  };

  const eventDate = document.createElement ("time");
  eventDate.className = objects.opendate;
  cardEvent.appendChild(eventDate);

  const eventType = document.createElement ("h3");
  eventType.textContent = objects.streetAddress;
  cardEvent.appendChild(eventType);

  const eventTitle = document.createElement("h2");
  eventTitle.textContent = objects.label;
  cardEvent.appendChild(eventTitle);

const eventDescriptif =document.createElement("p")
eventDescriptif.textContent = objects;
cardEvent.appendChild(eventDescriptif);

const eventdateTime= document.createElement("#eventDate")
eventdateTime.textContent = objects.startDate + objects.endDate;
cardEvent.appendChild(eventdateTime);

const eventPrice = document.createElement ("price");
eventPrice.textContent = objects.price + "€";
cardEvent.appendChild(eventPrice)

const eventAddress = document.createElement("#eventAddress");
eventAddress.textContent = objects.streetaddress;

const eventContact = document.createElement("#eventContact");
eventContact.textContent = ojects
};
/*
const eventDistance = document.querySelector("maps");
eventDistance = field.objects.//?;
cardEvent.appendChild(eventDistance);

const eventImage = querySelector("img");
eventImage.src = field.objects.locator;
eventImage.alt = field.objects.credits;
cardEvent.appendChild(eventImage);*/


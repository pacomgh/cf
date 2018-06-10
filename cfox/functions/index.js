// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

/*const stripe = require("stripe")(
    "sk_test_CioYk2VTzrSd9R1FjnkFOgIK"
);*/
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const {
    actionssdk
} = require('actions-on-google');
const {
    WebhookClient
} = require('dialogflow-fulfillment');
const {
    Card,
    Suggestion
} = require('dialogflow-fulfillment');

admin.initializeApp(functions.config().firebase);

var db = admin.database();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({
        request,
        response
    });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    // Uncomment and edit to make your own intent handler
    // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    function viajeGuia(agent) {
        agent.add(`La mejor ruta encontrada es la siguiente`);
        agent.add(`Para hospedarte`);
        agent.add(new Card({
            title: `Hotel Real de minas`,
            imageUrl: 'https://g.otcdn.com/imglib/hotelfotos/8/173/hotel-real-de-minas-express-leon-025.jpg',
            text: `Habitacion convencional 750 pesos x dia`,
            buttonText: 'Visitar la pagina',
            buttonUrl: 'https://www.booking.com/hotel/mx/real-de-minas-express.es.html?aid=311839&label=real-de-minas-express-zIodu%2A4GBiqIPkStejxA8gS266381360107%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap1t1%3Aneg%3Afi%3Atiaud-261710242782%3Akwd-6112111489%3Alp1031330%3Ali%3Adec%3Adm&sid=9274b44241fd776b5c8760ab401fa14f&ucfs=1&srpvid=d71a7340b43a0039&srepoch=1528561408&room1=A,A&hpos=1&hapos=1&dest_type=city&dest_id=-1679595&srfid=b18e98a6e7a398d6312b9e88318798618f2a3cf6X1&from=searchresults;highlight_room=#hotelTmpl'
        }));
    }

    function metricasFirebase(agent) {
        var ref = db.ref("conversaciones");
        console.log(request.body.originalDetectIntentRequest.payload.data.message.attachments[0].payload.url);

        var key = ref.push();
        return key.set({
            dato: 'holi' 
        }).then(() => {

            agent.add("¿Cuanto tiempo planeas quedarte?");
            agent.setContext({ name: 'fecha', lifespan: 3, parameters: { city: 'Rome' }});
            return Promise.resolve(agent);
        }).catch(e => {
            agent.add("error");
            return Promise.reject(agent);
        });


    }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    
    function googleAssistantHandler(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        conv.ask("holi");
        
        if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
            conv.ask('Sorry, try this on a screen device or select the ' +
                'phone surface in the simulator.');
            return;
        }
        conv.ask(new Carousel({
            items: {
                // Add the first item to the carousel
    "A": {
                    synonyms: [
        'Hotel',
        'Hospedaje',
        'Habitacion',
      ],
                    title: 'Hotel Real de Minas',
                    description: 'Habitacion convencional $750 x dia',
                    image: new Image({
                        url: 'https://g.otcdn.com/imglib/hotelfotos/8/173/hotel-real-de-minas-express-leon-025.jpg',
                        alt: 'Image alternate text'
                    }),
                },
                // Add the second item to the carousel
    "B": {
                    synonyms: [
        'Google Home Assistant',
        'Assistant on the Google Home',
    ],
                    title: 'Google Home',
                    description: 'Google Home is a voice-activated speaker powered by ' +
                        'the Google Assistant.',
                    image: new Image({
                        url: '',
                        alt: 'Google Home',
                    }),
                },
                // Add third item to the carousel
    C: {
                    synonyms: [
        'Google Pixel XL',
        'Pixel',
        'Pixel XL',
      ],
                    title: 'Google Pixel',
                    description: 'Pixel. Phone by Google.',
                    image: new Image({
                        url: '',
                        alt: 'Google Pixel',
                    }),
                },
            },
        }));  // Use Actions on Google library
    agent.add(conv); // Add Actions on Google library responses to your agent's response
}
// // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
// // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

// Run the proper function handler based on the matched Dialogflow intent name
let intentMap = new Map();

intentMap.set('intent-tiempo', viajeGuia);
intentMap.set('intent-presupuesto', metricasFirebase);
// intentMap.set('your intent name here', googleAssistantHandler);
agent.handleRequest(intentMap);
});

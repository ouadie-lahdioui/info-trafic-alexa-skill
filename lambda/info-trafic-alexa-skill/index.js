const Alexa = require('alexa-sdk');
const unirest = require('unirest');

let welcomeOutput = `
Bienvenue dans l'application InfoTrafic. 
Voulez-vous connaître les perturbations en cours et à venir en temps réel ?
Il suffit de me demander l'état du trafic !`;
let reprompt = "Voulez-vous l'état du trafic de quelles lignes ?";
let helpOutput = `
Pour connaître des informations sur le trafic de l'R.E.R A et B, toutes les lignes du métro, ainsi que toutes les lignes du tramway ?
Demandez-moi par exemple : "C'est quoi l'état du trafic du Métro 1 ?".
`;
let cancelOutput = `ça roule, je reste, néanmoins à votre écoute`;
let unhandledOutput = `Je ne suis pas sûr d'avoir compris votre demande !
Mais j'aprends vite ! 
En attendant, Pouvez-vous me reposer la question autrement ?`;

const handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', welcomeOutput, reprompt);
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', helpOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', cancelOutput);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', cancelOutput);
    },
    'getTraficInfo': function () {
        console.log(JSON.stringify(this.event.request.intent.slots));

        let metroLine = clean(this.event.request.intent.slots.metroLine.value);
        let rerLine = clean(this.event.request.intent.slots.rerLine.value);
        let tramLine = clean(this.event.request.intent.slots.tramLine.value);

        unirest
            .get('https://www.ratp.fr/meteo/ajax/data')
            .end( (response) => {
                let body = response.body
                let transportInfo = {
                    message : unhandledOutput,
                    unavailable : body.unavailable
                };

                console.log(body);
                
                if (metroLine) {
                    transportInfo = body.status.metro.lines[metroLine.toLowerCase()];
                } else if (rerLine) {
                    transportInfo = body.status.rer.lines[rerLine.toUpperCase()];
                } else if (tramLine) {
                    transportInfo = body.status.tram.lines[tramLine.toUpperCase()];
                }

                let speechOutput = getSpeechOutFromTransportInfo(transportInfo);
                this.emit(":tell", speechOutput);

            });
    },
    'Unhandled': function () {
        this.emit(':ask', unhandledOutput, helpOutput);
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function clean(value) {
    let cleanedValue = '';
    if (value) {
        cleanedValue = value.toLowerCase();
        cleanedValue = cleanedValue.replace(/\s/g, '');
    }
    return cleanedValue;
}

function getSpeechOutFromTransportInfo(transportInfo) {
    return transportInfo.message;
}
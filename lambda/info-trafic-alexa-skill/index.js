const Alexa = require('alexa-sdk');
const unirest = require('unirest');
let speechOutput = '';
let reprompt;
let welcomeOutput = "Welcome to info trafic : metro, R. , tram";
let welcomeReprompt = "sample re-prompt text";

const handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', welcomeOutput, welcomeReprompt);
    },
    'AMAZON.HelpIntent': function () {
        speechOutput = 'Placeholder response for AMAZON.HelpIntent.';
        reprompt = '';
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = 'Placeholder response for AMAZON.CancelIntent';
        this.emit(':tell', speechOutput);
    },
    'AMAZON.StopIntent': function () {
        speechOutput = 'Placeholder response for AMAZON.StopIntent.';
        this.emit(':tell', speechOutput);
    },
    'SessionEndedRequest': function () {
        speechOutput = 'Session ended with reason: ' + this.event.request.reason;
        //this.emit(':saveState', true);//uncomment to save attributes to db on session end
        this.emit(':tell', speechOutput);
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
                let transportInfo = {};

                console.log(body);
                
                if (body.unavailable) {
                    
                }
                
                if (metroLine) {
                    transportInfo = body.status.metro.lines[metroLine];
                    
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
        speechOutput = "The skill didn't quite understand what you wanted.  Do you want to try something else?";
        this.emit(':ask', speechOutput, speechOutput);
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
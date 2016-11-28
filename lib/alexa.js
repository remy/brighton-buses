const alexa = require('alexa-app');
const app = new alexa.app('nextbus');

app.intent('NextBusIntent', {
  'utterances': [
    'whens the next bus',
    'next bus',
    'when is my next bus',
    'when is then next bus',
  ]
}, (req, res) => {
  res.say('The next bus will come when you leave');
});

app.launch((req, res) => {
  res.say('whack');
});

module.exports = app;

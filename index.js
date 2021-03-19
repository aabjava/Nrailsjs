const Nrailsjs = require('./src/Nrailsjs.js');
const Controller = require("./src/controllers/Controller");
const Service = require("./src/services/Service");

module.exports=Nrailsjs;
module.exports.Controller =Controller;
module.exports.Service =Service;

//https://bugfender.com/blog/how-to-create-an-npm-package/
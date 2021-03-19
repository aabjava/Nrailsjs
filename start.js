const Nrailsjs = require("./src/Nrailsjs");

const myConfig = {
    "controllers":{
        "dir":"/src/test/app/controllers"
    },
    "services":{
        "dir":"/src/test/app/services"
    },
    "server":{
        "port":4000
    }

};
console.clear()

const nrailsjs = new Nrailsjs(myConfig);
nrailsjs.startServer();



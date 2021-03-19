require("ulog");
const express = require('express');
//MIDLLEWARE
const cookieParser  = require('cookie-parser');
const bodyParser = require('body-parser');
const {ContainerBuilder} = require('node-dependency-injection');

const anylogger = require('anylogger');
var path = require('path');


const defaultConfig = require("./conf/default/default.app.config");
const appConfig = require("./conf/app.config");
const fs = require("fs");
const {mergeConfigFiles,environments} = require("./utils/configEngine");


//Ok we need the path of the file that called this one not this one
//this is the solution appDir is the real dir
var path = require('path');
var appDir = path.dirname(require.main.filename);

class Nrailsjs {

    constructor(config,urlMappings){
        //no _ for private variables because it break autocomplete as its useless in js
        this.logger = anylogger("main");
        this.loghttp = anylogger("http");
        this.logger.debug("Available default loggers for app = main, config, controllers, services  and for each controller and service you have a logger for each with the class name");
       this.config = mergeConfigFiles([defaultConfig,appConfig,config]);
       this.express = express();
       this.server = null;
       this.controllers = new Map();

       this.services = new Map();
       this.container = new ContainerBuilder();

       const baseDir = this.config['fixedBasePath']||appDir;
        this.logger.debug("Current working dir = "+baseDir);
       const serviceDir = path.join(baseDir,this.config['services.dir']);



       const controllersDir = path.join(baseDir,this.config['controllers.dir']);
       this.initDependencyInjection(serviceDir,this.express,this.container);
       this.initMappings(baseDir,controllersDir);



        this.configMiddleware();

    }

    configMiddleware(){
        this.logger("Configuring default middleware");
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: true }));
        this.express.use(cookieParser());
    }

    startServer(){
        const log = this.logger;
        const port = this.config['server.port'];
       this.server = this.express.listen(port, () => {
            log.info("Listening on port =",port);
            log.info("Environment =",global.isProduction?'production':'development')

        });
    }

    async initDependencyInjection(serviceDir,app,container){
        this.logger("Configuring dependency injection..");
        //register container it must be here if not the main thread continues and calls router before this,
        const context = this;
        app.use(function (req,res,next) {
            context.logger("Container injector added to request (res) as res.container");
            req.container = container;
            context.logger("Logger http with name [http] added to request (res) as res.log");
            req.log=context.loghttp;
            next();
        });
        try{
            const files = fs.readdirSync(serviceDir);
            this.logger("Loading services in dir ",serviceDir);
            const serviceListInit = await loadServices(container,serviceDir,files,this.logger);

            for (let i = 0; i < serviceListInit.length ; i++) {
                const serviceInstance = serviceListInit[i];
                try{
                    //need to call to instanciate the services

                    const instance = container.get(serviceInstance);
                    if( typeof instance['init'] === 'function' ){
                        instance.init(container);
                    }
                    this.services.set(serviceInstance,instance);

                }catch (e) {
                   this.logger.error("Instanciating service from container failed ",e);
                }
            }

        }catch (e) {
            this.logger.error("Reading directory for services ",e);
        }
    }

    async initMappings(controllerDir,mappingFile){
        //init controllers
        this.logger("Init controllers url mappings ");
        try{
            const files = fs.readdirSync(controllerDir);
            this.logger("Loading controllers in dir ",controllerDir);
            this.controllers = await loadControllers(this.express,controllerDir,files,this.logger);


        }catch (e) {
            this.logger.error("Controller loading failed ",e);
        }
        this.logger("Controller mapping done");
    }




}

async function loadServices(container,directory,files) {
    let serviceListInit = [];


    for (let i = 0; i < files.length ; i++) {
        const file = files[i]
        console.log(file);

        if(file.endsWith('Service.js')){
            const path =directory+"/"+file;

            try{
                const Service = await require(path);
                //   console.debug("Ser ",Service)
                if(Service.default !=null){
                    //check it has a register function

                    const serviceName = file.replace(".js","");

                    const serviceInstance = Service.default;
                    container.register(serviceName,serviceInstance);
                    serviceListInit.push(serviceName);
                }else{
                    console.warn("File "+file+" does not have default service defined..")
                }


            }catch (e) {
                console.error("Error instatioation service = ",e)
            }



        }
    }

    return serviceListInit;
}

async function loadControllers(app,directory,files,log) {
    let controllerMap = new Map();



    for (let i = 0; i < files.length ; i++) {
        const file = files[i]


        if(file.endsWith('Controller.js') && file !== 'Controller.js'){
            const path =directory+"/"+file;

            try{
                log("Loading controller = "+file);
                const Service = await require(path);
               //does this work with export default ??
                if(Service !=null){
                    //check it has a register function

                    const serviceName = file.replace(".js","");

                    const serviceInstance = new Service();
                    serviceInstance.registerRoutes(app);

                    controllerMap.set(serviceName,serviceInstance);
                    log("Controller loaded OK = "+file);
                }else{
                    log.warn("Controller "+file+" does not have a default module defined, defined your controllers as default export");
                }


            }catch (e) {
                log.error("Loading "+file+" failed ",e);
            }



        }
    }

    return controllerMap;
}

module.exports = Nrailsjs;
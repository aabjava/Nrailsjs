import express from 'express';
//MIDLLEWARE
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import {ContainerBuilder} from 'node-dependency-injection';
import flat from "flat";

import config from "./conf/defaultConf";

import fs from "fs";
import path from "path";



class Nrailsjs {

    constructor(configFile){
        //no _ for private variables because it break autocomplete as its useless in js
       this.config = this.mergeConfig(configFile);
       this.app = express();
       this.controllers = new Map();
       this.services = new Map();
       this.container = new ContainerBuilder();

       const serviceDir = this.config['services.dir'];
        const controllersDir = this.config['controllers.dir'];
        this.initDependencyInjection(serviceDir,this.app,this.container);
        this.initMappings(controllersDir);

        this.configExpress();

    }

    configExpress(){
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());
    }

    async initDependencyInjection(serviceDir,app,container){

        //register container it must be here if not the main thread continues and calls router before this,

        app.use(function (req,res,next) {
            req.container = container;
            next();
        })
        try{
            const files = fs.readdirSync(serviceDir);
            const serviceListInit = await loadServices(container,serviceDir,files);
            console.debug("Init Services for own depencies..")
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
                    console.error("Error init services ")
                }
            }

        }catch (e) {
            console.error("Error msg  =",e)
        }
    }

    async initMappings(controllerDir,mappingFile){
        //init controllers
        try{
            const files = fs.readdirSync(controllerDir);
            this.controllers = await loadControllers(this.app,controllerDir,files);


        }catch (e) {
            console.error("Error Controller loading msg  =",e)
        }

        try{
            if(mappingFile){
                const file = fs.readfileSync(controllerDir);
            }




        }catch (e) {
            console.error("Error Controller loading msg  =",e)
        }

        //init mapping from file
    }

    mergeConfig(configFile){
        const flatten = flat(config);
        return flatten;
    }


}

async function loadServices(container,directory,files) {
    let serviceListInit = [];
    console.debug("Finding and instanciating Services..")

    for (let i = 0; i < files.length ; i++) {
        const file = files[i]
        console.log(file);

        if(file.endsWith('Service.js')){
            const path =directory+"/"+file;
            console.debug("Import file = ",path)
            try{
                const Service = await import(path);
                //   console.debug("Ser ",Service)
                if(Service.default !=null){
                    //check it has a register function

                    const serviceName = file.replace(".js","");
                    console.debug("Name = ",serviceName)
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

async function loadControllers(app,directory,files) {
    let controllerMap = new Map();

    console.debug("Finding and instanciating Controllers..")

    for (let i = 0; i < files.length ; i++) {
        const file = files[i]
        console.log(file);

        if(file.endsWith('Controller.js')){
            const path =directory+"/"+file;
            console.debug("Import file = ",path)
            try{
                const Service = await import(path);
                //   console.debug("Ser ",Service)
                if(Service.default !=null){
                    //check it has a register function

                    const serviceName = file.replace(".js","");
                    console.debug("Name = ",serviceName)
                    const serviceInstance = new Service.default();
                    serviceInstance.registerRoutes(app);

                    controllerMap.set(serviceName,serviceInstance);
                }else{
                    console.warn("File "+file+" does not have default service defined..")
                }


            }catch (e) {
                console.error("Error instatioation service = ",e)
            }



        }
    }

    return controllerMap;
}

export default Nrailsjs;
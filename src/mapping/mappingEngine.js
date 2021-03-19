export const mappingEngine = (app,mapping,controllerList) =>{

    if(!mapping){
        return;
    }

    for(let urlMap of mapping){
        const {url,controller,action,file,view} = urlMap;
        if(controller != null){
            mapToController(app,url,controller,action,controllerList)


        }else if(view != null){
            //render directly to view
        }
    }

};

function mapToController(app,url,controller,action,controllerList) {
    //find it
    let controllerInstance = null;
    for(const controllerInst of controllerList){
        if(controllerInst.constructor.name === (controller+"Controller")){
            controllerInstance = controllerInst;
        }
    }
    if(!controllerInstance){
        console.warn("No controller with name "+controller+" found!")
        return

    }

    let actionName = action;
    if(!action){
        //call default
        actionName = "index";

    }

    console.debug(controllerInstance._methodByName);

    const method = controllerInstance._methodByName.get(actionName);
    if(!method){
        console.warn("Controller with name "+controller+" does not have "+actionName+"defined, defined action name that exists!");
        return
    }
    console.debug("Put url mapping = "+url+" maps to "+controllerInstance.constructor.name+" action = ",actionName)

    /**
     * Real problem to get this to work, it only removes ONE entry because only one should exist.This removes ALL previous entries of the url like ALL GET POST PUT etc..
     * works with express 4.x
     * @type {string}
     */
    const routes = app._router.stack;
    let indexToRemove = -1;
    for (let i = 0; i < routes.length ; i++) {
        const route = routes[i];

        console.debug(route.route?.path)
        if(route.route?.path === url ){
            //remove
            console.debug("Should remove = ",route)
            indexToRemove = i;
        }
    }

    app._router.stack.splice(indexToRemove,1);

    //remove old mapping
    //    removeRoute(app, url,'get');
    //    removeRoute(app,url,'post');

    console.debug("Remove paths = ", app._router.stack)


    app.route(url).get(method).post(method)

}

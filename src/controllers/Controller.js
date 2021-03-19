class Controller{



    constructor(){
        this._methodByName = new Map();
        this._methodByUrl = new Map();
        this._mappingUrlToActionName = new Map()
    }
    static ignoreMethodsForUrl = ['registerRoutes','init'];

    static getAllMethods = (obj) => {
        let props = []

        do {
            const l = Object.getOwnPropertyNames(obj)
                .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
                .sort()
                .filter((p, i, arr) =>
                    typeof obj[p] === 'function' &&  //only the methods
                    p !== 'constructor' &&           //not the constructor
                    (i == 0 || p !== arr[i - 1]) &&  //not overriding in this prototype
                    props.indexOf(p) === -1          //not overridden in a child
                )
            props = props.concat(l)
        }
        while (
            (obj = Object.getPrototypeOf(obj)) &&   //walk-up the prototype chain
            Object.getPrototypeOf(obj)              //not the the Object prototype methods (hasOwnProperty, etc...)
            )

        return props
    }

    registerRoutes(app){
        const baseRouteUrl = this.baseUrl || "/"+this.constructor.name.toLowerCase().replace("controller","");
        console.debug("Base route  =",baseRouteUrl)

        const listMethods = Controller.getAllMethods(this);
        //create routes
        let routes = [];
        let routeMap = new Map();
        for (let methodName of listMethods){
            //console.debug("M ",method)
            if(Controller.ignoreMethodsForUrl.indexOf(methodName) !== -1){
                continue
            }


            if(methodName === 'index'){
                //add not only the name but the base
                //like / is index and also index.html
                const url = baseRouteUrl;
                const urlIndex = baseRouteUrl+"/index.html";
                routeMap.set(url,methodName);
                routeMap.set(urlIndex,methodName)

            }else{
                //just the name
                const url = baseRouteUrl!=="/"?baseRouteUrl+"/"+methodName:methodName;
                routeMap.set(url,methodName)
            }
        }

        console.debug("Ulrs  = ",routeMap);

        for(let [url,methodName] of routeMap){



            const method = this[methodName];
            const methodWrapped = this.methodWrapper(method);
            this._methodByUrl.set(url,methodWrapped);
            this._methodByName.set(methodName,methodWrapped);

            //put get
            app.route(url).get(methodWrapped).post(methodWrapped);


        }
        this._mappingUrlToActionName = routeMap;
        console.debug("Mapping url to action name = ",this._mappingUrlToActionName)


    }


    /**
     *
     * @param req
     * @param res
     * @param param id header
     * @returns {Promise<void>}
     */

    methodWrapper =method => (req, res, next = console.error) =>{
        return Promise.resolve(method(req, res)).catch(next)
        /* try{
             return func(req,res);
         }catch (e) {

         }*/

        // res.send("HEllo stranger "+req.params.id)
    }


}

export default Controller;
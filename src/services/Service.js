const anylogger = require('anylogger');

class Service{




    constructor(){

        this.log = anylogger(this.constructor.name);
    }
    static ignoreMethodsForUrl = ['registerRoutes','init','log'];



}

const methodWrapper =method => (req, res, next = console.error) =>{
    return Promise.resolve(method(req, res)).catch(next)
    /* try{
         return func(req,res);
     }catch (e) {

     }*/

    // res.send("HEllo stranger "+req.params.id)
}

module.exports = Service;
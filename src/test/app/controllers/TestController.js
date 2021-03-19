const Controller = require('../../../controllers/Controller');

class TestController extends Controller{

    constructor(props) {
        super(props);

    }

    async index(req,res){
        res.send("Hello index");
    }

    async somepath(req,res){
        res.send("Hello stranger")
    }

    async other(req,res){
        res.send("Hello other")
    }

}

module.exports=TestController;
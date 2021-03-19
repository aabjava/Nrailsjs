const Nrailsjs = require("../../Nrailsjs");
const request = require("supertest");
const ulog = require('ulog');
ulog.level = 'warn';



const testConfig1 = {
    "server.port":3000,
    //used for testing as the base path changes during the runing of the tests
     "fixedBasePath":"C:\\Users\\Monster\\Documents\\IntellijProjects\\AbelSites\\Nrails\\",
    "controllers":{
        "dir":"/src/test/app/controllers"
    }
};

const ulrMappings = [
    {url:"/test/somepath",controller:"TestController",action:"other"}
]

describe("url paths on server",()=>{
    const server = new Nrailsjs(testConfig1);

    test('should get the test path /test',async ()=>{
        const response = await request(server.express).get("/test");
        expect(response.statusCode).toBe(200);

    });
    test('should get the test path /test/somepath',async ()=>{
        const response = await request(server.express).get("/test/somepath");
        expect(response.statusCode).toBe(200);

    });
    test('should not test path /test/12',async ()=>{
        const response = await request(server.express).get("/test/12");
        expect(response.statusCode).toBe(404);

    });
    //remove path


})






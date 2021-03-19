const {mergeConfigFiles} =  require("../../utils/configEngine.js");
const ulog = require('ulog');
ulog.level = 'debug';

const testFile1 = {
    "server":{
        "port":2000
    }
};

const testFile2= {
    "server":{
        "port":3000,
        "serverUrl":"http://"
    }
};

const testFile3 = {
    "development":{
        "server":{
            "port":1000
        }
    },

}

const testFile4 = {
    "development":{
        "server":{
            "port":1000
        }
    },
    "production":{
        "server":{
            "port":2000
        }
    }
}

test('merge and flatten undefined',()=>{
    expect(mergeConfigFiles([undefined])).toStrictEqual({})
});

test('merge and flatten undefined and a file',()=>{
    expect(mergeConfigFiles([undefined,testFile1])).toStrictEqual({"server.port":2000})
});
test('merge and flatten single file',()=>{
    expect(mergeConfigFiles([testFile1])).toStrictEqual({"server.port":2000})
});

test('merge and flatten 2 files',()=>{
    expect(mergeConfigFiles([testFile1,testFile2])).toStrictEqual({"server.port":3000,"server.serverUrl":"http://"})
});

test('merge and flatten 2 files with development option',()=>{
    expect(mergeConfigFiles([testFile1,testFile3])).toStrictEqual({"server.port":1000})
});

test('merge and flatten 2 files with development option and production for development enviroment',()=>{
    expect(mergeConfigFiles([testFile1,testFile4])).toStrictEqual({"server.port":1000})
});

test('merge and flatten 2 files with development option and production for development production',()=>{
    expect(mergeConfigFiles([testFile1,testFile4],'production')).toStrictEqual({"server.port":2000})
});

test('merge and flatten 1 files with development option and production for development test',()=>{
    expect(mergeConfigFiles([testFile4],'test')).toStrictEqual({})
});

test('merge and flatten 1 files with development option and production for development test',()=>{
    expect(mergeConfigFiles([testFile1,testFile4],'test')).toStrictEqual({"server.port":2000})
});

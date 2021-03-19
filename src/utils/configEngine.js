const flat  = require("flat");


const environments = {
    development:"development",
    production:"production",
    test:"test"
};
/**
 *
 * @param filesArray
 * @param env development | test | production these words are reserved in the tags to be used only in setting for enviroments
 * @returns {null|*}
 */
function mergeConfigFiles(filesArray,env = 'development') {
    try{


        let array = [];
        for(const file of filesArray){
            array.push(flat(file))
        }
       // console.debug("Enviroment = "+enviroment)
        let mergedConfig =array.reduce((f,l)=>merge(f,l));
        //ok remove all enviroments that are not the current
        //
        let toBeRemovedPropertiesWithEnviroment = Object.values(environments);
        const index = toBeRemovedPropertiesWithEnviroment.indexOf(env);
        if(index !== -1){
            toBeRemovedPropertiesWithEnviroment.splice(index,1);
        }
        for(const property in mergedConfig){
            for(const env of toBeRemovedPropertiesWithEnviroment){
                if(property.includes(env+".")){
                    delete mergedConfig[property];
                }
            }
            //ok check for .enviroment and change the property
            if(property.includes(env+".")){
                const changedProperty = property.replace(env+".","");
                const value = mergedConfig[property];
                delete mergedConfig[property];
                mergedConfig[changedProperty]=value;

            }
        }
       // console.debug("Merged config ",mergedConfig)
        return mergedConfig;
    }catch (e) {
        console.debug("Error ",e)
        return null;
    }

}

module.exports = {mergeConfigFiles,environments};




function merge(current, update) {

    Object.keys(update).forEach(function(key) {
        // if update[key] exist, and it's not a string or array,
        // we go in one level deeper
        if (current.hasOwnProperty(key)
            && typeof current[key] === 'object'
            && !(current[key] instanceof Array)) {
            merge(current[key], update[key]);
            // if update[key] doesn't exist in current, or it's a string
            // or array, then assign/overwrite current[key] to update[key]
        } else {
            current[key] = update[key];
        }
    });
    return current;
}
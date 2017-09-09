
export const allWithAsync = (listOfPromises, cb) => {
    return new Promise(async (resolve, reject) => {
        let results = []
        for (let promise of listOfPromises.map(Promise.resolve, Promise)) {
            results.push(await promise.then(async resolvedData => await resolvedData, reject))
            if (results.length === listOfPromises.length) resolve(cb(results))
        }
    })
};
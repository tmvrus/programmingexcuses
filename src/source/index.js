const http = require('http');
const httpStatusCodes = require('http-status-codes');

const defaultOptions = {
    timeout: 3000,
    headers: {
        'Accept': 'text/html',
        'Accept-Language': 'en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36',
    },
};



module.exports = {
    getExcuse(config) {
        console.log(111, config);
        return new Promise((resolve, reject) => {
            console.log(11);
            let req = http.get(config.url, defaultOptions, (res) => {
                console.log(22);
                if (res.statusCode !== httpStatusCodes.OK) {
                    console.log(1);
                    res.resume();
                    reject(new Error(`Got unexpected status code ${res.statusCode}, with message '${res.statusMessage}', for ${config.url}`));
                    return
                }

                let responseChunks = [];
                res.on('data', (chunk) => {
                    console.log('data');
                    if (chunk) {
                        responseChunks.push(chunk);
                    }
                });

                res.on('end', () => {
                    if (!res.complete) {
                        console.log('end');
                        reject(new Error(`Connection terminated while read, for ${config.url}`));
                        return;
                    }

                    if (responseChunks.length === 0) {
                        console.log(3);
                        reject(new Error(`Empty response result for ${config.url}`));
                        return;
                    }

                    // Can use jsdom.querySelector here, but package is redundant for this small operations
                    let part = responseChunks.join('');
                    part = part.slice(part.indexOf('<a href'), part.indexOf('</a>'));
                    part = part.slice(part.indexOf('>') + 1);

                    if (part.length <= 10) {
                        console.log(4);
                        reject(new Error(`Invalid parsing result '${part}' for ${config.url}, response ${responseChunks}`))
                        return;
                    }

                    resolve(part);

                });
            });

            req.on('error', (err) => {
                reject(new Error(`Got http.get error ${err.message} for ${config.url}`));
            })
        });
    }
};
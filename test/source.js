const assert = require('assert');
const http = require('http');
const httpCodes = require('http-status-codes');
const excuseFinder = require('./../src/source');

const listenConfig = '127.0.0.1:8088';

let testCases = [{
    response: 'div class="wrapper"><center style="color: #333; padding-top: 200px; font-family: Courier; font-size: 24px; font-weight: bold;"><a href="/" rel="nofollow" style="text-decoration: none; color: #333;">I did a quick fix last time but it broke when we rebooted</a></center><div class="push"></div>',
    text: 'I did a quick fix last time but it broke when we rebooted',
    code: httpCodes.OK,
}, {
    response: '',
    text: '',
    code: httpCodes.OK,
}, {
    response: '',
    text: '',
    code: httpCodes.NOT_FOUND,
}];

let httpServer;

describe('Run test cases', () => {
    before(() => {
        httpServer = http.createServer((res, req) => {
            let data = testCases.shift();
            if (data === undefined) {
                res.statusCode = httpCodes.TOO_MANY_REQUESTS;
                res.end('to many requests in test');
                return
            }

            res.write(data.response);
            res.end();
        });

        httpServer.listen(listenConfig, (err) => {
            console.log(err);
        });
    });

    after((done) => {
        httpServer.close(done);
    });

    describe('First test case', async () => {
        try {
            let text = await excuseFinder.getExcuse({url : 'http://127.0.0.1:8088/'});
            it('Should get excuse from first test case', (done) => {
                assert.equal(text, 'I did a quick fix last time but it broke when we rebooted');
                done();
            });
        } catch (err) {
            console.log('got error!');
            console.log(err);
        }
    });

});

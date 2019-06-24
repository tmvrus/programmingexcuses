const assert = require('assert');
const http = require('http');
const httpCodes = require('http-status-codes');
const excuseFinder = require('../src/excuse');



let testCases = [{
    response: 'div class="wrapper"><center style="color: #333; padding-top: 200px; font-family: Courier; font-size: 24px; font-weight: bold;"><a href="/" rel="nofollow" style="text-decoration: none; color: #333;">I did a quick fix last time but it broke when we rebooted</a></center><div class="push"></div>',
    text: 'I did a quick fix last time but it broke when we rebooted',
    code: httpCodes.OK,
}, {
    response: '@3as!#',
    text: '',
    code: httpCodes.OK,
}, {
    response: 'Server error',
    text: '',
    code: httpCodes.INTERNAL_SERVER_ERROR,
}];

const listenConfig = 8088;

let httpServer;

before((done) => {
    httpServer = http.createServer((req, res) => {
        let data = testCases.shift();
        if (data === undefined) {
            res.statusCode = httpCodes.TOO_MANY_REQUESTS;
            res.end('to many requests in test');
            return
        }

        res.end(data.response);
    });

    httpServer.listen(listenConfig, (err) => {
        if (err) {
            console.log(err);
        }
        done();
    });
});

after((done) => {
    done();
    httpServer.close();
});

describe('Run test cases', () => {
    it('Happy path', async () => {
        try {
            let text = await excuseFinder.getExcuse({url : 'http://127.0.0.1:8088/test'});
            assert.equal(text, 'I did a quick fix last time but it broke when we rebooted');
        } catch (err) {
            assert.ifError(err);
        }
    });

    it('Strange response should lead to parsing error', () => {
        excuseFinder.getExcuse({url : 'http://127.0.0.1:8088/test'})
            .then(() => {
                assert.fail('Expected reject here');
            })
            .catch((err) => {
                assert.equal((err instanceof Error) && err.message.includes('Invalid parsing result'), true, 'Expected invalid parsing');
            });
    });

    it('Unexpected server response code', () => {
        excuseFinder.getExcuse({url : 'http://127.0.0.1:8088/test'})
            .then(() => {
                assert.fail('Expected reject here');
            })
            .catch((err) => {
                assert.equal((err instanceof Error) && err.message.includes('Got unexpected status code'), true, 'Expected invalid response code');
            });
    });
});

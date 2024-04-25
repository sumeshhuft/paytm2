const https = require('https');
const PaytmChecksum = require('./PaytmChecksum');

var paytmParams = {};

/* body parameters */
paytmParams.body = {
    "mid" : "test5P07128923987041",
    "orderId" : "order22234347387",
};
PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "nXuJnxiYoHRe&&2J").then(function(checksum){
    /* head parameters */
    paytmParams.head = {

        /* put generated checksum value here */
        "signature"	: checksum
    };

    /* prepare JSON string for request */
    var post_data = JSON.stringify(paytmParams);

    var options = {

        /* for Staging */
        // hostname: 'securegw-stage.paytm.in',

        // /* for Production */
         hostname: 'securegw.paytm.in',

        port: 443,
        path: '/v3/order/status',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };
var response = "";
var post_req = https.request(options, function(post_res) {
    post_res.on('data', function (chunk) {
        response += chunk;
    });

    post_res.on('end', function(){
        console.log('Response: ', response);
    });
});

// Handle request errors
post_req.on('error', function(err) {
    console.error('Request error:', err);
});

// post the data
post_req.write(post_data);
post_req.end();
});


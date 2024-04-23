// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const https = require('https');
// const PaytmChecksum = require('./PaytmChecksum');
// const fs = require('fs');
// app.use(bodyParser.urlencoded({ extended: true }));
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });
// app.post('/create-qr-code', (req, res) => {
//   const { orderId, amount } = req.body;
//   createQRCode(orderId, amount);
//   res.send('QR code created successfully');
// });
// function createQRCode(orderId, amount) {
//   const paytmParams = {
//     mid: "test5P07128923987041",
//     orderId: orderId,
//     amount: amount,
//     businessType: "UPI_QR_CODE",
//     posId: "S12_123"
//   };
//   PaytmChecksum.generateSignature(JSON.stringify(paytmParams), "nXuJnxiYoHRe&&2J").then(function(checksum) {
//     const paytmRequest = {
//       body: paytmParams,
//       head: {
//         clientId: "C11",
//         version: "v1",
//         signature: checksum
//       }
//     };
//     const post_data = JSON.stringify(paytmRequest);
//     const options = {
//       hostname: 'securegw.paytm.in',
//       port: 443,
//       path: '/paymentservices/qr/create',
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Content-Length': post_data.length
//       }
//     };
//       const post_req = https.request(options, function(post_res) {
//       let response = "";
//       post_res.on('data', function(chunk) {
//         response += chunk;
//       });

//       post_res.on('end', function() {
//         console.log('Response: ', response);
//         try {
//           let jsonResponse = JSON.parse(response);
//           extractAndUseQRCodeDetails(jsonResponse, orderId, amount);
//         } catch (error) {
//           console.error('Error parsing response:', error);
//         }
//       });
//     });
//     post_req.on('error', function(err) {
//       console.error('Error in request:', err);
//     });
//     post_req.write(post_data);
//     post_req.end();
//   }).catch(function(error) {
//     console.error('Error generating checksum:', error);
//   });
// }

// function extractAndUseQRCodeDetails(response, orderId, amount) {
//   const qrCodeId = response.body.qrCodeId;
//   const qrData = response.body.qrData;
//   const image = response.body.image; 
//   const port = "COM5";
//   console.log({ qrCodeId, qrData, image, port, orderId, amount });

//   const url = `PaytmPayments:?requestId=123;method=displayTxnQr;mid=test5P07128923987041;portName=${port};baudRate=115200;parity=0;dataBits=8;stopBits=1;order_id=${orderId};order_amount=${amount};qrcode_id=${qrData};currencySign=null;debugMode=1;posid=POS-1`;
//   console.log(url);

// //   import('open').then(open => {
// //     const deepLinkURL = url;
// //     open.default(deepLinkURL)
// //       .then(() => {
// //         console.log('Successfully opened the deep link URL in the default web browser.');
// //       })
// //       .catch(err => {
// //         console.error('Failed to open the deep link URL:', err);
// //       });
// //   }).catch(err => {
// //     console.error('Failed to import:', err);
// //   });
// // }


// const PORT =  3001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const https = require('https');
const PaytmChecksum = require('./PaytmChecksum');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/create-qr-code', (req, res) => {
  const { orderId, amount } = req.body;
  createQRCode(orderId, amount, (deepLink) => {
    res.redirect(deepLink); // Redirect client to the deep link
  });
});

function createQRCode(orderId, amount, callback) {
  const paytmParams = {
    mid: "test5P07128923987041",
    orderId: orderId,
    amount: amount,
    businessType: "UPI_QR_CODE",
    posId: "S12_123"
  };

  PaytmChecksum.generateSignature(JSON.stringify(paytmParams), "nXuJnxiYoHRe&&2J")
    .then(function(checksum) {
      const paytmRequest = {
        body: paytmParams,
        head: {
          clientId: "C11",
          version: "v1",
          signature: checksum
        }
      };

      const post_data = JSON.stringify(paytmRequest);
      const options = {
        hostname: 'securegw.paytm.in',
        port: 443,
        path: '/paymentservices/qr/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': post_data.length
        }
      };

      const post_req = https.request(options, function(post_res) {
        let response = "";
        post_res.on('data', function(chunk) {
          response += chunk;
        });

        post_res.on('end', function() {
          console.log('Response: ', response);
          try {
            let jsonResponse = JSON.parse(response);
            const qrData = jsonResponse.body.qrData;
            const port = "COM5";
            const deepLink = `PaytmPayments:?requestId=123;method=displayTxnQr;mid=test5P07128923987041;portName=${port};baudRate=115200;parity=0;dataBits=8;stopBits=1;order_id=${orderId};order_amount=${amount};qrcode_id=${qrData};currencySign=null;debugMode=1;posid=POS-1`;
            console.log("Deep Link:", deepLink);
            callback(deepLink); // Call the callback with the generated deep link
          } catch (error) {
            console.error('Error parsing response:', error);
          }
        });
      });

      post_req.on('error', function(err) {
        console.error('Error in request:', err);
      });

      post_req.write(post_data);
      post_req.end();
    })
    .catch(function(error) {
      console.error('Error generating checksum:', error);
    });
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

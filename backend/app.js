const express = require('express');
const cors = require('cors');
const app = express();
const request = require('request');
const yelp = require('yelp-fusion');
const myGooglekey = 'AIzaSyDyuqEgrCkrgQ_NrIondRZCc-ei8qtIkqw';
const myYelpkey = 'ibjolosRecL40ejoC6_Mv93n6MhTnPjwwGgI8R0WvwNUgDcjaa58uoLE1-RchlZwSbyHOspDvUx8xr4BXjM6xm24Kdz37HxmLg8smRFZVZsUnsTr2M_LAiHrGcG2WnYx';
const client = yelp.client(myYelpkey);
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/', function (req, res, next) {
    var test = "Welcome to Ziqiao Wang's AWS";
    //test = encodeURIComponent(test);
    res.send(test);
 })


app.get('/getPlace', function(req, res, next){
    
    // console.log(req.query);
    if (req.query.location) {
        var keyword = encodeURIComponent(req.query.keyword);
        var category = req.query.category;
        var distance = req.query.distance;
        var address = encodeURIComponent(req.query.location);
        var nextpagetoken = req.query.pagetoken;
        let axisreq = 'https://maps.google.com/maps/api/geocode/json?address=' + address + '&key=' + myGooglekey;
        // console.log(axisreq);
        request(axisreq, function(error, response, body){
            if(!error && response.statusCode == 200){
                let result = JSON.parse(body);
                // console.log(result);
                let res = result.results[0];
                // console.log(res);
                let lat = res['geometry']['location']['lat'];
                let lng = res['geometry']['location']['lng'];
                var axis = lat + "," + lng;
                console.log(axis);
                reqRes(axis);
            }
        })
    } else {
        var keyword = encodeURIComponent(req.query.keyword);
        var category = req.query.category;
        var distance = req.query.distance;
        var axis = req.query.here;
        var nextpagetoken = req.query.pagetoken;
        reqRes(axis);
    }

    function reqRes(axis) {
        //console.log(nextpagetoken);
        if (nextpagetoken == undefined || nextpagetoken == '') {
            if (category == "default") {
                let dreq = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + axis + '&radius=' + 1609.34*distance + '&keyword=' + keyword + '&key=' + myGooglekey;
                //console.log(dreq);
                request(dreq, function(error, response, body){
                    if(!error && response.statusCode == 200){
                        let result = JSON.parse(body);
                        result.stlat = axis.split(",")[0] * 1.0;
                        result.stlng = axis.split(",")[1] * 1.0;
                        res.send(result);
                        // console.log(result);
                    }
                })
            } else {
                let ndreq = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + axis + '&radius=' + 1609.34*distance + '&type=' + category + '&keyword=' + keyword + '&key=' + myGooglekey;
                //console.log(ndreq);
                request(ndreq, function(error, response, body){
                    if(!error && response.statusCode == 200){
                        let result = JSON.parse(body);
                        result.stlat = axis.split(",")[0] * 1.0;
                        result.stlng = axis.split(",")[1] * 1.0;
                        res.send(result);
                        // console.log(result);
                    }
                })
            }
        } else {
            if (category == "default") {
                let dreq = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + axis + '&radius=' + 1609.34*distance + '&keyword=' + keyword + '&key=' + myGooglekey + '&pagetoken=' + nextpagetoken;
                //console.log(dreq);
                request(dreq, function(error, response, body){
                    if(!error && response.statusCode == 200){
                        let result = JSON.parse(body);
                        result.stlat = axis.split(",")[0] * 1.0;
                        result.stlng = axis.split(",")[1] * 1.0;
                        res.send(result);
                        // console.log(result);
                    }
                })
            } else {
                let ndreq = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + axis + '&radius=' + 1609.34*distance + '&type=' + category + '&keyword=' + keyword + '&key=' + myGooglekey + '&pagetoken=' + nextpagetoken;
                //console.log(ndreq);
                request(ndreq, function(error, response, body){
                    if(!error && response.statusCode == 200){
                        let result = JSON.parse(body);
                        result.stlat = axis.split(",")[0] * 1.0;
                        result.stlng = axis.split(",")[1] * 1.0;
                        res.send(result);
                        // console.log(result);
                    }
                })
            }
        }
        
    }
})

app.get('/getPlacedetail', function(req, res, next){
    var placeid = req.query.placeid;
    request('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeid + '&key=' + myGooglekey, function(error, response, body){
    if(!error && response.statusCode == 200){
        let result = JSON.parse(body);
        if (result.result.price_level) {
            switch (result.result.price_level) {
                case 1:
                    result.result.price_level = "$";
                    break;
                case 2:
                    result.result.price_level = "$$";
                    break;
                case 3:
                    result.result.price_level = "$$$";
                    break;
                case 4:
                    result.result.price_level = "$$$$";
                    break;
            }
        }
        res.send(result);
        //console.log(result);
    }
    })
})

app.get('/getYelpreview', function(req, res, next){
    let name    = req.query.name;
    let add1    = req.query.add1;
    let add2    = req.query.add2;
    let add3    = req.query.add3;
    let city    = req.query.city;
    let state   = req.query.state
    let country = req.query.country;

    client.businessMatch('best', {
        // name: 'Starbucks' ,
        // address1: '"3201 S Hoover St',
        // address2: 'Los Angeles, CA 90089',
        // city: 'Los Angeles',
        // state: 'CA',
        // country: 'US'
        name: name,
        address1: add1,
        address2: add2,
        city: city,
        state: state,
        country: country
    }).then(body => {
        if (body.jsonBody.businesses[0]) {
            let id = body.jsonBody.businesses[0].id;
            console.log(id);
            genRev(id);
        } else {
            res.send(body.jsonBody);
            console.log(body.jsonBody);
        }
        // console.log(body.jsonBody.businesses[0].id);
    }).catch(e => {
        console.log(e);
        });
      
    function genRev(id) {
        client.reviews(id).then(body => {
            console.log(body.jsonBody);
            res.send(body.jsonBody);
            // console.log(body.jsonBody.reviews[0].text);
        }).catch(e => {
            console.log(e);
            });
        }
})

app.listen(8081, () => console.log('Server running on port 8081'))
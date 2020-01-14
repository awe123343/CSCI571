var mainApp = angular.module('myApp', ['ngMessages', 'ngAnimate', 'angularMoment']);


mainApp.controller('myCtrl', function($scope, $http) {
    var axisreq = "";

    $scope.nearbyrst = '';
    $scope.requrl = '';
    $scope.pagetoken = '';
    $scope.previous = [];
    $scope.dofplace = '';
    $scope.hideList = false;
    $scope.hideDetails = true;
    $scope.photourls = [];
    $scope.company = "Google Reviews";
    $scope.order = "Default Orders";
    $scope.favoriteDatas = [];
    $scope.FAVORITE_DATA = "";
    //$scope.state = 'google';

    $scope.load = function() {
        $http.get("http://ip-api.com/json/").then(function (response) {
            if (response.data.status === "success") {
                axisreq = response.data.lat + "," + response.data.lon;
                $scope.currentAxis = response.data.lat + "," + response.data.lon;
            }
            //console.log(axisreq); 
        }); 
    }

    $scope.getNextpage = function () {
        // console.log($scope.requrl);
        // console.log($scope.pagetoken);
        $scope.showProgressbar = true;
        //$scope.hideList = true;
        let url = $scope.requrl + "&pagetoken=" + $scope.pagetoken;

        $http.get(url).then(function (response) {
            $scope.showProgressbar = false;
            $scope.hideList = false;
            $scope.error = false;
            console.log(response);
            $scope.nearbyrst = response.data;
            if (response.data.next_page_token) {
                //console.log(response.data.next_page_token);                    
                $scope.pagetoken = response.data.next_page_token;
            }   
            $scope.previous.push(response.data);          
        }, function(response) {
            if (response.status != 200) {
                $scope.error = true;
                $scope.showProgressbar = false;
            }
        }); 
    }

    $scope.getPrev = function () {
        $scope.previous.pop();
        $scope.nearbyrst = $scope.previous[$scope.previous.length-1];
        //console.log($scope.nearbyrst);
    }
    
    $scope.showDetail = function (placeid) {
        
        $('.nav-tabs a[href="#info"]').tab('show');

        $scope.showProgressbar = true;
        $scope.hideList = true;
        $scope.hideDetails = false;

        let dehighlight = angular.element('.highlight');
        if (dehighlight) {
            dehighlight.removeClass("highlight");
        }

        let tempclass = '.' + placeid;
        $(tempclass).addClass("highlight");

        
        
        // let highlightrow0 = '';
        // let highlightrow1 = '';
        // highlightrow0 = document.getElementsByClassName(placeid)[0];
        // highlightrow0.addClass("highlight");
        // if (document.getElementsByClassName(placeid)[1]) {
        //     highlightrow1 = document.getElementsByClassName(placeid)[1];
        //     highlightrow1.addClass("highlight");
        // }

        //console.log(placeid);
        let url = "http://hw8sylvester-env.us-east-2.elasticbeanstalk.com/getPlacedetail?placeid=" + placeid;
        $http.get(url).then(function (response) {
            $scope.showProgressbar = false;
            $scope.error = false;
            //console.log(response.data);
            $scope.dofplace = response.data;
            if (response.data.result.rating) {
                $scope.rating = response.data.result.rating;
                $scope.star = $scope.rating * 100 / 5;
            }

            //For photos tab
            let request = {placeId: placeid};
            let pics = document.getElementById('pics');
            
            service = new google.maps.places.PlacesService(pics);
            service.getDetails(request, function(place, status) {
                if (place.photos) {
                    let photos = place.photos;
                    for (let i = 0; i < photos.length; i++) {
                        $scope.photourls[i] = photos[i].getUrl({'maxWidth': 320})
                    }
                } else {
                    $scope.photourls = [];
                    console.log($scope.photourls);
                }

                //For opening hours
                if (response.data.result.opening_hours) {
                    let targetHoursData = null;
                    let weekDay = [];

                    targetHoursData = response.data.result.opening_hours;
                    weekDay = targetHoursData.weekday_text;
                    let localDayToNum = Number(moment().utcOffset(place.utc_offset).format('d')) - 1;
                    localDayToNum = localDayToNum === -1 ? 6 : localDayToNum;
        
                    if (targetHoursData.open_now) {
                        $('#hours').html('<span id="detailPopupButton" data-toggle="modal" data-target="#myModal">Daily open hours</span>');
                        $('#hours').prepend(`<span id="openState">Open now: ${weekDay[localDayToNum].split(/day: /)[1]}   </span>`);
                    } else {
                        $('#hours').html('<span id="detailPopupButton" data-toggle="modal" data-target="#myModal">Daily open hours</span>');
                        $('#hours').prepend(`<span id="openState">Closed </span>`);
                    }

                    $('#detailPopupList').html('');

                    $('#detailPopupList').append(`<li class="list-group-item"><strong>${weekDay[localDayToNum]}</strong></li>`);
                    for (let i = localDayToNum + 1; i < weekDay.length; i++) {
                        $('#detailPopupList').append(`<li class="list-group-item">${weekDay[i]}</li>`);
                    }
                    for (let i = 0; i < localDayToNum; i++) {
                        $('#detailPopupList').append(`<li class="list-group-item">${weekDay[i]}</li>`);
                    }
                } 

                //For maps tab
                let destlat = 1.0 * response.data.result.geometry.location.lat;
                let destlng = 1.0 * response.data.result.geometry.location.lng;
                $scope.createMap(destlat, destlng);
                $scope.showMap = true;
                $scope.showStreet = false;
            
                //Review tab
                $scope.googleReviews = response.data.result.reviews;

                let name = response.data.result.name;
                let city="", state="", country="", street_num="", route="", postal_code="", add1="", add2="";
                for(let i = 0; i < response.data.result.address_components.length; i++) {
                    if(response.data.result.address_components[i].types[0] == "locality"){
                        city = response.data.result.address_components[i].short_name;
                    }
                    if(response.data.result.address_components[i].types[0] == "administrative_area_level_1"){
                        state = response.data.result.address_components[i].short_name;
                    }
                    if(response.data.result.address_components[i].types[0] == "street_number"){
                        street_num = response.data.result.address_components[i].short_name;
                    }
                    if(response.data.result.address_components[i].types[0] == "route"){
                        route = response.data.result.address_components[i].short_name;
                    }
                    if(response.data.result.address_components[i].types[0] == "postal_code"){
                        postal_code = response.data.result.address_components[i].long_name;
                    }
                }

                add1 = street_num + " " + route;
                add2 = city + ", " + state + " " + postal_code;

                let yelpRequest = "http://hw8sylvester-env.us-east-2.elasticbeanstalk.com/getYelpreview?name=" + name + "&add1=" + add1 + "&add2=" + add2 + "&city=" + city + "&state=" + state + "&country=US";
                console.log(yelpRequest);

                $scope.yelpReviews = null;
                $http.get(yelpRequest).then(function (response) {
                    $scope.yelpReviews = response.data.reviews;
                    $scope.company = "Google Reviews";
                    $scope.order = "Default Order";
                    console.log($scope.yelpReviews);
                }, function(response) {
                    if (response.status != 200) {
                        $scope.yelpReviews = null;
                        console.log(response.status);
                    }
                }); 

                //For twitter
                let twitterurl = 'https://twitter.com/intent/tweet?text=' + encodeURI('Check out' + place.name + 'located at ' + place.formatted_address + '. Website: ');
                if (place.website) {
                    twitterurl += '&url=' + encodeURI(place.website);
                } else {
                  twitterurl += '&url=' + encodeURI(place.url);
                }
                twitterurl += '&hashtags=' + encodeURI('TravelAndEntertainmentSearch');
                $('#twitter').attr('href', twitterurl);

                $scope.$apply();
            });

            //Map section
            $scope.inputTo = response.data.result.formatted_address;
            //$scope.destination = {lat: 1.0 * response.data.result.geometry.location.lat, lng: 1.0 * response.data.result.geometry.location.lng};
            $scope.travelMode = "DRIVING";

            
        }, function(response) {
            if (response.status != 200) {
                $scope.error = true;
                $scope.showProgressbar = false;
            }
        });
    }

    $scope.displayDetail = function () {
        $scope.hideList = true;
        $scope.hideDetails = false;
    }

    $scope.displayList = function () {
        $scope.hideList = false;
        $scope.hideDetails = true;
    }

    $scope.autocompleteMap = function() {
        let autocompleteMap = new google.maps.places.Autocomplete(
            (document.getElementById('inputFrom')),
            {types: ['address']});
    }

    $scope.createMap = function (dtlat, dtlng) {
        $scope.showMap  = true;
        $scope.showStreet = false;

        console.log("Creating Map");
        let dest = {lat: dtlat, lng: dtlng};

        map = new google.maps.Map(document.getElementById("detailmap"), {
            center: dest,
            zoom: 12
        });

        marker = new google.maps.Marker({
            position: dest,
            map: map,
        });  

        document.getElementById('detailmap-panel').innerHTML = '';
        
        directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true,
            map: map,
            panel: document.getElementById('detailmap-panel')
        });

        directionsDisplay.setMap(map);
    }

    $scope.toggleStreetView = function(dtlat, dtlng) {
        let dest = {lat: dtlat, lng: dtlng};
        panorama = new google.maps.StreetViewPanorama(
            document.getElementById('detailmap'),
            {
              position: dest,
              pov: {heading: 165, pitch: 0},
              zoom: 1
            });
            
            if ($scope.showMap) {
                panorama.setVisible(true);
                $scope.showMap  = false;
                $scope.showStreet = true;
            } else if ($scope.showStreet) {
                panorama.setVisible(false);
                $scope.showMap  = true;
                $scope.showStreet = false;
            }
    }

    $scope.displayRoute = function() {
        if ($scope.showStreet) {
            panorama.setVisible(false);
        }

        marker.setMap(null);

        $scope.showMap  = true;
        $scope.showStreet = false;

        var directionsService = new google.maps.DirectionsService;
        let origin = angular.element('#inputFrom')[0].value;
        let travelMode = angular.element('#travelMode')[0].value;

        if (origin == 'Your location' || origin == 'My location') {
            origin = $scope.from;
            console.log("Axis of origin: " + origin);  
        } 

        if (travelMode === 'DRIVING') {
            travelMode = google.maps.TravelMode.DRIVING;
        }   else if (travelMode === 'BICYCLING') {
            travelMode = google.maps.TravelMode.BICYCLING;
        }   else if (travelMode === 'TRANSIT') {
            travelMode = google.maps.TravelMode.TRANSIT;
        }   else if (travelMode === 'WALKING') {
            travelMode = google.maps.TravelMode.WALKING;
        }   

        directionsService.route({
            origin: origin,
            destination: $scope.inputTo,
            provideRouteAlternatives: true,
            travelMode: travelMode
        }, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }   else {
                alert('Could not display directions due to: ' + status);
            }
        });
    }

    $scope.onChangeReview = function(company) {
        $scope.company = company;
        // if (company === 'Google Reviews') {
        //   $scope.state = 'google';
        // } else if (company === 'Yelp Reviews') {
        //   $scope.state = 'yelp';
        // }
        $scope.sortReviews();
    }

    $scope.onChangeOrder = function (order) {
        $scope.order = order;
        $scope.sortReviews();
    }

    $scope.sortReviews = function() {
        if ($scope.order === 'Default Order') {
            if ($scope.googleReviews !== null && $scope.googleReviews !== undefined) {
                console.log($scope.googleReviews);
            }
            if ($scope.yelpReviews !== null && $scope.yelpReviews !== undefined) {
                console.log($scope.yelpReviews);
            }
        } else if ($scope.order === 'Most Recent') {
            if ($scope.googleReviews !== null && $scope.googleReviews !== undefined) {
                $scope.googleReviews.sort((a, b) => {
                    return b.time - a.time;
                });
            }
            if ($scope.yelpReviews !== null && $scope.yelpReviews !== undefined) {
                $scope.yelpReviews.sort((a, b) => {
                    return Number(moment(b['time_created']).format('x')) - Number(moment(a['time_created']).format('x'));
                });
            }
        } else if ($scope.order === 'Least Recent') {
            if ($scope.googleReviews !== null && $scope.googleReviews !== undefined) {
                $scope.googleReviews.sort((a, b) => {
                    return a.time - b.time;
                });
            }
            if ($scope.yelpReviews !== null && $scope.yelpReviews !== undefined) {
                $scope.yelpReviews.sort((a, b) => {
                    return Number(moment(a['time_created']).format('x')) - Number(moment(b['time_created']).format('x'));
                });
            }
        } else if ($scope.order === 'Highest Rating') {
            if ($scope.googleReviews !== null && $scope.googleReviews !== undefined) {
                $scope.googleReviews.sort((a, b) => {
                    return b.rating - a.rating;
                });
            }
            if ($scope.yelpReviews !== null && $scope.yelpReviews !== undefined) {
                $scope.yelpReviews.sort((a, b) => {
                    return b.rating - a.rating;
                });
            }
        } else if ($scope.order === 'Lowest Rating') {
            if ($scope.googleReviews !== null && $scope.googleReviews !== undefined) {
                $scope.googleReviews.sort((a, b) => {
                    return a.rating - b.rating;
                });
            }
            if ($scope.yelpReviews !== null && $scope.yelpReviews !== undefined) {
                $scope.yelpReviews.sort((a, b) => {
                return a.rating - b.rating;
            });
          }
        }
    }

    $scope.saveFavorite = function(place_id, icon, name, vicinity) {
        $scope.favoriteDatas.push([place_id, icon, name, vicinity]);
        $scope.saveToLocalStorage($scope.favoriteDatas);
    }

    $scope.removeFavorite = function(id){
        var idx = $scope.favoriteDatas.findIndex( function (item) {
            return item[0] === id;
        })
  
        if (idx > -1) {
            $scope.favoriteDatas.splice(idx, 1);
            $scope.saveToLocalStorage($scope.favoriteDatas);
        }
    }
  
    $scope.checkFavorite = function(id){
        var idx = $scope.favoriteDatas.findIndex( function (item) {
            return item[0] === id;
        })
        if (idx > -1)
            return true;
        else
            return false;
    }

    $scope.showFavorite = function() {
        $scope.favoriteDatas = $scope.getToLocalStorage();
        $scope.hideF = false;
        
        
        $('.nav-pills a[href="#favorites"]').tab('show');
        $scope.hideDetails = true;
        $scope.hideList = false;
    }

    $scope.showResult = function () { 
        $scope.hideList = false;
        $('.nav-pills a[href="#resultcontent"]').tab('show');
        $scope.hideDetails = true;
    }

    $scope.saveToLocalStorage = function(data) {
        localStorage.setItem($scope.FAVORITE_DATA, JSON.stringify(data));
    }
  
    $scope.getToLocalStorage = function() {
        return JSON.parse(localStorage.getItem($scope.FAVORITE_DATA)) || [];
    }

});
    


mainApp.controller('validateCtrl', function($scope, $http) {
    $scope.keyword = '';
    $scope.inputLoc = '';
    $scope.category = 'default';

    $scope.formSubmit = function () {
        $scope.$parent.showFavorite();
        $('.nav-pills a[href="#resultcontent"]').tab('show');
        $scope.$parent.hideF = true;

        $scope.$parent.nearbyrst = '';
        $scope.$parent.previous = [];
        $scope.$parent.dofplace = '';
        $scope.$parent.hideList = false;
        $scope.$parent.hideDetails = true;
        $scope.$parent.showProgressbar = true;

        if ($scope.isChecked == 'false') {
            let loc = angular.element('#inputLoc')[0].value;
            //let url =  "http://hw8sylvester-env.us-east-2.elasticbeanstalk.com/getPlace?location=" + $scope.inputLoc + "&keyword=" + $scope.keyword + "&category=" + $scope.category + "&distance=" + $scope.distance;
            let url =  "http://hw8sylvester-env.us-east-2.elasticbeanstalk.com/getPlace?location=" + loc + "&keyword=" + $scope.keyword + "&category=" + $scope.category + "&distance=" + $scope.distance;            
            console.log(url);
            $scope.$parent.requrl = url;
            //For the use of map section
            //$scope.$parent.inputFrom = $scope.inputLoc;
            $scope.$parent.inputFrom = angular.element('#inputLoc')[0].value

            $http.get(url).then(function (response) {
                $scope.$parent.error = false;
                $scope.$parent.showProgressbar = false;

                console.log(response); 
                
                $scope.$parent.nearbyrst = response.data;
                $scope.$parent.previous.push(response.data);
                if (response.data.next_page_token) {
                    //console.log(response.data.next_page_token);
                    $scope.$parent.pagetoken = response.data.next_page_token;
                }
                }, function(response) {
                    alert(response.status);
                    if (response.status != 200) {
                        $scope.$parent.error = true;
                        $scope.$parent.showProgressbar = false;
                    }
                }); 
        } else if($scope.isChecked == 'true') {
            //console.log($scope.currentAxis);
            let url =  "http://hw8sylvester-env.us-east-2.elasticbeanstalk.com/getPlace?here=" + $scope.currentAxis + "&keyword=" + $scope.keyword + "&category=" + $scope.category + "&distance=" + $scope.distance;
            //console.log(url);
            $scope.$parent.requrl = url;
            //For the use of map section
            $scope.$parent.from = $scope.currentAxis;
            $scope.$parent.inputFrom = "Your location";
            
            $http.get(url).then(function (response) {
                $scope.$parent.showProgressbar = false;
                $scope.$parent.error = false;
                console.log(response); 
                
                $scope.$parent.nearbyrst = response.data;
                $scope.$parent.previous.push(response.data);                
                if (response.data.next_page_token) {
                    //console.log(response.data.next_page_token);                    
                    $scope.$parent.pagetoken = response.data.next_page_token;
                }             
            }, function(response) {
                if (response.status != 200) {
                    $scope.$parent.error = true;
                    $scope.$parent.showProgressbar = false;
                }
            }); 
        }  
    };
    
    $scope.clear = function(form) {
        $scope.$parent.nearbyrst = '';
        $scope.$parent.dofplace = '';
        $scope.$parent.hideList = true;
        $scope.keyword = '';
        $scope.distance = 10;
        $scope.category = "default";
        $scope.isChecked = "true";
        $scope.inputLoc = '';

        $scope.myForm.$setPristine();
        $scope.myForm.$setUntouched();
    };
});

var autocomplete;

function initAutocomplete() {
    
    autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('inputLoc')),
        {types: ['geocode']});
    //autocomplete.addListener('place_changed', fillInAddress.bind(autocomplete));
}
$(function(){

    function get_location() {
        if (Modernizr.geolocation) {
            navigator.geolocation.getCurrentPosition(use_position, handle_loc_error, {enableHighAccuracy:true});
        } else {
            // no native support; maybe try Gears?
        }
    }

    function use_position(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        // todo: get the address and fill in the form
        alert('lat: ' + lat + ', ' + lng);
    }

    function handle_loc_error(err) {
        switch(err.code)
        {
            case 1:
                // PERMISSION_DENIED
                break;
            case 2:
                // POSITION_UNAVAILABLE
                break;
            case 3:
                // TIMEOUT
                break;
            default:
                // this shouldn't ever happen
                break;
        }
    }

    var Location = Backbone.Model.extend({
        defaults: function() {
            return {    
                name:'',
                address:'',
                lat:'',
                lng:'',
                order: Locations.nextOrder()
            };
        },

        get_distance: function(lat, lng) {
            alert('lat: ' + lat + ', lng:' + lng)
            // todo: calculate distance
        },

        clear: function() {
            this.destroy();
        }
    });

    var LocationList = Backbone.Collection.extend({
        model: Location,

        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        comparator: function(location) {
            return location.get('order');
        }
    });

    var Locations = new LocationList;

    var LocationView = Backbone.View.extend({
        tagName:  "li",


    })

    var AppView = Backbone.View.extend({
        el: $("#content"),

        events: {
            "click #add-location":  "showPrompt",
        },

        showPrompt: function () {
            var friend_name = prompt("What is the address?");
        },

        addFriendLi: function (model) {
            //The parameter passed is a reference to the model that was added
            $("#friends-list").append("<li>" + model.get('name') + "</li>");
            //Use .get to receive attributes of the model
        }
    });

    var appview = new AppView;

    get_location();

});

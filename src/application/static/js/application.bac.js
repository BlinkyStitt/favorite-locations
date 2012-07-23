(function($) {

    window.Location = Backbone.Model.extend({
        defaults: {
            name: "Not specified",
            address: "Not specified",
            lat: "",
            lng: ""
        },
        urlRoot: "/api/locations",
    });


    window.LocationCollection = Backbone.Collection.extend({
        model: Location,
        url: "/api/locations",
        parse: function(response) {
            // The API returns locations under "results".
            return response.results;
        }
    });
    

    window.LocationView = Backbone.View.extend({
        tagName: 'li',

        template: _.template($('#location_template').html()),

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });


    window.AppView = Backbone.View.extend({
        el: "#content",

        events: {
            "click button#get-location": "promptGeolocation",
            "click button#new-location": "newLocation"
        },

        initialize: function() {
            this.locations = new LocationCollection;

            this.locations.fetch();
        },

        newLocation: function( event ){
            event.preventDefault(); // cancel default behavior
            this.locations.create({
                name: $("input#name").val(),
                address: $("input#address").val()+", "+$("input#citystate").val()
            }, {wait: true});

            // todo: clear the form
            // todo: render the new location

            return this;
        },

        // if Modernizr says the user can geolocate, try it, otherwise hide the
        // button
        promptGeolocation: function(event) {
            event.preventDefault(); // cancel default behavior

            if ( Modernizr.geolocation ) {
                navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError);
            } else {
                // hide geolocate button if browser doesn't support it
                $("button#get-location").hide();
            }

            return this;
        },

        // success handler for promptGeolocation
        // todo: put current location on a map or something. use a model
        geoSuccess: function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            alert (lat+' '+lng);
        },

        // error handler for promptGeolocation
        geoError: function(error) {
            console.log(error);
            if (error.code == 1) {          // PERMISSION_DENIED
                // hide geolocate button if user denys geolocation
                $("button#get-location").hide();
            } else if (error.code == 2) {   // POSITION_UNAVAILABLE
                // alert("Current position unavailable!");
            } else if (error.code == 3) {   // TIMEOUT
                alert("Current position query timed out!");
            } else {
                alert("Something unexpected happened.");
            }
        }

    });

    // the basic flask webserver does not have the support we need
    Backbone.emulateJSON = true;

    // go!!!
    $(document).ready(function() {

    var view = new AppView;
})(jQuery);
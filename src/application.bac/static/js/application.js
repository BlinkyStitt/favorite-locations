$(function() {

    var Location = Backbone.Model.extend({
        defaults: {
            name: "Not specified",
            address: "Not specified",
            lat: "",
            lng: ""
        },
        urlRoot: "/api/locations",
    });


    var LocationCollection = Backbone.Collection.extend({
        model: Location,
        url: "/api/locations/",
        parse: function(response) {
            return response.locations;
        }
    });
    var locations = new LocationCollection;


    var LocationView = Backbone.View.extend({

        tagName:  "li",

        // Cache the template function for a single item.
        template: _.template($('#location_template').html()),

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });


    var HomeView = Backbone.View.extend({
        el: "#content",
        template: "#home_template",

        initialize: function() {
            this.promptLocation();

            locations.bind('add', this.addOne, this);
            locations.bind('reset', this.addAll, this);
            locations.bind('all', this.render, this);

            locations.fetch();
        },

        render: function() {
            // Compile the template using underscore
            var template = _.template( $(this.template).html(), {} );
            // Load the compiled HTML into the Backbone "el"
            $(this.el).html( template );
            // return this for chained calls
            return this;
        },

        events: {
            "click button#get-location": "promptLocation",
            "click button#new-location": "newLocation"
        },

        newLocation: function( event ){
            alert('new location');
        },

        // Add a single todo item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(loc) {
          var view = new LocationView({model: loc});
          $("#location-list").append(view.render().el);
        },

        // Add all items in the **Todos** collection at once.
        addAll: function() {
          locations.each(this.addOne);
        },

        promptLocation: function() {
            if ( Modernizr.geolocation ) {
                navigator.geolocation.getCurrentPosition(this.posSuccess, this.posError);
            } else {
                $("button#get-location").hide();
            }
        },

        posSuccess: function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            alert (lat+' '+lng);
        },

        posError: function(error) {
            console.log(error);
            if (error.code == 1) {
                // PERMISSION_DENIED
                // todo: hide the current location button
                $("button#get-location").hide();
            } else if (error.code == 2) {
                // POSITION_UNAVAILABLE
                alert("Current position unavailable!");
            } else if (error.code == 3) {
                // TIMEOUT
                alert("Current position query timed out!");
            } else {
                alert("Something unexpected happened.");
            }
        }

    });


    var ContactView = Backbone.View.extend({
        el: "#content",
        template: "#contact_template",

        render: function() {
            // Compile the template using underscore
            var template = _.template( $(this.template).html(), {} );
            // Load the compiled HTML into the Backbone "el"
            $(this.el).html( template );
            return this;
        },
    });


    var AppRouter = Backbone.Router.extend({
        home_view: new HomeView,
        contact_view: new ContactView,

        routes: {
            "":  "homeRoute",
            "contact": "contactRoute"
        },

        homeRoute: function(path) {
            // path is just to catch any route
            this.home_view.render();
            this.activateNav('home');
        },

        contactRoute: function() {
            this.contact_view.render();
            this.activateNav('contact');
        },

        activateNav: function(nav) {
            $('#header-nav li.active').removeClass('active');
            $('#header-nav li.'+nav).addClass('active');
        }
    });
    var app_router = new AppRouter;

    Backbone.history.start();
});
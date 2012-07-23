(function($) {

    window.Location = Backbone.Model.extend({
        defaults: {
            name: 'Not specified',
            address: 'Not specified',
            lat: '',
            lng: ''
        },
        urlRoot: '/api/locations',
    });

    window.Locations = Backbone.Collection.extend({
        model: Location,
        url: '/api/locations',

        parse: function(response) {
            // the API returns locations under "results".
            return response.results;
        }
    });
    window.locations = new Locations;

    window.LocationView = Backbone.View.extend({
        tagName: 'li',
        className: 'location',

        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.template = _.template($('#location-template').html());
        },

        events: {
            'click button.close': 'destroy',
            'dblclick .view': 'edit',
            'keypress .edit': 'updateOnEnter',
        },

        destroy: function() {
            // delete the model
            this.model.destroy();
            // remove the view
            this.remove();
            // return false so the page doesnt try to reload
            return false;
        },

        edit: function() {
            // rather than manually doing JS show/hide, let CSS handle that
            this.$el.addClass("editing");
            this.nameInput.focus();
        },

        closeEdit: function() {
            var name = this.nameInput.val();
            var address = this.addressInput.val();

            // if the name is cleared, remove the item
            if (!name) this.destory();
            // otherwise, save the new attributes
            this.model.save({name: name, address: address});
            // close out editing mode
            this.$el.removeClass("editing");
        },

        updateOnEnter: function(e) {
            // keyCode 13 is "enter"
            if (e.keyCode == 13) this.closeEdit();
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));

            // save the inputs to this view so we can get the values later
            this.nameInput = this.$('.edit input[name=name]');
            this.addressInput = this.$('.edit input[name=address]');
            return this;
        }
    });

    window.MarkerView = Backbone.View.extend({

        initialize: function(args) {
            this.map = args['map'];

            _.bindAll(this, 'destroy',
                            'render');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.destroy);
        },

        destroy: function() {
            this.marker.setMap(null);
            return this;
        },

        render: function() {
            // if we already have a marker, destory it
            if (this.marker != null) {
                this.destroy();
            }

            // create a marker
            var position = new google.maps.LatLng(this.model.get('lat'), this.model.get('lng'));
            var marker = this.map.gmap('addMarker', {'position': position,
                                                     'bounds': true });

            // save the marker to this view so we can access it later
            this.marker = marker.get(0);

            return this;
        }
    });

    window.MapView = Backbone.View.extend({
        className: 'map',

        initialize: function() {
            _.bindAll(this, 'addMarker',
                            'addAllMarkers',
                            'render');

            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.addMarker);
        },

        addMarker: function(marker) {
            var view = new MarkerView({
                map: $(this.el),
                model: marker
            });
            // this does not append a template like the other views
            view.render();

            return this;
        },

        addAllMarkers: function() {
            var collection = this.collection;
            var thisView = this;

            // clear any existing markers
            $(this.el).gmap('clear', 'markers');
            collection.each(function(loc) {
                thisView.addMarker(loc);
            });

            return this;
        },

        render: function() {
            // create an essentially empty gmap
            $(this.el).gmap();

            // add all of the map markers
            this.addAllMarkers();
            return this;
        }
    });

    window.FavoriteView = Backbone.View.extend({
        className: 'favorite',

        initialize: function() {
            _.bindAll(this, 'create',
                            'addOne',
                            'addAll',
                            'render');

            this.template = _.template($('#favorite-template').html());

            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.addOne);
        },

        events: {
            'click button.new-location': 'create'
        },

        create: function(event) {
            var collection = this.collection;
            var $clicked = $(event['currentTarget']);
            var $form = this.$('.add-favorite');
            var $nameInput = $form.find('input[name=name]');
            var $addressInput = $form.find('input[name=address]');

            // use twitter bootstrap js to toggle loading state
            $clicked.button('loading');

            collection.create({
                name: $nameInput.val(),
                address: $addressInput.val() + ', ' + $form.find('input[name=citystate]').val()
            },
            {
                // wait for the server for the formatted address, lat and lng
                wait: true,
                success: function (model, response) {
                    // use twitter bootstrap js to reset loading state
                    $clicked.button('reset');
                    // clear some of the form
                    $nameInput.val('');
                    $addressInput.val('');
                },
                error: function (model, response) {
                    // todo: something prettier than an alert
                    alert('Sorry, we were unable to add that location.');
                    console.log("error", model, response);
                    // use twitter bootstrap js to reset loading state
                    $clicked.button('reset');
                }
            });

            // return false so the page doesnt try to reload
            return false;
        },

        addOne: function(loc) {
            var $locations = this.$('.locations');
            var view = new LocationView({
                model: loc
            });
            $locations.append(view.render().el);

            return this;
        },

        addAll: function() {
            var $locations = this.$('.locations');
            var collection = this.collection;
            var thisView = this;

            collection.each(function(loc) {
                thisView.addOne(loc);
            });

            return this;
        },

        render: function() {
            $(this.el).html(this.template({}));
            this.addAll();
            return this;
        }

    });

    window.HeaderView = Backbone.View.extend({
        tagName: 'header',

        initialize: function() {
            _.bindAll(this, 'render');
            this.template = _.template($('#header-template').html());
        },

        render: function() {
            $(this.el).html(this.template({}));
            return this;
        }
    });

    window.AppRouter = Backbone.Router.extend({
        routes: {
            '': 'home',
        },

        initialize: function() {
            this.$container = $('#container');

            this.headerView = new HeaderView({});
            this.mapView = new MapView({collection: window.locations});
            this.favoriteView = new FavoriteView({collection: window.locations});
        },

        home: function() {
            $row = $('<div class="row-fluid" />');
            $row.append(this.mapView.render().el);
            $row.append(this.favoriteView.render().el);

            this.mapView.$el.wrap('<div class="span6" />');

            this.favoriteView.$el.wrap('<div class="span6" />');

            this.$container.empty();
            this.$container.append(this.headerView.render().el);
            this.$container.append($row);

            $row.wrap('<div class="container-fluid" />');
        },
    });
    window.App = new AppRouter();

    // the basic flask webserver does not support JSON
    Backbone.emulateJSON = true;

    // the basic flask webserver does not support {pushState: true}
    Backbone.history.start();

})(jQuery);

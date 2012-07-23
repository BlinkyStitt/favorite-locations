import urllib2

# this json will try simplejson and fallback to pure-python
from flask import json
from werkzeug.urls import url_encode

from application import db


class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    name = db.Column(db.String(32))
    address = db.Column(db.String(128))

    def __init__(self, name=name, address=address):
        self.name = name

        # ask google for a formatted address and lat/lng
        # note sensor is 'false' not 'False'
        google_url = 'http://maps.googleapis.com/maps/api/geocode/json?%s' % \
                url_encode({'address':address, 'sensor':'false'})
        response = urllib2.urlopen(urllib2.Request(google_url))

        # read the response, parse json, grab just the first result
        data = json.loads(response.read())['results'][0]

        # with a multi-user database, these could be in their own table
        self.address = data['formatted_address'] 
        self.lat = data['geometry']['location']['lat']
        self.lng = data['geometry']['location']['lng']

    def serialize(self):
        return {
            'id': self.id,
            'lat': self.lat,
            'lng': self.lng,
            'name': self.name,
            'address': self.address,
        }

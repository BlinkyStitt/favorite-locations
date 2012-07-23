import urllib2

from flask import abort, json
from jinja2.utils import escape
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from werkzeug.urls import url_encode

from application import db


class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32))
    _address = db.Column(db.String(128))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)

    @hybrid_property
    def address(self):
        """
        Set this as a hybrid property so we can make a fancy setter

        Do this above the __init__ since the __init__ uses this property
        """
        return self._address

    @address.setter
    def address(self, value):
        """
        ask google for self._address, self.lat, and self.lng
        """
        # note sensor is 'false' not 'False'
        google_url = 'http://maps.googleapis.com/maps/api/geocode/json?%s' % \
                url_encode({'address':value, 'sensor':'false'})
        response = urllib2.urlopen(urllib2.Request(google_url))

        # read the response, parse json, grab just the first result
        # todo: wrap this in a try block in case of error
        data = json.loads(response.read())['results'][0]

        # with a multi-user database, these could be in their own table
        self._address = data['formatted_address'] 
        self.lat = data['geometry']['location']['lat']
        self.lng = data['geometry']['location']['lng']

    def __init__(self, name=name, address=address):
        """
        Disallow setting lat and lng on __init__
        """
        self.name = name
        self.address = address

    @validates('name', 'address')
    def bare_bones_validator(self, key, value):
        """
        Disallow empty strings and escape the value
        """
        assert value != ''
        return escape(value)


    def __repr__(self):
        return "%s(name='%s',address='%s')" % (self.__class__.__name__, self.name, self.address)

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'lat': self.lat,
            'lng': self.lng,
        }

from flask import Blueprint, jsonify, request

from application import db
from application.models import Location
# circular imports FTW
from application.views import blueprints

blueprint = Blueprint('location', __name__, url_prefix='/api/locations')
blueprints.append(blueprint)


@blueprint.route('/', methods=['get'])
def index():
    """
    Return a list of all of the Locations

    http://flask.pocoo.org/docs/security/#json-security

    todo: potentially add filtering or sorting to the query
    """
    locations = Location.query.all()

    return jsonify(locations=[l.serialize() for l in locations])


@blueprint.route('/', methods=['post'])
def create():
    """
    Create a new location

    http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5
    """
    location = Location(name=request.form['name'],
                        address=request.form['address'])

    db.session.add(location)
    db.session.commit()

    return (jsonify(locations=location.serialize()),
            201,
            {'Location':url_for('location.read', location_id=location.id)})


@blueprint.route('/<int:location_id>', methods=['get'])
def read(location_id):
    """
    Return a location with the given id or 404
    """
    location = Location.query.get_or_404(location_id)

    return jsonify(locations=location.serialize())


@blueprint.route('/<int:location_id>', methods=['put'])
def update(location_id):
    """
    Update the location

    http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6
    """
    location = Location.query.get_or_404(location_id)

    data = request.form
    # todo: set location.whatever to data.whatever

    return jsonify(locations=location.serialize())


@blueprint.route('/<int:location_id>', methods=['delete'])
def destroy(location_id):
    """
    Delete the object and return with a 204

    http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.7
    """
    db.session.query(Location).filter(Location.id==location_id).delete()

    return '', 204

from flask import Blueprint, current_app, json, jsonify, request, url_for

from application import db
from application.models import Location
# circular imports FTW
from application.views import blueprints

blueprint = Blueprint('api', __name__, url_prefix='/api')
blueprints.append(blueprint)


@blueprint.route('/locations', methods=['get'])
def location_index():
    """
    Return a list of all of the locations

    todo: potentially add filtering or sorting to the query
    """
    locations = Location.query.all()

    # jsonify will not serialize a list
    # http://flask.pocoo.org/docs/security/#json-security
    return jsonify(results=[l.serialize() for l in locations])


@blueprint.route('/locations', methods=['post'])
def location_create():
    """
    Create a new location
    """
    # backbone sends the data as a JSON string in post['model']
    data = json.loads(request.form['model'])

    # data filtering is in the Model
    location = Location(name=data['name'],
                        address=data['address'])

    db.session.add(location)
    db.session.commit()

    # http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5
    response = jsonify(location.serialize())
    response.status_code = 201
    response.headers['Location'] = url_for('api.location_read', location_id=location.id)
    return response


@blueprint.route('/locations/<int:location_id>', methods=['get'])
def location_read(location_id):
    """
    Return a location with the given id or 404
    """
    location = Location.query.get_or_404(location_id)

    # return with a simple 200
    return jsonify(location.serialize())


@blueprint.route('/locations/<int:location_id>', methods=['put'])
def location_update(location_id):
    """
    Update the location

    """
    location = Location.query.get_or_404(location_id)

    # backbone sends the data as a JSON string in post['model']
    data = json.loads(request.form['model'])

    # update the model
    if data['name']:
        location.name = data['name']
    if data['address']:
        location.address = data['address']

    db.session.commit()

    # http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6
    return jsonify(location.serialize())


@blueprint.route('/locations/<int:location_id>', methods=['delete'])
def location_destroy(location_id):
    """
    Delete the object and return with a 204

    """
    db.session.query(Location).filter(Location.id==location_id).delete()
    db.session.commit()

    # http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.7
    return '', 204

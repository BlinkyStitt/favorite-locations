import os
from flask import (Blueprint, current_app, jsonify, render_template, request,
                   send_from_directory)

blueprints = []

# import any other blueprints here. they will add themselves to the above list
import application.views.locations

blueprint = Blueprint('default', __name__)
blueprints.append(blueprint)


@blueprint.route('/')
def index():
    """
    This is the only page the user directly interacts with. Backbone handles 
    everything from here.
    """
    return render_template('index.html')


@blueprint.route('/favicon.ico')
def favicon():
    """
    Return the favicon rather efficiently

    http://flask.pocoo.org/docs/patterns/favicon/
    """
    return send_from_directory(os.path.join(current_app.root_path, 'static'),
                'favicon.ico', mimetype='image/vnd.microsoft.icon')

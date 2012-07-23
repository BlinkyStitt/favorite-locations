from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SECRET_KEY'] = '<replace with a secret key>'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/uber.db'

db = SQLAlchemy(app)

# import the views after the db is created
from application.views import blueprints
[app.register_blueprint(b) for b in blueprints]

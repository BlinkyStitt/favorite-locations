#!/usr/bin/env python

from flask.ext.script import Manager

from application import app, db
from application.models import Location

manager = Manager(app)


@manager.command
def setupdb():
    """
    Create all database tables
    """
    db.drop_all()
    db.create_all()

    # scaffold some basic data
    db.session.add(Location(name='Uber',address='800 Market St., San Francisco, CA'))
    db.session.add(Location(name='Home',address='Sacramento St., San Francisco, CA'))
    db.session.commit()


if __name__ == '__main__':
    manager.run()

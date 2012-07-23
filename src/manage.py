#!/usr/bin/env python

from flask.ext.script import Manager

from application import app, db

manager = Manager(app)


@manager.command
def setupdb():
    """
    Create all database tables
    """
    db.drop_all()
    db.create_all()


if __name__ == '__main__':
    manager.run()

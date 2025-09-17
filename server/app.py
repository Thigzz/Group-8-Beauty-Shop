import os
from app import create_app
from server.app.extensions import db

# Create the Flask application using the app factory
app = create_app()

if __name__ == '__main__':
    with server.app.app_context():
        db.create_all()  # Create database tables
    server.app.run(debug=True)

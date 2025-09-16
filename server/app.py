import os
from app import create_app
from app.extensions import db

# Create the Flask application using the app factory
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)

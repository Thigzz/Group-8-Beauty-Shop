import os
from server.app import create_app  # Corrected import
from server.app.extensions import db

# Create the Flask application using the app factory
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)  # Corrected run command
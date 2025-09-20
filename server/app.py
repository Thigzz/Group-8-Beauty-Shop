import os
from server.app import create_app
from server.app.extensions import db
from server.app.seed import seed_data


app = create_app()

@app.cli.command("seed-db")
def seed_db_command():
    """Seeds the database with initial data."""
    print("--- Seeding database ---")
    seed_data()
    print("--- Seeding complete ---")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
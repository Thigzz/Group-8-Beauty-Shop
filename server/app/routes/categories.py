from flask import Blueprint, request, jsonify
from server.app.extensions import db
from server.app.models.category import Category
from flask_jwt_extended import jwt_required
from server.app.decorators import admin_required

categories_bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@categories_bp.route("/", methods=["POST"])
@jwt_required()
@admin_required()
def create_category():
    data = request.get_json()
    category = Category(category_name=data["category_name"])
    db.session.add(category)
    db.session.commit()
    return jsonify({"message": "Category created", "id": str(category.id)}), 201


@categories_bp.route("/", methods=["GET"])
def get_categories():
    categories = Category.query.all()
    return jsonify([{"id": str(c.id), "category_name": c.category_name} for c in categories])


@categories_bp.route("/<uuid:category_id>", methods=["GET"])
def get_category(category_id):
    category = Category.query.get_or_404(category_id)
    return jsonify({"id": str(category.id), "category_name": category.category_name})


@categories_bp.route("/<uuid:category_id>", methods=["PATCH"])
@jwt_required()
@admin_required()
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    data = request.get_json()
    if "category_name" in data:
        category.category_name = data["category_name"]
    db.session.commit()
    return jsonify({"message": "Category updated"})


@categories_bp.route("/<uuid:category_id>", methods=["DELETE"])
@jwt_required()
@admin_required()
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category deleted"})
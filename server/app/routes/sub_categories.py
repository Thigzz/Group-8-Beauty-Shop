from flask import Blueprint, request, jsonify
from server.app.extensions import db
from server.app.models.sub_category import SubCategory
from server.app.models.category import Category
from flask_jwt_extended import jwt_required
from server.app.decorators import admin_required

sub_categories_bp = Blueprint("sub_categories", __name__, url_prefix="/api/sub_categories")


@sub_categories_bp.route("/", methods=["POST"])
@jwt_required()
@admin_required()
def create_sub_category():
    data = request.get_json()
    category_id = data.get("category_id")
    sub_category_name = data.get("sub_category_name")

    if not category_id or not sub_category_name:
        return jsonify({"message": "category_id and sub_category_name are required"}), 400

    category = Category.query.get(category_id)
    if not category:
        return jsonify({"message": "Category not found"}), 404

    sub_category = SubCategory(category_id=category_id, sub_category_name=sub_category_name)
    db.session.add(sub_category)
    db.session.commit()
    return jsonify({"message": "SubCategory created", "id": str(sub_category.id)}), 201


@sub_categories_bp.route("/", methods=["GET"])
def get_sub_categories():
    sub_categories = SubCategory.query.all()
    return jsonify([
        {
            "id": str(sc.id),
            "sub_category_name": sc.sub_category_name,
            "category_id": str(sc.category_id)
        } for sc in sub_categories
    ])


@sub_categories_bp.route("/<uuid:sub_category_id>", methods=["GET"])
def get_sub_category(sub_category_id):
    sub_category = SubCategory.query.get_or_404(sub_category_id)
    return jsonify({
        "id": str(sub_category.id),
        "sub_category_name": sub_category.sub_category_name,
        "category_id": str(sub_category.category_id)
    })


@sub_categories_bp.route("/<uuid:sub_category_id>", methods=["PATCH"])
@jwt_required()
@admin_required()
def update_sub_category(sub_category_id):
    sub_category = SubCategory.query.get_or_404(sub_category_id)
    data = request.get_json()
    if "sub_category_name" in data:
        sub_category.sub_category_name = data["sub_category_name"]
    db.session.commit()
    return jsonify({"message": "SubCategory updated"})


@sub_categories_bp.route("/<uuid:sub_category_id>", methods=["DELETE"])
@jwt_required()
@admin_required()
def delete_sub_category(sub_category_id):
    sub_category = SubCategory.query.get_or_404(sub_category_id)
    db.session.delete(sub_category)
    db.session.commit()
    return jsonify({"message": "SubCategory deleted"})

@sub_categories_bp.route("/by_category/<uuid:category_id>", methods=["GET"])
def get_sub_categories_by_category(category_id):
    """
    Get all sub-categories for a specific parent category.
    """
    category = Category.query.get_or_404(category_id)
    sub_categories = SubCategory.query.filter_by(category_id=category.id).all()
    
    return jsonify([
        {
            "id": str(sc.id),
            "sub_category_name": sc.sub_category_name,
            "category_id": str(sc.category_id)
        } for sc in sub_categories
    ])

import csv
import io
from flask import Blueprint, request, jsonify, Response
from app.models import Product, Order
from app.extensions import db

reports_bp = Blueprint("reports", __name__, url_prefix="/reports")

def generate_csv(data, headers):
    """Helper: convert list of dicts into CSV response."""
    proxy = io.StringIO()
    writer = csv.DictWriter(proxy, fieldnames=headers)
    writer.writeheader()
    writer.writerows(data)
    proxy.seek(0)

    return Response(
        proxy.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=report.csv"}
    )

@reports_bp.route("/products", methods=["GET"])
def export_products():
    """Admin: Export product report"""
    products = Product.query.all()
    data = [p.to_dict() for p in products]  # ensure Product has to_dict()
    format_type = request.args.get("format", "json")

    if format_type == "csv":
        headers = data[0].keys() if data else ["id", "name", "price", "category_id"]
        return generate_csv(data, headers)

    return jsonify(data)


@reports_bp.route("/orders", methods=["GET"])
def export_orders():
    """Admin: Export order report"""
    orders = Order.query.all()
    data = [o.to_dict() for o in orders]  # ensure Order has to_dict()
    format_type = request.args.get("format", "json")

    if format_type == "csv":
        headers = data[0].keys() if data else ["id", "user_id", "total_amount", "status", "created_at"]
        return generate_csv(data, headers)

    return jsonify(data)

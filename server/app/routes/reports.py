# app/routes/reports.py
import csv
import io
from flask import Blueprint, request, jsonify, Response
from server.app.models import Product, Order
from server.app.extensions import db
from openpyxl import Workbook
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from flask_jwt_extended import jwt_required
from server.app.decorators import admin_required

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

def generate_excel(data, headers):
    """Helper: convert list of dicts into Excel response."""
    output = io.BytesIO()
    wb = Workbook()
    ws = wb.active
    ws.append(headers)
    for row in data:
        ws.append([row.get(h, "") for h in headers])
    wb.save(output)
    output.seek(0)

    return Response(
        output.getvalue(),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=report.xlsx"}
    )

def generate_pdf(data, headers, title="Report"):
    """Helper: convert list of dicts into PDF response."""
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=letter)
    elements = []

    styles = getSampleStyleSheet()
    elements.append(Paragraph(title, styles["Title"]))

    table_data = [headers] + [[row.get(h, "") for h in headers] for row in data]
    table = Table(table_data)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.grey),
        ("TEXTCOLOR", (0,0), (-1,0), colors.whitesmoke),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0,0), (-1,0), 12),
        ("GRID", (0,0), (-1,-1), 1, colors.black),
    ]))
    elements.append(table)

    doc.build(elements)
    output.seek(0)

    return Response(
        output.getvalue(),
        mimetype="application/pdf",
        headers={"Content-Disposition": "attachment; filename=report.pdf"}
    )

def export_data(queryset, format_type, title):
    """General export function"""
    data = [obj.to_dict() for obj in queryset]
    headers = data[0].keys() if data else []

    if format_type == "csv":
        return generate_csv(data, headers)
    elif format_type == "excel":
        return generate_excel(data, headers)
    elif format_type == "pdf":
        return generate_pdf(data, headers, title)
    else:
        return jsonify(data)

@reports_bp.route("/products", methods=["GET"])
@jwt_required()
@admin_required()
def export_products():
    """Admin: Export product report"""
    format_type = request.args.get("format", "json").lower()
    products = Product.query.all()
    return export_data(products, format_type, "Product Report")

@reports_bp.route("/orders", methods=["GET"])
@jwt_required()
@admin_required()
def export_orders():
    """Admin: Export order report"""
    format_type = request.args.get("format", "json").lower()
    orders = Order.query.all()
    return export_data(orders, format_type, "Order Report")
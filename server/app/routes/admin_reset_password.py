from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models.users import User
from app.models.security_question import SecurityQuestion
from app.models.password_reset_audit import PasswordResetAudit

admin_reset_bp = Blueprint("admin_reset", __name__, url_prefix="/admin-reset")


@admin_reset_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    user_id = data.get("user_id")
    admin_id = data.get("admin_id")
    new_password = data.get("new_password")
    answers = data.get("answers", [])

    user = User.query.get_or_404(user_id)
    questions = SecurityQuestion.query.filter_by(user_id=user_id, is_active=True).all()

    # validate answers
    for q in questions:
        given_answer = next((a for a in answers if a["question_id"] == str(q.id)), None)
        if not given_answer or not check_password_hash(q.answer_hash, given_answer["answer"]):
            return jsonify({"error": "Security question validation failed"}), 400

    # update password
    user.password_hash = generate_password_hash(new_password)
    db.session.add(user)

    # log audit trail
    audit = PasswordResetAudit(
        user_id=user.id,
        admin_id=admin_id,
        action="Password Reset"
    )
    db.session.add(audit)

    db.session.commit()
    return jsonify({"message": "Password reset successful"})

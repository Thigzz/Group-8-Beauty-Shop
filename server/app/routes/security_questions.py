from flask import Blueprint, request, jsonify
import uuid
from server.app.extensions import db, bcrypt
from server.app.models.security_question import SecurityQuestion
from server.app.models.user_security_questions import UserSecurityQuestion
from server.app.models.users import User

security_questions_bp = Blueprint('security_questions', __name__, url_prefix='/api/security-questions')


@security_questions_bp.route('/available', methods=['GET'])
def get_available_questions():
    """Get all available security questions for users to choose from"""
    try:
        questions = SecurityQuestion.query.filter_by(is_active=True).all()
        return jsonify({
            'questions': [
                {
                    'id': str(question.id),
                    'question': question.question
                } for question in questions
            ]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security_questions_bp.route('/user/<user_id>', methods=['GET'])
def get_user_questions(user_id):
    """Get security questions for a specific user (without answers)"""
    try:
        user_uuid = uuid.UUID(user_id)
        
        user_questions = db.session.query(UserSecurityQuestion, SecurityQuestion)\
            .join(SecurityQuestion)\
            .filter(UserSecurityQuestion.user_id == user_uuid)\
            .filter(UserSecurityQuestion.is_active == True)\
            .all()
        
        return jsonify({
            'questions': [
                {
                    'id': str(uq.id),
                    'question_id': str(sq.id),
                    'question': sq.question
                } for uq, sq in user_questions
            ]
        }), 200
    except ValueError:
        return jsonify({'error': 'Invalid user ID format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security_questions_bp.route('/user/<user_id>', methods=['POST'])
def set_user_questions(user_id):
    """Set security questions for a user"""
    try:
        data = request.get_json()
        
        if 'questions' not in data or not isinstance(data['questions'], list):
            return jsonify({'error': 'questions array is required'}), 400
        
        user_uuid = uuid.UUID(user_id)
        user = User.query.get_or_404(user_uuid)
        
        # Deactivating existing questions for this user
        UserSecurityQuestion.query.filter_by(user_id=user_uuid).update({'is_active': False})
        
        # Creating new user security questions
        for question_data in data['questions']:
            if 'question_id' not in question_data or 'answer' not in question_data:
                return jsonify({'error': 'Each question must have question_id and answer'}), 400
            
            # Use bcrypt to hash the answer
            answer_hash = bcrypt.generate_password_hash(question_data['answer'].lower().strip()).decode('utf-8')
            
            user_question = UserSecurityQuestion(
                user_id=user_uuid,
                question_id=uuid.UUID(question_data['question_id']),
                answer_hash=answer_hash,
                is_active=True
            )
            db.session.add(user_question)
        
        db.session.commit()
        return jsonify({'message': 'Security questions set successfully'}), 201
        
    except ValueError:
        return jsonify({'error': 'Invalid UUID format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@security_questions_bp.route('/verify/<user_id>', methods=['POST'])
def verify_answers(user_id):
    """Verifying security question answers for password reset"""
    try:
        data = request.get_json()
        
        if 'answers' not in data or not isinstance(data['answers'], list):
            return jsonify({'error': 'answers array is required'}), 400
        
        user_uuid = uuid.UUID(user_id)
        
        user_questions = UserSecurityQuestion.query.filter_by(
            user_id=user_uuid, 
            is_active=True
        ).all()
        
        if len(user_questions) == 0:
            return jsonify({'error': 'No security questions found for user'}), 404
        
        correct_answers = 0
        for answer_data in data['answers']:
            if 'question_id' not in answer_data or 'answer' not in answer_data:
                continue
                
            question_uuid = uuid.UUID(answer_data['question_id'])
            user_question = next((uq for uq in user_questions if uq.question_id == question_uuid), None)
            
            # Use bcrypt to verify the answer
            if user_question and bcrypt.check_password_hash(user_question.answer_hash, answer_data['answer'].lower().strip()):
                correct_answers += 1
        
        required_correct = min(1, len(user_questions))
        
        if correct_answers >= required_correct:
            return jsonify({
                'verified': True,
                'message': 'Security questions verified successfully'
            }), 200
        else:
            return jsonify({
                'verified': False,
                'message': 'Insufficient correct answers'
            }), 400
            
    except ValueError:
        return jsonify({'error': 'Invalid UUID format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security_questions_bp.route('/', methods=['POST'])
def create_security_question():
    """Creating a new security question (Admin only)"""
    try:
        data = request.get_json()
        
        if 'question' not in data:
            return jsonify({'error': 'question is required'}), 400
        
        question = SecurityQuestion(
            question=data['question'],
            is_active=True
        )
        
        db.session.add(question)
        db.session.commit()
        
        return jsonify({
            'id': str(question.id),
            'question': question.question
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
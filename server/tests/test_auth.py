import json
from server.app.models.users import User, UserRole
from server.app.models.security_question import SecurityQuestion
from server.app.models.user_security_questions import UserSecurityQuestion
from server.app.extensions import db, bcrypt


def setup_user_with_questions(test_client):
    with test_client.application.app_context():
        user = User(username="sec_user", email="security@test.com", first_name="Sec", last_name="User", primary_phone_no="111")
        user.set_password("password123")
        db.session.add(user)
        
        q1 = SecurityQuestion(question="What is your pet's name?")
        q2 = SecurityQuestion(question="What is your favorite color?")
        db.session.add_all([q1, q2])
        db.session.commit()

        ans1 = UserSecurityQuestion(user_id=user.id, question_id=q1.id, answer_hash=bcrypt.generate_password_hash("Buddy").decode('utf-8'))
        ans2 = UserSecurityQuestion(user_id=user.id, question_id=q2.id, answer_hash=bcrypt.generate_password_hash("Blue").decode('utf-8'))
        db.session.add_all([ans1, ans2])
        db.session.commit()
        
 
        return {"username": user.username, "q1_id": q1.id, "q2_id": q2.id}

def test_register_user(test_client, new_user):
    response = test_client.post('/auth/register', data=json.dumps({"first_name": new_user.first_name, "last_name": new_user.last_name, "username": new_user.username, "email": new_user.email, "primary_phone_no": new_user.primary_phone_no, "password": "password123", "confirm_password": "password123"}), content_type='application/json')
    assert response.status_code == 201

def test_register_existing_user(test_client, new_user):
    test_client.post('/auth/register', data=json.dumps({"username": new_user.username, "email": new_user.email, "password": "password123", "confirm_password": "password123", "first_name": "Test", "last_name": "User", "primary_phone_no": "123"}), content_type='application/json')
    response = test_client.post('/auth/register', data=json.dumps({"username": new_user.username, "email": new_user.email, "password": "password123", "confirm_password": "password123", "first_name": "Test", "last_name": "User", "primary_phone_no": "123"}), content_type='application/json')
    assert response.status_code == 409

def test_login_user_with_username(test_client, new_user):
    test_client.post('/auth/register', data=json.dumps({"username": new_user.username, "email": new_user.email, "password": "password123", "confirm_password": "password123", "first_name": "Test", "last_name": "User", "primary_phone_no": "123"}), content_type='application/json')
    response = test_client.post('/auth/login', data=json.dumps({"login_identifier": new_user.username, "password": "password123"}), content_type='application/json')
    assert response.status_code == 200

def test_login_user_with_email(test_client, new_user):
    test_client.post('/auth/register', data=json.dumps({"username": "anotheruser", "email": "another@test.com", "password": "password123", "confirm_password": "password123", "first_name": "Another", "last_name": "User", "primary_phone_no": "456"}), content_type='application/json')
    response = test_client.post('/auth/login', data=json.dumps({"login_identifier": "another@test.com", "password": "password123"}), content_type='application/json')
    assert response.status_code == 200

def test_login_invalid_credentials(test_client, new_user):
    response = test_client.post('/auth/login', data=json.dumps({"login_identifier": new_user.username, "password": "wrongpassword"}), content_type='application/json')
    assert response.status_code == 401

def test_access_protected_route(test_client, new_user):
    """Test that a user can access their profile and fetch phone numbers."""
    # Register the user with both phone numbers
    test_client.post(
        '/auth/register',
        data=json.dumps({
            "username": new_user.username,
            "email": new_user.email,
            "password": "password123",
            "confirm_password": "password123",
            "first_name": "Test",
            "last_name": "User",
            "primary_phone_no": "1234567890",
            "secondary_phone_no": "0987654321"
        }),
        content_type='application/json'
    )

    # Login to get access token
    login_res = test_client.post(
        '/auth/login',
        data=json.dumps({
            "login_identifier": new_user.username,
            "password": "password123"
        }),
        content_type='application/json'
    )
    access_token = json.loads(login_res.data)['access_token']

    # Fetch profile
    response = test_client.get(
        '/auth/profile',
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    data = json.loads(response.data)

    # Verify all profile fields including phone numbers
    assert data['first_name'] == "Test"
    assert data['last_name'] == "User"
    assert data['username'] == new_user.username
    assert data['email'] == new_user.email
    assert data['primary_phone_no'] == "1234567890"
    assert data['secondary_phone_no'] == "0987654321"


def test_admin_access(test_client, new_admin):
    test_client.post('/auth/register', data=json.dumps({"username": new_admin.username, "email": new_admin.email, "password": "password123", "confirm_password": "password123", "first_name": "Admin", "last_name": "User", "primary_phone_no": "456"}), content_type='application/json')
    with test_client.application.app_context():
        admin_user = User.query.filter_by(username=new_admin.username).first()
        admin_user.role = UserRole.admin
        db.session.commit()
    login_res = test_client.post('/auth/login', data=json.dumps({"login_identifier": new_admin.username, "password": "password123"}), content_type='application/json')
    access_token = json.loads(login_res.data)['access_token']
    response = test_client.get('/auth/admin/dashboard', headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200

def test_non_admin_access_denied(test_client, new_user):
    test_client.post('/auth/register', data=json.dumps({"username": "nonadmin", "email": "nonadmin@test.com", "password": "password123", "confirm_password": "password123", "first_name": "Non", "last_name": "Admin", "primary_phone_no": "789"}), content_type='application/json')
    login_res = test_client.post('/auth/login', data=json.dumps({"login_identifier": "nonadmin", "password": "password123"}), content_type='application/json')
    access_token = json.loads(login_res.data)['access_token']
    response = test_client.get('/auth/admin/dashboard', headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 403

def test_get_security_questions_for_user(test_client):
    user_data = setup_user_with_questions(test_client)
    response = test_client.post('/auth/reset-questions', data=json.dumps({"login_identifier": user_data["username"]}), content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 2
    assert data[0]['question'] == "What is your pet's name?"

def test_verify_correct_answers(test_client):
    user_data = setup_user_with_questions(test_client)
    answers = [{"question_id": str(user_data["q1_id"]), "answer": "Buddy"}, {"question_id": str(user_data["q2_id"]), "answer": "Blue"}]
    response = test_client.post('/auth/verify-answers', data=json.dumps({"login_identifier": user_data["username"], "answers": answers}), content_type='application/json')
    assert response.status_code == 200
    assert "reset_token" in json.loads(response.data)

def test_verify_incorrect_answers(test_client):
    user_data = setup_user_with_questions(test_client)
    answers = [{"question_id": str(user_data["q1_id"]), "answer": "Buddy"}, {"question_id": str(user_data["q2_id"]), "answer": "WRONG_ANSWER"}]
    response = test_client.post('/auth/verify-answers', data=json.dumps({"login_identifier": user_data["username"], "answers": answers}), content_type='application/json')
    assert response.status_code == 401

def test_full_password_reset_flow(test_client):
    user_data = setup_user_with_questions(test_client)
    answers = [{"question_id": str(user_data["q1_id"]), "answer": "Buddy"}, {"question_id": str(user_data["q2_id"]), "answer": "Blue"}]
    verify_res = test_client.post('/auth/verify-answers', data=json.dumps({"login_identifier": user_data["username"], "answers": answers}), content_type='application/json')
    token = json.loads(verify_res.data)['reset_token']
    reset_res = test_client.post('/auth/reset-password', data=json.dumps({"token": token, "new_password": "a_brand_new_password"}), content_type='application/json')
    assert reset_res.status_code == 200
    login_res = test_client.post('/auth/login', data=json.dumps({"login_identifier": user_data["username"], "password": "a_brand_new_password"}), content_type='application/json')
    assert login_res.status_code == 200

def test_change_password(test_client, new_user):
    """
    GIVEN a logged-in user
    WHEN the '/auth/change-password' endpoint is called with correct data
    THEN check that the password is changed successfully
    """

    test_client.post('/auth/register', data=json.dumps({
        "username": new_user.username, "email": new_user.email, "password": "password123", "confirm_password": "password123",
        "first_name": "Test", "last_name": "User", "primary_phone_no": "123"
    }), content_type='application/json')
    login_res = test_client.post('/auth/login', data=json.dumps({
        "login_identifier": new_user.username, "password": "password123"
    }), content_type='application/json')
    access_token = json.loads(login_res.data)['access_token']

    headers = {"Authorization": f"Bearer {access_token}"}
    change_password_data = {
        "current_password": "password123",
        "new_password": "new_password_456",
        "confirm_password": "new_password_456"
    }


    response = test_client.put('/auth/change-password', headers=headers, data=json.dumps(change_password_data), content_type='application/json')
    assert response.status_code == 200
    assert response.get_json()['message'] == 'Password updated successfully'

    login_with_new_pass_res = test_client.post('/auth/login', data=json.dumps({
        "login_identifier": new_user.username, "password": "new_password_456"
    }), content_type='application/json')
    assert login_with_new_pass_res.status_code == 200
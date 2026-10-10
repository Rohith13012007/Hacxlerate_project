import sys
import os
import unittest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

class TestOTPFlow(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_send_email_otp(self):
        response = self.client.post("/api/auth/send-otp", json={
            "contact": "test.patient@example.com",
            "name": "Rohith Kumar",
            "type": "email"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("otp_code", data)
        self.assertEqual(len(data["otp_code"]), 6)

        # Test verify OTP with correct code
        otp_code = data["otp_code"]
        verify_res = self.client.post("/api/auth/verify-otp", json={
            "contact": "test.patient@example.com",
            "code": otp_code,
            "name": "Rohith Kumar"
        })
        self.assertEqual(verify_res.status_code, 200)
        verify_data = verify_res.json()
        self.assertIn("token", verify_data)
        self.assertEqual(verify_data["email"], "test.patient@example.com")

    def test_send_mobile_otp(self):
        response = self.client.post("/api/auth/send-otp", json={
            "contact": "+919876543210",
            "name": "Rohith Mobile",
            "type": "mobile"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("otp_code", data)

        # Test verify OTP
        otp_code = data["otp_code"]
        verify_res = self.client.post("/api/auth/verify-otp", json={
            "contact": "+919876543210",
            "code": otp_code,
            "name": "Rohith Mobile"
        })
        self.assertEqual(verify_res.status_code, 200)
        verify_data = verify_res.json()
        self.assertIn("token", verify_data)

    def test_invalid_otp(self):
        verify_res = self.client.post("/api/auth/verify-otp", json={
            "contact": "nonexistent@example.com",
            "code": "000000",
            "name": "Test"
        })
        self.assertEqual(verify_res.status_code, 400)

if __name__ == "__main__":
    unittest.main()

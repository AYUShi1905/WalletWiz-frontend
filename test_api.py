#!/usr/bin/env python3
import json
import urllib.request
import urllib.error
import urllib.parse
import time
import random
import string

BASE_URL = "http://localhost:8000/api/v1"

# Colors for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def log_info(msg):
    print(f"{CYAN}[INFO]{RESET} {msg}")

def log_success(msg):
    print(f"{GREEN}[PASS]{RESET} {msg}")

def log_fail(msg):
    print(f"{RED}[FAIL]{RESET} {msg}")

def log_section(title):
    print(f"\n{BOLD}{YELLOW}=== {title} ==={RESET}")

def generate_random_email():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{random_str}@walletwiz.com"

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            response_body = response.read().decode("utf-8")
            parsed_body = {}
            if response_body:
                try:
                    parsed_body = json.loads(response_body)
                except json.JSONDecodeError:
                    parsed_body = {"raw_text": response_body}
            return status_code, parsed_body
    except urllib.error.HTTPError as e:
        status_code = e.code
        error_body = e.read().decode("utf-8")
        parsed_body = {}
        if error_body:
            try:
                parsed_body = json.loads(error_body)
            except json.JSONDecodeError:
                parsed_body = {"raw_text": error_body}
        return status_code, parsed_body
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    log_section("Checking API Connection")
    # Quick health check (root endpoint is usually outside /api/v1)
    status, body = make_request("http://localhost:8000/")
    if status == 200:
        log_success(f"Backend is online! Response: {body}")
    else:
        log_info(f"Failed to hit root endpoint directly (Status: {status}). Proceeding with /api/v1 tests...")

    # 1. AUTHENTICATION TESTS
    log_section("1. Testing Authentication")
    
    # Generate unique credentials
    email = generate_random_email()
    password = "SuperSecurePassword123!"
    first_name = "Ayushi"
    
    log_info(f"Registering user with email: {email}")
    reg_payload = {
        "email": email,
        "password": password,
        "first_name": first_name
    }
    
    # POST /auth/register
    status, body = make_request(f"{BASE_URL}/auth/register", "POST", data=reg_payload)
    if status in (200, 201, 210):
        log_success(f"User registration succeeded (Status: {status})")
        user_id = body.get("user_id")
        log_info(f"Created User ID: {user_id}")
    else:
        log_fail(f"User registration failed (Status: {status}). Response: {body}")
        return

    # Test Registration Duplicate Email Prevention
    log_info("Testing duplicate email registration prevention...")
    status_dup, body_dup = make_request(f"{BASE_URL}/auth/register", "POST", data=reg_payload)
    if status_dup == 400:
        log_success("Correctly blocked duplicate email with Status 400.")
    else:
        log_fail(f"Duplicate registration returned unexpected Status {status_dup}. Response: {body_dup}")

    # POST /auth/login
    log_info("Logging in user...")
    login_payload = {
        "email": email,
        "password": password
    }
    status, body = make_request(f"{BASE_URL}/auth/login", "POST", data=login_payload)
    
    if status == 200:
        log_success("User login succeeded.")
        access_token = body.get("access_token")
        token_type = body.get("token_type")
        log_info(f"Token Type: {token_type}")
        if not access_token:
            log_fail("Access token missing from login response.")
            return
    else:
        log_fail(f"User login failed (Status: {status}). Response: {body}")
        return

    # Prepare Auth Header
    auth_headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # 2. TRANSACTION CRUD TESTS
    log_section("2. Testing Transaction CRUD Operations")

    # 2.1 Create Transaction
    log_info("Creating a new transaction...")
    tx_payload = {
        "amount": 250.50,
        "category": "Food & Dining",
        "payment_method": "UPI",
        "merchant": "Starbucks",
        "description": "Iced Latte",
        "transaction_date": "2026-07-08T12:00:00Z"
    }
    
    status, created_tx = make_request(f"{BASE_URL}/transactions", "POST", headers=auth_headers, data=tx_payload)
    if status in (200, 201):
        log_success(f"Transaction creation succeeded (Status: {status}).")
        tx_id = created_tx.get("id")
        log_info(f"Created Transaction ID: {tx_id}")
        if created_tx.get("amount") != 250.5:
            log_fail(f"Unexpected amount in response: {created_tx.get('amount')}")
    else:
        log_fail(f"Transaction creation failed (Status: {status}). Response: {created_tx}")
        return

    # 2.2 List/Read Transactions
    log_info("Listing transactions...")
    status, list_res = make_request(f"{BASE_URL}/transactions?page=1&limit=10", "GET", headers=auth_headers)
    if status == 200:
        log_success("Listing transactions succeeded.")
        tx_list = list_res.get("data", [])
        pagination = list_res.get("pagination", {})
        log_info(f"Retrieved {len(tx_list)} transactions (Total items: {pagination.get('total_items')})")
        # Ensure our created transaction is in the list
        found = any(item.get("id") == tx_id for item in tx_list)
        if found:
            log_success("Created transaction found in the transaction list.")
        else:
            log_fail("Created transaction was not found in the transaction list.")
    else:
        log_fail(f"Listing transactions failed (Status: {status}). Response: {list_res}")

    # 2.3 Update Transaction
    log_info(f"Updating transaction {tx_id}...")
    update_payload = {
        "amount": 280.00,
        "merchant": "Starbucks Coffee"
    }
    status, updated_tx = make_request(f"{BASE_URL}/transactions/{tx_id}", "PUT", headers=auth_headers, data=update_payload)
    if status == 200:
        log_success("Updating transaction succeeded.")
        if updated_tx.get("amount") == 280.00 and updated_tx.get("merchant") == "Starbucks Coffee":
            log_success("Updates verified in the response body.")
        else:
            log_fail(f"Updates not matches. Response: {updated_tx}")
    else:
        log_fail(f"Updating transaction failed (Status: {status}). Response: {updated_tx}")

    # 3. ANALYTICS DASHBOARD TESTS
    log_section("3. Testing Analytics Dashboard")
    log_info("Fetching dashboard overview...")
    status, dashboard_res = make_request(f"{BASE_URL}/analytics/dashboard?timeframe=this-month", "GET", headers=auth_headers)
    if status == 200:
        log_success("Dashboard fetch succeeded.")
        log_info(f"Total spent: {dashboard_res.get('total_spent')}")
        log_info(f"Daily average: {dashboard_res.get('daily_average')}")
        log_info(f"Categories tracked: {[c.get('category') for c in dashboard_res.get('by_category', [])]}")
        log_info(f"Payment methods tracked: {[p.get('payment_method') for p in dashboard_res.get('by_payment_method', [])]}")
    else:
        log_fail(f"Dashboard fetch failed (Status: {status}). Response: {dashboard_res}")

    # 4. CONVERSATIONAL CHAT ENDPOINT TESTS
    log_section("4. Testing Agentic Conversational Chat")
    
    chat_payload = {
        "message": "spent 350 on UPI at Starbucks for coffee today",
        "history": []
    }
    log_info(f"Sending chat query: \"{chat_payload['message']}\"")
    status, chat_res = make_request(f"{BASE_URL}/chat", "POST", headers=auth_headers, data=chat_payload)
    if status == 200:
        log_success("Chat processing succeeded.")
        log_info(f"Agent Response: {chat_res.get('response')}")
        log_info(f"Tool Triggered: {chat_res.get('tool_triggered')}")
        log_info(f"Metadata: {chat_res.get('metadata')}")
    elif status == 429:
        log_info("Got status 429 (Rate limited). Note: Chat endpoint has rate limits.")
    else:
        log_fail(f"Chat processing failed (Status: {status}). Response: {chat_res}")

    # Test conversation history memory
    log_info("Testing chat message with conversation history...")
    history_payload = {
        "message": "And how much of that was at Starbucks?",
        "history": [
            {"role": "user", "content": "How much did I spend in total last week?"},
            {"role": "assistant", "content": "Last week you spent a total of 1850.00."}
        ]
    }
    status, chat_history_res = make_request(f"{BASE_URL}/chat", "POST", headers=auth_headers, data=history_payload)
    if status == 200:
        log_success("Chat with history succeeded.")
        log_info(f"Agent Response: {chat_history_res.get('response')}")
        log_info(f"Tool Triggered: {chat_history_res.get('tool_triggered')}")
    elif status == 429:
        log_info("Got status 429 (Rate limited).")
    else:
        log_fail(f"Chat with history failed (Status: {status}). Response: {chat_history_res}")

    # 2.4 Delete Transaction (Clean up)
    log_section("5. Clean-up: Testing Transaction Deletion")
    log_info(f"Deleting transaction {tx_id}...")
    status, delete_res = make_request(f"{BASE_URL}/transactions/{tx_id}", "DELETE", headers=auth_headers)
    if status in (200, 204):
        log_success("Deleting transaction succeeded.")
    else:
        log_fail(f"Deleting transaction failed (Status: {status}). Response: {delete_res}")

    # Verify transaction deletion by trying to update it
    log_info("Verifying transaction is deleted...")
    status, verify_res = make_request(f"{BASE_URL}/transactions/{tx_id}", "PUT", headers=auth_headers, data=update_payload)
    if status == 404:
        log_success("Verified transaction no longer exists (correctly received Status 404).")
    else:
        log_fail(f"Unexpected response checking deleted transaction. Status: {status}, Response: {verify_res}")

    log_section("Tests Completed!")

if __name__ == "__main__":
    run_tests()

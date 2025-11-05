#!/usr/bin/env python3
import bcrypt

# Hash from database
db_hash = b'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCa'

# Common passwords to test
passwords = [
    'Staff123@',
    'staff123',
    'Staff123',
    'password',
    'Password123',
    'password123',
    '123456',
    'admin123',
    'staff',
    'Staff',
    'test',
    'Test123@',
    '111111'
]

print("Testing passwords against hash from database...")
print(f"Hash: {db_hash.decode()}\n")

found = False
for pwd in passwords:
    try:
        if bcrypt.checkpw(pwd.encode(), db_hash):
            print(f"✅ MATCH FOUND: '{pwd}'")
            found = True
            break
        else:
            print(f"❌ No match: '{pwd}'")
    except Exception as e:
        print(f"Error testing '{pwd}': {e}")

if not found:
    print("\n❌ No password matched!")
    print("\nGenerating new hash for 'Staff123@'...")
    new_hash = bcrypt.hashpw('Staff123@'.encode(), bcrypt.gensalt())
    print(f"New hash: {new_hash.decode()}")


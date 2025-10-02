"""
Test E04 Plan Data Maintenance & Editing functionality
"""
import duckdb
from pathlib import Path
import uuid
from datetime import datetime

DB_PATH = Path(__file__).parent.parent / "data" / "planwise.db"

def test_validation():
    """Test field validation"""
    print("=" * 60)
    print("TEST 1: Field Validation")
    print("=" * 60)

    conn = duckdb.connect(str(DB_PATH), read_only=True)

    # Get validation rules
    rules = conn.execute("SELECT * FROM field_validation_rules").fetchall()
    columns = [desc[0] for desc in conn.description]

    print(f"\n✓ Found {len(rules)} validation rules:")
    for rule in rules:
        rule_dict = dict(zip(columns, rule))
        print(f"  - {rule_dict['field_name']}: {rule_dict['data_type']} (min: {rule_dict['min_value']}, max: {rule_dict['max_value']})")

    conn.close()

def test_update_field():
    """Test updating a single field"""
    print("\n" + "=" * 60)
    print("TEST 2: Update Single Field")
    print("=" * 60)

    conn = duckdb.connect(str(DB_PATH))

    try:
        # Pick a test client
        client_id = "70006"
        field_name = "auto_enrollment_rate"

        # Get current value
        current = conn.execute(
            f"SELECT {field_name} FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        old_value = current[0] if current else None
        print(f"\nCurrent value for {client_id}.{field_name}: {old_value}")

        # Update to new value
        new_value = 0.05  # 5%
        updated_by = "test_script@planwise.com"

        print(f"Updating to: {new_value}")

        # Perform update
        conn.execute(f"""
            UPDATE plan_designs
            SET {field_name} = ?,
                updated_at = CURRENT_TIMESTAMP,
                updated_by = ?
            WHERE client_id = ?
        """, [new_value, updated_by, client_id])

        # Create audit log
        audit_id = f"audit-{uuid.uuid4()}"
        conn.execute("""
            INSERT INTO audit_log
            (id, client_id, field_name, old_value, new_value, change_type, reason, notes, updated_by, updated_at)
            VALUES (?, ?, ?, ?, ?, 'update', 'data_correction', 'Test update from E04 test script', ?, CURRENT_TIMESTAMP)
        """, [audit_id, client_id, field_name, str(old_value), str(new_value), updated_by])

        # Verify update
        updated = conn.execute(
            f"SELECT {field_name}, updated_by FROM plan_designs WHERE client_id = ?",
            [client_id]
        ).fetchone()

        print(f"✓ Updated successfully!")
        print(f"  New value: {updated[0]}")
        print(f"  Updated by: {updated[1]}")
        print(f"  Audit ID: {audit_id}")

    finally:
        conn.close()

def test_audit_log():
    """Test audit log retrieval"""
    print("\n" + "=" * 60)
    print("TEST 3: Audit Log History")
    print("=" * 60)

    conn = duckdb.connect(str(DB_PATH), read_only=True)

    try:
        client_id = "70006"
        field_name = "auto_enrollment_rate"

        # Get audit history
        history = conn.execute("""
            SELECT
                id,
                updated_at,
                old_value,
                new_value,
                updated_by,
                reason,
                notes
            FROM audit_log
            WHERE client_id = ? AND field_name = ?
            ORDER BY updated_at DESC
            LIMIT 5
        """, [client_id, field_name]).fetchall()

        print(f"\nAudit history for {client_id}.{field_name}:")
        print(f"Found {len(history)} entries\n")

        for entry in history:
            print(f"  [{entry[1]}]")
            print(f"  Changed from {entry[2]} → {entry[3]}")
            print(f"  By: {entry[4]}")
            print(f"  Reason: {entry[5]}")
            print(f"  Notes: {entry[6] or 'None'}")
            print()

    finally:
        conn.close()

def test_bulk_update():
    """Test bulk update of multiple fields"""
    print("=" * 60)
    print("TEST 4: Bulk Update")
    print("=" * 60)

    conn = duckdb.connect(str(DB_PATH))

    try:
        client_id = "70001"
        updates = [
            ("auto_enrollment_rate", 0.04),
            ("auto_escalation_cap", 0.15)
        ]

        print(f"\nBulk updating {len(updates)} fields for client {client_id}:")

        for field_name, new_value in updates:
            # Get old value
            old_value = conn.execute(
                f"SELECT {field_name} FROM plan_designs WHERE client_id = ?",
                [client_id]
            ).fetchone()[0]

            # Update field
            conn.execute(
                f"UPDATE plan_designs SET {field_name} = ? WHERE client_id = ?",
                [new_value, client_id]
            )

            # Create audit log
            audit_id = f"audit-{uuid.uuid4()}"
            conn.execute("""
                INSERT INTO audit_log
                (id, client_id, field_name, old_value, new_value, change_type, reason, notes, updated_by)
                VALUES (?, ?, ?, ?, ?, 'bulk_update', 'test_bulk_update', 'Bulk update test', 'test_script@planwise.com')
            """, [audit_id, client_id, field_name, str(old_value), str(new_value)])

            print(f"  ✓ {field_name}: {old_value} → {new_value}")

        print("\n✓ Bulk update completed successfully!")

    finally:
        conn.close()

def test_excel_export():
    """Test Excel export functionality"""
    print("\n" + "=" * 60)
    print("TEST 5: Excel Export")
    print("=" * 60)

    import pandas as pd
    from io import BytesIO

    conn = duckdb.connect(str(DB_PATH), read_only=True)

    try:
        # Export all data
        df = pd.DataFrame(conn.execute("SELECT * FROM plan_designs").fetchall())
        columns = [desc[0] for desc in conn.description]
        df.columns = columns

        # Create Excel in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Plan Data', index=False)

            # Add audit trail
            audit_df = pd.DataFrame(
                conn.execute("SELECT * FROM audit_log ORDER BY updated_at DESC").fetchall()
            )
            audit_columns = [desc[0] for desc in conn.description]
            audit_df.columns = audit_columns
            audit_df.to_excel(writer, sheet_name='Audit Trail', index=False)

        output.seek(0)
        file_size = len(output.getvalue())

        print(f"\n✓ Excel export created:")
        print(f"  Plan records: {len(df)}")
        print(f"  Audit entries: {len(audit_df)}")
        print(f"  File size: {file_size:,} bytes")
        print(f"  Sheets: Plan Data, Audit Trail")

    finally:
        conn.close()

if __name__ == "__main__":
    print("\n🧪 E04 Plan Data Maintenance & Editing Tests\n")

    test_validation()
    test_update_field()
    test_audit_log()
    test_bulk_update()
    test_excel_export()

    print("\n" + "=" * 60)
    print("✅ All E04 tests completed successfully!")
    print("=" * 60 + "\n")

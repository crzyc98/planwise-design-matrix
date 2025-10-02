"""
Database migration: Add audit logging and validation tables for E04
"""
import duckdb
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent.parent / "data" / "planwise.db"

def run_migration():
    """Add audit_log and field_validation_rules tables"""
    conn = duckdb.connect(str(DB_PATH))

    print("Running migration: Add audit logging tables...")

    try:
        # 1. Add metadata columns to plan_designs
        print("\n1. Adding metadata columns to plan_designs...")
        conn.execute("""
            ALTER TABLE plan_designs
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        """)
        conn.execute("""
            ALTER TABLE plan_designs
            ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255)
        """)
        conn.execute("""
            ALTER TABLE plan_designs
            ADD COLUMN IF NOT EXISTS data_quality_score DECIMAL(3,2)
        """)
        conn.execute("""
            ALTER TABLE plan_designs
            ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP
        """)
        conn.execute("""
            ALTER TABLE plan_designs
            ADD COLUMN IF NOT EXISTS verified_by VARCHAR(255)
        """)
        print("✓ Metadata columns added")

        # 2. Create audit_log table
        print("\n2. Creating audit_log table...")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id VARCHAR PRIMARY KEY,
                client_id VARCHAR NOT NULL,
                field_name VARCHAR NOT NULL,
                old_value VARCHAR,
                new_value VARCHAR,
                change_type VARCHAR NOT NULL,
                reason VARCHAR NOT NULL,
                notes TEXT,
                updated_by VARCHAR(255) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                confidence_score DECIMAL(3,2)
            )
        """)

        # Create indexes
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_audit_log_client_field
            ON audit_log(client_id, field_name)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp
            ON audit_log(updated_at DESC)
        """)
        print("✓ Audit log table created with indexes")

        # 3. Create field_validation_rules table
        print("\n3. Creating field_validation_rules table...")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS field_validation_rules (
                field_name VARCHAR PRIMARY KEY,
                data_type VARCHAR NOT NULL,
                required BOOLEAN DEFAULT FALSE,
                min_value DOUBLE,
                max_value DOUBLE,
                allowed_values VARCHAR[],
                validation_regex VARCHAR,
                help_text TEXT
            )
        """)
        print("✓ Validation rules table created")

        # 4. Insert validation rules
        print("\n4. Inserting validation rules...")
        validation_rules = [
            ('auto_enrollment_rate', 'decimal', False, 0.0, 0.15, None, None,
             'Auto-enrollment default rate (0% to 15%)'),
            ('auto_escalation_cap', 'decimal', False, 0.0, 0.20, None, None,
             'Maximum auto-escalation percentage (0% to 20%)'),
            ('match_effective_rate', 'decimal', False, 0.0, 0.15, None, None,
             'Match effective rate (0% to 15%)'),
            ('vesting_schedule', 'enum', False, None, None,
             "['Immediate', '2-year cliff', '3-year cliff', '5-year cliff', 'Graded', 'Other']", None,
             'Vesting schedule type'),
            ('industry', 'enum', True, None, None,
             "['healthcare', 'higher_ed', 'manufacturing', 'nonprofit', 'government', 'other']", None,
             'Client industry classification (required)'),
            ('employee_count', 'integer', True, 1, 1000000, None, None,
             'Total number of employees (required)'),
        ]

        for rule in validation_rules:
            conn.execute("""
                INSERT INTO field_validation_rules
                (field_name, data_type, required, min_value, max_value, allowed_values, validation_regex, help_text)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (field_name) DO NOTHING
            """, rule)

        print(f"✓ Inserted {len(validation_rules)} validation rules")

        # 5. Verify migration
        print("\n5. Verifying migration...")
        audit_count = conn.execute("SELECT COUNT(*) FROM audit_log").fetchone()[0]
        rules_count = conn.execute("SELECT COUNT(*) FROM field_validation_rules").fetchone()[0]

        print(f"✓ Audit log records: {audit_count}")
        print(f"✓ Validation rules: {rules_count}")

        print("\n✅ Migration completed successfully!")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()

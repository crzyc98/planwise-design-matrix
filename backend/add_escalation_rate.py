#!/usr/bin/env python3
"""
Migration script to add auto_escalation_rate column to plan_designs table.
Sets default value of 1% (0.01) for plans with auto-escalation enabled.
"""

import duckdb
import sys

def main():
    db_path = "../data/planwise.db"  # Relative to backend directory
    
    try:
        conn = duckdb.connect(db_path)
        
        # Check if column already exists
        columns = conn.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'plan_designs'
        """).fetchall()
        
        column_names = [col[0] for col in columns]
        
        if 'auto_escalation_rate' in column_names:
            print("✓ Column 'auto_escalation_rate' already exists")
        else:
            print("Adding 'auto_escalation_rate' column to plan_designs...")
            conn.execute("""
                ALTER TABLE plan_designs
                ADD COLUMN auto_escalation_rate DECIMAL(5,4) DEFAULT 0.01
            """)
            print("✓ Column added successfully")
        
        # Update values: set to 0.01 (1%) where auto_escalation_enabled is true
        print("\nSetting default escalation rate (1%) for enabled plans...")
        result = conn.execute("""
            UPDATE plan_designs
            SET auto_escalation_rate = 0.01
            WHERE auto_escalation_enabled = true
        """)
        
        rows_updated = conn.execute("""
            SELECT COUNT(*) FROM plan_designs 
            WHERE auto_escalation_enabled = true
        """).fetchone()[0]
        
        print(f"✓ Updated {rows_updated} plans with auto-escalation enabled")
        
        # Verify the changes
        print("\nVerifying changes...")
        sample = conn.execute("""
            SELECT client_id, auto_escalation_enabled, auto_escalation_rate, auto_escalation_cap
            FROM plan_designs
            LIMIT 5
        """).fetchall()
        
        print("\nSample data:")
        print("Client ID | Escalation Enabled | Rate | Cap")
        print("-" * 50)
        for row in sample:
            print(f"{row[0]:9} | {str(row[1]):18} | {row[2] if row[2] else 'NULL':4} | {row[3] if row[3] else 'NULL'}")
        
        # Add to field_validation_rules if not exists
        print("\nAdding validation rule for auto_escalation_rate...")
        existing_rule = conn.execute("""
            SELECT COUNT(*) FROM field_validation_rules
            WHERE field_name = 'auto_escalation_rate'
        """).fetchone()[0]
        
        if existing_rule == 0:
            conn.execute("""
                INSERT INTO field_validation_rules (
                    field_name, data_type, required, min_value, max_value, 
                    allowed_values, description
                ) VALUES (
                    'auto_escalation_rate', 'decimal', false, 0.0, 0.05,
                    null, 'Annual escalation rate (e.g., 0.01 for 1%)'
                )
            """)
            print("✓ Validation rule added")
        else:
            print("✓ Validation rule already exists")
        
        conn.close()
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

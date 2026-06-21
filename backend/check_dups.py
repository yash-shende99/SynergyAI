import asyncio
import json
from app.core.config import supabase

async def main():
    try:
        # Find Axis Banks
        axis = supabase.table('companies').select('cin, name, logo_url').ilike('name', '%Axis Bank%').execute()
        print("Axis Banks found:")
        print(json.dumps(axis.data, indent=2))
        
        # Find SBIs
        sbi = supabase.table('companies').select('cin, name, logo_url').or_('name.ilike.%State Bank of India%,name.ilike.%SBI%').execute()
        print("\nSBIs found:")
        print(json.dumps(sbi.data, indent=2))
        
        # Check references for Axis Banks
        axis_cins = [c['cin'] for c in axis.data]
        if axis_cins:
            events = supabase.table('events').select('id, company_cin').in_('company_cin', axis_cins).execute()
            print(f"\nEvents referencing Axis Banks: {len(events.data)}")

        # Check Nazara and Can Fin Homes
        nazara = supabase.table('companies').select('cin, name, logo_url').ilike('name', '%Nazara%').execute()
        print("\nNazara found:")
        print(json.dumps(nazara.data, indent=2))
        
        canfin = supabase.table('companies').select('cin, name, logo_url').ilike('name', '%Can Fin%').execute()
        print("\nCan Fin found:")
        print(json.dumps(canfin.data, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

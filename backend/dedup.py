import asyncio
from app.core.config import supabase

async def main():
    try:
        # 1. Axis Bank deduplication
        axis = supabase.table('companies').select('cin, name').ilike('name', '%Axis Bank%').execute()
        axis_cins = sorted([c['cin'] for c in axis.data])
        if len(axis_cins) > 1:
            keep_cin = axis_cins[0]
            delete_cins = axis_cins[1:]
            print(f"Keeping Axis Bank {keep_cin}, deleting {delete_cins}")
            
            for old_cin in delete_cins:
                supabase.table('watchlist_companies').update({'company_cin': keep_cin}).eq('company_cin', old_cin).execute()
                supabase.table('events').update({'company_cin': keep_cin}).eq('company_cin', old_cin).execute()
                
            supabase.table('companies').delete().in_('cin', delete_cins).execute()
            print("Deleted extra Axis Banks.")

        # 2. SBI deduplication
        sbi = supabase.table('companies').select('cin, name').or_('name.ilike.%State Bank of India%,name.ilike.%SBI%').execute()
        sbi_cins = sorted([c['cin'] for c in sbi.data if 'state bank of india' in c['name'].lower() or 'sbi' in c['name'].lower()])
        if len(sbi_cins) > 1:
            keep_cin = sbi_cins[0]
            delete_cins = sbi_cins[1:]
            print(f"Keeping SBI {keep_cin}, deleting {delete_cins}")
            
            for old_cin in delete_cins:
                supabase.table('watchlist_companies').update({'company_cin': keep_cin}).eq('company_cin', old_cin).execute()
                supabase.table('events').update({'company_cin': keep_cin}).eq('company_cin', old_cin).execute()
            
            supabase.table('companies').delete().in_('cin', delete_cins).execute()
            print("Deleted extra SBIs.")

        # 3. Update Nazara and Can Fin Homes to Google Favicons
        supabase.table('companies').update({'logo_url': 'https://www.google.com/s2/favicons?domain=nazara.com&sz=128'}).ilike('name', '%Nazara%').execute()
        supabase.table('companies').update({'logo_url': 'https://www.google.com/s2/favicons?domain=canfinhomes.com&sz=128'}).ilike('name', '%Can Fin%').execute()
        print("Updated Nazara and Can Fin Homes logos.")
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())

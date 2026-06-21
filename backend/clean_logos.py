import asyncio
from app.core.config import supabase

async def main():
    try:
        # Fetch all companies
        print("Fetching companies...")
        result = supabase.table('companies').select('cin, logo_url').like('logo_url', '%logo.clearbit.com%').execute()
        
        companies_to_update = result.data
        print(f"Found {len(companies_to_update)} companies with clearbit logos.")
        
        updated_count = 0
        for comp in companies_to_update:
            old_url = comp['logo_url']
            domain = old_url.split('/')[-1]
            new_url = f"https://logo.uplead.com/{domain}"
            
            # Update the record
            supabase.table('companies').update({'logo_url': new_url}).eq('cin', comp['cin']).execute()
            updated_count += 1
            if updated_count % 50 == 0:
                print(f"Updated {updated_count} logos...")
                
        print(f"Successfully updated {updated_count} company logos in the database.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

const ProfileInfoForm = () => (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
        <h3 className="font-semibold text-white mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
                <label className="text-xs text-secondary">Full Name</label>
                <input type="text" defaultValue="Yash Shende" className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
            </div>
            <div>
                <label className="text-xs text-secondary">Job Title</label>
                <input type="text" defaultValue="Lead Analyst" className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
            </div>
            <div>
                <label className="text-xs text-secondary">Email Address</label>
                <input type="email" defaultValue="yash@synergy.ai" className="w-full mt-1 bg-background border border-border rounded-md p-2" disabled/>
            </div>
             <div>
                <label className="text-xs text-secondary">Contact Number</label>
                <input type="text" placeholder="+91..." className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
            </div>
        </div>
    </div>
);
export default ProfileInfoForm;
// This component will be rendered inside the DealWorkspaceLayout

export default function VDRPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Documents</h2>
      {/* We will add the FileTable component here */}
      <div className="p-8 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-slate-400">The file table and VDR content will go here.</p>
      </div>
    </div>
  );
}

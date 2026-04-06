import { SeoHelmet } from '../../components/shared/SeoHelmet'

export function AdminUsers() {
  return (
    <>
      <SeoHelmet title="Admin — Users" description="Manage Starlings Hospitality users." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-4">Users</h1>
        <p className="text-slate">Connect this view to your users API when ready.</p>
      </div>
    </>
  )
}

import { SeoHelmet } from '../../components/shared/SeoHelmet'

export function AdminDestinations() {
  return (
    <>
      <SeoHelmet title="Admin — Destinations" description="Manage Starlings Hospitality destinations." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-4">Destinations</h1>
        <p className="text-slate">Connect this view to your destinations API when ready.</p>
      </div>
    </>
  )
}

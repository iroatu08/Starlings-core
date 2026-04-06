import { SeoHelmet } from '../../components/shared/SeoHelmet'

export function AdminContact() {
  return (
    <>
      <SeoHelmet title="Admin — Contact" description="Starlings Hospitality contact inquiries." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-4">Contact messages</h1>
        <p className="text-slate">Connect this view to your contact form submissions when ready.</p>
      </div>
    </>
  )
}

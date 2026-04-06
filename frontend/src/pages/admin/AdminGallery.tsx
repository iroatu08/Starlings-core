import { SeoHelmet } from '../../components/shared/SeoHelmet'

export function AdminGallery() {
  return (
    <>
      <SeoHelmet title="Admin — Gallery" description="Manage Starlings Hospitality gallery." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-4">Gallery</h1>
        <p className="text-slate">Connect this view to your media or CMS when ready.</p>
      </div>
    </>
  )
}

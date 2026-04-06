import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { useAuthStore } from '../../stores/authStore'

export function Profile() {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <SeoHelmet title="Profile" description="Your Starlings Hospitality profile." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-4">Profile</h1>
        <dl className="space-y-2 text-slate">
          <div>
            <dt className="text-xs uppercase tracking-wide text-navy/60">Email</dt>
            <dd>{user?.email ?? '—'}</dd>
          </div>
        </dl>
      </div>
    </>
  )
}

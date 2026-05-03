import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { adminApi } from '../../api/admin.api'

export function AdminEmail() {
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [broadcastToAll, setBroadcastToAll] = useState(false)

  const { data: usersPage } = useQuery({
    queryKey: ['admin-users-email-picker'],
    queryFn: () => adminApi.getUsers({ page: 1, limit: 100 }).then((r) => r.data.data),
  })

  const sendMutation = useMutation({
    mutationFn: () =>
      adminApi.sendEmail({
        subject: subject.trim(),
        htmlBody: htmlBody.trim(),
        broadcastToAll: broadcastToAll || undefined,
        toEmail: toEmail.trim() || undefined,
        userId: userId || undefined,
      }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !htmlBody.trim()) return
    if (!broadcastToAll && !toEmail.trim() && !userId) return
    sendMutation.mutate()
  }

  return (
    <>
      <SeoHelmet title="Admin — Email" description="Send email to users from Starlings admin." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm max-w-3xl">
        <h1 className="font-display text-2xl font-bold text-navy mb-2">Send email</h1>
        <p className="text-slate text-sm mb-6">
          Sends via Resend API (HTTPS). HTML is sent as-is; avoid untrusted paste.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={broadcastToAll}
              onChange={(e) => {
                setBroadcastToAll(e.target.checked)
                if (e.target.checked) {
                  setToEmail('')
                  setUserId('')
                }
              }}
              className="mt-1"
            />
            <span className="text-sm text-navy">
              Broadcast to all verified, active users
            </span>
          </label>

          {!broadcastToAll && (
            <>
              <div>
                <label htmlFor="pick-user" className="label-field">Recipient user</label>
                <select
                  id="pick-user"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value)
                    if (e.target.value) setToEmail('')
                  }}
                  className="input-field w-full"
                >
                  <option value="">Select a user…</option>
                  {usersPage?.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} — {u.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="to-email" className="label-field">Or raw email</label>
                <input
                  id="to-email"
                  type="email"
                  value={toEmail}
                  onChange={(e) => {
                    setToEmail(e.target.value)
                    if (e.target.value) setUserId('')
                  }}
                  placeholder="name@example.com"
                  className="input-field w-full"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="subj" className="label-field">Subject</label>
            <input
              id="subj"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="body" className="label-field">HTML body</label>
            <textarea
              id="body"
              rows={12}
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              className="input-field w-full font-mono text-sm"
              placeholder="<p>Hello …</p>"
              required
            />
          </div>

          <button
            type="submit"
            disabled={
              sendMutation.isPending ||
              !subject.trim() ||
              !htmlBody.trim() ||
              (!broadcastToAll && !toEmail.trim() && !userId)
            }
            className="btn-primary"
          >
            {sendMutation.isPending ? 'Sending…' : 'Send'}
          </button>

          {sendMutation.isSuccess && (
            <p className="text-green-700 text-sm">
              {(sendMutation.data?.data as { message?: string } | undefined)?.message}
            </p>
          )}
          {sendMutation.isError && (
            <p className="text-red-600 text-sm">Send failed. Check recipient and try again.</p>
          )}
        </form>
      </div>
    </>
  )
}

import { useState, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { HeroImageDropzone } from '../../components/admin/HeroImageDropzone'
import { destinationsApi } from '../../api/destinations.api'
import { adminApi } from '../../api/admin.api'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Destination, Package } from '../../types/destination.types'

const emptyDest = {
  name: '',
  country: '',
  description: '',
  heroImageUrl: '',
  priceFromNgn: 0,
  priceFromUsd: 0,
  isFeatured: false,
  latitude: '' as string | number,
  longitude: '' as string | number,
}

const emptyPkg = {
  title: '',
  description: '',
  priceNgn: 0,
  priceUsd: 0,
  durationDays: 7,
  maxCapacity: 20,
  includesVisa: false,
  includesFlight: false,
  includesHotel: false,
  includesActivities: false,
}

const PKG_INCLUDES = [
  { key: 'includesVisa' as const, label: 'Visa' },
  { key: 'includesFlight' as const, label: 'Flight' },
  { key: 'includesHotel' as const, label: 'Hotel' },
  { key: 'includesActivities' as const, label: 'Activities' },
]

function LabeledField({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="label-field">
        {label}
      </label>
      {children}
    </div>
  )
}

export function AdminDestinations() {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState(emptyDest)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyDest)
  const [pkgDestId, setPkgDestId] = useState<string | null>(null)
  const [pkgForm, setPkgForm] = useState(emptyPkg)
  const [editPkg, setEditPkg] = useState<{ destId: string; pkg: Package } | null>(null)

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['destinations', 'admin'],
    queryFn: () => destinationsApi.getAll().then((r) => r.data.data),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['destinations'] })
  }

  const createDestMutation = useMutation({
    mutationFn: () =>
      adminApi.createDestination({
        name: createForm.name,
        country: createForm.country,
        description: createForm.description,
        heroImageUrl: createForm.heroImageUrl || undefined,
        priceFromNgn: Number(createForm.priceFromNgn),
        priceFromUsd: Number(createForm.priceFromUsd),
        isFeatured: createForm.isFeatured,
        latitude: createForm.latitude === '' ? undefined : Number(createForm.latitude),
        longitude: createForm.longitude === '' ? undefined : Number(createForm.longitude),
        packages: [
          {
            name: 'Base destination package',
            type: 'custom',
            description: 'Default package added at destination creation',
            priceNgn: Number(createForm.priceFromNgn) || 0,
            priceUsd: Number(createForm.priceFromUsd) || 0,
            isRemovable: true,
          },
        ],
      }),
    onSuccess: () => {
      invalidate()
      setCreating(false)
      setCreateForm(emptyDest)
    },
  })

  const patchDestMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      adminApi.patchDestination(id, body),
    onSuccess: () => {
      invalidate()
      setEditId(null)
    },
  })

  const deleteDestMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteDestination(id),
    onSuccess: invalidate,
  })

  const createPkgMutation = useMutation({
    mutationFn: (destinationId: string) =>
      adminApi.createPackage(destinationId, {
        name: pkgForm.title,
        type: 'custom',
        description: pkgForm.description || undefined,
        priceNgn: Number(pkgForm.priceNgn),
        priceUsd: Number(pkgForm.priceUsd),
        durationDays: Number(pkgForm.durationDays),
        maxCapacity: Number(pkgForm.maxCapacity),
        includesVisa: pkgForm.includesVisa,
        includesFlight: pkgForm.includesFlight,
        includesHotel: pkgForm.includesHotel,
        includesActivities: pkgForm.includesActivities,
      }),
    onSuccess: () => {
      invalidate()
      setPkgDestId(null)
      setPkgForm(emptyPkg)
    },
  })

  const patchPkgMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      adminApi.patchPackage(editPkg?.destId || '', id, body),
    onSuccess: () => {
      invalidate()
      setEditPkg(null)
    },
  })

  const deletePkgMutation = useMutation({
    mutationFn: ({ destinationId, packageId }: { destinationId: string; packageId: string }) =>
      adminApi.deletePackage(destinationId, packageId),
    onSuccess: invalidate,
  })

  const startEdit = (d: Destination) => {
    setEditId(d.id)
    setEditForm({
      name: d.name,
      country: d.country,
      description: d.description,
      heroImageUrl: d.heroImageUrl || '',
      priceFromNgn: d.priceFromNgn,
      priceFromUsd: d.priceFromUsd,
      isFeatured: d.isFeatured,
      latitude: d.latitude ?? '',
      longitude: d.longitude ?? '',
    })
  }

  const saveEdit = () => {
    if (!editId) return
    patchDestMutation.mutate({
      id: editId,
      body: {
        name: editForm.name,
        country: editForm.country,
        description: editForm.description,
        heroImageUrl: editForm.heroImageUrl || undefined,
        priceFromNgn: Number(editForm.priceFromNgn),
        priceFromUsd: Number(editForm.priceFromUsd),
        isFeatured: editForm.isFeatured,
        latitude: editForm.latitude === '' ? undefined : Number(editForm.latitude),
        longitude: editForm.longitude === '' ? undefined : Number(editForm.longitude),
      },
    })
  }

  return (
    <>
      <SeoHelmet title="Admin — Destinations" description="Manage Starlings Hospitality destinations." />
      <div className="space-y-8">
        <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-2 border-b border-border/60 pb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-navy">Destinations</h1>
              <p className="mt-1 text-sm text-slate">Create destinations, set hero imagery, and manage packages.</p>
            </div>
            <button
              type="button"
              onClick={() => setCreating((c) => !c)}
              className="btn-primary shrink-0 text-sm"
            >
              {creating ? 'Close form' : 'Add destination'}
            </button>
          </div>

          <div className="pt-6">
            {creating && (
              <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-off-white/90 to-white p-5 text-sm shadow-inner md:p-6">
                <h2 className="font-display text-lg font-semibold text-navy">New destination</h2>
                <p className="mt-1 text-xs text-slate">Required fields are marked. Upload a hero image or leave it empty.</p>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <LabeledField id="admin-dest-create-name" label="Destination name">
                    <input
                      id="admin-dest-create-name"
                      className="input-field"
                      placeholder="e.g. Zanzibar"
                      value={createForm.name}
                      onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </LabeledField>
                  <LabeledField id="admin-dest-create-country" label="Country">
                    <input
                      id="admin-dest-create-country"
                      className="input-field"
                      placeholder="e.g. Tanzania"
                      value={createForm.country}
                      onChange={(e) => setCreateForm((f) => ({ ...f, country: e.target.value }))}
                    />
                  </LabeledField>
                  <div className="md:col-span-2">
                    <label htmlFor="admin-dest-create-hero" className="label-field">
                      Hero image
                    </label>
                    <p className="mb-2 text-xs text-slate">Drag and drop an image, or click to choose a file. Images are stored via the gallery upload.</p>
                    <HeroImageDropzone
                      inputId="admin-dest-create-hero"
                      value={createForm.heroImageUrl}
                      onHeroUrlChange={(url) => setCreateForm((f) => ({ ...f, heroImageUrl: url }))}
                      disabled={createDestMutation.isPending}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <LabeledField id="admin-dest-create-desc" label="Description">
                      <textarea
                        id="admin-dest-create-desc"
                        className="input-field min-h-[88px]"
                        rows={3}
                        placeholder="Short description for listings and detail pages"
                        value={createForm.description}
                        onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                      />
                    </LabeledField>
                  </div>
                  <LabeledField id="admin-dest-create-ngn" label="Price from (NGN)">
                    <input
                      id="admin-dest-create-ngn"
                      className="input-field"
                      type="number"
                      min={0}
                      value={createForm.priceFromNgn}
                      onChange={(e) => setCreateForm((f) => ({ ...f, priceFromNgn: Number(e.target.value) }))}
                    />
                  </LabeledField>
                  <LabeledField id="admin-dest-create-usd" label="Price from (USD)">
                    <input
                      id="admin-dest-create-usd"
                      className="input-field"
                      type="number"
                      min={0}
                      value={createForm.priceFromUsd}
                      onChange={(e) => setCreateForm((f) => ({ ...f, priceFromUsd: Number(e.target.value) }))}
                    />
                  </LabeledField>
                  <LabeledField id="admin-dest-create-lat" label="Latitude (optional)">
                    <input
                      id="admin-dest-create-lat"
                      className="input-field"
                      type="number"
                      step="any"
                      placeholder="e.g. -6.1659"
                      value={createForm.latitude}
                      onChange={(e) => setCreateForm((f) => ({ ...f, latitude: e.target.value }))}
                    />
                  </LabeledField>
                  <LabeledField id="admin-dest-create-lng" label="Longitude (optional)">
                    <input
                      id="admin-dest-create-lng"
                      className="input-field"
                      type="number"
                      step="any"
                      placeholder="e.g. 39.2026"
                      value={createForm.longitude}
                      onChange={(e) => setCreateForm((f) => ({ ...f, longitude: e.target.value }))}
                    />
                  </LabeledField>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/50 pt-5">
                  <label htmlFor="admin-dest-create-featured" className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
                    <input
                      id="admin-dest-create-featured"
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                      checked={createForm.isFeatured}
                      onChange={(e) => setCreateForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                    />
                    Featured destination
                  </label>
                  <button
                    type="button"
                    disabled={createDestMutation.isPending || !createForm.name || !createForm.country}
                    onClick={() => createDestMutation.mutate()}
                    className="btn-navy text-sm"
                  >
                    {createDestMutation.isPending ? 'Saving…' : 'Create destination'}
                  </button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 shimmer-bg rounded-2xl" />
                ))}
              </div>
            ) : (
              <ul className="space-y-5 pt-2">
                {destinations.map((d) => (
                  <li
                    key={d.id}
                    className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                  >
                    {editId === d.id ? (
                      <div className="space-y-4 p-5 text-sm md:p-6">
                        <h2 className="font-display text-lg font-semibold text-navy">Edit {d.name}</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                          <LabeledField id="admin-dest-edit-name" label="Destination name">
                            <input
                              id="admin-dest-edit-name"
                              className="input-field"
                              value={editForm.name}
                              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                            />
                          </LabeledField>
                          <LabeledField id="admin-dest-edit-country" label="Country">
                            <input
                              id="admin-dest-edit-country"
                              className="input-field"
                              value={editForm.country}
                              onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                            />
                          </LabeledField>
                          <div className="md:col-span-2">
                            <label htmlFor="admin-dest-edit-hero" className="label-field">
                              Hero image
                            </label>
                            <p className="mb-2 text-xs text-slate">Upload replaces the hero URL. Saved when you click Save below.</p>
                            <HeroImageDropzone
                              inputId="admin-dest-edit-hero"
                              value={editForm.heroImageUrl}
                              onHeroUrlChange={(url) => setEditForm((f) => ({ ...f, heroImageUrl: url }))}
                              destinationId={editId}
                              disabled={patchDestMutation.isPending}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <LabeledField id="admin-dest-edit-desc" label="Description">
                              <textarea
                                id="admin-dest-edit-desc"
                                className="input-field min-h-[88px]"
                                rows={3}
                                value={editForm.description}
                                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                              />
                            </LabeledField>
                          </div>
                          <LabeledField id="admin-dest-edit-ngn" label="Price from (NGN)">
                            <input
                              id="admin-dest-edit-ngn"
                              className="input-field"
                              type="number"
                              value={editForm.priceFromNgn}
                              onChange={(e) => setEditForm((f) => ({ ...f, priceFromNgn: Number(e.target.value) }))}
                            />
                          </LabeledField>
                          <LabeledField id="admin-dest-edit-usd" label="Price from (USD)">
                            <input
                              id="admin-dest-edit-usd"
                              className="input-field"
                              type="number"
                              value={editForm.priceFromUsd}
                              onChange={(e) => setEditForm((f) => ({ ...f, priceFromUsd: Number(e.target.value) }))}
                            />
                          </LabeledField>
                          <LabeledField id="admin-dest-edit-lat" label="Latitude (optional)">
                            <input
                              id="admin-dest-edit-lat"
                              className="input-field"
                              type="number"
                              step="any"
                              value={editForm.latitude}
                              onChange={(e) => setEditForm((f) => ({ ...f, latitude: e.target.value }))}
                            />
                          </LabeledField>
                          <LabeledField id="admin-dest-edit-lng" label="Longitude (optional)">
                            <input
                              id="admin-dest-edit-lng"
                              className="input-field"
                              type="number"
                              step="any"
                              value={editForm.longitude}
                              onChange={(e) => setEditForm((f) => ({ ...f, longitude: e.target.value }))}
                            />
                          </LabeledField>
                        </div>
                        <label htmlFor="admin-dest-edit-featured" className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
                          <input
                            id="admin-dest-edit-featured"
                            type="checkbox"
                            className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                            checked={editForm.isFeatured}
                            onChange={(e) => setEditForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                          />
                          Featured destination
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={saveEdit} className="btn-primary text-sm">
                            Save changes
                          </button>
                          <button type="button" onClick={() => setEditId(null)} className="btn-outline text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 md:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 flex-1 gap-4">
                            {d.heroImageUrl ? (
                              <div className="hidden shrink-0 overflow-hidden rounded-xl border border-border/60 shadow-sm sm:block sm:h-24 sm:w-36">
                                <img src={d.heroImageUrl} alt="" className="h-full w-full object-cover" />
                              </div>
                            ) : null}
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-display text-xl font-bold text-navy">{d.name}</h2>
                                {d.isFeatured ? (
                                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">
                                    Featured
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-slate text-sm">
                                {d.country} · from {formatCurrency(d.priceFromNgn, 'NGN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 flex-wrap gap-2">
                            <button type="button" onClick={() => startEdit(d)} className="btn-outline px-4 py-2 text-xs">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete ${d.name}?`)) deleteDestMutation.mutate(d.id)
                              }}
                              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setPkgDestId((id) => (id === d.id ? null : d.id))}
                              className="btn-navy px-4 py-2 text-xs"
                            >
                              Add package
                            </button>
                          </div>
                        </div>

                        {pkgDestId === d.id && (
                          <div className="mt-5 rounded-xl border border-border/70 bg-off-white/60 p-4 text-sm shadow-inner md:p-5">
                            <h3 className="font-display text-base font-semibold text-navy">New package — {d.name}</h3>
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <LabeledField id={`admin-pkg-new-title-${d.id}`} label="Package title">
                                <input
                                  id={`admin-pkg-new-title-${d.id}`}
                                  className="input-field"
                                  placeholder="e.g. Premium week"
                                  value={pkgForm.title}
                                  onChange={(e) => setPkgForm((f) => ({ ...f, title: e.target.value }))}
                                />
                              </LabeledField>
                              <div className="hidden md:block" aria-hidden />
                              <div className="md:col-span-2">
                                <LabeledField id={`admin-pkg-new-desc-${d.id}`} label="Description">
                                  <textarea
                                    id={`admin-pkg-new-desc-${d.id}`}
                                    className="input-field min-h-[72px]"
                                    rows={2}
                                    placeholder="What is included or special about this package"
                                    value={pkgForm.description}
                                    onChange={(e) => setPkgForm((f) => ({ ...f, description: e.target.value }))}
                                  />
                                </LabeledField>
                              </div>
                              <LabeledField id={`admin-pkg-new-ngn-${d.id}`} label="Price (NGN)">
                                <input
                                  id={`admin-pkg-new-ngn-${d.id}`}
                                  className="input-field"
                                  type="number"
                                  min={0}
                                  value={pkgForm.priceNgn}
                                  onChange={(e) => setPkgForm((f) => ({ ...f, priceNgn: Number(e.target.value) }))}
                                />
                              </LabeledField>
                              <LabeledField id={`admin-pkg-new-usd-${d.id}`} label="Price (USD)">
                                <input
                                  id={`admin-pkg-new-usd-${d.id}`}
                                  className="input-field"
                                  type="number"
                                  min={0}
                                  value={pkgForm.priceUsd}
                                  onChange={(e) => setPkgForm((f) => ({ ...f, priceUsd: Number(e.target.value) }))}
                                />
                              </LabeledField>
                              <LabeledField id={`admin-pkg-new-days-${d.id}`} label="Duration (days)">
                                <input
                                  id={`admin-pkg-new-days-${d.id}`}
                                  className="input-field"
                                  type="number"
                                  min={1}
                                  value={pkgForm.durationDays}
                                  onChange={(e) => setPkgForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
                                />
                              </LabeledField>
                              <LabeledField id={`admin-pkg-new-cap-${d.id}`} label="Max capacity">
                                <input
                                  id={`admin-pkg-new-cap-${d.id}`}
                                  className="input-field"
                                  type="number"
                                  min={1}
                                  value={pkgForm.maxCapacity}
                                  onChange={(e) => setPkgForm((f) => ({ ...f, maxCapacity: Number(e.target.value) }))}
                                />
                              </LabeledField>
                            </div>
                            <fieldset className="mt-4 border-0 p-0">
                              <legend className="label-field mb-2">Includes</legend>
                              <div className="flex flex-wrap gap-4 text-sm">
                                {PKG_INCLUDES.map(({ key, label }) => (
                                  <label key={key} htmlFor={`admin-pkg-new-${d.id}-${key}`} className="flex cursor-pointer items-center gap-2 text-navy">
                                    <input
                                      id={`admin-pkg-new-${d.id}-${key}`}
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                                      checked={pkgForm[key]}
                                      onChange={(e) => setPkgForm((f) => ({ ...f, [key]: e.target.checked }))}
                                    />
                                    {label}
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                            <button
                              type="button"
                              disabled={createPkgMutation.isPending || !pkgForm.title}
                              onClick={() => createPkgMutation.mutate(d.id)}
                              className="btn-primary mt-4 text-sm"
                            >
                              {createPkgMutation.isPending ? 'Creating…' : 'Create package'}
                            </button>
                          </div>
                        )}

                        <div className="mt-5 border-t border-border/50 pt-5">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate">Packages</p>
                          <ul className="space-y-3">
                            {(d.packages ?? []).map((p) => (
                              <li
                                key={p.id}
                                className="rounded-xl border border-border/50 bg-off-white/40 p-3 text-sm md:p-4"
                              >
                                {editPkg?.pkg.id === p.id ? (
                                  <div className="space-y-3">
                                    <LabeledField id={`admin-pkg-edit-title-${p.id}`} label="Package title">
                                      <input
                                        id={`admin-pkg-edit-title-${p.id}`}
                                        className="input-field"
                                        value={editPkg.pkg.title}
                                        onChange={(e) =>
                                          setEditPkg((cur) => cur && { ...cur, pkg: { ...cur.pkg, title: e.target.value } })
                                        }
                                      />
                                    </LabeledField>
                                    <div className="grid grid-cols-2 gap-3">
                                      <LabeledField id={`admin-pkg-edit-ngn-${p.id}`} label="Price (NGN)">
                                        <input
                                          id={`admin-pkg-edit-ngn-${p.id}`}
                                          className="input-field"
                                          type="number"
                                          value={editPkg.pkg.priceNgn}
                                          onChange={(e) =>
                                            setEditPkg((cur) =>
                                              cur && { ...cur, pkg: { ...cur.pkg, priceNgn: Number(e.target.value) } },
                                            )
                                          }
                                        />
                                      </LabeledField>
                                      <LabeledField id={`admin-pkg-edit-usd-${p.id}`} label="Price (USD)">
                                        <input
                                          id={`admin-pkg-edit-usd-${p.id}`}
                                          className="input-field"
                                          type="number"
                                          value={editPkg.pkg.priceUsd}
                                          onChange={(e) =>
                                            setEditPkg((cur) =>
                                              cur && { ...cur, pkg: { ...cur.pkg, priceUsd: Number(e.target.value) } },
                                            )
                                          }
                                        />
                                      </LabeledField>
                                      <div className="col-span-2">
                                        <LabeledField id={`admin-pkg-edit-days-${p.id}`} label="Duration (days)">
                                          <input
                                            id={`admin-pkg-edit-days-${p.id}`}
                                            className="input-field"
                                            type="number"
                                            value={editPkg.pkg.durationDays}
                                            onChange={(e) =>
                                              setEditPkg((cur) =>
                                                cur && { ...cur, pkg: { ...cur.pkg, durationDays: Number(e.target.value) } },
                                              )
                                            }
                                          />
                                        </LabeledField>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          patchPkgMutation.mutate({
                                            id: p.id,
                                            body: {
                                              name: editPkg.pkg.title,
                                              priceNgn: editPkg.pkg.priceNgn,
                                              priceUsd: editPkg.pkg.priceUsd,
                                              durationDays: editPkg.pkg.durationDays,
                                            },
                                          })
                                        }
                                        className="btn-primary text-xs py-2"
                                      >
                                        Save package
                                      </button>
                                      <button type="button" onClick={() => setEditPkg(null)} className="btn-outline text-xs py-2">
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                                    <div className="min-w-0 space-y-1">
                                      <span className="font-medium text-navy">{p.title}</span>
                                      <p className="text-gold font-semibold">
                                        {formatCurrency(p.priceNgn, 'NGN')} · {p.durationDays} days
                                      </p>
                                      <p className="text-xs text-slate">
                                        {[p.includesVisa && 'Visa', p.includesFlight && 'Flight', p.includesHotel && 'Hotel', p.includesActivities && 'Activities'].filter(Boolean).join(' · ') || 'No include flags'}
                                      </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditPkg({ destId: d.id, pkg: p })}
                                        className="text-gold text-xs font-semibold underline-offset-2 hover:underline"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm('Delete this package?')) {
                                            deletePkgMutation.mutate({ destinationId: d.id, packageId: p.id })
                                          }
                                        }}
                                        className="text-xs font-semibold text-red-600"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

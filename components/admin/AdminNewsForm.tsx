'use client'

import Image from 'next/image'
import { useActionState, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createNewsPostAction,
  updateNewsPostAction,
  goToNewsListAction,
  type AdminNewsFormState,
} from '@/app/admin/news/actions'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AdminNewsForm(props:
  | { mode: 'create' }
  | {
      mode: 'edit'
      initial: {
        id: string
        title: string
        slug: string
        excerpt: string | null
        body: string
        coverImageUrl: string | null
        galleryUrls: string[]
        published: boolean
      }
    }) {
  const { t } = useLanguage()
  const router = useRouter()
  const initialState: AdminNewsFormState = {}
  const action = props.mode === 'create' ? createNewsPostAction : updateNewsPostAction
  const [state, formAction] = useActionState(action, initialState)

  const [gallery, setGallery] = useState<string[]>(props.mode === 'edit' ? props.initial.galleryUrls : [])
  const [removeCover, setRemoveCover] = useState(false)

  const galleryJson = useMemo(() => JSON.stringify(gallery), [gallery])

  useEffect(() => {
    if (!state || !('success' in state) || !state.success) return
    router.push('/admin/news')
  }, [state, router])

  const errorText =
    state && 'error' in state
      ? state.error === 'validation'
        ? t('admin.errValidation')
        : state.error === 'conflict'
          ? t('admin.errSlugConflict')
          : state.error === 'upload'
            ? t('admin.errUpload')
            : t('admin.errGeneric')
      : null

  return (
    <section className="admin-form-card">
      <div className="admin-page-head">
        <h1 className="admin-title">{props.mode === 'create' ? t('admin.newsNewTitle') : t('admin.newsEditTitle')}</h1>
        <form action={goToNewsListAction}>
          <button type="submit" className="admin-btn admin-btn-secondary">
            {t('admin.back')}
          </button>
        </form>
      </div>

      {errorText ? <p className="admin-alert" role="alert">{errorText}</p> : null}

      <form action={formAction} className="admin-form">
        {props.mode === 'edit' ? <input type="hidden" name="id" value={props.initial.id} /> : null}

        <label className="admin-field">
          <span>{t('admin.fieldTitle')}</span>
          <input name="title" type="text" maxLength={200} defaultValue={props.mode === 'edit' ? props.initial.title : ''} required />
        </label>

        <label className="admin-field">
          <span>{t('admin.fieldSlug')}</span>
          <input name="slug" type="text" maxLength={120} defaultValue={props.mode === 'edit' ? props.initial.slug : ''} required />
          <small className="admin-hint">{t('admin.slugHint')}</small>
        </label>

        <label className="admin-field">
          <span>{t('admin.fieldExcerpt')}</span>
          <textarea name="excerpt" rows={3} maxLength={500} defaultValue={props.mode === 'edit' ? props.initial.excerpt ?? '' : ''} />
        </label>

        <label className="admin-field">
          <span>{t('admin.fieldBody')}</span>
          <textarea name="body" rows={12} maxLength={50000} defaultValue={props.mode === 'edit' ? props.initial.body : ''} required />
        </label>

        <label className="admin-field">
          <span>{t('admin.fieldCover')}</span>
          {props.mode === 'edit' && props.initial.coverImageUrl && !removeCover ? (
            <div className="admin-cover-row">
              <Image src={props.initial.coverImageUrl} alt="" width={320} height={180} className="admin-cover-img" unoptimized />
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => setRemoveCover(true)}>
                {t('admin.removeCover')}
              </button>
            </div>
          ) : null}
          <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
          <input type="hidden" name="removeCover" value={removeCover ? '1' : '0'} />
          <small className="admin-hint">{t('admin.coverHint')}</small>
        </label>

        <div className="admin-field">
          <span>{t('admin.fieldGallery')}</span>
          <input type="file" name="galleryUpload" accept="image/jpeg,image/png,image/webp" multiple className="admin-gallery-files" />
          <small className="admin-hint">{t('admin.galleryUploadHint')}</small>
          {gallery.length ? (
            <ul className="admin-gallery-list">
              {gallery.map((u) => (
                <li key={u} className="admin-gallery-item">
                  <div className="admin-gallery-preview">
                    {u.startsWith('/') ? (
                      <Image src={u} alt="" width={72} height={48} className="admin-gallery-thumb" unoptimized />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u} alt="" className="admin-gallery-thumb admin-gallery-thumb-external" />
                    )}
                    <span className="admin-mono">{u}</span>
                  </div>
                  <button type="button" className="admin-link" onClick={() => setGallery((prev) => prev.filter((x) => x !== u))}>
                    {t('admin.remove')}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <input type="hidden" name="galleryUrls" value={galleryJson} />
        </div>

        <label className="admin-field admin-inline">
          <input name="published" type="checkbox" defaultChecked={props.mode === 'edit' ? props.initial.published : false} value="1" />
          <span>{t('admin.fieldPublished')}</span>
        </label>

        <button type="submit" className="admin-btn">
          {t('admin.save')}
        </button>
      </form>
    </section>
  )
}


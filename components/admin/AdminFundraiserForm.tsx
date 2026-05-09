'use client'

import Image from 'next/image'
import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createFundraiserAction,
  updateFundraiserAction,
  goToFundraisersListAction,
  type AdminFundraiserFormState,
} from '@/app/admin/fundraisers/actions'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AdminFundraiserForm(props:
  | { mode: 'create' }
  | {
      mode: 'edit'
      initial: {
        id: string
        title: string
        tag: string | null
        description: string
        goalAmount: number
        raisedAmount: number
        coverImageUrl: string | null
        published: boolean
        archived: boolean
      }
    }) {
  const { t } = useLanguage()
  const router = useRouter()
  const initialState: AdminFundraiserFormState = {}
  const action = props.mode === 'create' ? createFundraiserAction : updateFundraiserAction
  const [state, formAction] = useActionState(action, initialState)

  const [removeCover, setRemoveCover] = useState(false)

  useEffect(() => {
    if (!state || !('success' in state) || !state.success) return
    router.push('/admin/fundraisers')
  }, [state, router])

  const errorText =
    state && 'error' in state
      ? state.error === 'validation'
        ? t('admin.errValidation')
        : state.error === 'upload'
          ? t('admin.errUpload')
          : t('admin.errGeneric')
      : null

  return (
    <section className="admin-form-card">
      <div className="admin-page-head">
        <h1 className="admin-title">{props.mode === 'create' ? t('admin.fundraiserNewTitle') : t('admin.fundraiserEditTitle')}</h1>
        <form action={goToFundraisersListAction}>
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
          <span>{t('admin.fieldTag')}</span>
          <input name="tag" type="text" maxLength={60} defaultValue={props.mode === 'edit' ? props.initial.tag ?? '' : ''} />
          <small className="admin-hint">{t('admin.tagHint')}</small>
        </label>

        <label className="admin-field">
          <span>{t('admin.fieldDescription')}</span>
          <textarea name="description" rows={6} maxLength={10000} defaultValue={props.mode === 'edit' ? props.initial.description : ''} required />
        </label>

        <div className="admin-field admin-split">
          <label className="admin-field">
            <span>{t('admin.fieldGoalUah')}</span>
            <input name="goalAmount" type="text" defaultValue={props.mode === 'edit' ? String(props.initial.goalAmount) : ''} required />
          </label>
          <label className="admin-field">
            <span>{t('admin.fieldRaisedUah')}</span>
            <input name="raisedAmount" type="text" defaultValue={props.mode === 'edit' ? String(props.initial.raisedAmount) : '0'} />
          </label>
        </div>

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

        <label className="admin-field admin-inline">
          <input name="published" type="checkbox" defaultChecked={props.mode === 'edit' ? props.initial.published : false} value="1" />
          <span>{t('admin.fieldPublished')}</span>
        </label>

        <label className="admin-field admin-inline">
          <input name="archived" type="checkbox" defaultChecked={props.mode === 'edit' ? props.initial.archived : false} value="1" />
          <span>{t('admin.fieldArchived')}</span>
        </label>

        <button type="submit" className="admin-btn">
          {t('admin.save')}
        </button>
      </form>
    </section>
  )
}

'use client'

import { Save } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ... (Bagian Types & Storage Utilities tidak berubah)
export type AdvancedParams = {
  version: number
  len: number
  prefix: string
  suffix: string
  raw: boolean
}

const ADV_KEY = 'kpwgen:advanced:v1'

type StoredAdvanced = {
  v: 1
  savedAt: number
  exp: number | null
  data: AdvancedParams
}

export function saveAdvancedParams(data: AdvancedParams, ttlMs: number | null) {
  const now = Date.now()
  const payload: StoredAdvanced = {
    v: 1,
    savedAt: now,
    exp: ttlMs ? now + ttlMs : null,
    data,
  }
  localStorage.setItem(ADV_KEY, JSON.stringify(payload))
}

export function readAdvancedParams():
  | { status: 'empty' }
  | { status: 'ok'; stored: StoredAdvanced }
  | { status: 'expired'; expiredAt: number }
  | { status: 'corrupt' } {
  const raw = localStorage.getItem(ADV_KEY)
  if (!raw) return { status: 'empty' }
  try {
    const stored = JSON.parse(raw) as StoredAdvanced
    if (stored.exp && Date.now() > stored.exp) {
      localStorage.removeItem(ADV_KEY)
      return { status: 'expired', expiredAt: stored.exp }
    }
    return { status: 'ok', stored }
  } catch (e) {
    localStorage.removeItem(ADV_KEY)
    return { status: 'corrupt' }
  }
}

export function clearAdvancedParams() {
  localStorage.removeItem(ADV_KEY)
}

const ttlOptions = [
  { label: '3 hours', value: '3h' as const, ms: 3 * 60 * 60 * 1000 },
  { label: '24 hours', value: '24h' as const, ms: 24 * 60 * 60 * 1000 },
  { label: '48 hours', value: '48h' as const, ms: 48 * 60 * 60 * 1000 },
  { label: 'No expiry', value: 'none' as const, ms: null },
]

type TtlValue = typeof ttlOptions[number]['value']

function ttlToMs(v: TtlValue): number | null {
  const opt = ttlOptions.find(o => o.value === v)
  return opt ? opt.ms : 24 * 60 * 60 * 1000
}


export function AdvancedSaveControl({
  data,
  onSaved,
  buttonClassName,
}: {
  data: AdvancedParams
  onSaved?: (expiry: number | null) => void
  buttonClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [ttl, setTtl] = useState<TtlValue>('24h')
  const [saving, setSaving] = useState(false)
  const [expanding, setExpanding] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const [buttonRect, setButtonRect] = useState<{ width: number, height: number } | null>(null);

  // PERUBAHAN 1: Menyempurnakan timing animasi open dan close
  const handleOpen = useCallback(() => {
    if (buttonRef.current) {
        setButtonRect({
            width: buttonRef.current.offsetWidth,
            height: buttonRef.current.offsetHeight,
        });
    }
    setOpen(true);

    setTimeout(() => {
        setExpanding(true);

        setTimeout(() => {
            setShowContent(true);
        }, 300);
    }, 10);
  }, []);

  const handleClose = useCallback(() => {
    setShowContent(false);

    setTimeout(() => {
        setExpanding(false);
        
        setTimeout(() => {
            setOpen(false);
        }, 300);
    }, 0);
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    try {
      const ms = ttlToMs(ttl);
      saveAdvancedParams(data, ms);
      onSaved?.(ms);
      handleClose();
    } finally {
      setSaving(false);
    }
  }, [data, onSaved, ttl, handleClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  const buttonCn = useMemo(
    () =>
      buttonClassName ||
      'gap-2 flex flex-row items-center px-3 py-1.5 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white/90 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-md transition',
    [buttonClassName]
  );

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        type="button" 
        className={buttonCn} 
        onClick={handleOpen}
        style={{ 
          opacity: open ? 0 : 1,
          transition: 'opacity 200ms ease-out'
        }}
      >
        <Save className='w-4 h-4'/>
        Save
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />

          <div
            className="absolute z-50"
            style={{
              top: 0,
              right: 0,
              transformOrigin: 'top right',
              
              width: expanding ? '384px' : buttonRect ? `${buttonRect.width}px` : 'auto',
              height: expanding ? '288px' : buttonRect ? `${buttonRect.height}px` : 'auto',
              
              transition: 'width 300ms cubic-bezier(0.5, 0.5, 0.1, 1), height 300ms cubic-bezier(0.5, 0, 0.1, 1)',
              overflow: 'hidden',
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="w-full h-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl text-white"
            >
              <div 
                className="gap-2 absolute inset-0 flex items-center justify-center text-sm"
                style={{
                  opacity: expanding ? 0 : 1,
                  transition: 'opacity 150ms ease-out',
                  pointerEvents: 'none'
                }}
              >
                <Save className='w-4 h-4'/>
                Save
              </div>

              <div
                className="p-5 h-full flex flex-col"
                style={{
                  opacity: showContent ? 1 : 0,
                  transition: 'opacity 200ms ease-out',
                  visibility: showContent ? 'visible' : 'hidden',
                }}
              >
                <h3 className="text-lg font-semibold">Save advanced parameters?</h3>
                <p className="mt-2 text-sm text-white/80">
                  Please choose an expiry time for these advanced settings. They are saved locally in your browser (localStorage). The master key is <span className="font-semibold">never</span> saved.
                </p>

                <div className="mt-4 flex-1">
                  <label className="block text-sm text-white/80">Expire after</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    value={ttl}
                    onChange={e => setTtl(e.target.value as TtlValue)}
                  >
                    {ttlOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-white/90 transition"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-sm font-medium disabled:opacity-60 transition"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
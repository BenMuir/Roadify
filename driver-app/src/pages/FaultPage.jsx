import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import AppHeader from '../components/AppHeader'


function ChoiceButton({ selected, onClick, children, variant = 'default' }) {
  const styles = {
    default: selected
      ? 'bg-brand/15 border-brand text-brand-light shadow-lg shadow-brand/10'
      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
    danger: selected
      ? 'bg-severity-major/15 border-severity-major text-severity-major shadow-lg shadow-severity-major/10'
      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
    success: selected
      ? 'bg-severity-minor/15 border-severity-minor text-severity-minor shadow-lg shadow-severity-minor/10'
      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
    muted: selected
      ? 'bg-white/10 border-white/20 text-white/70'
      : 'bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/5',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-2 flex items-center justify-center gap-2.5 ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

function QuestionBlock({ question, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-3"
    >
      <div>
        <h3 className="text-lg font-bold text-white">{question}</h3>
        {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="space-y-2">{children}</div>
    </motion.div>
  )
}

export default function FaultPage({ formData, updateFormData, userProfile }) {
  const navigate = useNavigate()
  const [editingVehicle, setEditingVehicle] = useState(false)

  const update = (fields) => updateFormData(fields)

  const showThirdPartyPresent = formData.thirdPartyInvolved === true
  const showFault = formData.thirdPartyInvolved !== null

  const editInputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all'

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-[100dvh] bg-navy"
    >
      <AppHeader backTo="/" />
      <div className="px-6 pb-3">
        <p className="text-brand-light/60 text-xs font-semibold uppercase tracking-widest mb-1">Step 1 of 3</p>
        <h2 className="text-2xl font-extrabold text-white">Incident Details</h2>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-2 pb-6 gap-5 overflow-y-auto">
        {/* Vehicle card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Your Vehicle</p>
            <button
              onClick={() => setEditingVehicle(!editingVehicle)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
            >
              {editingVehicle ? (
                <svg className="w-4 h-4 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {editingVehicle ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-2.5 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase font-medium mb-0.5 block">Make</label>
                    <input
                      type="text"
                      value={formData.vehicleMake}
                      onChange={(e) => update({ vehicleMake: e.target.value })}
                      placeholder="Toyota"
                      className={editInputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase font-medium mb-0.5 block">Model</label>
                    <input
                      type="text"
                      value={formData.vehicleModel}
                      onChange={(e) => update({ vehicleModel: e.target.value })}
                      placeholder="HiLux"
                      className={editInputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase font-medium mb-0.5 block">Plate</label>
                    <input
                      type="text"
                      value={formData.vehicleRego}
                      onChange={(e) => update({ vehicleRego: e.target.value.toUpperCase() })}
                      placeholder="ABC 123"
                      className={`${editInputClass} uppercase`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase font-medium mb-0.5 block">Color</label>
                    <input
                      type="text"
                      value={formData.vehicleColor}
                      onChange={(e) => update({ vehicleColor: e.target.value })}
                      placeholder="Silver"
                      className={editInputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase font-medium mb-0.5 block">Year</label>
                  <input
                    type="text"
                    value={formData.vehicleYear}
                    onChange={(e) => update({ vehicleYear: e.target.value })}
                    placeholder="2022"
                    className={editInputClass}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 mt-3"
              >
                <div className="w-12 h-12 bg-brand/15 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}</p>
                  <p className="text-white/40 text-xs">{formData.vehicleColor} &middot; {formData.vehicleRego}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Q1: Third party involved? */}
        <QuestionBlock
          question="Was another vehicle involved?"
          subtitle="Our AI will analyse your photos for the rest"
          delay={0.15}
        >
          <ChoiceButton
            selected={formData.thirdPartyInvolved === true}
            onClick={() => update({ thirdPartyInvolved: true, otherPartyPresent: null })}
            variant="default"
          >
            Yes
          </ChoiceButton>
          <ChoiceButton
            selected={formData.thirdPartyInvolved === false}
            onClick={() => update({ thirdPartyInvolved: false, otherPartyPresent: null })}
            variant="default"
          >
            No
          </ChoiceButton>
        </QuestionBlock>

        {/* Q2: Is the other driver present? (only if third party involved) */}
        <AnimatePresence>
          {showThirdPartyPresent && (
            <QuestionBlock
              question="Is the other driver present?"
              subtitle="Still at the scene when you took photos"
            >
              <ChoiceButton
                selected={formData.otherPartyPresent === true}
                onClick={() => update({ otherPartyPresent: true })}
                variant="success"
              >
                Yes, they are here
              </ChoiceButton>
              <ChoiceButton
                selected={formData.otherPartyPresent === false}
                onClick={() => update({ otherPartyPresent: false })}
                variant="default"
              >
                No, they left
              </ChoiceButton>
            </QuestionBlock>
          )}
        </AnimatePresence>

        {/* Q3: Fault */}
        <AnimatePresence>
          {showFault && (
            <QuestionBlock question="Were you at fault?">
              <ChoiceButton
                selected={formData.atFault === false}
                onClick={() => update({ atFault: false })}
                variant="success"
              >
                Not at fault
              </ChoiceButton>
              <ChoiceButton
                selected={formData.atFault === true}
                onClick={() => update({ atFault: true })}
                variant="danger"
              >
                At fault
              </ChoiceButton>
              <ChoiceButton
                selected={formData.atFault === 'unsure'}
                onClick={() => update({ atFault: 'unsure' })}
                variant="muted"
              >
                Not sure
              </ChoiceButton>
            </QuestionBlock>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/')}
            className="px-5 py-3.5 rounded-2xl text-sm font-semibold text-white/50 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={() => navigate('/camera')}
            disabled={formData.thirdPartyInvolved === null}
            className={`flex-1 font-bold py-3.5 rounded-2xl shadow-lg transition-all text-base cursor-pointer ${
              formData.thirdPartyInvolved !== null
                ? 'bg-brand hover:bg-brand-dark text-white shadow-brand/25'
                : 'bg-white/5 text-white/30 cursor-not-allowed shadow-none'
            }`}
          >
            Next
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

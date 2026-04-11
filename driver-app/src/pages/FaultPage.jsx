import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const COLLISION_OBJECTS = [
  { value: 'pole', label: 'Pole / Post' },
  { value: 'barrier', label: 'Barrier / Guardrail' },
  { value: 'tree', label: 'Tree' },
  { value: 'animal', label: 'Animal' },
  { value: 'kerb', label: 'Kerb / Gutter' },
  { value: 'other', label: 'Other object' },
]

const SPEED_OPTIONS = [
  { value: 'stationary', label: 'Stationary / Parked' },
  { value: 'slow', label: 'Slow (< 20 km/h)' },
  { value: 'moderate', label: 'Moderate (20–60 km/h)' },
  { value: 'fast', label: 'Fast (60+ km/h)' },
]

const ROAD_CONDITIONS = [
  { value: 'dry', label: 'Dry' },
  { value: 'wet', label: 'Wet / Rainy' },
  { value: 'gravel', label: 'Gravel / Dirt' },
  { value: 'icy', label: 'Icy / Slippery' },
]

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

  const showHitAndRun = formData.thirdPartyInvolved === true
  const showParked = formData.thirdPartyInvolved === true && formData.hitAndRun === true
  const showCollisionObject = formData.thirdPartyInvolved === false
  const showFault = formData.thirdPartyInvolved === true && formData.hitAndRun === false
  const showFaultUnsure = formData.thirdPartyInvolved === false

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
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Step 1</p>
          <p className="text-white font-semibold text-sm">Incident Details</p>
        </div>
        <div className="w-10" />
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
          subtitle="This helps our AI know what to look for in your photos"
          delay={0.15}
        >
          <ChoiceButton
            selected={formData.thirdPartyInvolved === true}
            onClick={() => update({ thirdPartyInvolved: true, collisionObject: '', hitAndRun: null, parkedWhenHit: null })}
            variant="default"
          >
            Yes, another vehicle
          </ChoiceButton>
          <ChoiceButton
            selected={formData.thirdPartyInvolved === false}
            onClick={() => update({ thirdPartyInvolved: false, hitAndRun: null, parkedWhenHit: null, atFault: null })}
            variant="default"
          >
            No, single vehicle / object
          </ChoiceButton>
        </QuestionBlock>

        {/* Q2a: Hit and run? (if third party) */}
        <AnimatePresence>
          {showHitAndRun && (
            <QuestionBlock
              question="Was it a hit and run?"
              subtitle="The other driver left the scene"
            >
              <ChoiceButton
                selected={formData.hitAndRun === true}
                onClick={() => update({ hitAndRun: true, parkedWhenHit: null })}
                variant="danger"
              >
                Yes, they left the scene
              </ChoiceButton>
              <ChoiceButton
                selected={formData.hitAndRun === false}
                onClick={() => update({ hitAndRun: false, parkedWhenHit: null })}
                variant="success"
              >
                No, other driver is present
              </ChoiceButton>
            </QuestionBlock>
          )}
        </AnimatePresence>

        {/* Q2b: Parked when hit? (if hit and run) */}
        <AnimatePresence>
          {showParked && (
            <QuestionBlock question="Was your vehicle parked when hit?">
              <ChoiceButton
                selected={formData.parkedWhenHit === true}
                onClick={() => update({ parkedWhenHit: true, atFault: false })}
                variant="default"
              >
                Yes, it was parked
              </ChoiceButton>
              <ChoiceButton
                selected={formData.parkedWhenHit === false}
                onClick={() => update({ parkedWhenHit: false })}
                variant="default"
              >
                No, I was driving
              </ChoiceButton>
            </QuestionBlock>
          )}
        </AnimatePresence>

        {/* Q2c: What did you hit? (if no third party) */}
        <AnimatePresence>
          {showCollisionObject && (
            <QuestionBlock question="What did you collide with?">
              <div className="grid grid-cols-2 gap-2">
                {COLLISION_OBJECTS.map((obj) => (
                  <button
                    key={obj.value}
                    onClick={() => update({ collisionObject: obj.value })}
                    className={`py-3 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer border-2 ${
                      formData.collisionObject === obj.value
                        ? 'bg-brand/15 border-brand text-brand-light'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>
            </QuestionBlock>
          )}
        </AnimatePresence>

        {/* Q3: Fault (if third party present, not hit-and-run) */}
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
                selected={formData.atFault === null && formData.hitAndRun === false}
                onClick={() => update({ atFault: null })}
                variant="muted"
              >
                Not sure
              </ChoiceButton>
            </QuestionBlock>
          )}
        </AnimatePresence>

        {/* Q3b: Fault for single vehicle (simpler) */}
        <AnimatePresence>
          {showFaultUnsure && formData.collisionObject && (
            <QuestionBlock question="Were you at fault?">
              <ChoiceButton
                selected={formData.atFault === true}
                onClick={() => update({ atFault: true })}
                variant="danger"
              >
                Yes
              </ChoiceButton>
              <ChoiceButton
                selected={formData.atFault === false}
                onClick={() => update({ atFault: false })}
                variant="success"
              >
                No
              </ChoiceButton>
              <ChoiceButton
                selected={formData.atFault === null && !!formData.collisionObject}
                onClick={() => update({ atFault: null })}
                variant="muted"
              >
                Not sure
              </ChoiceButton>
            </QuestionBlock>
          )}
        </AnimatePresence>

        {/* Speed at time of incident */}
        <AnimatePresence>
          {formData.thirdPartyInvolved !== null && (
            <QuestionBlock
              question="How fast were you going?"
              subtitle="Helps assess damage plausibility"
            >
              <div className="grid grid-cols-2 gap-2">
                {SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update({ vehicleSpeed: opt.value })}
                    className={`py-3 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer border-2 ${
                      formData.vehicleSpeed === opt.value
                        ? 'bg-brand/15 border-brand text-brand-light'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </QuestionBlock>
          )}
        </AnimatePresence>

        {/* Road / weather conditions */}
        <AnimatePresence>
          {formData.thirdPartyInvolved !== null && (
            <QuestionBlock
              question="Road conditions?"
              subtitle="Wet, dry, gravel — helps verify the scene"
            >
              <div className="grid grid-cols-2 gap-2">
                {ROAD_CONDITIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update({ roadCondition: opt.value })}
                    className={`py-3 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer border-2 ${
                      formData.roadCondition === opt.value
                        ? 'bg-brand/15 border-brand text-brand-light'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </QuestionBlock>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/camera')}
          disabled={formData.thirdPartyInvolved === null}
          className={`w-full font-bold py-4 rounded-2xl shadow-xl transition-all text-lg cursor-pointer flex items-center justify-center gap-3 ${
            formData.thirdPartyInvolved !== null
              ? 'bg-brand hover:bg-brand-dark text-white shadow-brand/25'
              : 'bg-white/5 text-white/30 cursor-not-allowed shadow-none'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          Next: Take Photos
        </motion.button>
      </div>
    </motion.div>
  )
}

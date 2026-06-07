import { useSettings } from '../contexts/SettingsContext'

function Footer() {
  const { schoolSettings, currentAcademicYear } = useSettings()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="px-3 pb-4 pt-2 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(244,248,252,0.92))] shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 lg:py-8">
          {/* School Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {schoolSettings.schoolLogo ? (
                <img 
                  src={schoolSettings.schoolLogo} 
                  alt={schoolSettings.schoolName} 
                  className="w-12 h-12 object-contain rounded flex-shrink-0"
                />
              ) : (
                <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain flex-shrink-0" />
              )}
              <div>
                <h3 className="font-display text-base font-semibold text-text-dark sm:text-lg">{schoolSettings.schoolName}</h3>
                <p className="mt-1 text-xs sm:text-sm text-text-muted">{schoolSettings.schoolDescription || 'School Management System'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-text-dark sm:text-base">Contact</h4>
            <div className="space-y-2 text-xs sm:text-sm text-text-muted">
              {schoolSettings.schoolPhone && (
                <p>
                  <span className="font-medium text-text-dark">Phone:</span> {schoolSettings.schoolPhone}
                </p>
              )}
              {schoolSettings.schoolEmail && (
                <p>
                  <span className="font-medium text-text-dark">Email:</span> {schoolSettings.schoolEmail}
                </p>
              )}
              {schoolSettings.schoolAddress && (
                <p>
                  <span className="font-medium text-text-dark">Address:</span> {schoolSettings.schoolAddress}
                </p>
              )}
            </div>
          </div>

          {/* Academic Year Info */}
          <div className="space-y-2">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-text-dark sm:text-base">Current Academic Year</h4>
            {currentAcademicYear ? (
              <div className="text-xs sm:text-sm text-text-muted space-y-1">
                <p className="text-sm font-semibold text-primary-blue sm:text-base">{currentAcademicYear.year}</p>
                <p>
                  {currentAcademicYear.startDate ? new Date(currentAcademicYear.startDate).toLocaleDateString() : ''} - {currentAcademicYear.endDate ? new Date(currentAcademicYear.endDate).toLocaleDateString() : ''}
                </p>
                {currentAcademicYear.terms && currentAcademicYear.terms.length > 0 && (
                  <p>Terms: {currentAcademicYear.terms.length}</p>
                )}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-text-muted">No academic year set</p>
            )}
          </div>

          {/* System Settings */}
          <div className="space-y-2">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-text-dark sm:text-base">Settings</h4>
            <div className="space-y-1 text-xs sm:text-sm text-text-muted">
              <p>
                <span className="font-medium text-text-dark">Currency:</span> {schoolSettings.currency}
              </p>
              <p>
                <span className="font-medium text-text-dark">Timezone:</span> {schoolSettings.timezone}
              </p>
              <p>
                <span className="font-medium text-text-dark">Language:</span> {schoolSettings.language}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200/80 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <p>© {currentYear} {schoolSettings.schoolName}. All rights reserved.</p>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
              <p>eSync School Management System v2.0</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

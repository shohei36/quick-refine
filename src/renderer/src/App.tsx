import { useCallback, useEffect, useState } from 'react'
import type { AppSettings, Skill } from '../../shared/types'
import PopupView from './views/PopupView'
import SettingsView from './views/SettingsView'
import SkillManagerView from './views/SkillManagerView'

type ViewName = 'popup' | 'settings' | 'skills'

function App(): React.JSX.Element {
  const [view, setView] = useState<ViewName>('popup')
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  const reloadSettings = useCallback(async () => {
    const current = await window.api.settings.get()
    setSettings(current)
  }, [])

  const reloadSkills = useCallback(async () => {
    const list = await window.api.skills.list()
    setSkills(list)
  }, [])

  useEffect(() => {
    Promise.all([window.api.settings.get(), window.api.skills.list()]).then(
      ([currentSettings, list]) => {
        setSettings(currentSettings)
        setSkills(list)
        setLoading(false)
      }
    )
  }, [])

  if (loading || !settings) {
    return (
      <div className="app-loading">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <div style={{ display: view === 'popup' ? 'contents' : 'none' }}>
        <PopupView
          settings={settings}
          skills={skills}
          onOpenSettings={() => setView('settings')}
          onOpenSkills={() => setView('skills')}
          onSettingsChanged={reloadSettings}
        />
      </div>
      <div style={{ display: view === 'settings' ? 'contents' : 'none' }}>
        <SettingsView
          settings={settings}
          onBack={() => setView('popup')}
          onSettingsChanged={reloadSettings}
        />
      </div>
      <div style={{ display: view === 'skills' ? 'contents' : 'none' }}>
        <SkillManagerView
          skills={skills}
          onBack={() => setView('popup')}
          onSkillsChanged={reloadSkills}
        />
      </div>
    </div>
  )
}

export default App

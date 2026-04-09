import { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { AbsenceAlert } from '../types/absence-alert.types'

export const useAbsenceAlerts = () => {
  const [alerts, setAlerts] = useState<AbsenceAlert[]>([])
  const [newAlertCount, setNewAlertCount] = useState(0)

  useEffect(() => {
    const socket = getSocket()

    socket.on('teacher:absent', (alert: AbsenceAlert) => {
      setAlerts(prev => [alert, ...prev])
      setNewAlertCount(prev => prev + 1)
    })

    return () => {
      socket.off('teacher:absent')
    }
  }, [])

  const clearAlerts = () => {
    setAlerts([])
    setNewAlertCount(0)
  }

  const dismissAlert = (staffId: string) => {
    setAlerts(prev => prev.filter(a => a.staffId !== staffId))
  }

  return { alerts, newAlertCount, clearAlerts, dismissAlert }
}

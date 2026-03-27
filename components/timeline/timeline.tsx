"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, FileText, Gavel, CalendarCheck, Scale, CheckCircle2 } from "lucide-react"

interface Activity {
  id: number
  activity: string
  description: string
  status: "completed" | "pending"
  createdAt: string
  dueDate?: string
}

const activityTypes: Record<
  string,
  { icon: any; color: string }
> = {
  Filed: { icon: FileText, color: "from-sky-400 to-blue-500" },
  "In Court": { icon: Gavel, color: "from-purple-400 to-indigo-500" },
  Hearing: { icon: CalendarCheck, color: "from-amber-400 to-orange-500" },
  Judgment: { icon: Scale, color: "from-pink-400 to-rose-500" },
  Closed: { icon: CheckCircle2, color: "from-green-400 to-emerald-500" },
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HorizontalCaseTimeline({ caseId }: { caseId: string }) {
  const { data, error } = useSWR(`/api/cases/${caseId}/activities`, fetcher, {
    refreshInterval: 5000,
  })

  const activities: Activity[] = data?.activities || []

  const [showModal, setShowModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const [newActivity, setNewActivity] = useState<{
    activity: string
    description: string
    status: "pending" | "completed"
    dueDate: string
  }>({
    activity: "Filed",
    description: "",
    status: "pending",
    dueDate: "",
  })

  const handleAddActivity = async () => {
    if (!newActivity.activity || !newActivity.description) return

    try {
      const res = await fetch(`/api/cases/${caseId}/activities/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
      })

      const data = await res.json()

      if (data.activity) {
        mutate(`/api/cases/${caseId}/activities`)
        setNewActivity({
          activity: "Filed",
          description: "",
          status: "pending",
          dueDate: "",
        })
        setShowModal(false)
      } else {
        console.error("Failed to add activity:", data.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const markCompleted = async (id: number) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/activities/${id}/complete`, {
        method: "PATCH",
      })
      const data = await res.json()
      if (data.success) mutate(`/api/cases/${caseId}/activities`)
    } catch (err) {
      console.error("Failed to mark completed:", err)
    }
  }

  if (error) return <div className="text-red-500">Failed to load activities</div>
  if (!data) return <div>Loading activities...</div>

  return (
    <>
      <div className="w-full bg-gray-50 dark:bg-gray-900 py-4 px-4 shadow-md sticky top-0 z-50 overflow-x-auto">
        <div className="flex items-center space-x-10 min-w-max">
          {activities.map((item) => {
            const type =
              activityTypes[item.activity] || {
                icon: FileText,
                color: "from-gray-400 to-gray-500",
              }
            const Icon = type.icon
            const isCompleted = item.status === "completed"

            return (
              <div
                key={item.id}
                className="relative flex flex-col items-center group cursor-pointer"
                onClick={() => setSelectedActivity(item)}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${isCompleted
                      ? `bg-gradient-to-r ${type.color}`
                      : "bg-gray-400 dark:bg-gray-600"
                    }`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <span className="mt-2 text-xs text-center">{item.activity}</span>
              </div>
            )
          })}

          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-6 h-6" />
            </div>
            <span className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              Add
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(showModal || selectedActivity) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-lg"
            >
              {selectedActivity ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">
                    {selectedActivity.activity}
                  </h3>
                  <p className="mb-4">{selectedActivity.description}</p>

                  {selectedActivity.status === "pending" && (
                    <button
                      className="px-4 py-2 rounded bg-blue-500 text-white"
                      onClick={() => {
                        markCompleted(selectedActivity.id)
                        setSelectedActivity(null)
                      }}
                    >
                      Mark Completed
                    </button>
                  )}

                  <button
                    className="mt-3 px-4 py-2 rounded bg-gray-300"
                    onClick={() => setSelectedActivity(null)}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-4">Add Activity</h3>

                  <input
                    type="date"
                    value={newActivity.dueDate}
                    onChange={(e) =>
                      setNewActivity({
                        ...newActivity,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full mb-3 border p-2 rounded"
                  />

                  <textarea
                    placeholder="Description"
                    value={newActivity.description}
                    onChange={(e) =>
                      setNewActivity({
                        ...newActivity,
                        description: e.target.value,
                      })
                    }
                    className="w-full mb-3 border p-2 rounded"
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                      onClick={handleAddActivity}
                    >
                      Add
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
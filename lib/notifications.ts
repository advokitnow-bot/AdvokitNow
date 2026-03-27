import { prisma } from "./prisma"
import { sendSMS } from "./sms"
import type { NotificationType } from "@prisma/client"

interface CreateNotificationParams {
  userId: number
  title: string
  message: string
  type: NotificationType
  caseId?: string
  sendSMS?: boolean
  sendEmail?: boolean
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  caseId,
  sendSMS: shouldSendSMS = false,
  sendEmail: shouldSendEmail = false,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
        caseId: caseId || null,
      },
    })

    if (shouldSendSMS || shouldSendEmail) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user) {
        // ✅ FIXED: mobile instead of phoneNumber
        if (shouldSendSMS && user.mobile) {
          const smsMessage = `${title}: ${message}`
          await sendSMS(user.mobile, smsMessage)
        }

        if (shouldSendEmail && user.email) {
          console.log(`📧 Email to ${user.email}: ${title} - ${message}`)
        }
      }
    }

    return notification
  } catch (error) {
    console.error("Create notification error:", error)
    throw error
  }
}

export async function createHearingReminder(
  caseId: string,
  userId: number,
  hearingDate: Date
) {
  const case_ = await prisma.case.findUnique({
    where: { id: caseId },
    select: { caseNumber: true, title: true, court: true },
  })

  if (!case_) return

  const title = "Hearing Reminder"
  const message = `You have a hearing scheduled for case ${case_.caseNumber} (${case_.title}) on ${hearingDate.toLocaleDateString()} at ${case_.court}`

  return createNotification({
    userId,
    title,
    message,
    type: "HEARING_REMINDER",
    caseId,
    sendSMS: true,
  })
}

export async function createCaseUpdateNotification(
  caseId: string,
  userId: number,
  updateMessage: string
) {
  const case_ = await prisma.case.findUnique({
    where: { id: caseId },
    select: { caseNumber: true, title: true },
  })

  if (!case_) return

  const title = "Case Update"
  const message = `Case ${case_.caseNumber} (${case_.title}): ${updateMessage}`

  return createNotification({
    userId,
    title,
    message,
    type: "CASE_UPDATE",
    caseId,
  })
}

export async function createDocumentUploadNotification(
  caseId: string,
  userId: number,
  documentName: string
) {
  const case_ = await prisma.case.findUnique({
    where: { id: caseId },
    select: { caseNumber: true, title: true },
  })

  if (!case_) return

  const title = "Document Uploaded"
  const message = `New document "${documentName}" has been uploaded to case ${case_.caseNumber} (${case_.title})`

  return createNotification({
    userId,
    title,
    message,
    type: "DOCUMENT_UPLOAD",
    caseId,
  })
}

export async function createDeadlineReminder(
  caseId: string,
  userId: number,
  deadline: string,
  daysLeft: number
) {
  const case_ = await prisma.case.findUnique({
    where: { id: caseId },
    select: { caseNumber: true, title: true },
  })

  if (!case_) return

  const title = "Deadline Reminder"
  const message = `${deadline} for case ${case_.caseNumber} (${case_.title}) is due in ${daysLeft} day(s)`

  return createNotification({
    userId,
    title,
    message,
    type: "DEADLINE_REMINDER",
    caseId,
    sendSMS: daysLeft <= 1,
  })
}
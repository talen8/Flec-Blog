import request from '@/utils/request'
import type { Feedback, SubmitFeedbackParams } from '@/types/feedback'

/**
 * 提交反馈
 */
export function submitFeedback(data: SubmitFeedbackParams) {
  return request.post<Feedback>('/feedback', data)
}

/**
 * 根据工单号查询反馈
 */
export function getFeedbackByTicketNo(ticketNo: string) {
  return request.get<Feedback>(`/feedback/ticket/${ticketNo}`)
}


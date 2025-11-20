import axios from 'axios'
import { accessToken } from './auth'
import type { ApiResponse } from '@/types/request'

/**
 * 文件上传类型
 */
export type UploadType = '用户头像' | '评论贴图' | '反馈投诉'

/**
 * 文件上传响应数据
 */
export interface UploadResponse {
  original_name: string
  file_url: string
}

/**
 * 上传文件
 * @param file 要上传的文件（从文件选择器获取）
 * @param type 上传类型：'用户头像'、'评论贴图'、'反馈投诉'
 * @param maxSize 最大文件大小（字节），默认 5MB
 * @returns 上传成功返回文件信息
 */
export async function uploadFile(
  file: File,
  type: UploadType,
  maxSize: number = 5 * 1024 * 1024
): Promise<UploadResponse> {
  // 根据上传类型设置允许的文件类型
  let allowedTypes: string[]
  let typeDescription: string
  
  if (type === '反馈投诉') {
    // 反馈投诉支持图片和文档
    allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    typeDescription = 'JPG、PNG、GIF、WebP 格式的图片或 PDF、DOC、DOCX 格式的文档'
  } else {
    // 其他类型只支持图片
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    typeDescription = 'JPG、PNG、GIF、WebP 格式的图片'
  }
  
  // 验证文件类型
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`只支持 ${typeDescription}`)
  }

  // 验证文件大小
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    throw new Error(`文件大小不能超过 ${maxSizeMB}MB`)
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const baseURL = import.meta.env.VITE_API_URL

  try {
    const response = await axios.post<ApiResponse<UploadResponse>>(
      `${baseURL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: accessToken.value ? `Bearer ${accessToken.value}` : ''
        }
      }
    )

    if (response.data.code === 0) {
      return response.data.data
    } else {
      throw new Error(response.data.message || '文件上传失败')
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || '文件上传失败')
  }
}

/**
 * 上传图片（向后兼容的别名）
 * @deprecated 请使用 uploadFile 方法
 */
export const uploadImage = uploadFile

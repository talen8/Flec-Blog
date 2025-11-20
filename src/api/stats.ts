import request from '../utils/request'
import type { SiteStats, ArchiveStats } from '../types/stats'

/**
 * 获取网站统计信息
 * @returns 网站统计数据
 */
export function getSiteStats(): Promise<SiteStats> {
  return request.get<SiteStats>('/stats/site')
}

/**
 * 获取归档统计信息
 * @returns 归档统计数据
 */
export function getArchiveStats(): Promise<ArchiveStats> {
  return request.get<ArchiveStats>('/stats/archives')
}


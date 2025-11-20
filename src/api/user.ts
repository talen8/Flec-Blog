import request from '../utils/request'
import type { LoginParams, LoginResponse, RegisterParams, RegisterResponse, UserInfo, UpdateProfileParams, ForgotPasswordParams, ResetPasswordParams, ChangePasswordParams, DeactivateAccountParams, RefreshTokenParams, RefreshTokenResponse } from '../types/user'

/**
 * 用户登录
 * @param data 登录参数
 * @param data.email 邮箱
 * @param data.password 密码
 * @returns 登录成功返回token和用户信息
 */
export function login(data: LoginParams): Promise<LoginResponse> {
  return request.post("/auth/login", data);
}

/**
 * 用户注册
 * @param data 注册参数
 * @param data.email 邮箱
 * @param data.nickname 昵称
 * @param data.password 密码
 * @param data.website 网站地址（可选）
 * @returns 注册成功返回token和用户信息
 */
export function register(data: RegisterParams): Promise<RegisterResponse> {
  return request.post("/auth/register", data);
}

/**
 * 刷新Token
 * @param data 刷新Token参数
 * @param data.refresh_token 刷新令牌
 * @returns 新的access_token和refresh_token
 */
export function refreshToken(data: RefreshTokenParams): Promise<RefreshTokenResponse> {
  return request.post("/auth/refresh", data);
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export function getUserProfile(): Promise<UserInfo> {
  return request.get("/user/profile");
}

/**
 * 更新用户资料（部分更新）
 * @param data 更新参数（只需提供要更新的字段）
 * @returns 更新后的用户信息
 */
export function updateUserProfile(data: UpdateProfileParams): Promise<UserInfo> {
  return request.patch("/user/profile", data);
}

/**
 * 忘记密码（发送重置密码验证码）
 * @param data 忘记密码参数
 * @param data.email 邮箱地址
 * @returns 发送结果
 */
export function forgotPassword(data: ForgotPasswordParams): Promise<void> {
  return request.post("/auth/forgot-password", data);
}

/**
 * 重置密码
 * @param data 重置密码参数
 * @param data.email 邮箱地址
 * @param data.code 验证码
 * @param data.password 新密码
 * @returns 重置结果
 */
export function resetPassword(data: ResetPasswordParams): Promise<void> {
  return request.post("/auth/reset-password", data);
}

/**
 * 修改密码（用户已登录）
 * @param data 修改密码参数
 * @param data.old_password 旧密码
 * @param data.new_password 新密码（6-32个字符）
 * @returns 修改结果
 */
export function changePassword(data: ChangePasswordParams): Promise<void> {
  return request.put("/user/password", data);
}

/**
 * 注销（删除）账户
 * @param data 注销账户参数
 * @param data.password 用户密码（用于确认身份）
 * @returns 注销结果
 */
export function deactivateAccount(data: DeactivateAccountParams): Promise<void> {
  return request.delete("/user/deactivate", { data });
}

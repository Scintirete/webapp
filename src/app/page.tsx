import { redirect } from 'next/navigation'

export default function RootPage() {
  // 由于使用 'as-needed' 配置，默认语言 en 不需要前缀
  // 重定向到根路径会被 middleware 自动处理为英文版本
  redirect('/')
}
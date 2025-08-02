'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'

export default function DashboardPage() {
  const router = useRouter()
  const { user, status, logout, checkAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [checkAuth, router])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">仪表板</h1>
          <p className="text-muted-foreground">欢迎回来，{user.name}！</p>
        </div>
        <div className="flex gap-2">
          <Button>
            新建项目
          </Button>
          <Button onClick={handleLogout} variant="outline">
            登出
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总项目数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% 较上月
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成视频</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% 较上月
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总观看时长</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0分钟</div>
            <p className="text-xs text-muted-foreground">
              +0% 较上月
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">存储使用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0GB</div>
            <p className="text-xs text-muted-foreground">
              共10GB可用
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>最近项目</CardTitle>
            <CardDescription>
              您最近创建或编辑的项目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无项目</p>
              <p className="text-sm mt-2">创建您的第一个项目开始使用</p>
              <Button className="mt-4">
                创建项目
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>
              常用功能快速入口
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              上传音频文件
            </Button>
            <Button className="w-full justify-start" variant="outline">
              从URL导入播客
            </Button>
            <Button className="w-full justify-start" variant="outline">
              浏览模板库
            </Button>
            <Button className="w-full justify-start" variant="outline">
              查看使用教程
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>开始使用</CardTitle>
          <CardDescription>
            按照以下步骤快速上手智能视频创作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">上传音频</h3>
              <p className="text-sm text-muted-foreground">
                上传您的播客音频文件或从URL导入
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI分析</h3>
              <p className="text-sm text-muted-foreground">
                AI自动分析音频内容并生成视觉元素
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">编辑发布</h3>
              <p className="text-sm text-muted-foreground">
                使用编辑器调整效果，一键发布到各平台
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { LoginCredentials } from '@/services/authService'

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = '邮箱不能为空'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = '密码不能为空'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await login(formData)
      // Redirect to dashboard on successful login
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Invalid credentials')) {
          setErrors({ general: '邮箱或密码错误' })
        } else {
          setErrors({ general: '登录失败，请稍后重试' })
        }
      } else {
        setErrors({ general: '登录失败，请稍后重试' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">登录账户</CardTitle>
        <CardDescription>
          输入您的邮箱和密码以登录
        </CardDescription>
        {message && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            {message}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入您的邮箱"
              value={formData.email}
              onChange={handleInputChange('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入您的密码"
              value={formData.password}
              onChange={handleInputChange('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <div className="text-sm text-red-500 text-center">
              {errors.general}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">还没有账户？</span>{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            立即注册
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
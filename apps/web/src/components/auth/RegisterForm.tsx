'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as authService from '@/services/authService';
import { RegisterData } from '@/services/authService';

interface FormErrors {
  name?: string
  email?: string
  password?: string
  general?: string
}

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '姓名至少需要2个字符'
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = '密码至少需要8个字符'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密码必须包含大写字母、小写字母和数字'
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
      await authService.register(formData)
      // After successful registration, redirect to login
      router.push('/auth/login?message=注册成功，请登录')
    } catch (error) {
      console.error('Registration failed:', error)
      if (error instanceof Error) {
        if (error.message.includes('409') || error.message.includes('already exists')) {
          setErrors({ email: '该邮箱已被注册' })
        } else {
          setErrors({ general: '注册失败，请稍后重试' })
        }
      } else {
        setErrors({ general: '注册失败，请稍后重试' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof RegisterData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev: RegisterData) => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">创建账户</CardTitle>
        <CardDescription>
          填写信息以创建您的账户
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              type="text"
              placeholder="请输入您的姓名"
              value={formData.name}
              onChange={handleInputChange('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

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
              placeholder="请输入密码（至少8位，包含大小写字母和数字）"
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
            {isLoading ? '注册中...' : '注册'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">已有账户？</span>{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            立即登录
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
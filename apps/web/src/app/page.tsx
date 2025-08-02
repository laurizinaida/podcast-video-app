import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          智能化在线视频创作平台
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          将播客音频转化为动态视频的智能创作平台，让您的内容更具视觉冲击力
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/register">开始创作</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/auth/login">登录</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>音频转视频</CardTitle>
              <CardDescription>
                智能分析播客内容，自动生成匹配的视觉元素
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                使用AI技术分析音频内容，自动生成相关的图像、文字和动画效果
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>智能编辑</CardTitle>
              <CardDescription>
                强大的编辑工具，让视频制作变得简单
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                拖拽式编辑界面，支持实时预览和多种视觉效果
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>一键发布</CardTitle>
              <CardDescription>
                支持多平台发布，扩大内容影响力
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                直接发布到YouTube、抖音等主流视频平台
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20">
        <h2 className="text-3xl font-bold mb-6">准备开始您的创作之旅？</h2>
        <p className="text-xl text-muted-foreground mb-8">
          立即注册，体验智能视频创作的魅力
        </p>
        <Button asChild size="lg">
          <Link href="/auth/register">免费注册</Link>
        </Button>
      </section>
    </div>
  )
}
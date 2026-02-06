import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Code2, Trophy, Users, Rocket, Brain, CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Code2 className="h-6 w-6" />
            <span>CodeKori</span>
          </div>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/register">
              Courses
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/register">
              Community
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Master Coding. <span className="text-accent">Unlock Your Future.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The gamified learning platform built for Africa's next generation of tech leaders. Learn, compete, and build real-world projects.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8">
                    Start Learning Now
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="h-12 px-8">
                    View Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {/* Abstract Pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-repeat" />
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary font-medium">
                  Why CodeKori?
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Gamified Learning at its Best
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We verify your skills with challenges, reward your progress with XP, and connect you with peers.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="bg-card border-none shadow-lg">
                <CardHeader>
                  <Trophy className="h-10 w-10 text-accent mb-2" />
                  <CardTitle>Earn XP & Badges</CardTitle>
                  <CardDescription>
                    Stay motivated by earning rewards for every lesson and challenge you complete.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Daily Streaks</li>
                    <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Skill Badges</li>
                    <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Leaderboard</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-card border-none shadow-lg">
                <CardHeader>
                  <Rocket className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Project-Based Learning</CardTitle>
                  <CardDescription>
                    Don&apos;t just watch videos. Build real applications that you can show off in your portfolio.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Interactive Coding Challenges</li>
                    <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Code Reviews</li>
                    <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Structured Courses</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-card border-none shadow-lg">
                <CardHeader>
                  <Users className="h-10 w-10 text-secondary mb-2" />
                  <CardTitle>Community & Mentorship</CardTitle>
                  <CardDescription>
                    Connect with other learners and get guidance from experienced mentors in the field.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Discussion Forums</li>
                    <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Peer Programming</li>
                    <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Mentor Guidance</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary font-medium">
                  Don&apos;t wait. Join the movement.
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Start Your Coding Journey?
                </h2>
                <Link href="/register">
                  <Button className="w-full sm:w-auto" size="lg">
                    Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Join thousands of students across Africa learning the skills of tomorrow. Whether you want to build websites, apps, or AI models, CodeKori is your launchpad.
                </p>

                <div className="w-full max-w-sm space-y-2">
                  <form className="flex space-x-2">
                    <Input className="max-w-lg flex-1" placeholder="Enter your email" type="email" />
                    <Button type="submit">Subscribe</Button>
                  </form>
                  <p className="text-xs text-muted-foreground">
                    Get the latest updates. No spam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-background border-t">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2026 CodeKori. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="/terms">
              Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

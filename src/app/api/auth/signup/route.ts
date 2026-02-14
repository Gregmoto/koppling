/**
 * Sign Up API Route
 * 
 * Handles user registration with tenant creation
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePasswordStrength } from '@/lib/password'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, companyName } = body

    // Validate required fields
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(', ') },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          companyName,
          status: 'active',
        }
      })

      // Create user as tenant owner
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'tenant_owner',
          status: 'active',
          tenantId: tenant.id
        }
      })

      // Create tenant onboarding record
      await tx.tenantOnboarding.create({
        data: {
          tenantId: tenant.id,
          fortnoxConnected: false,
          shopifyConnected: false,
          syncSettingsConfigured: false,
          firstSyncCompleted: false
        }
      })

      return { tenant, user }
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      userId: result.user.id,
      tenantId: result.tenant.id
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}

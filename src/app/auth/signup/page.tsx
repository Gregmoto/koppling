/**
 * Sign Up Page
 */

import { Suspense } from 'react'
import SignUpForm from './signup-form'

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { cn } from '../src/lib/utils'

test('cn joins truthy class names with spaces', () => {
  const result = cn('btn', false, undefined, 'active', null, 'large')
  assert.equal(result, 'btn active large')
})
